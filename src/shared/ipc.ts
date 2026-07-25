import type { Systeminformation } from 'systeminformation'

/**
 * Single source of truth for every IPC channel name. Main registers handlers
 * against these, the preload bridge references the same constants, and nothing
 * else in the app is allowed to invent a channel string. Keeping them here is
 * what makes the "one function per channel" preload contract auditable.
 */
export const CH = {
  sysStatic: 'sys:static',
  sysDynamic: 'sys:dynamic',
  sysProcesses: 'sys:processes',
  statsUpdate: 'stats:update',
  meta: 'sys:meta',
  openExternal: 'shell:open-external',
  splashDone: 'splash:done',
  settingsGet: 'settings:get',
  settingsSet: 'settings:set',
  settingsChanged: 'settings:changed',
  openSettings: 'ui:open-settings',
  reportExport: 'report:export',
  relaunchAdmin: 'app:relaunch-admin',
  updateStatus: 'update:status',
  updateCheck: 'update:check',
  updateInstall: 'update:install',
  updateGet: 'update:get'
} as const

/** Static, gathered-once hardware inventory (mirrors the old one-shot si.get). */
export interface StaticInfo {
  cpu?: Systeminformation.CpuData
  cpuCache?: Systeminformation.CpuCacheData
  mem?: Systeminformation.MemData
  memLayout?: Systeminformation.MemLayoutData[]
  graphics?: Systeminformation.GraphicsData
  battery?: Systeminformation.BatteryData
  osInfo?: Systeminformation.OsData
  uuid?: Systeminformation.UuidData
  versions?: Systeminformation.VersionData
  diskLayout?: Systeminformation.DiskLayoutData[]
  networkInterfaces?: Systeminformation.NetworkInterfacesData[]
  networkGatewayDefault?: string
  networkInterfaceDefault?: string
  system?: Systeminformation.SystemData
  bios?: Systeminformation.BiosData
  baseboard?: Systeminformation.BaseboardData
  chassis?: Systeminformation.ChassisData
  audio?: Systeminformation.AudioData[]
  bluetoothDevices?: Systeminformation.BluetoothDeviceData[]
  printer?: Systeminformation.PrinterData[]
  usb?: Systeminformation.UsbData[]
  wifiNetworks?: Systeminformation.WifiNetworkData[]
}

export interface MemStats {
  total: number
  used: number
  free: number
  active: number
  available: number
  buffcache: number
  slab: number
  swaptotal: number
  swapused: number
  swapfree: number
}

export interface DiskIoStats {
  read: number
  write: number
  rIO: number
  wIO: number
  tIO: number
}

export interface NetStats {
  rx: number
  tx: number
  rxTotal: number
  txTotal: number
  iface: string
}

export interface FsVolume {
  fs: string
  type: string
  size: number
  used: number
  available: number
  use: number
  mount: string
}

export interface SensorReading {
  label: string
  value: number
}

export interface FanReading {
  label: string
  rpm: number
}

/** Enriched hardware sensors from the hybrid sensor bridge (see main/sensors.ts). */
export interface SensorSnapshot {
  source: 'librehardwaremonitor' | 'acpi' | 'none'
  cpuTemp: number | null
  gpuTemp: number | null
  cpuPower: number | null
  gpuLoad: number | null
  temps: SensorReading[]
  fans: FanReading[]
}

/**
 * Live telemetry, computed and aggregated in the main process and pushed to the
 * renderer on a single consolidated interval. Moving this aggregation out of the
 * renderer is the core "improve logic" change.
 */
export interface DynamicStats {
  cpuLoad: number
  cpuSpeed: number
  cpuTemp: number | null
  cpuModel: string
  cpuCores: number[]
  mem: MemStats
  disks: DiskIoStats
  net: NetStats
  fsSize: FsVolume[]
  uptime: number
  sensors: SensorSnapshot
  timestamp: number
}

export interface ProcessInfo {
  pid: number
  name: string
  cpu: number
  mem: number
  memRss: number
  memVsz: number
  user: string
  command: string
  state: string
  priority: number
  started: string
}

export interface ProcessSnapshot {
  all: number
  list: ProcessInfo[]
}

export interface SystemMeta {
  platform: NodeJS.Platform
  arch: string
  appName: string
  appVersion: string
  electronVersion: string
  nodeVersion: string
  chromeVersion: string
  v8Version: string
  isElevated: boolean
  isPackaged: boolean
}

export interface ThresholdSettings {
  cpuTemp: number
  cpuLoad: number
  memUsage: number
  diskUsage: number
}

/** How the main window opens on launch. */
export type StartMode = 'maximized' | 'fullscreen' | 'remember'

export interface AppSettings {
  theme: 'dark' | 'light'
  accentColor: string
  startMode: StartMode
  refreshMs: number
  showSystemDrives: boolean
  minimizeToTray: boolean
  closeToTray: boolean
  launchAtStartup: boolean
  notificationsEnabled: boolean
  thresholds: ThresholdSettings
  hasOnboarded: boolean
}

export type UpdateState =
  | 'idle'
  | 'checking'
  | 'available'
  | 'not-available'
  | 'downloading'
  | 'downloaded'
  | 'error'

export interface UpdateStatus {
  state: UpdateState
  version: string | null
  releaseNotes: string | null
  percent: number
  bytesPerSecond: number
  transferred: number
  total: number
  error: string | null
}

export interface ExportResult {
  ok: boolean
  path?: string
  canceled?: boolean
  error?: string
}

export interface ExternalOpenResult {
  ok: boolean
  reason?: string
}

/**
 * The exact, whitelisted surface exposed to the renderer through contextBridge.
 * There is deliberately one method per capability; the renderer never receives a
 * generic `invoke` or raw `ipcRenderer`.
 */
export interface SysApi {
  getStatic(): Promise<StaticInfo>
  getDynamic(): Promise<DynamicStats>
  getProcesses(): Promise<ProcessSnapshot>
  getMeta(): Promise<SystemMeta>
  getSettings(): Promise<AppSettings>
  setSettings(patch: Partial<AppSettings>): Promise<AppSettings>
  openExternal(url: string): Promise<ExternalOpenResult>
  exportReport(): Promise<ExportResult>
  relaunchAsAdmin(): Promise<boolean>
  notifyLoaded(): void
  onStats(callback: (stats: DynamicStats) => void): () => void
  onSettingsChange(callback: (settings: AppSettings) => void): () => void
  onOpenSettings(callback: () => void): () => void
}

export interface UpdaterApi {
  check(): Promise<void>
  getStatus(): Promise<UpdateStatus>
  installNow(): void
  onStatus(callback: (status: UpdateStatus) => void): () => void
}
