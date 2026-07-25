import {
  SoundOutlined,
  AudioOutlined,
  CustomerServiceOutlined,
  ApiOutlined,
  CheckCircleOutlined,
  ArrowDownOutlined,
  ArrowUpOutlined,
  SwapOutlined
} from '@ant-design/icons'
import type { StaticInfo } from '@shared/ipc'
import type { Systeminformation } from 'systeminformation'
import {
  PageHeader,
  Section,
  GlassCard,
  SpecGrid,
  StatTile,
  HealthPill,
  EmptyHint
} from '../ui/kit'
import { display } from '../../lib/format'

const ACCENT = '#b37feb'

type Health = 'good' | 'warn' | 'bad' | 'info' | 'idle'

function statusHealth(status?: string): Health {
  const s = (status ?? '').toLowerCase()
  if (s.includes('online') || s.includes('ok') || s.includes('active')) return 'good'
  if (s.includes('offline') || s.includes('disabled') || s.includes('error')) return 'bad'
  if (!s) return 'idle'
  return 'info'
}

function directionLabel(device: Systeminformation.AudioData): string {
  if (device.in && device.out) return 'Input + Output'
  if (device.out) return 'Output'
  if (device.in) return 'Input'
  const t = (device.type ?? '').toLowerCase()
  if (t.includes('input')) return 'Input'
  if (t.includes('output')) return 'Output'
  return 'Unknown'
}

function DirectionIcon({ device }: { device: Systeminformation.AudioData }): React.JSX.Element {
  if (device.in && device.out) return <SwapOutlined />
  if (device.out) return <ArrowUpOutlined />
  if (device.in) return <ArrowDownOutlined />
  return <AudioOutlined />
}

export default function Audio({ siData }: { siData: StaticInfo | null }): React.JSX.Element {
  const audioDevices = siData?.audio ?? ([] as Systeminformation.AudioData[])

  const total = audioDevices.length
  const outputs = audioDevices.filter((d) => d.out || (d.type ?? '').toLowerCase().includes('output')).length
  const inputs = audioDevices.filter((d) => d.in || (d.type ?? '').toLowerCase().includes('input')).length
  const defaultDevice = audioDevices.find((d) => d.default)
  const onlineCount = audioDevices.filter((d) => statusHealth(d.status) === 'good').length

  const manufacturers = Array.from(
    new Set(audioDevices.map((d) => d.manufacturer).filter((m): m is string => !!m && m !== 'N/A'))
  )

  return (
    <div className="section-container">
      <PageHeader
        icon={<SoundOutlined />}
        title="Audio Devices"
        subtitle={
          defaultDevice
            ? `Default: ${defaultDevice.name || 'Unknown device'}`
            : 'Sound endpoints, codecs and drivers detected on this system'
        }
        color={ACCENT}
        stats={[
          { label: 'Devices', value: total, color: ACCENT },
          { label: 'Outputs', value: outputs, color: '#52c41a' },
          { label: 'Inputs', value: inputs, color: '#40a9ff' },
          { label: 'Online', value: `${onlineCount}/${total}`, color: '#faad14' }
        ]}
      />

      {total === 0 ? (
        <Section icon={<SoundOutlined />} title="AUDIO DEVICES" color={ACCENT}>
          <EmptyHint
            icon={<SoundOutlined />}
            title="No audio devices detected"
            description="No sound cards, codecs or endpoints were reported by the system."
          />
        </Section>
      ) : (
        <>
          <Section icon={<CustomerServiceOutlined />} title="OVERVIEW" color={ACCENT}>
            <div className="ds-cards-auto">
              <StatTile
                icon={<SoundOutlined />}
                label="Total Devices"
                value={total}
                sub={manufacturers.length > 0 ? `${manufacturers.length} vendor(s)` : undefined}
                color={ACCENT}
              />
              <StatTile
                icon={<ArrowUpOutlined />}
                label="Playback"
                value={outputs}
                sub="Output endpoints"
                color="#52c41a"
              />
              <StatTile
                icon={<ArrowDownOutlined />}
                label="Recording"
                value={inputs}
                sub="Input endpoints"
                color="#40a9ff"
              />
              <StatTile
                icon={<CheckCircleOutlined />}
                label="Online"
                value={`${onlineCount}/${total}`}
                sub="Reporting active"
                color="#faad14"
              />
            </div>
          </Section>

          <Section
            icon={<AudioOutlined />}
            title="DEVICE DETAILS"
            color={ACCENT}
            extra={<HealthPill status="info">{`${total} device(s)`}</HealthPill>}
          >
            <div className="ds-cards-2">
              {audioDevices.map((device, index) => {
                const health = statusHealth(device.status)
                return (
                  <GlassCard
                    key={`${device.id ?? 'audio'}-${index}`}
                    className="ds-glow"
                    glow={ACCENT}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        marginBottom: 14,
                        flexWrap: 'wrap'
                      }}
                    >
                      <span style={{ fontSize: 22, color: ACCENT }}>
                        <DirectionIcon device={device} />
                      </span>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'var(--ds-ink)',
                            wordBreak: 'break-word'
                          }}
                        >
                          {device.name || 'Unknown Device'}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.7 }}>
                          {device.manufacturer || 'Unknown manufacturer'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {device.default && <HealthPill status="good">Default</HealthPill>}
                        <HealthPill status={health}>{display(device.status)}</HealthPill>
                      </div>
                    </div>

                    <SpecGrid
                      columns={2}
                      items={[
                        { label: 'Name', value: display(device.name), span: 2 },
                        { label: 'Manufacturer', value: display(device.manufacturer) },
                        { label: 'Type', value: display(device.type) },
                        { label: 'Direction', value: directionLabel(device) },
                        { label: 'Channel', value: display(device.channel) },
                        { label: 'Input Capable', value: display(device.in) },
                        { label: 'Output Capable', value: display(device.out) },
                        { label: 'Default Device', value: display(device.default) },
                        {
                          label: 'Status',
                          value: display(device.status),
                          color:
                            health === 'good'
                              ? 'var(--ds-good)'
                              : health === 'bad'
                                ? 'var(--ds-bad)'
                                : undefined
                        },
                        {
                          label: 'Revision',
                          value: display(device.revision),
                          mono: true
                        },
                        {
                          label: 'Device ID',
                          value: display(device.id),
                          mono: true,
                          copyable: true
                        },
                        {
                          label: 'Driver',
                          value: display(device.driver),
                          mono: true,
                          copyable: true,
                          span: 2
                        }
                      ]}
                    />

                    <div style={{ marginTop: 12, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <ApiOutlined style={{ color: device.in ? '#40a9ff' : 'var(--ds-ink-3)' }} />
                        <span style={{ opacity: device.in ? 1 : 0.5 }}>
                          {device.in ? 'Input available' : 'No input'}
                        </span>
                      </span>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
                        <SoundOutlined style={{ color: device.out ? '#52c41a' : 'var(--ds-ink-3)' }} />
                        <span style={{ opacity: device.out ? 1 : 0.5 }}>
                          {device.out ? 'Output available' : 'No output'}
                        </span>
                      </span>
                    </div>
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
