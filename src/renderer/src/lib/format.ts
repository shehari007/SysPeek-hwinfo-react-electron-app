// Shared formatting helpers so every panel renders values the same way.

export function formatBytes(bytes: number | null | undefined, decimals = 1): string {
  if (bytes === null || bytes === undefined || Number.isNaN(bytes)) return 'N/A'
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB']
  const i = Math.min(Math.floor(Math.log(Math.abs(bytes)) / Math.log(k)), sizes.length - 1)
  return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`
}

export function formatSpeed(bytesPerSec: number | null | undefined): string {
  if (bytesPerSec === null || bytesPerSec === undefined || Number.isNaN(bytesPerSec)) return '0 B/s'
  if (bytesPerSec === 0) return '0 B/s'
  return `${formatBytes(bytesPerSec, 1)}/s`
}

export function formatGHz(value: number | null | undefined): string {
  if (!value) return 'N/A'
  return `${value.toFixed(2)} GHz`
}

export function formatMHz(value: number | null | undefined): string {
  if (!value) return 'N/A'
  if (value >= 1000) return `${(value / 1000).toFixed(2)} GHz`
  return `${value} MHz`
}

export function formatDuration(seconds: number | null | undefined): string {
  if (!seconds || seconds < 0) return 'N/A'
  const d = Math.floor(seconds / 86400)
  const h = Math.floor((seconds % 86400) / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (d > 0) return `${d}d ${h}h ${m}m`
  if (h > 0) return `${h}h ${m}m`
  return `${m}m`
}

export function formatHours(hours: number | null | undefined): string {
  if (!hours && hours !== 0) return 'N/A'
  if (hours < 24) return `${hours} h`
  const days = Math.floor(hours / 24)
  return `${days}d (${hours.toLocaleString()} h)`
}

/** Turns any value into a display string, coercing empty and nullish to a dash. */
export function display(value: unknown, suffix = ''): string {
  if (value === null || value === undefined || value === '' || value === -1) return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return `${value}${suffix}`
}

export function usageColor(percent: number): string {
  if (percent >= 90) return '#ff6b6b'
  if (percent >= 70) return '#ffd666'
  return '#5dd39e'
}

export function tempColor(celsius: number | null): string {
  if (celsius === null) return '#7cc4ff'
  if (celsius >= 85) return '#ff6b6b'
  if (celsius >= 65) return '#ffd666'
  return '#5dd39e'
}
