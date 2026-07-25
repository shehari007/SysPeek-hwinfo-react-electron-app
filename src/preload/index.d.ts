import type { SysApi, UpdaterApi } from '@shared/ipc'

declare global {
  interface Window {
    sysapi: SysApi
    updater: UpdaterApi
  }
}

export {}
