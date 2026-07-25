import {
  DashboardOutlined,
  ThunderboltOutlined,
  FireOutlined,
  ClusterOutlined,
  DatabaseOutlined,
  CheckCircleOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  GlobalOutlined,
  SwapOutlined,
  ReadOutlined,
  EditOutlined,
  SyncOutlined,
  DesktopOutlined,
  InfoCircleOutlined
} from '@ant-design/icons'
import type { SensorSnapshot } from '@shared/ipc'
import { Section, GlassCard, SpecGrid, StatTile, Meter } from '../ui/kit'
import { useLiveStats } from '../../lib/live'
import { formatBytes, formatSpeed, usageColor, tempColor } from '../../lib/format'

function LiveBadge(): React.JSX.Element {
  return (
    <span className="live-badge">
      <span className="live-badge-dot" />
      Live
    </span>
  )
}

function sourceLabel(source: SensorSnapshot['source']): string {
  if (source === 'librehardwaremonitor') return 'LibreHardwareMonitor'
  if (source === 'acpi') return 'ACPI thermal zone'
  return 'package sensor'
}

function SensorHint(): React.JSX.Element {
  return (
    <div className="sensor-hint">
      <InfoCircleOutlined />
      <span>
        Temperatures, fan speeds and power are not available from a base sensor. Run
        LibreHardwareMonitor, or relaunch SysPeek as administrator, to read them.
      </span>
    </div>
  )
}

function SensorExtras({
  sensors,
  cpuTemp
}: {
  sensors: SensorSnapshot | undefined
  cpuTemp: number | null
}): React.JSX.Element | null {
  const temps = sensors?.temps ?? []
  const fans = sensors?.fans ?? []

  if (temps.length > 0 || fans.length > 0) {
    return (
      <div style={{ marginTop: 14 }}>
        <GlassCard>
          {temps.length > 0 && (
            <SpecGrid
              columns={3}
              items={temps.slice(0, 12).map((t) => ({
                label: t.label,
                value: `${t.value}°C`,
                color: tempColor(t.value)
              }))}
            />
          )}
          {fans.length > 0 && (
            <div className="ds-cards-3" style={{ marginTop: temps.length ? 12 : 0 }}>
              {fans.map((f, i) => (
                <StatTile
                  key={i}
                  icon={<SyncOutlined spin />}
                  label={f.label}
                  value={`${f.rpm} RPM`}
                  color="#7cc4ff"
                />
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    )
  }

  if (cpuTemp == null && (sensors?.source ?? 'none') === 'none') {
    return (
      <div style={{ marginTop: 14 }}>
        <SensorHint />
      </div>
    )
  }
  return null
}

export function CpuLive(): React.JSX.Element {
  const live = useLiveStats()
  const load = live?.cpuLoad ?? 0
  const speed = live?.cpuSpeed ?? 0
  const temp = live?.cpuTemp ?? null
  const cores = live?.cpuCores ?? []
  const sensors = live?.sensors
  const power = sensors?.cpuPower ?? null

  return (
    <Section icon={<DashboardOutlined />} title="LIVE" color="#7cc4ff" extra={<LiveBadge />}>
      {/* Exactly four tiles, so pin four columns rather than letting a trailing
          tile strand itself on its own row. */}
      <div className="ds-cards-4" style={{ marginBottom: cores.length ? 14 : 0 }}>
        <StatTile
          icon={<DashboardOutlined />}
          label="CPU Load"
          value={`${load.toFixed(1)}%`}
          sub="current utilization"
          color={usageColor(load)}
        />
        <StatTile
          icon={<ThunderboltOutlined />}
          label="Current Speed"
          value={speed ? `${speed.toFixed(2)} GHz` : 'N/A'}
          sub="live turbo clock"
          color="#7cc4ff"
        />
        <StatTile
          icon={<FireOutlined />}
          label="Temperature"
          value={temp != null ? `${temp}°C` : 'N/A'}
          sub={temp != null ? sourceLabel(sensors?.source ?? 'none') : 'sensor unavailable'}
          color={temp != null ? tempColor(temp) : '#64748b'}
        />
        {power != null ? (
          <StatTile
            icon={<ThunderboltOutlined />}
            label="Package Power"
            value={`${power.toFixed(1)} W`}
            sub="live draw"
            color="#f59e0b"
          />
        ) : (
          <StatTile
            icon={<ClusterOutlined />}
            label="Logical Cores"
            value={cores.length || 'N/A'}
            sub="reporting load"
            color="#a78bfa"
          />
        )}
      </div>
      {cores.length > 0 && (
        <GlassCard>
          <div className="live-cores">
            {cores.map((c, i) => (
              <div key={i} className="live-core">
                <div className="live-core-head">
                  <span>Core {i}</span>
                  <span style={{ color: usageColor(c) }}>{c.toFixed(0)}%</span>
                </div>
                <div className="ds-meter-track">
                  <div className="ds-meter-fill" style={{ width: `${c}%`, background: usageColor(c) }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
      <SensorExtras sensors={sensors} cpuTemp={temp} />
    </Section>
  )
}

export function GraphicsLive(): React.JSX.Element {
  const live = useLiveStats()
  const sensors = live?.sensors
  const gpuTemp = sensors?.gpuTemp ?? null
  const gpuLoad = sensors?.gpuLoad ?? null

  return (
    <Section icon={<DesktopOutlined />} title="LIVE GPU" color="#b37feb" extra={<LiveBadge />}>
      {gpuLoad == null && gpuTemp == null ? (
        <SensorHint />
      ) : (
        <div className="ds-cards-3">
          <StatTile
            icon={<DashboardOutlined />}
            label="GPU Load"
            value={gpuLoad != null ? `${gpuLoad}%` : 'N/A'}
            sub="all engines"
            color={gpuLoad != null ? usageColor(gpuLoad) : '#64748b'}
          />
          <StatTile
            icon={<FireOutlined />}
            label="GPU Temperature"
            value={gpuTemp != null ? `${gpuTemp}°C` : 'N/A'}
            sub={gpuTemp != null ? sourceLabel(sensors?.source ?? 'none') : 'needs LibreHardwareMonitor'}
            color={gpuTemp != null ? tempColor(gpuTemp) : '#64748b'}
          />
          <StatTile
            icon={<ThunderboltOutlined />}
            label="Sensor Source"
            value={sensors?.source === 'librehardwaremonitor' ? 'LHM' : sensors?.source === 'acpi' ? 'ACPI' : 'Counters'}
            sub="live provider"
            color="#7cc4ff"
          />
        </div>
      )}
    </Section>
  )
}

export function MemoryLive(): React.JSX.Element {
  const live = useLiveStats()
  const m = live?.mem
  const total = m?.total ?? 0
  const used = m?.used ?? 0
  const pct = total ? (used / total) * 100 : 0
  const swapPct = m && m.swaptotal ? (m.swapused / m.swaptotal) * 100 : 0

  return (
    <Section icon={<DatabaseOutlined />} title="LIVE USAGE" color="#5dd39e" extra={<LiveBadge />}>
      <GlassCard>
        <Meter
          label={`Memory  ${formatBytes(used)} / ${formatBytes(total)}`}
          percent={pct}
          color={usageColor(pct)}
          right={`${pct.toFixed(1)}%`}
        />
        {m && m.swaptotal > 0 && (
          <Meter
            label={`Swap  ${formatBytes(m.swapused)} / ${formatBytes(m.swaptotal)}`}
            percent={swapPct}
            color="#b37feb"
            right={`${swapPct.toFixed(1)}%`}
          />
        )}
        <div className="ds-cards-3" style={{ marginTop: 12 }}>
          <StatTile icon={<DatabaseOutlined />} label="Used" value={formatBytes(used)} color={usageColor(pct)} />
          <StatTile
            icon={<CheckCircleOutlined />}
            label="Available"
            value={formatBytes(m?.available ?? 0)}
            color="#5dd39e"
          />
          <StatTile
            icon={<ThunderboltOutlined />}
            label="Active"
            value={formatBytes(m?.active ?? 0)}
            color="#7cc4ff"
          />
        </div>
      </GlassCard>
    </Section>
  )
}

export function StorageLive(): React.JSX.Element {
  const live = useLiveStats()
  const d = live?.disks

  return (
    <Section icon={<SwapOutlined />} title="LIVE DISK ACTIVITY" color="#ffd666" extra={<LiveBadge />}>
      <div className="ds-cards-3">
        <StatTile
          icon={<ReadOutlined />}
          label="Read Activity"
          value={`${Math.round(d?.read ?? 0)} IO/s`}
          sub="read operations"
          color="#7cc4ff"
        />
        <StatTile
          icon={<EditOutlined />}
          label="Write Activity"
          value={`${Math.round(d?.write ?? 0)} IO/s`}
          sub="write operations"
          color="#ffd666"
        />
        <StatTile
          icon={<SwapOutlined />}
          label="Total Operations"
          value={(d?.tIO ?? 0).toLocaleString()}
          sub="since boot"
          color="#a78bfa"
        />
      </div>
    </Section>
  )
}

export function NetworkLive(): React.JSX.Element {
  const live = useLiveStats()
  const n = live?.net

  return (
    <Section icon={<GlobalOutlined />} title="LIVE THROUGHPUT" color="#7cc4ff" extra={<LiveBadge />}>
      <div className="ds-cards-3">
        <StatTile
          icon={<CloudDownloadOutlined />}
          label="Download"
          value={formatSpeed(n?.rx ?? 0)}
          sub={n?.iface || 'aggregate'}
          color="#5dd39e"
        />
        <StatTile
          icon={<CloudUploadOutlined />}
          label="Upload"
          value={formatSpeed(n?.tx ?? 0)}
          sub="aggregate"
          color="#ff8080"
        />
        <StatTile
          icon={<SwapOutlined />}
          label="Total Transferred"
          value={`↓${formatBytes(n?.rxTotal ?? 0)}  ↑${formatBytes(n?.txTotal ?? 0)}`}
          sub="since boot"
          color="#b37feb"
        />
      </div>
    </Section>
  )
}
