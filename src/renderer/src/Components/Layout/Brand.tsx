import { Tooltip } from 'antd'
import { SafetyCertificateFilled } from '@ant-design/icons'
import type { SystemMeta } from '@shared/ipc'

interface BrandProps {
  collapsed: boolean
  meta: SystemMeta | null
}

function platformLabel(platform: string | undefined): string {
  if (platform === 'win32') return 'Windows'
  if (platform === 'darwin') return 'macOS'
  if (platform === 'linux') return 'Linux'
  return platform ?? ''
}

/**
 * Sidebar identity block. Expanded it shows the product name plus the details
 * people actually want at a glance: version, CPU architecture, host platform and
 * whether the app is running elevated.
 */
export default function Brand({ collapsed, meta }: BrandProps): React.JSX.Element {
  const version = meta?.appVersion ?? '2.0.0'
  const arch = meta?.arch ?? ''
  const platform = platformLabel(meta?.platform)

  if (collapsed) {
    return (
      <div className="brand brand-collapsed">
        <Tooltip title={`SysPeek v${version} · ${arch}`} placement="right">
          <div className="brand-logo">
            <img src="logo192.png" height={34} width={34} alt="SysPeek" />
          </div>
        </Tooltip>
      </div>
    )
  }

  return (
    <div className="brand">
      <div className="brand-logo">
        <img src="logo192.png" height={38} width={38} alt="SysPeek" />
      </div>
      <div className="brand-info">
        <span className="brand-name">
          SysPeek
          {meta?.isElevated && (
            <Tooltip title="Running with elevated privileges">
              <SafetyCertificateFilled className="brand-elevated-icon" />
            </Tooltip>
          )}
        </span>
        <span className="brand-chips">
          <span className="brand-chip brand-chip-version">v{version}</span>
          {arch && <span className="brand-chip">{arch}</span>}
        </span>
        {platform && <span className="brand-platform">{platform}</span>}
      </div>
    </div>
  )
}
