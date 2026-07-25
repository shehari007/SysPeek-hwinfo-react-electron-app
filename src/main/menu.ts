import { Menu, shell, app, type BrowserWindow, type MenuItemConstructorOptions } from 'electron'

const REPO = 'https://github.com/shehari007/SysPeek-hwinfo-react-electron-app'

export interface MenuCallbacks {
  onCheckUpdates: () => void
  onRelaunchAdmin: () => void
  onOpenSettings: () => void
  onExport: () => void
}

export function buildMenu(win: BrowserWindow, cb: MenuCallbacks): void {
  const isMac = process.platform === 'darwin'

  const macAppMenu: MenuItemConstructorOptions[] = isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'about' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'quit' }
          ]
        }
      ]
    : []

  const adminItem: MenuItemConstructorOptions[] =
    process.platform === 'win32'
      ? [{ label: 'Relaunch as Administrator', click: () => cb.onRelaunchAdmin() }]
      : []

  const template: MenuItemConstructorOptions[] = [
    ...macAppMenu,
    {
      label: 'File',
      submenu: [
        { label: 'Export Report…', accelerator: 'CmdOrCtrl+E', click: () => cb.onExport() },
        { label: 'Settings', accelerator: 'CmdOrCtrl+,', click: () => cb.onOpenSettings() },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Tools',
      submenu: [{ label: 'Check for Updates…', click: () => cb.onCheckUpdates() }, ...adminItem]
    },
    {
      role: 'help',
      submenu: [
        { label: 'GitHub Repository', click: () => shell.openExternal(REPO) },
        { label: 'Report an Issue', click: () => shell.openExternal(`${REPO}/issues`) },
        { label: 'Author', click: () => shell.openExternal('https://github.com/shehari007') }
      ]
    }
  ]

  void win
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}
