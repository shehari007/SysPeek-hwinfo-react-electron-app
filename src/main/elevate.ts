import { app } from 'electron'
import { spawn } from 'node:child_process'

/**
 * SysPeek runs as a normal (asInvoker) process so that auto update keeps working.
 * Elevation is opt in: this relaunches the app with a UAC prompt on Windows so
 * that systeminformation can read the extra fields that require admin rights
 * (SMART data, some temperatures, per process details). On macOS and Linux the
 * OS gates those behind a graphical sudo/polkit prompt the shell tools trigger
 * on demand, so no relaunch is needed there.
 */
export function relaunchAsAdmin(): boolean {
  if (process.platform !== 'win32') return false

  const exePath = process.execPath
  try {
    if (app.isPackaged) {
      spawn(
        'powershell.exe',
        ['-NoProfile', '-WindowStyle', 'Hidden', '-Command', `Start-Process -FilePath '${exePath}' -Verb RunAs`],
        { detached: true, stdio: 'ignore' }
      ).unref()
    } else {
      // In dev the runtime is electron.exe launching the project directory.
      const appPath = app.getAppPath()
      spawn(
        'powershell.exe',
        [
          '-NoProfile',
          '-WindowStyle',
          'Hidden',
          '-Command',
          `Start-Process -FilePath '${exePath}' -ArgumentList '${appPath}' -Verb RunAs`
        ],
        { detached: true, stdio: 'ignore' }
      ).unref()
    }
    setTimeout(() => app.exit(0), 400)
    return true
  } catch {
    return false
  }
}
