import {
  Drawer,
  Segmented,
  Switch,
  Select,
  Slider,
  Button,
  Divider,
  Typography,
  Space,
  Tag,
  App
} from 'antd'
import {
  BgColorsOutlined,
  ReloadOutlined,
  BellOutlined,
  SafetyCertificateOutlined,
  ExportOutlined,
  CloudSyncOutlined,
  DesktopOutlined
} from '@ant-design/icons'
import type { AppSettings, SystemMeta } from '@shared/ipc'
import { sysapi, updater } from '../../lib/api'

const { Text, Title } = Typography

const ACCENTS = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899']

interface SettingsPanelProps {
  open: boolean
  settings: AppSettings | null
  meta: SystemMeta | null
  onClose: () => void
  onChange: (patch: Partial<AppSettings>) => void | Promise<void>
}

function Row({ label, hint, control }: { label: string; hint?: string; control: React.ReactNode }): React.JSX.Element {
  return (
    <div className="settings-row">
      <div className="settings-row-text">
        <Text className="settings-row-label">{label}</Text>
        {hint && <Text className="settings-row-hint">{hint}</Text>}
      </div>
      <div className="settings-row-control">{control}</div>
    </div>
  )
}

export default function SettingsPanel({
  open,
  settings,
  meta,
  onClose,
  onChange
}: SettingsPanelProps): React.JSX.Element {
  const { message } = App.useApp()
  const s = settings

  const runExport = async (): Promise<void> => {
    const res = await sysapi.exportReport()
    if (res.ok) message.success('Report exported')
    else if (!res.canceled) message.error(res.error ?? 'Export failed')
  }

  const relaunchAdmin = async (): Promise<void> => {
    const ok = await sysapi.relaunchAsAdmin()
    if (!ok) message.warning('Elevation is only available on Windows')
  }

  return (
    <Drawer
      title="Settings"
      placement="right"
      width={420}
      open={open}
      onClose={onClose}
      className="settings-drawer"
    >
      <Title level={5} className="settings-section">
        <BgColorsOutlined /> Appearance
      </Title>
      <Row
        label="Theme"
        control={
          <Segmented
            value={s?.theme ?? 'dark'}
            onChange={(v) => onChange({ theme: v as AppSettings['theme'] })}
            options={[
              { label: 'Dark', value: 'dark' },
              { label: 'Light', value: 'light' }
            ]}
          />
        }
      />
      <Row
        label="Accent color"
        control={
          <div className="accent-swatches">
            {ACCENTS.map((c) => (
              <button
                key={c}
                type="button"
                aria-label={`Accent ${c}`}
                className={`accent-swatch ${s?.accentColor === c ? 'active' : ''}`}
                style={{ background: c }}
                onClick={() => onChange({ accentColor: c })}
              />
            ))}
          </div>
        }
      />

      <Divider />
      <Title level={5} className="settings-section">
        <ReloadOutlined /> Monitoring
      </Title>
      <Row
        label="Refresh interval"
        hint="How often live telemetry is sampled"
        control={
          <Select
            style={{ width: 130 }}
            value={s?.refreshMs ?? 2000}
            onChange={(v) => onChange({ refreshMs: v })}
            options={[
              { label: '1 second', value: 1000 },
              { label: '2 seconds', value: 2000 },
              { label: '5 seconds', value: 5000 },
              { label: '10 seconds', value: 10000 }
            ]}
          />
        }
      />
      <Row
        label="Show system volumes"
        hint="Include OS and virtual volumes in disk usage"
        control={
          <Switch
            checked={s?.showSystemDrives ?? false}
            onChange={(v) => onChange({ showSystemDrives: v })}
          />
        }
      />

      <Divider />
      <Title level={5} className="settings-section">
        <DesktopOutlined /> Window & Tray
      </Title>
      <Row
        label="Open at launch"
        hint="How the window appears when SysPeek starts"
        control={
          <Select
            style={{ width: 150 }}
            value={s?.startMode ?? 'maximized'}
            onChange={(v) => onChange({ startMode: v })}
            options={[
              { label: 'Maximized', value: 'maximized' },
              { label: 'Full screen', value: 'fullscreen' },
              { label: 'Last size', value: 'remember' }
            ]}
          />
        }
      />
      <Row
        label="Minimize to tray"
        control={
          <Switch
            checked={s?.minimizeToTray ?? true}
            onChange={(v) => onChange({ minimizeToTray: v })}
          />
        }
      />
      <Row
        label="Keep running in tray on close"
        control={
          <Switch checked={s?.closeToTray ?? false} onChange={(v) => onChange({ closeToTray: v })} />
        }
      />
      <Row
        label="Launch at startup"
        control={
          <Switch
            checked={s?.launchAtStartup ?? false}
            onChange={(v) => onChange({ launchAtStartup: v })}
          />
        }
      />

      <Divider />
      <Title level={5} className="settings-section">
        <BellOutlined /> Threshold alerts
      </Title>
      <Row
        label="Desktop notifications"
        control={
          <Switch
            checked={s?.notificationsEnabled ?? true}
            onChange={(v) => onChange({ notificationsEnabled: v })}
          />
        }
      />
      <div className="threshold-sliders">
        <ThresholdSlider
          label="CPU temperature"
          suffix="°C"
          min={50}
          max={100}
          value={s?.thresholds.cpuTemp ?? 85}
          onChange={(v) => onChange({ thresholds: { ...defaultThresholds(s), cpuTemp: v } })}
        />
        <ThresholdSlider
          label="CPU load"
          suffix="%"
          min={50}
          max={100}
          value={s?.thresholds.cpuLoad ?? 90}
          onChange={(v) => onChange({ thresholds: { ...defaultThresholds(s), cpuLoad: v } })}
        />
        <ThresholdSlider
          label="Memory usage"
          suffix="%"
          min={50}
          max={100}
          value={s?.thresholds.memUsage ?? 90}
          onChange={(v) => onChange({ thresholds: { ...defaultThresholds(s), memUsage: v } })}
        />
        <ThresholdSlider
          label="Disk usage"
          suffix="%"
          min={50}
          max={100}
          value={s?.thresholds.diskUsage ?? 90}
          onChange={(v) => onChange({ thresholds: { ...defaultThresholds(s), diskUsage: v } })}
        />
      </div>

      <Divider />
      <Title level={5} className="settings-section">
        <SafetyCertificateOutlined /> Access & maintenance
      </Title>
      <Space direction="vertical" style={{ width: '100%' }} size={10}>
        {meta?.platform === 'win32' && !meta?.isElevated && (
          <Button block icon={<SafetyCertificateOutlined />} onClick={relaunchAdmin}>
            Relaunch as Administrator
          </Button>
        )}
        {meta?.isElevated && (
          <Tag color="green" style={{ padding: '4px 10px' }}>
            Running with elevated privileges
          </Tag>
        )}
        <Button block icon={<ExportOutlined />} onClick={runExport}>
          Export full report (JSON)
        </Button>
        <Button
          block
          icon={<CloudSyncOutlined />}
          onClick={() => {
            updater.check()
            message.info('Checking for updates…')
          }}
        >
          Check for updates
        </Button>
      </Space>

      {meta && (
        <>
          <Divider />
          <div className="settings-meta">
            <Text type="secondary">
              SysPeek v{meta.appVersion} • Electron {meta.electronVersion} • Node {meta.nodeVersion}
            </Text>
          </div>
        </>
      )}
    </Drawer>
  )
}

function defaultThresholds(s: AppSettings | null): AppSettings['thresholds'] {
  return s?.thresholds ?? { cpuTemp: 85, cpuLoad: 90, memUsage: 90, diskUsage: 90 }
}

interface ThresholdSliderProps {
  label: string
  suffix: string
  min: number
  max: number
  value: number
  onChange: (value: number) => void
}

function ThresholdSlider({
  label,
  suffix,
  min,
  max,
  value,
  onChange
}: ThresholdSliderProps): React.JSX.Element {
  return (
    <div className="threshold-slider">
      <div className="threshold-slider-head">
        <Text className="settings-row-label">{label}</Text>
        <Text className="threshold-value">
          {value}
          {suffix}
        </Text>
      </div>
      <Slider min={min} max={max} value={value} onChange={onChange} tooltip={{ open: false }} />
    </div>
  )
}
