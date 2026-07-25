import type { StaticInfo } from '@shared/ipc'
import type { Systeminformation } from 'systeminformation'
import {
  DesktopOutlined,
  ThunderboltOutlined,
  FireOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  BranchesOutlined
} from '@ant-design/icons'
import {
  PageHeader,
  Section,
  GlassCard,
  SpecGrid,
  Meter,
  HealthPill,
  EmptyHint
} from '../ui/kit'
import type { SpecItem } from '../ui/kit'
import { formatBytes, display, usageColor, tempColor } from '../../lib/format'
import { GraphicsLive } from '../Live/LiveSections'

const ACCENT = '#b37feb'

function vendorColor(vendor: string | undefined): string {
  const v = (vendor ?? '').toLowerCase()
  if (v.includes('nvidia')) return '#76b900'
  if (v.includes('amd') || v.includes('ati')) return '#ed1c24'
  if (v.includes('intel')) return '#0071c5'
  if (v.includes('apple')) return '#8e8e93'
  return ACCENT
}

// VRAM fields from systeminformation are reported in MB.
function formatVram(mb: number | null | undefined): string {
  if (mb === null || mb === undefined || mb < 0) return 'N/A'
  return formatBytes(mb * 1024 * 1024, 1)
}

function isNum(v: number | null | undefined): v is number {
  return typeof v === 'number' && Number.isFinite(v)
}

function hasText(v: string | null | undefined): v is string {
  return typeof v === 'string' && v.trim().length > 0
}

function tempHealth(t: number): 'good' | 'warn' | 'bad' {
  if (t >= 85) return 'bad'
  if (t >= 70) return 'warn'
  return 'good'
}

export default function Graphics({ siData }: { siData: StaticInfo | null }): React.JSX.Element {
  const controllers: Systeminformation.GraphicsControllerData[] =
    siData?.graphics?.controllers ?? []

  const totalVramMb = controllers.reduce((acc, c) => acc + (isNum(c.vram) ? c.vram : 0), 0)
  const vendors = [...new Set(controllers.map((c) => c.vendor).filter(hasText))]
  const dedicatedGpus = controllers.filter((c) => c.external || (isNum(c.vram) && c.vram >= 1024))
  const hottest = controllers.reduce<number | null>((max, c) => {
    if (isNum(c.temperatureGpu))
      return max === null ? c.temperatureGpu : Math.max(max, c.temperatureGpu)
    return max
  }, null)

  const subtitleParts: string[] = []
  if (controllers.length > 0) {
    subtitleParts.push(
      `${controllers.length} display adapter${controllers.length > 1 ? 's' : ''} detected`
    )
    subtitleParts.push(
      dedicatedGpus.length > 0
        ? `${dedicatedGpus.length} dedicated`
        : 'integrated graphics only'
    )
    if (vendors.length > 0) subtitleParts.push(vendors.join(', '))
  } else {
    subtitleParts.push('No graphics adapters detected')
  }

  return (
    <div className="section-container">
      <PageHeader
        icon={<DesktopOutlined />}
        title="Graphics"
        subtitle={subtitleParts.join(' · ')}
        color={ACCENT}
        stats={[
          { label: 'Adapters', value: controllers.length, color: ACCENT },
          { label: 'Total VRAM', value: formatVram(totalVramMb), color: '#10b981' },
          { label: 'Vendors', value: vendors.length || 'N/A', color: '#7cc4ff' },
          {
            label: 'Peak Temp',
            value: hottest !== null ? `${Math.round(hottest)}°C` : 'N/A',
            color: hottest !== null ? tempColor(hottest) : undefined
          }
        ]}
      />

      <GraphicsLive />

      {controllers.length === 0 ? (
        <EmptyHint
          icon={<DesktopOutlined />}
          title="No graphics controllers"
          description="No GPUs or display adapters were reported by the system."
        />
      ) : (
        controllers.map((gpu, index) => {
          const color = vendorColor(gpu.vendor)

          /* ---------- identity ---------- */
          const identity: SpecItem[] = [
            { label: 'Model', value: display(gpu.model), span: 2 },
            { label: 'Vendor', value: display(gpu.vendor), color },
            { label: 'Name', value: display(gpu.name) },
            { label: 'External', value: display(gpu.external ?? false) },
            { label: 'VRAM Type', value: gpu.vramDynamic ? 'Dynamic / Shared' : 'Dedicated' }
          ]
          if (isNum(gpu.cores)) identity.push({ label: 'Cores', value: gpu.cores })
          if (hasText(gpu.metalVersion))
            identity.push({ label: 'Metal Version', value: display(gpu.metalVersion) })

          /* ---------- memory ---------- */
          const memory: SpecItem[] = [
            { label: 'VRAM', value: formatVram(gpu.vram), color: '#10b981' },
            { label: 'Memory Total', value: formatVram(gpu.memoryTotal) },
            { label: 'Memory Used', value: formatVram(gpu.memoryUsed) },
            { label: 'Memory Free', value: formatVram(gpu.memoryFree) }
          ]
          const hasMemory =
            isNum(gpu.vram) ||
            isNum(gpu.memoryTotal) ||
            isNum(gpu.memoryUsed) ||
            isNum(gpu.memoryFree)
          const memPercent =
            isNum(gpu.memoryUsed) && isNum(gpu.memoryTotal) && gpu.memoryTotal > 0
              ? (gpu.memoryUsed / gpu.memoryTotal) * 100
              : null

          /* ---------- bus & identifiers ---------- */
          const bus: SpecItem[] = [
            { label: 'Bus', value: display(gpu.bus) },
            { label: 'Bus Address', value: display(gpu.busAddress), mono: true },
            { label: 'PCI Bus', value: display(gpu.pciBus), mono: true },
            { label: 'Vendor ID', value: display(gpu.vendorId), mono: true, copyable: true },
            { label: 'Device ID', value: display(gpu.deviceId), mono: true, copyable: true },
            { label: 'Sub Vendor', value: display(gpu.subVendor), mono: true },
            { label: 'Sub Device ID', value: display(gpu.subDeviceId), mono: true },
            { label: 'PCI ID', value: display(gpu.pciID), mono: true },
            {
              label: 'Driver Version',
              value: display(gpu.driverVersion),
              mono: true,
              copyable: true
            }
          ]
          const hasBus = [
            gpu.bus,
            gpu.busAddress,
            gpu.pciBus,
            gpu.vendorId,
            gpu.deviceId,
            gpu.subVendor,
            gpu.subDeviceId,
            gpu.pciID,
            gpu.driverVersion
          ].some(hasText)

          /* ---------- telemetry ---------- */
          const hasPowerMeter = isNum(gpu.powerDraw) && isNum(gpu.powerLimit) && gpu.powerLimit > 0
          const hasTelemetry =
            isNum(gpu.utilizationGpu) ||
            isNum(gpu.utilizationMemory) ||
            isNum(gpu.temperatureGpu) ||
            isNum(gpu.temperatureMemory) ||
            isNum(gpu.fanSpeed) ||
            isNum(gpu.powerDraw) ||
            isNum(gpu.powerLimit) ||
            isNum(gpu.clockCore) ||
            isNum(gpu.clockMemory)

          // Values that are NOT already shown as a meter above.
          const clockSpecs: SpecItem[] = []
          if (isNum(gpu.clockCore))
            clockSpecs.push({ label: 'Core Clock', value: `${gpu.clockCore} MHz` })
          if (isNum(gpu.clockMemory))
            clockSpecs.push({ label: 'Memory Clock', value: `${gpu.clockMemory} MHz` })
          if (isNum(gpu.temperatureMemory))
            clockSpecs.push({
              label: 'Memory Temp',
              value: `${gpu.temperatureMemory}°C`,
              color: tempColor(gpu.temperatureMemory)
            })
          if (!hasPowerMeter && isNum(gpu.powerDraw))
            clockSpecs.push({ label: 'Power Draw', value: `${gpu.powerDraw} W` })
          if (!hasPowerMeter && isNum(gpu.powerLimit))
            clockSpecs.push({ label: 'Power Limit', value: `${gpu.powerLimit} W` })

          return (
            <Section
              key={index}
              icon={<DesktopOutlined />}
              title={`GPU ${index + 1} · ${gpu.model || gpu.vendor || 'Unknown'}`}
              color={color}
              extra={
                <>
                  {gpu.external ? <HealthPill status="info">External</HealthPill> : null}
                  {gpu.vramDynamic ? <HealthPill status="idle">Shared VRAM</HealthPill> : null}
                  {isNum(gpu.vram) && gpu.vram > 0 ? (
                    <HealthPill status="idle">{formatVram(gpu.vram)}</HealthPill>
                  ) : null}
                </>
              }
            >
              {/* live first: status before identity */}
              {hasTelemetry && (
                <Section icon={<DashboardOutlined />} title="LIVE TELEMETRY" color={color}>
                  <div style={{ display: 'grid', gap: 12 }}>
                    {isNum(gpu.utilizationGpu) && (
                      <Meter
                        label="GPU Utilization"
                        percent={gpu.utilizationGpu}
                        color={usageColor(gpu.utilizationGpu)}
                        right={`${Math.round(gpu.utilizationGpu)}%`}
                      />
                    )}
                    {isNum(gpu.utilizationMemory) && (
                      <Meter
                        label="Memory Utilization"
                        percent={gpu.utilizationMemory}
                        color={usageColor(gpu.utilizationMemory)}
                        right={`${Math.round(gpu.utilizationMemory)}%`}
                      />
                    )}
                    {isNum(gpu.temperatureGpu) && (
                      <Meter
                        label="Core Temperature"
                        percent={Math.min(gpu.temperatureGpu, 100)}
                        color={tempColor(gpu.temperatureGpu)}
                        right={`${Math.round(gpu.temperatureGpu)}°C`}
                      />
                    )}
                    {isNum(gpu.fanSpeed) && (
                      <Meter
                        label="Fan Speed"
                        percent={Math.min(gpu.fanSpeed, 100)}
                        color={usageColor(gpu.fanSpeed)}
                        right={`${gpu.fanSpeed}%`}
                      />
                    )}
                    {hasPowerMeter && isNum(gpu.powerDraw) && isNum(gpu.powerLimit) && (
                      <Meter
                        label="Power Draw"
                        percent={Math.min((gpu.powerDraw / gpu.powerLimit) * 100, 100)}
                        color={ACCENT}
                        right={`${gpu.powerDraw} / ${gpu.powerLimit} W`}
                      />
                    )}
                  </div>

                  {clockSpecs.length > 0 && (
                    <div style={{ marginTop: 14 }}>
                      <SpecGrid columns={3} items={clockSpecs} />
                    </div>
                  )}

                  {isNum(gpu.temperatureGpu) && (
                    <div style={{ marginTop: 12 }}>
                      <HealthPill status={tempHealth(gpu.temperatureGpu)}>
                        {tempHealth(gpu.temperatureGpu) === 'good'
                          ? 'Thermals nominal'
                          : tempHealth(gpu.temperatureGpu) === 'warn'
                            ? 'Running warm'
                            : 'Thermal limit'}
                      </HealthPill>
                    </div>
                  )}
                </Section>
              )}

              <Section icon={<ThunderboltOutlined />} title="ADAPTER" color={color}>
                <GlassCard className="ds-glow" glow={color}>
                  <SpecGrid columns={3} items={identity} />
                </GlassCard>
              </Section>

              {hasMemory ? (
                <Section icon={<DatabaseOutlined />} title="MEMORY" color={color}>
                  <SpecGrid columns={4} items={memory} />
                  {memPercent !== null && (
                    <div style={{ marginTop: 14 }}>
                      <Meter
                        label="VRAM Usage"
                        percent={memPercent}
                        color={usageColor(memPercent)}
                        right={`${formatVram(gpu.memoryUsed)} / ${formatVram(gpu.memoryTotal)}`}
                      />
                    </div>
                  )}
                </Section>
              ) : null}

              {hasBus ? (
                <Section icon={<BranchesOutlined />} title="BUS & IDENTIFIERS" color={color}>
                  <SpecGrid columns={3} items={bus} />
                </Section>
              ) : (
                <Section icon={<BranchesOutlined />} title="BUS & IDENTIFIERS" color={color}>
                  <EmptyHint
                    icon={<BranchesOutlined />}
                    title="No bus details reported"
                    description="This adapter did not expose PCI identifiers or a driver version."
                  />
                </Section>
              )}

              {!hasTelemetry && (
                <Section icon={<FireOutlined />} title="TELEMETRY" color={color}>
                  <EmptyHint
                    icon={<DashboardOutlined />}
                    title="No live telemetry"
                    description="This driver does not report load, clocks, fan speed, power or temperature."
                  />
                </Section>
              )}
            </Section>
          )
        })
      )}
    </div>
  )
}
