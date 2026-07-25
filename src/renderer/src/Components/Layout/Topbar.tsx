import type { ReactNode } from 'react'
import { Button, Tooltip } from 'antd'
import { ExportOutlined, SettingFilled, CloudSyncOutlined } from '@ant-design/icons'
import { usageColor, tempColor } from '../../lib/format'
import { useLiveStats } from '../../lib/live'

interface TopbarProps {
  title: string
  icon: ReactNode
  onExport: () => void
  onSettings: () => void
  onCheckUpdates: () => void
}

export default function Topbar({
  title,
  icon,
  onExport,
  onSettings,
  onCheckUpdates
}: TopbarProps): React.JSX.Element {
  const live = useLiveStats()
  const cpu = live?.cpuLoad ?? 0
  const memPct = live && live.mem.total ? Math.round((live.mem.used / live.mem.total) * 100) : 0
  const temp = live?.cpuTemp ?? null

  return (
    <div className="topbar">
      <div className="topbar-title">
        {icon}
        <span>{title}</span>
      </div>
      <div className="topbar-pulse">
        <span className="pulse-chip">
          <span className="pulse-dot" style={{ color: usageColor(cpu) }} />
          CPU <b>{cpu.toFixed(0)}%</b>
        </span>
        <span className="pulse-chip">
          <span className="pulse-dot" style={{ color: usageColor(memPct) }} />
          RAM <b>{memPct}%</b>
        </span>
        {temp != null && (
          <span className="pulse-chip">
            <span className="pulse-dot" style={{ color: tempColor(temp) }} />
            TEMP <b>{temp}°C</b>
          </span>
        )}
      </div>
      <div className="topbar-actions">
        <Tooltip title="Check for updates">
          <Button type="text" icon={<CloudSyncOutlined />} onClick={onCheckUpdates} />
        </Tooltip>
        <Tooltip title="Export report">
          <Button type="text" icon={<ExportOutlined />} onClick={onExport} />
        </Tooltip>
        <Tooltip title="Settings">
          <Button type="text" icon={<SettingFilled />} onClick={onSettings} />
        </Tooltip>
      </div>
    </div>
  )
}
