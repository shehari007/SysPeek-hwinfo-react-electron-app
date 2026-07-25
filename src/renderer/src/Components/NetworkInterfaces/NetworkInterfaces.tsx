import { useMemo } from 'react'
import {
  GlobalOutlined,
  ApiOutlined,
  WifiOutlined,
  NodeIndexOutlined,
  SwapOutlined,
  ThunderboltOutlined,
  BlockOutlined,
  DeploymentUnitOutlined
} from '@ant-design/icons'
import type { StaticInfo } from '@shared/ipc'
import type { Systeminformation } from 'systeminformation'
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
import type { SpecItem } from '../ui/kit'
import { display } from '../../lib/format'
import { NetworkLive } from '../Live/LiveSections'

const ACCENT = '#7cc4ff'

function isWireless(type: string | undefined): boolean {
  const t = (type ?? '').toLowerCase()
  return t.includes('wireless') || t.includes('wifi') || t.includes('wlan')
}

function speedLabel(speed: number | null | undefined): string {
  if (speed == null || speed < 0) return 'N/A'
  if (speed >= 1000) return `${(speed / 1000).toFixed(speed % 1000 === 0 ? 0 : 1)} Gbit/s`
  return `${speed} Mbit/s`
}

export default function NetworkInterfaces({
  siData
}: {
  siData: StaticInfo | null
}): React.JSX.Element {
  const interfaces = siData?.networkInterfaces ?? []
  const defaultIface = siData?.networkInterfaceDefault ?? 'N/A'
  const defaultGateway = siData?.networkGatewayDefault ?? 'N/A'

  const sorted = useMemo(() => {
    const rank = (i: Systeminformation.NetworkInterfacesData): number => {
      let score = 0
      if (i.default) score += 4
      if (i.operstate === 'up') score += 2
      if (i.ip4) score += 1
      return score
    }
    return [...interfaces].sort((a, b) => rank(b) - rank(a))
  }, [interfaces])

  const upCount = interfaces.filter((i) => i.operstate === 'up').length
  const physical = interfaces.filter((i) => !i.virtual && !i.internal)
  const physicalCount = physical.length
  const physicalUp = physical.filter((i) => i.operstate === 'up').length
  const wirelessCount = interfaces.filter((i) => isWireless(i.type)).length
  const virtualCount = interfaces.filter((i) => i.virtual || i.internal).length
  const dhcpCount = interfaces.filter((i) => i.dhcp).length
  const addressedCount = interfaces.filter((i) => !!i.ip4).length
  const fastest = interfaces.reduce<number | null>((max, i) => {
    const s = i.speed
    if (s == null || s < 0) return max
    return max == null || s > max ? s : max
  }, null)

  const hasRoute = defaultIface !== 'N/A' || defaultGateway !== 'N/A'
  const physicalRatio = physicalCount > 0 ? (physicalUp / physicalCount) * 100 : 0

  const routeItems: SpecItem[] = [
    { label: 'Egress Interface', value: display(defaultIface), mono: true, copyable: defaultIface !== 'N/A' },
    { label: 'Next Hop Gateway', value: display(defaultGateway), mono: true, copyable: defaultGateway !== 'N/A', color: defaultGateway !== 'N/A' ? '#4ade80' : undefined },
    { label: 'IPv4 Addressed', value: `${addressedCount} of ${interfaces.length}`, hint: 'Adapters holding an IPv4 lease or static address' }
  ]

  return (
    <div className="section-container">
      <PageHeader
        icon={<GlobalOutlined />}
        title="Network Interfaces"
        subtitle="Adapter inventory, addressing and link state"
        color={ACCENT}
        stats={[
          { label: 'Interfaces', value: interfaces.length, color: ACCENT },
          { label: 'Up', value: upCount, color: '#4ade80' },
          { label: 'Physical', value: physicalCount, color: '#a78bfa' }
        ]}
      />

      <NetworkLive />

      {hasRoute && (
        <Section icon={<NodeIndexOutlined />} title="DEFAULT ROUTE" color={ACCENT}>
          <GlassCard>
            <SpecGrid columns={3} items={routeItems} />
          </GlassCard>
        </Section>
      )}

      {interfaces.length > 0 && (
        <Section icon={<DeploymentUnitOutlined />} title="ADAPTER MIX" color="#a78bfa">
          <div className="ds-cards-4">
            <StatTile
              icon={<WifiOutlined />}
              label="Wireless"
              value={wirelessCount}
              sub="Wi-Fi / WLAN adapters"
              color={ACCENT}
            />
            <StatTile
              icon={<BlockOutlined />}
              label="Virtual / Internal"
              value={virtualCount}
              sub="Loopback, tunnels, hypervisor"
              color="#a78bfa"
            />
            <StatTile
              icon={<SwapOutlined />}
              label="DHCP Enabled"
              value={dhcpCount}
              sub={`${interfaces.length - dhcpCount} static or unmanaged`}
              color="#4ade80"
            />
            <StatTile
              icon={<ThunderboltOutlined />}
              label="Fastest Link"
              value={speedLabel(fastest)}
              sub="Negotiated adapter speed"
              color="#fbbf24"
            />
          </div>
          {physicalCount > 0 && (
            <GlassCard>
              <Meter
                label="Physical adapters online"
                percent={physicalRatio}
                color={physicalUp > 0 ? '#4ade80' : '#64748b'}
                right={`${physicalUp} / ${physicalCount}`}
              />
            </GlassCard>
          )}
        </Section>
      )}

      {sorted.length === 0 ? (
        <EmptyHint
          icon={<GlobalOutlined />}
          title="No network interfaces"
          description="No network adapters were reported by the system."
        />
      ) : (
        <Section
          icon={<ApiOutlined />}
          title="ADAPTERS"
          color={ACCENT}
          extra={`${sorted.length} listed`}
        >
          <div className="ds-cards-2">
            {sorted.map((iface, idx) => {
              const wifi = isWireless(iface.type)
              const state = iface.operstate
              const statusPill = state === 'up' ? 'good' : state === 'down' ? 'bad' : 'idle'
              const glow = state === 'up' ? ACCENT : '#64748b'

              return (
                <GlassCard key={`${iface.iface}-${idx}`} className="ds-glow" glow={glow}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      marginBottom: 14
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                      <span style={{ fontSize: 20, color: glow }}>
                        {wifi ? <WifiOutlined /> : <ApiOutlined />}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 15 }}>
                          {iface.iface || iface.ifaceName || 'Unknown'}
                        </div>
                        <div style={{ fontSize: 12, opacity: 0.65 }}>
                          {display(iface.ifaceName)}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        gap: 6,
                        flexWrap: 'wrap',
                        justifyContent: 'flex-end'
                      }}
                    >
                      {iface.default && (
                        <HealthPill status="info">
                          <ThunderboltOutlined /> DEFAULT
                        </HealthPill>
                      )}
                      {iface.virtual && <HealthPill status="idle">VIRTUAL</HealthPill>}
                      <HealthPill status={statusPill}>
                        {state ? state.toUpperCase() : 'UNKNOWN'}
                      </HealthPill>
                    </div>
                  </div>

                  {/* Addressing: long values, two columns so nothing wraps mid-token */}
                  <SpecGrid
                    columns={2}
                    items={[
                      {
                        label: 'IPv4 Address',
                        value: display(iface.ip4),
                        mono: true,
                        copyable: !!iface.ip4,
                        color: iface.ip4 ? '#4ade80' : undefined
                      },
                      { label: 'IPv4 Subnet', value: display(iface.ip4subnet), mono: true },
                      {
                        label: 'IPv6 Address',
                        value: display(iface.ip6),
                        mono: true,
                        copyable: !!iface.ip6,
                        span: 2
                      },
                      { label: 'IPv6 Subnet', value: display(iface.ip6subnet), mono: true, span: 2 },
                      {
                        label: 'MAC Address',
                        value: display(iface.mac),
                        mono: true,
                        copyable: !!iface.mac,
                        span: 2
                      },
                      { label: 'DNS Suffix', value: display(iface.dnsSuffix), span: 2 }
                    ]}
                  />

                  <div
                    style={{
                      height: 1,
                      margin: '12px 0',
                      background: 'rgba(255,255,255,0.08)'
                    }}
                  />

                  {/* Link and low-level flags: short values, three columns */}
                  <SpecGrid
                    columns={3}
                    items={[
                      { label: 'Type', value: display(iface.type) },
                      { label: 'Link Speed', value: speedLabel(iface.speed) },
                      { label: 'Duplex', value: display(iface.duplex) },
                      { label: 'MTU', value: iface.mtu != null ? `${iface.mtu} bytes` : 'N/A' },
                      {
                        label: 'DHCP',
                        value: display(iface.dhcp),
                        color: iface.dhcp ? ACCENT : undefined
                      },
                      {
                        label: 'Internal',
                        value: display(iface.internal),
                        hint: 'Loopback / internal adapter'
                      },
                      {
                        label: 'Virtual',
                        value: display(iface.virtual),
                        color: iface.virtual ? '#a78bfa' : undefined
                      },
                      {
                        label: 'Carrier Changes',
                        value: iface.carrierChanges != null ? iface.carrierChanges : 'N/A',
                        hint: 'Link up/down transitions'
                      },
                      { label: '802.1X State', value: display(iface.ieee8021xState) },
                      { label: '802.1X Auth', value: display(iface.ieee8021xAuth), span: 3 }
                    ]}
                  />
                </GlassCard>
              )
            })}
          </div>
        </Section>
      )}
    </div>
  )
}
