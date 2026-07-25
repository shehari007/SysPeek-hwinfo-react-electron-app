import electronUpdater, { type AppUpdater } from 'electron-updater'
import { app, type BrowserWindow } from 'electron'
import { CH, type UpdateStatus } from '@shared/ipc'

// electron-updater is CommonJS and its `autoUpdater` is a lazy getter that
// touches Electron's `app` on first access. Accessing it at module load (before
// app is ready) throws, so it is resolved lazily inside functions that only run
// after app.whenReady().
function au(): AppUpdater {
  return electronUpdater.autoUpdater
}

let lastStatus: UpdateStatus = {
  state: 'idle',
  version: null,
  releaseNotes: null,
  percent: 0,
  bytesPerSecond: 0,
  transferred: 0,
  total: 0,
  error: null
}

export function getUpdateStatus(): UpdateStatus {
  return lastStatus
}

export function initUpdater(win: BrowserWindow): void {
  const updater = au()
  updater.autoDownload = true
  updater.autoInstallOnAppQuit = true
  if (!app.isPackaged) updater.forceDevUpdateConfig = true

  const send = (patch: Partial<UpdateStatus>): void => {
    lastStatus = { ...lastStatus, ...patch }
    if (!win.isDestroyed()) win.webContents.send(CH.updateStatus, lastStatus)
  }

  updater.on('checking-for-update', () => send({ state: 'checking', error: null }))
  updater.on('update-available', (info) =>
    send({
      state: 'available',
      version: info.version,
      releaseNotes: typeof info.releaseNotes === 'string' ? info.releaseNotes : null
    })
  )
  updater.on('update-not-available', () => send({ state: 'not-available' }))
  updater.on('download-progress', (p) =>
    send({
      state: 'downloading',
      percent: Math.round(p.percent),
      bytesPerSecond: Math.round(p.bytesPerSecond),
      transferred: p.transferred,
      total: p.total
    })
  )
  updater.on('update-downloaded', (info) => send({ state: 'downloaded', version: info.version }))
  updater.on('error', (err) =>
    send({ state: 'error', error: err instanceof Error ? err.message : String(err) })
  )
}

export async function checkForUpdates(): Promise<void> {
  try {
    await au().checkForUpdates()
  } catch {
    // The 'error' event already reports this to the renderer.
  }
}

export function quitAndInstall(): void {
  au().quitAndInstall()
}
