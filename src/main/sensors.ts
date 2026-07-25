import { spawn, type ChildProcessWithoutNullStreams } from 'node:child_process'
import type { SensorSnapshot } from '@shared/ipc'

/**
 * Hybrid hardware sensor bridge for Windows.
 *
 * systeminformation cannot read most real hardware sensors on Windows. This
 * layer enriches the telemetry with, in order of preference:
 *   1. LibreHardwareMonitor (root/LibreHardwareMonitor WMI) when the user runs
 *      it: full temperatures, fan RPM, power, voltages and per-core clocks.
 *   2. The ACPI thermal zone (needs administrator) for a CPU/system temperature.
 *   3. GPU utilization from the driver-free PDH GPU counters.
 *
 * A single long-lived PowerShell process streams a normalized JSON snapshot on a
 * slow cadence, which keeps overhead low. Everything degrades gracefully: when no
 * source is available the snapshot's `source` is 'none' and the UI shows a hint.
 */
const EMPTY: SensorSnapshot = {
  source: 'none',
  cpuTemp: null,
  gpuTemp: null,
  cpuPower: null,
  gpuLoad: null,
  temps: [],
  fans: []
}

let snapshot: SensorSnapshot = EMPTY
let proc: ChildProcessWithoutNullStreams | null = null

const PS_SCRIPT = `
$ErrorActionPreference='SilentlyContinue'
$lhm=$false
try{ $null=Get-CimInstance -Namespace root/LibreHardwareMonitor -ClassName Hardware -ErrorAction Stop; $lhm=$true }catch{}
while($true){
  $r=[ordered]@{source='none';cpuTemp=$null;gpuTemp=$null;cpuPower=$null;gpuLoad=$null;temps=@();fans=@()}
  if($lhm){
    $r.source='librehardwaremonitor'
    $sn=Get-CimInstance -Namespace root/LibreHardwareMonitor -ClassName Sensor
    foreach($s in $sn){
      if($s.SensorType -eq 'Temperature' -and $s.Value){ $r.temps+=,@{label="$($s.Name)";value=[math]::Round($s.Value,1)} }
      if($s.SensorType -eq 'Fan' -and $s.Value){ $r.fans+=,@{label="$($s.Name)";rpm=[int]$s.Value} }
    }
    $ct=$sn|Where-Object{$_.SensorType -eq 'Temperature' -and $_.Name -match 'CPU Package|Core \\(Tctl|Core Max|CPU'}|Select-Object -First 1
    if($ct){$r.cpuTemp=[math]::Round($ct.Value,1)}
    $gt=$sn|Where-Object{$_.SensorType -eq 'Temperature' -and $_.Name -match 'GPU Core|GPU Hot|GPU'}|Select-Object -First 1
    if($gt){$r.gpuTemp=[math]::Round($gt.Value,1)}
    $cp=$sn|Where-Object{$_.SensorType -eq 'Power' -and $_.Name -match 'Package|CPU'}|Select-Object -First 1
    if($cp){$r.cpuPower=[math]::Round($cp.Value,1)}
    $gl=$sn|Where-Object{$_.SensorType -eq 'Load' -and $_.Name -match 'GPU Core'}|Select-Object -First 1
    if($gl){$r.gpuLoad=[math]::Round($gl.Value,1)}
  } else {
    try{ $tz=Get-CimInstance -Namespace root/wmi -ClassName MSAcpi_ThermalZoneTemperature -ErrorAction Stop|Select-Object -First 1
      if($tz.CurrentTemperature){$r.cpuTemp=[math]::Round(($tz.CurrentTemperature/10)-273.15,1);$r.source='acpi'} }catch{}
    try{ $g=(Get-Counter '\\GPU Engine(*)\\Utilization Percentage' -ErrorAction Stop).CounterSamples|Measure-Object -Property CookedValue -Sum
      if($g){$r.gpuLoad=[math]::Round([math]::Min($g.Sum,100),1)} }catch{}
  }
  ($r|ConvertTo-Json -Compress -Depth 4)
  '__SP_END__'
  Start-Sleep -Seconds 3
}
`

function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) return value as T[]
  if (value === null || value === undefined) return []
  return [value as T]
}

function parseSnapshot(json: string): void {
  try {
    const raw = JSON.parse(json) as Partial<SensorSnapshot>
    snapshot = {
      source: raw.source ?? 'none',
      cpuTemp: typeof raw.cpuTemp === 'number' ? raw.cpuTemp : null,
      gpuTemp: typeof raw.gpuTemp === 'number' ? raw.gpuTemp : null,
      cpuPower: typeof raw.cpuPower === 'number' ? raw.cpuPower : null,
      gpuLoad: typeof raw.gpuLoad === 'number' ? raw.gpuLoad : null,
      temps: toArray(raw.temps),
      fans: toArray(raw.fans)
    }
  } catch {
    /* keep the previous snapshot on a parse hiccup */
  }
}

export function startSensorMonitor(): void {
  if (process.platform !== 'win32' || proc) return
  try {
    const encoded = Buffer.from(PS_SCRIPT, 'utf16le').toString('base64')
    proc = spawn(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-EncodedCommand', encoded],
      { windowsHide: true }
    )
    let buffer = ''
    proc.stdout.on('data', (chunk: Buffer) => {
      buffer += chunk.toString()
      let idx = buffer.indexOf('__SP_END__')
      while (idx !== -1) {
        const block = buffer.slice(0, idx).trim()
        if (block) parseSnapshot(block)
        buffer = buffer.slice(idx + '__SP_END__'.length)
        idx = buffer.indexOf('__SP_END__')
      }
      if (buffer.length > 65536) buffer = buffer.slice(-4096)
    })
    proc.on('error', () => {
      snapshot = EMPTY
    })
    proc.on('exit', () => {
      proc = null
    })
  } catch {
    snapshot = EMPTY
  }
}

export function stopSensorMonitor(): void {
  try {
    proc?.kill()
  } catch {
    /* ignore */
  }
  proc = null
}

export function getSensors(): SensorSnapshot {
  return snapshot
}
