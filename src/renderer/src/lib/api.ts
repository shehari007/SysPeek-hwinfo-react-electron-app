import type { SysApi, UpdaterApi } from '@shared/ipc'

// The contextBridge in the preload guarantees these globals exist inside the
// packaged app. Re-exporting them here gives components a single typed import
// and keeps `window.*` access out of the UI code.
export const sysapi: SysApi = window.sysapi
export const updater: UpdaterApi = window.updater
