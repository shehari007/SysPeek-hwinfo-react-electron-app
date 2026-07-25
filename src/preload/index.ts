import { contextBridge, ipcRenderer, type IpcRendererEvent } from 'electron'
import { CH, type SysApi, type UpdaterApi, type AppSettings } from '@shared/ipc'

// The preload is the only place allowed to touch ipcRenderer. Everything the
// renderer can do is one explicit method here; there is no passthrough.
function subscribe<T>(channel: string, callback: (data: T) => void): () => void {
  const listener = (_event: IpcRendererEvent, data: T): void => callback(data)
  ipcRenderer.on(channel, listener)
  return () => ipcRenderer.removeListener(channel, listener)
}

const sysapi: SysApi = {
  getStatic: () => ipcRenderer.invoke(CH.sysStatic),
  getDynamic: () => ipcRenderer.invoke(CH.sysDynamic),
  getProcesses: () => ipcRenderer.invoke(CH.sysProcesses),
  getMeta: () => ipcRenderer.invoke(CH.meta),
  getSettings: () => ipcRenderer.invoke(CH.settingsGet),
  setSettings: (patch: Partial<AppSettings>) => ipcRenderer.invoke(CH.settingsSet, patch),
  openExternal: (url: string) => ipcRenderer.invoke(CH.openExternal, url),
  exportReport: () => ipcRenderer.invoke(CH.reportExport),
  relaunchAsAdmin: () => ipcRenderer.invoke(CH.relaunchAdmin),
  notifyLoaded: () => ipcRenderer.send(CH.splashDone),
  onStats: (callback) => subscribe(CH.statsUpdate, callback),
  onSettingsChange: (callback) => subscribe(CH.settingsChanged, callback),
  onOpenSettings: (callback) => subscribe(CH.openSettings, () => callback())
}

const updater: UpdaterApi = {
  check: () => ipcRenderer.invoke(CH.updateCheck),
  getStatus: () => ipcRenderer.invoke(CH.updateGet),
  installNow: () => ipcRenderer.send(CH.updateInstall),
  onStatus: (callback) => subscribe(CH.updateStatus, callback)
}

if (process.contextIsolated) {
  contextBridge.exposeInMainWorld('sysapi', sysapi)
  contextBridge.exposeInMainWorld('updater', updater)
} else {
  // Fallback for the unlikely case contextIsolation is disabled.
  ;(globalThis as unknown as { sysapi: SysApi }).sysapi = sysapi
  ;(globalThis as unknown as { updater: UpdaterApi }).updater = updater
}
