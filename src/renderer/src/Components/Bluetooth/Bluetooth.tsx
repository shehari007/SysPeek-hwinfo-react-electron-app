import type { StaticInfo } from '@shared/ipc'
import type { Systeminformation } from 'systeminformation'
import {
  RadarChartOutlined,
  LinkOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  SoundOutlined,
  DesktopOutlined,
  DisconnectOutlined
} from '@ant-design/icons'
import {
  PageHeader,
  Section,
  GlassCard,
  SpecGrid,
  StatTile,
  Meter,
  HealthPill,
  EmptyHint
} from '../ui/kit'
import { display, usageColor } from '../../lib/format'

const ACCENT = '#7cc4ff'

function typeIcon(type?: string): React.JSX.Element {
  const t = (type ?? '').toLowerCase()
  if (t.includes('audio') || t.includes('headphone') || t.includes('speaker'))
    return <SoundOutlined />
  if (t.includes('keyboard') || t.includes('mouse') || t.includes('computer'))
    return <DesktopOutlined />
  return <LinkOutlined />
}

export default function Bluetooth({ siData }: { siData: StaticInfo | null }): React.JSX.Element {
  const devices: Systeminformation.BluetoothDeviceData[] = siData?.bluetoothDevices ?? []

  const connectedCount = devices.filter((d) => d.connected).length
  const withBattery = devices.filter(
    (d) => typeof d.batteryPercent === 'number' && d.batteryPercent >= 0
  )
  const avgBattery =
    withBattery.length > 0
      ? Math.round(
          withBattery.reduce((sum, d) => sum + (d.batteryPercent ?? 0), 0) / withBattery.length
        )
      : null

  return (
    <div className="section-container">
      <PageHeader
        icon={<RadarChartOutlined />}
        title="Bluetooth"
        subtitle="Paired and connected Bluetooth peripherals"
        color={ACCENT}
        stats={[
          { label: 'Devices', value: devices.length, color: ACCENT },
          { label: 'Connected', value: connectedCount, color: 'var(--ds-good)' },
          { label: 'Paired', value: devices.length - connectedCount, color: 'var(--ds-ink-3)' },
          {
            label: 'Avg Battery',
            value: avgBattery !== null ? `${avgBattery}%` : 'N/A',
            color: avgBattery !== null ? usageColor(100 - avgBattery) : 'var(--ds-ink-3)'
          }
        ]}
      />

      {devices.length === 0 ? (
        <EmptyHint
          icon={<DisconnectOutlined />}
          title="No Bluetooth devices detected"
          description="No paired or connected Bluetooth peripherals were reported by this system."
        />
      ) : (
        <>
          <Section icon={<ApiOutlined />} title="OVERVIEW" color={ACCENT}>
            <div className="ds-cards-3">
              <StatTile
                icon={<RadarChartOutlined />}
                label="Total Devices"
                value={devices.length}
                sub="paired + connected"
                color={ACCENT}
              />
              <StatTile
                icon={<LinkOutlined />}
                label="Connected Now"
                value={connectedCount}
                sub={`${devices.length - connectedCount} paired only`}
                color="var(--ds-good)"
              />
              <StatTile
                icon={<ThunderboltOutlined />}
                label="Battery Reporting"
                value={withBattery.length}
                sub={avgBattery !== null ? `avg ${avgBattery}%` : 'no battery data'}
                color={avgBattery !== null ? usageColor(100 - avgBattery) : 'var(--ds-ink-3)'}
              />
            </div>
          </Section>

          <Section icon={<LinkOutlined />} title="DEVICES" color={ACCENT}>
            <div className="ds-cards-2">
              {devices.map((device, index) => {
                const hasBattery =
                  typeof device.batteryPercent === 'number' && device.batteryPercent >= 0
                const battery = device.batteryPercent ?? 0
                return (
                  <GlassCard
                    key={`${device.macDevice || device.name || 'bt'}-${index}`}
                    className="ds-glow"
                    glow={device.connected ? '#4ade80' : ACCENT}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        marginBottom: 14
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
                        <span style={{ color: ACCENT, fontSize: 22 }}>{typeIcon(device.type)}</span>
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 600,
                              fontSize: 15,
                              color: 'var(--ds-ink)',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap'
                            }}
                          >
                            {device.name || 'Unknown Device'}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--ds-ink-3)' }}>
                            {display(device.manufacturer)}
                          </div>
                        </div>
                      </div>
                      <HealthPill status={device.connected ? 'good' : 'idle'}>
                        {device.connected ? 'Connected' : 'Paired'}
                      </HealthPill>
                    </div>

                    {hasBattery && (
                      <div style={{ marginBottom: 12 }}>
                        <Meter
                          label="Battery"
                          percent={battery}
                          color={usageColor(100 - battery)}
                          right={`${battery}%`}
                        />
                      </div>
                    )}

                    <SpecGrid
                      columns={2}
                      items={[
                        { label: 'Type', value: display(device.type) },
                        { label: 'Manufacturer', value: display(device.manufacturer) },
                        {
                          label: 'Battery',
                          value: hasBattery ? `${battery}%` : 'N/A'
                        },
                        {
                          label: 'Status',
                          value: device.connected ? 'Connected' : 'Paired',
                          color: device.connected ? 'var(--ds-good)' : 'var(--ds-ink-3)'
                        },
                        {
                          label: 'Device MAC',
                          value: display(device.macDevice),
                          mono: true,
                          copyable: !!device.macDevice
                        },
                        {
                          label: 'Host MAC',
                          value: display(device.macHost),
                          mono: true,
                          copyable: !!device.macHost
                        },
                        {
                          label: 'Device ID',
                          value: display(device.device),
                          mono: true,
                          copyable: !!device.device,
                          span: 2
                        }
                      ]}
                    />
                  </GlassCard>
                )
              })}
            </div>
          </Section>
        </>
      )}
    </div>
  )
}
