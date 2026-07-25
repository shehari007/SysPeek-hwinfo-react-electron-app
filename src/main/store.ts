import Store from 'electron-store'
import type { AppSettings } from '@shared/ipc'

export const defaultSettings: AppSettings = {
  theme: 'dark',
  accentColor: '#3b82f6',
  startMode: 'maximized',
  refreshMs: 2000,
  showSystemDrives: false,
  minimizeToTray: true,
  closeToTray: false,
  launchAtStartup: false,
  notificationsEnabled: true,
  thresholds: { cpuTemp: 85, cpuLoad: 90, memUsage: 90, diskUsage: 90 },
  hasOnboarded: false
}

export interface WindowBounds {
  width: number
  height: number
  x?: number
  y?: number
  maximized: boolean
}

interface StoreSchema {
  settings: AppSettings
  windowBounds: WindowBounds
}

// electron-store reads app.getPath('userData') in its constructor, so it is
// created lazily on first use rather than at module import time.
let store: Store<StoreSchema> | null = null

function db(): Store<StoreSchema> {
  if (!store) {
    store = new Store<StoreSchema>({
      name: 'syspeek-config',
      defaults: {
        settings: defaultSettings,
        windowBounds: { width: 1280, height: 800, maximized: true }
      }
    })
  }
  return store
}

export function getSettings(): AppSettings {
  const saved = db().get('settings')
  return {
    ...defaultSettings,
    ...saved,
    thresholds: { ...defaultSettings.thresholds, ...(saved?.thresholds ?? {}) }
  }
}

export function setSettings(patch: Partial<AppSettings>): AppSettings {
  const current = getSettings()
  const next: AppSettings = {
    ...current,
    ...patch,
    thresholds: { ...current.thresholds, ...(patch.thresholds ?? {}) }
  }
  db().set('settings', next)
  return next
}

export function getBounds(): WindowBounds {
  return db().get('windowBounds')
}

export function setBounds(bounds: WindowBounds): void {
  db().set('windowBounds', bounds)
}
