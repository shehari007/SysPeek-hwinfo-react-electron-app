import { useSyncExternalStore } from 'react'
import type { DynamicStats } from '@shared/ipc'
import { sysapi } from './api'

// Live telemetry is kept in a module-level store and exposed through
// useSyncExternalStore. Only components that actually call useLiveStats()
// re-render when a new sample arrives. This is what stops every 2s tick from
// re-rendering the entire app shell (sidebar, menu, detail pages), which was the
// main cause of high CPU usage on the dashboard.
let current: DynamicStats | null = null
const listeners = new Set<() => void>()
let started = false

function ensureStarted(): void {
  if (started) return
  started = true
  sysapi.onStats((s) => {
    current = s
    for (const listener of listeners) listener()
  })
}

function subscribe(callback: () => void): () => void {
  ensureStarted()
  listeners.add(callback)
  return () => {
    listeners.delete(callback)
  }
}

function getSnapshot(): DynamicStats | null {
  return current
}

export function useLiveStats(): DynamicStats | null {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot)
}
