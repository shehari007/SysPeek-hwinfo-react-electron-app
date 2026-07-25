import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'

/**
 * systeminformation cannot read the live turbo/boost clock on Windows; it reports
 * the nominal base frequency. We derive the real clock from the Windows PDH
 * counter "% Processor Performance", which expresses the current speed as a
 * percentage of the base and rises above 100 during turbo. So:
 *   liveGHz = baseGHz * percent / 100
 *
 * typeperf is a built-in tool available to standard users, so this needs no
 * driver and no elevation. A single long-lived process streams the value, which
 * is far cheaper than spawning a query every poll.
 */
let perfPercent: number | null = null
let proc: ChildProcessWithoutNullStreams | null = null

export function startCpuClockMonitor(): void {
  if (process.platform !== 'win32' || proc) return
  try {
    proc = spawn(
      'typeperf',
      ['\\Processor Information(_Total)\\% Processor Performance', '-si', '2'],
      { windowsHide: true }
    )
    proc.stdout.on('data', (chunk: Buffer) => {
      for (const line of chunk.toString().split('\n')) {
        const match = line.match(/,"([0-9.]+)"\s*$/)
        if (match) {
          const value = Number.parseFloat(match[1])
          if (Number.isFinite(value)) perfPercent = value
        }
      }
    })
    proc.on('error', () => {
      perfPercent = null
    })
    proc.on('exit', () => {
      proc = null
    })
  } catch {
    perfPercent = null
  }
}

export function stopCpuClockMonitor(): void {
  try {
    proc?.kill()
  } catch {
    /* ignore */
  }
  proc = null
}

/** Live effective clock in GHz, or null when the counter is unavailable. */
export function liveCpuGHz(baseGHz: number): number | null {
  if (perfPercent == null || !baseGHz) return null
  return Number(((baseGHz * perfPercent) / 100).toFixed(2))
}
