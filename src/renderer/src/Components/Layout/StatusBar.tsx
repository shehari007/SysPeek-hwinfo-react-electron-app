import { Tooltip } from 'antd'
import {
  ClockCircleOutlined,
  SafetyCertificateFilled,
  UserOutlined,
  HeartFilled,
  GithubOutlined,
  DashboardOutlined,
  ApiOutlined
} from '@ant-design/icons'
import type { StaticInfo, SystemMeta } from '@shared/ipc'
import { sysapi } from '../../lib/api'
import { useLiveStats } from '../../lib/live'
import { formatDuration } from '../../lib/format'

interface StatusBarProps {
  meta: SystemMeta | null
  staticInfo: StaticInfo | null
}

function osLabel(staticInfo: StaticInfo | null): string {
  const os = staticInfo?.osInfo
  if (!os) return ''
  const distro = os.distro || os.platform || ''
  const release = os.release && !distro.includes(os.release) ? ` ${os.release}` : ''
  return `${distro}${release}`.trim()
}

function sensorLabel(source: string | undefined): string {
  if (source === 'librehardwaremonitor') return 'LibreHardwareMonitor'
  if (source === 'acpi') return 'ACPI sensors'
  return 'Base sensors'
}

/**
 * Footer status bar. Groups the persistent facts (identity, host, runtime) on the
 * left, live state in the middle, and credit on the right. Only this component
 * subscribes to live stats, so the ticking uptime does not re-render the app.
 */
export default function StatusBar({ meta, staticInfo }: StatusBarProps): React.JSX.Element {
  const live = useLiveStats()
  const os = osLabel(staticInfo)
  const kernel = staticInfo?.osInfo?.kernel
  const build = staticInfo?.osInfo?.build
  const host = staticInfo?.osInfo?.hostname
  const sensors = live?.sensors?.source

  return (
    <div className="statusbar">
      <div className="statusbar-group">
        <span className="statusbar-brand">SysPeek</span>
        <span className="statusbar-tag statusbar-tag-accent">v{meta?.appVersion ?? '2.0.0'}</span>
        {meta?.arch && <span className="statusbar-tag">{meta.arch}</span>}
        {meta?.isElevated ? (
          <Tooltip title="Running with administrator privileges">
            <span className="statusbar-tag statusbar-tag-good">
              <SafetyCertificateFilled /> Elevated
            </span>
          </Tooltip>
        ) : (
          <Tooltip title="Running as a standard user. Some sensors need elevation.">
            <span className="statusbar-tag">
              <UserOutlined /> Standard
            </span>
          </Tooltip>
        )}
      </div>

      <span className="statusbar-sep" />

      <div className="statusbar-group statusbar-host">
        {os && (
          <Tooltip title={[kernel && `Kernel ${kernel}`, build && `Build ${build}`].filter(Boolean).join(' · ')}>
            <span className="statusbar-item">{os}</span>
          </Tooltip>
        )}
        {host && <span className="statusbar-item statusbar-dim">{host}</span>}
      </div>

      <div className="statusbar-group statusbar-live">
        {live && (
          <Tooltip title="System uptime">
            <span className="statusbar-item">
              <ClockCircleOutlined /> {formatDuration(live.uptime)}
            </span>
          </Tooltip>
        )}
        {live && (
          <Tooltip title="Live CPU load">
            <span className="statusbar-item">
              <DashboardOutlined /> {live.cpuLoad.toFixed(0)}%
            </span>
          </Tooltip>
        )}
        <Tooltip title="Active hardware sensor provider">
          <span className="statusbar-item statusbar-dim">
            <ApiOutlined /> {sensorLabel(sensors)}
          </span>
        </Tooltip>
      </div>

      <div className="statusbar-group statusbar-credit">
        <span className="statusbar-dim">
          Made with <HeartFilled className="statusbar-heart" /> by
        </span>
        <button
          type="button"
          className="statusbar-author"
          onClick={() => sysapi.openExternal('https://github.com/shehari007')}
        >
          <GithubOutlined /> Muhammad Sheharyar Butt
        </button>
      </div>
    </div>
  )
}
