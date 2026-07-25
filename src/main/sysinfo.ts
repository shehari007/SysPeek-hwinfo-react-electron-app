import si from 'systeminformation'
import { exec } from 'node:child_process'
import type { StaticInfo, DynamicStats, ProcessSnapshot, ProcessInfo, FsVolume } from '@shared/ipc'
import { liveCpuGHz } from './cpuclock'
import { getSensors } from './sensors'

// The full static inventory is expensive and never changes during a session, so
// it is gathered once and cached. Everything here runs in the Node main process,
// which is what lets us keep the renderer sandboxed.
let cachedStatic: StaticInfo | null = null

export async function getStatic(force = false): Promise<StaticInfo> {
  if (cachedStatic && !force) return cachedStatic
  const data = (await si.get({
    cpu: '*',
    cpuCache: '*',
    mem: '*',
    memLayout: '*',
    graphics: 'controllers, displays',
    battery: '*',
    osInfo: '*',
    uuid: '*',
    versions: '*',
    diskLayout: '*',
    networkInterfaces: '*',
    networkGatewayDefault: '*',
    networkInterfaceDefault: '*',
    system: '*',
    bios: '*',
    baseboard: '*',
    chassis: '*',
    audio: '*',
    bluetoothDevices: '*',
    printer: '*',
    usb: '*',
    wifiNetworks: '*'
  })) as unknown as StaticInfo
  cachedStatic = data
  return data
}

export async function getDynamic(): Promise<DynamicStats> {
  const [load, speed, temp, cpuInfo, mem, disks, net, fs, time] = await Promise.all([
    si.currentLoad(),
    si.cpuCurrentSpeed(),
    si.cpuTemperature(),
    si.cpu(),
    si.mem(),
    si.disksIO(),
    si.networkStats(),
    si.fsSize(),
    Promise.resolve(si.time())
  ])

  const netArray = Array.isArray(net) ? net : net ? [net] : []
  const netAgg = netArray.reduce(
    (acc, n) => ({
      rx: acc.rx + (n.rx_sec || 0),
      tx: acc.tx + (n.tx_sec || 0),
      rxTotal: acc.rxTotal + (n.rx_bytes || 0),
      txTotal: acc.txTotal + (n.tx_bytes || 0),
      iface: n.iface || acc.iface
    }),
    { rx: 0, tx: 0, rxTotal: 0, txTotal: 0, iface: '' }
  )

  const fsSize: FsVolume[] = (fs || [])
    .filter((v) => v.size > 0)
    .map((v) => ({
      fs: v.fs,
      type: v.type,
      size: v.size,
      used: v.used,
      available: v.available,
      use: v.use,
      mount: v.mount
    }))

  const m = mem as unknown as Record<string, number>
  const sensors = getSensors()

  return {
    cpuLoad: Number((load.currentLoad || 0).toFixed(1)),
    cpuSpeed: liveCpuGHz(cpuInfo.speed) ?? (speed.avg || speed.min || 0),
    cpuTemp:
      sensors.cpuTemp ?? (typeof temp.main === 'number' && temp.main > 0 ? temp.main : null),
    cpuModel: cpuInfo.brand || 'Unknown CPU',
    cpuCores: (load.cpus || []).map((c) => Number((c.load || 0).toFixed(1))),
    mem: {
      total: m.total || 0,
      used: m.used || 0,
      free: m.free || 0,
      active: m.active || 0,
      available: m.available || 0,
      buffcache: m.buffcache || 0,
      slab: m.slab || 0,
      swaptotal: m.swaptotal || 0,
      swapused: m.swapused || 0,
      swapfree: m.swapfree || 0
    },
    disks: {
      read: disks?.rIO_sec ?? 0,
      write: disks?.wIO_sec ?? 0,
      rIO: disks?.rIO ?? 0,
      wIO: disks?.wIO ?? 0,
      tIO: disks?.tIO ?? 0
    },
    net: netAgg,
    fsSize,
    uptime: time?.uptime || 0,
    sensors,
    timestamp: Date.now()
  }
}

export async function getProcesses(limit = 200): Promise<ProcessSnapshot> {
  const procs = await si.processes()
  const list: ProcessInfo[] = (procs.list || [])
    .sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
    .slice(0, limit)
    .map((p) => ({
      pid: p.pid,
      name: p.name || '',
      cpu: p.cpu || 0,
      mem: p.mem || 0,
      memRss: p.memRss || 0,
      memVsz: p.memVsz || 0,
      user: p.user || '',
      command: p.command || '',
      state: p.state || '',
      priority: p.priority || 0,
      started: p.started || ''
    }))
  return { all: Number.isFinite(procs.all) ? procs.all : list.length, list }
}

/** Best effort admin/root detection used to surface elevated-only fields in the UI. */
export function isElevated(): Promise<boolean> {
  return new Promise((resolve) => {
    if (process.platform === 'win32') {
      exec('net session', { windowsHide: true }, (err) => resolve(!err))
    } else {
      resolve(typeof process.getuid === 'function' && process.getuid() === 0)
    }
  })
}
