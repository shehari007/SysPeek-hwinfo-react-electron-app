import {
  app,
  BrowserWindow,
  ipcMain,
  shell,
  session,
  dialog,
  nativeTheme,
  Notification,
  type IpcMainInvokeEvent,
  type IpcMainEvent
} from 'electron'
import { join } from 'node:path'
import { existsSync } from 'node:fs'
import { writeFile } from 'node:fs/promises'
import iconAsset from '../../resources/icon.png?asset'
import { CH, type DynamicStats, type SystemMeta, type AppSettings, type ExportResult } from '@shared/ipc'
import { getStatic, getDynamic, getProcesses, isElevated } from './sysinfo'
import { startCpuClockMonitor, stopCpuClockMonitor } from './cpuclock'
import { startSensorMonitor, stopSensorMonitor } from './sensors'
import { getSettings, setSettings, getBounds, setBounds } from './store'
import { initUpdater, checkForUpdates, quitAndInstall, getUpdateStatus } from './updater'
import { createTray, updateTrayStats, destroyTray } from './tray'
import { buildMenu } from './menu'
import { relaunchAsAdmin } from './elevate'

const APP_ID = 'com.electron.syspeek'
const SPLASH_FALLBACK_MS = 15000
const NOTIFY_DEBOUNCE_MS = 60000

let mainWindow: BrowserWindow | null = null
let splashWindow: BrowserWindow | null = null
let pollTimer: NodeJS.Timeout | null = null
let isQuitting = false
const lastNotify: Record<string, number> = {}

/* -------------------------------------------------------------------------- */
/* Paths                                                                       */
/* -------------------------------------------------------------------------- */

function resolvePreload(): string {
  const base = join(__dirname, '../preload/')
  for (const file of ['index.mjs', 'index.js', 'index.cjs']) {
    const candidate = join(base, file)
    if (existsSync(candidate)) return candidate
  }
  return join(base, 'index.mjs')
}

function rendererFile(name: string): string {
  return join(__dirname, `../renderer/${name}`)
}

function isDev(): boolean {
  return !app.isPackaged && !!process.env['ELECTRON_RENDERER_URL']
}

/* -------------------------------------------------------------------------- */
/* Windows                                                                     */
/* -------------------------------------------------------------------------- */

function createSplash(): void {
  splashWindow = new BrowserWindow({
    width: 460,
    height: 540,
    resizable: false,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    show: false,
    webPreferences: { contextIsolation: true, nodeIntegration: false, sandbox: true }
  })

  if (isDev()) {
    splashWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/splash.html`)
  } else {
    splashWindow.loadFile(rendererFile('splash.html'))
  }
  splashWindow.once('ready-to-show', () => splashWindow?.show())
}

function closeSplash(): void {
  if (!splashWindow || splashWindow.isDestroyed()) return
  const splash = splashWindow
  splashWindow = null
  splash.destroy()
  revealMainWindow()
}

function revealMainWindow(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  const startMode = getSettings().startMode

  if (startMode === 'fullscreen') {
    mainWindow.setFullScreen(true)
  } else if (startMode === 'maximized') {
    mainWindow.maximize()
  } else if (getBounds().maximized) {
    // 'remember' restores whatever state the window was last closed in.
    mainWindow.maximize()
  }

  mainWindow.show()
  mainWindow.focus()
}

function createMainWindow(): void {
  const bounds = getBounds()

  mainWindow = new BrowserWindow({
    width: bounds.width,
    height: bounds.height,
    x: bounds.x,
    y: bounds.y,
    minWidth: 960,
    minHeight: 640,
    show: false,
    backgroundColor: '#0b1220',
    autoHideMenuBar: true,
    title: `SysPeek ${app.getVersion()}`,
    icon: iconAsset,
    webPreferences: {
      preload: resolvePreload(),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      spellcheck: false
    }
  })

  if (isDev()) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'] as string)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    mainWindow.loadFile(rendererFile('index.html'))
  }

  // If the renderer never signals it finished loading data, reveal anyway.
  setTimeout(() => {
    if (splashWindow) closeSplash()
    else revealMainWindow()
  }, SPLASH_FALLBACK_MS)

  mainWindow.on('maximize', () => persistBounds())
  mainWindow.on('unmaximize', () => persistBounds())

  mainWindow.on('minimize', () => {
    if (getSettings().minimizeToTray) mainWindow?.hide()
  })

  mainWindow.on('close', (event) => {
    if (!isQuitting && getSettings().closeToTray) {
      event.preventDefault()
      mainWindow?.hide()
      return
    }
    persistBounds()
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

function persistBounds(): void {
  if (!mainWindow || mainWindow.isDestroyed()) return
  // While full screen the reported bounds are the whole display, which would
  // overwrite the remembered windowed geometry, so skip saving in that state.
  if (mainWindow.isFullScreen()) return
  const maximized = mainWindow.isMaximized()
  const b = maximized ? mainWindow.getNormalBounds() : mainWindow.getBounds()
  setBounds({ width: b.width, height: b.height, x: b.x, y: b.y, maximized })
}

function toggleWindow(): void {
  if (!mainWindow) {
    createMainWindow()
    revealMainWindow()
    return
  }
  if (mainWindow.isVisible() && !mainWindow.isMinimized()) mainWindow.hide()
  else {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.show()
    mainWindow.focus()
  }
}

/* -------------------------------------------------------------------------- */
/* Security                                                                    */
/* -------------------------------------------------------------------------- */

function contentSecurityPolicy(): string {
  const common =
    "default-src 'self'; img-src 'self' data:; font-src 'self' data:; style-src 'self' 'unsafe-inline'; object-src 'none'; base-uri 'none'; frame-ancestors 'none';"
  if (isDev()) {
    return `${common} script-src 'self' 'unsafe-inline' 'unsafe-eval'; connect-src 'self' ws: http: https:;`
  }
  return `${common} script-src 'self'; connect-src 'self';`
}

function installCsp(): void {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [contentSecurityPolicy()]
      }
    })
  })
}

function hardenNavigation(): void {
  app.on('web-contents-created', (_event, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      try {
        if (/^https?:$/.test(new URL(url).protocol)) shell.openExternal(url)
      } catch {
        /* ignore malformed urls */
      }
      return { action: 'deny' }
    })

    contents.on('will-navigate', (event, navigationUrl) => {
      const allowed = isDev() ? process.env['ELECTRON_RENDERER_URL'] : 'file://'
      if (allowed && !navigationUrl.startsWith(allowed)) event.preventDefault()
    })
  })
}

/** Only accept IPC that originates from our own main window renderer. */
function fromMainWindow(event: IpcMainInvokeEvent | IpcMainEvent): boolean {
  return !!mainWindow && !mainWindow.isDestroyed() && event.sender === mainWindow.webContents
}

/* -------------------------------------------------------------------------- */
/* Polling + notifications                                                     */
/* -------------------------------------------------------------------------- */

function startPolling(intervalMs: number): void {
  stopPolling()
  let busy = false
  pollTimer = setInterval(async () => {
    if (busy || !mainWindow || mainWindow.isDestroyed()) return
    busy = true
    try {
      const stats = await getDynamic()
      if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(CH.statsUpdate, stats)
      updateTrayStats(stats)
      maybeNotify(stats)
    } catch {
      /* transient sensor read errors are ignored */
    } finally {
      busy = false
    }
  }, Math.max(1000, intervalMs))
}

function stopPolling(): void {
  if (pollTimer) clearInterval(pollTimer)
  pollTimer = null
}

function restartPolling(): void {
  startPolling(getSettings().refreshMs)
}

function maybeNotify(stats: DynamicStats): void {
  const settings = getSettings()
  if (!settings.notificationsEnabled || !Notification.isSupported()) return

  const now = Date.now()
  const fire = (key: string, title: string, body: string): void => {
    if (now - (lastNotify[key] ?? 0) < NOTIFY_DEBOUNCE_MS) return
    lastNotify[key] = now
    new Notification({ title, body, icon: iconAsset, silent: false }).show()
  }

  const { thresholds } = settings
  if (stats.cpuTemp != null && stats.cpuTemp >= thresholds.cpuTemp) {
    fire('temp', 'High CPU temperature', `CPU is running at ${stats.cpuTemp}°C`)
  }
  if (stats.cpuLoad >= thresholds.cpuLoad) {
    fire('cpu', 'High CPU load', `CPU load is at ${stats.cpuLoad}%`)
  }
  const memPct = stats.mem.total ? (stats.mem.used / stats.mem.total) * 100 : 0
  if (memPct >= thresholds.memUsage) {
    fire('mem', 'High memory usage', `Memory usage is at ${Math.round(memPct)}%`)
  }
  for (const vol of stats.fsSize) {
    if (vol.use >= thresholds.diskUsage) {
      fire(`disk:${vol.mount}`, 'Disk almost full', `${vol.mount} is ${Math.round(vol.use)}% full`)
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Settings side effects                                                       */
/* -------------------------------------------------------------------------- */

function applyLoginItem(openAtLogin: boolean): void {
  if (process.platform === 'linux') return
  app.setLoginItemSettings({ openAtLogin })
}

function applySettings(patch: Partial<AppSettings>): AppSettings {
  const next = setSettings(patch)
  if ('refreshMs' in patch) restartPolling()
  if ('launchAtStartup' in patch) applyLoginItem(next.launchAtStartup)
  if ('theme' in patch) nativeTheme.themeSource = next.theme
  // Apply the launch mode immediately so the choice is visible right away.
  if ('startMode' in patch && mainWindow && !mainWindow.isDestroyed()) {
    if (next.startMode === 'fullscreen') mainWindow.setFullScreen(true)
    else if (next.startMode === 'maximized') {
      if (mainWindow.isFullScreen()) mainWindow.setFullScreen(false)
      mainWindow.maximize()
    } else if (mainWindow.isFullScreen()) mainWindow.setFullScreen(false)
  }
  if (mainWindow && !mainWindow.isDestroyed()) mainWindow.webContents.send(CH.settingsChanged, next)
  return next
}

/* -------------------------------------------------------------------------- */
/* Reports                                                                     */
/* -------------------------------------------------------------------------- */

async function buildMeta(): Promise<SystemMeta> {
  return {
    platform: process.platform,
    arch: process.arch,
    appName: 'SysPeek',
    appVersion: app.getVersion(),
    electronVersion: process.versions.electron,
    nodeVersion: process.versions.node,
    chromeVersion: process.versions.chrome,
    v8Version: process.versions.v8,
    isElevated: await isElevated(),
    isPackaged: app.isPackaged
  }
}

async function exportReport(): Promise<ExportResult> {
  if (!mainWindow) return { ok: false, error: 'no-window' }
  const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')
  const result = await dialog.showSaveDialog(mainWindow, {
    title: 'Export SysPeek Report',
    defaultPath: `syspeek-report-${stamp}.json`,
    filters: [{ name: 'JSON Report', extensions: ['json'] }]
  })
  if (result.canceled || !result.filePath) return { ok: false, canceled: true }

  try {
    const [staticInfo, dynamic, procs, meta] = await Promise.all([
      getStatic(),
      getDynamic(),
      getProcesses(50),
      buildMeta()
    ])
    const report = {
      generatedAt: new Date().toISOString(),
      app: meta,
      static: staticInfo,
      live: dynamic,
      topProcesses: procs.list
    }
    await writeFile(result.filePath, JSON.stringify(report, null, 2), 'utf-8')
    return { ok: true, path: result.filePath }
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : String(err) }
  }
}

/* -------------------------------------------------------------------------- */
/* IPC                                                                         */
/* -------------------------------------------------------------------------- */

function registerIpc(): void {
  const guardHandle = <T>(fn: () => Promise<T> | T) => {
    return (event: IpcMainInvokeEvent): Promise<T> | T => {
      if (!fromMainWindow(event)) throw new Error('Unauthorized IPC sender')
      return fn()
    }
  }

  ipcMain.handle(CH.sysStatic, guardHandle(() => getStatic()))
  ipcMain.handle(CH.sysDynamic, guardHandle(() => getDynamic()))
  ipcMain.handle(CH.sysProcesses, guardHandle(() => getProcesses()))
  ipcMain.handle(CH.meta, guardHandle(() => buildMeta()))
  ipcMain.handle(CH.settingsGet, guardHandle(() => getSettings()))
  ipcMain.handle(CH.reportExport, guardHandle(() => exportReport()))
  ipcMain.handle(CH.relaunchAdmin, guardHandle(() => relaunchAsAdmin()))
  ipcMain.handle(CH.updateCheck, guardHandle(() => checkForUpdates()))
  ipcMain.handle(CH.updateGet, guardHandle(() => getUpdateStatus()))

  ipcMain.handle(CH.settingsSet, (event, patch: Partial<AppSettings>) => {
    if (!fromMainWindow(event)) throw new Error('Unauthorized IPC sender')
    return applySettings(patch ?? {})
  })

  ipcMain.handle(CH.openExternal, async (event, url: string) => {
    if (!fromMainWindow(event)) throw new Error('Unauthorized IPC sender')
    try {
      const parsed = new URL(String(url))
      if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        return { ok: false, reason: 'blocked-protocol' }
      }
      await shell.openExternal(parsed.href)
      return { ok: true }
    } catch {
      return { ok: false, reason: 'invalid-url' }
    }
  })

  ipcMain.on(CH.splashDone, (event) => {
    if (fromMainWindow(event)) closeSplash()
  })

  ipcMain.on(CH.updateInstall, (event) => {
    if (fromMainWindow(event)) quitAndInstall()
  })
}

/* -------------------------------------------------------------------------- */
/* Lifecycle                                                                   */
/* -------------------------------------------------------------------------- */

hardenNavigation()

if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.show()
      mainWindow.focus()
    }
  })

  app.whenReady().then(async () => {
    app.setAppUserModelId(APP_ID)
    installCsp()

    const settings = getSettings()
    nativeTheme.themeSource = settings.theme
    applyLoginItem(settings.launchAtStartup)

    createSplash()
    createMainWindow()
    registerIpc()

    createTray({
      onToggleWindow: () => toggleWindow(),
      onCheckUpdates: () => checkForUpdates(),
      onQuit: () => {
        isQuitting = true
        app.quit()
      }
    })

    if (mainWindow) {
      buildMenu(mainWindow, {
        onCheckUpdates: () => checkForUpdates(),
        onRelaunchAdmin: () => relaunchAsAdmin(),
        onOpenSettings: () => mainWindow?.webContents.send(CH.openSettings),
        onExport: () => exportReport()
      })
      initUpdater(mainWindow)
    }

    startCpuClockMonitor()
    startSensorMonitor()
    startPolling(settings.refreshMs)
    if (app.isPackaged) checkForUpdates()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
        revealMainWindow()
      } else {
        mainWindow?.show()
      }
    })
  })
}

app.on('before-quit', () => {
  isQuitting = true
  stopPolling()
  stopCpuClockMonitor()
  stopSensorMonitor()
  destroyTray()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
