import { Tray, Menu, nativeImage } from 'electron'
import trayIconAsset from '../../resources/tray-icon.png?asset'
import type { DynamicStats } from '@shared/ipc'

let tray: Tray | null = null

export interface TrayCallbacks {
  onToggleWindow: () => void
  onCheckUpdates: () => void
  onQuit: () => void
}

export function createTray(cb: TrayCallbacks): Tray {
  const image = nativeImage.createFromPath(trayIconAsset).resize({ width: 18, height: 18 })
  if (process.platform === 'darwin') image.setTemplateImage(true)

  tray = new Tray(image)
  tray.setToolTip('SysPeek')
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: 'Show / Hide SysPeek', click: () => cb.onToggleWindow() },
      { type: 'separator' },
      { label: 'Check for Updates', click: () => cb.onCheckUpdates() },
      { type: 'separator' },
      { label: 'Quit SysPeek', click: () => cb.onQuit() }
    ])
  )
  tray.on('click', () => cb.onToggleWindow())
  return tray
}

export function updateTrayStats(stats: DynamicStats): void {
  if (!tray) return
  const memPct = stats.mem.total ? Math.round((stats.mem.used / stats.mem.total) * 100) : 0
  const temp = stats.cpuTemp != null ? ` | ${stats.cpuTemp}°C` : ''
  tray.setToolTip(`SysPeek\nCPU ${stats.cpuLoad}%${temp} | RAM ${memPct}%`)
}

export function destroyTray(): void {
  tray?.destroy()
  tray = null
}

export function hasTray(): boolean {
  return tray !== null
}
