import { useEffect, useState } from 'react'
import { Alert, Button, Progress } from 'antd'
import { DownloadOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons'
import type { UpdateStatus } from '@shared/ipc'
import { sysapi, updater } from '../../lib/api'

export default function UpdateBanner(): React.JSX.Element | null {
  const [status, setStatus] = useState<UpdateStatus | null>(null)

  useEffect(() => {
    updater
      .getStatus()
      .then(setStatus)
      .catch(() => {})
    return updater.onStatus(setStatus)
  }, [])

  if (!status) return null
  const { state, version } = status
  const label = version ? `v${version}` : ''

  if (state === 'error') {
    return (
      <Alert
        className="update-banner"
        type="error"
        showIcon
        closable
        message="Update check failed"
        description={status.error ?? 'Unknown error while checking for updates.'}
      />
    )
  }

  // Platforms that can detect an update but not install one, currently macOS.
  // Showing the usual progress bar here would sit at zero forever, because
  // nothing is downloading and nothing is going to.
  if (state === 'available' && status.manualDownload) {
    return (
      <Alert
        className="update-banner"
        type="info"
        showIcon
        closable
        icon={<DownloadOutlined />}
        message={`Update ${label} is available`}
        description="Automatic install is not supported on this platform. Download the new version from the releases page."
        action={
          <Button
            size="small"
            type="primary"
            icon={<ExportOutlined />}
            onClick={() => {
              sysapi.openExternal(status.releaseUrl).catch(() => {})
            }}
          >
            Open Releases
          </Button>
        }
      />
    )
  }

  if (state === 'available' || state === 'downloading') {
    return (
      <Alert
        className="update-banner"
        type="info"
        showIcon
        icon={<DownloadOutlined />}
        message={`Downloading update ${label}`}
        description={<Progress percent={status.percent} size="small" status="active" />}
      />
    )
  }

  if (state === 'downloaded') {
    return (
      <Alert
        className="update-banner"
        type="success"
        showIcon
        message={`Update ${label} is ready to install`}
        description="Restart SysPeek to apply the latest version."
        action={
          <Button
            size="small"
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => updater.installNow()}
          >
            Restart & Install
          </Button>
        }
      />
    )
  }

  return null
}
