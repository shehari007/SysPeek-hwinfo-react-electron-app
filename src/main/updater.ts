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

/** Where someone is sent when the app cannot install the update itself. */
const RELEASE_PAGE =
  'https://github.com/shehari007/SysPeek-hwinfo-react-electron-app/releases/latest'

/**
 * macOS is told about updates but does not apply them.
 *
 * Squirrel, which is what Electron uses to swap the application bundle, refuses
 * to touch a build that is not signed with an Apple Developer ID. SysPeek ships
 * unsigned: `electron-builder.yml` sets `hardenedRuntime: true` with
 * `notarize: false` and there is no certificate. Downloading anyway would pull
 * the whole zip and then fail at the last step, which looks like a broken app
 * rather than a missing signature.
 *
 * Checking is an ordinary manifest download and a version comparison, so that
 * part works on every platform and is worth keeping. Knowing a new version
 * exists is most of the value. Remove this once there is an Apple certificate
 * and `notarize: true`.
 */
const MANUAL_DOWNLOAD = process.platform === 'darwin'

let lastStatus: UpdateStatus = {
  state: 'idle',
  version: null,
  releaseNotes: null,
  percent: 0,
  bytesPerSecond: 0,
  transferred: 0,
  total: 0,
  error: null,
  manualDownload: MANUAL_DOWNLOAD,
  releaseUrl: RELEASE_PAGE
}

export function getUpdateStatus(): UpdateStatus {
  return lastStatus
}

export function initUpdater(win: BrowserWindow): void {
  const updater = au()
  updater.autoDownload = !MANUAL_DOWNLOAD
  // Nothing is ever downloaded where the install cannot run, so there is nothing
  // to install on quit either. Leaving it on would invite Squirrel to act on a
  // build it cannot verify.
  updater.autoInstallOnAppQuit = !MANUAL_DOWNLOAD
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
  // Guarded here as well as in the interface, because the renderer is not the
  // only caller and quitting into an install that cannot run would close the app
  // for nothing.
  if (MANUAL_DOWNLOAD) return
  au().quitAndInstall()
}
