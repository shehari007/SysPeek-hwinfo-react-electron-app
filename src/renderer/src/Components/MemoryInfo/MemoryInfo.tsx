import type { StaticInfo } from '@shared/ipc'
import type { Systeminformation } from 'systeminformation'
import {
  DatabaseOutlined,
  SwapOutlined,
  AppstoreOutlined,
  DashboardOutlined,
  BarsOutlined
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
import { formatBytes, display, usageColor } from '../../lib/format'
import { MemoryLive } from '../Live/LiveSections'

const ACCENT = '#5dd39e'

export default function MemoryInfo({
  siData
}: {
  siData: StaticInfo | null
}): React.JSX.Element {
  const mem = siData?.mem ?? ({} as Systeminformation.MemData)
  const memLayout = siData?.memLayout ?? []

  const hasMem = !!mem.total
  const usedPct = mem.total ? Math.round((mem.used / mem.total) * 100) : 0
  const activePct = mem.total ? Math.round((mem.active / mem.total) * 100) : 0
  const cachePct = mem.total && mem.buffcache ? Math.round((mem.buffcache / mem.total) * 100) : 0
  const swapPct = mem.swaptotal ? Math.round((mem.swapused / mem.swaptotal) * 100) : 0

  const installed = memLayout.reduce((sum, m) => sum + (m.size || 0), 0)
  const eccModules = memLayout.filter((m) => m.ecc === true).length

  const usageStatus: 'good' | 'warn' | 'bad' =
    usedPct >= 90 ? 'bad' : usedPct >= 75 ? 'warn' : 'good'
  const usageLabel = usedPct >= 90 ? 'Critical' : usedPct >= 75 ? 'Elevated' : 'Healthy'

  return (
    <div className="section-container">
      <PageHeader
        icon={<DatabaseOutlined />}
        title="Memory"
        subtitle="RAM allocation, swap, and installed module inventory"
        color={ACCENT}
        stats={[
          { label: 'Total RAM', value: formatBytes(mem.total), color: ACCENT },
          { label: 'In Use', value: `${usedPct}%`, color: usageColor(usedPct) },
          { label: 'Available', value: formatBytes(mem.available), color: '#7cc4ff' },
          { label: 'Modules', value: memLayout.length, color: '#c084fc' }
        ]}
      />

      <MemoryLive />

      <Section
        icon={<DashboardOutlined />}
        title="ALLOCATION"
        color={ACCENT}
        extra={<HealthPill status={usageStatus}>{usageLabel}</HealthPill>}
      >
        {hasMem ? (
          <GlassCard className="ds-glow" glow={ACCENT}>
            <Meter
              label="RAM in use"
              percent={usedPct}
              color={usageColor(usedPct)}
              right={`${formatBytes(mem.used)} / ${formatBytes(mem.total)}`}
            />
            <Meter
              label="Active working set"
              percent={activePct}
              color={ACCENT}
              right={formatBytes(mem.active)}
            />
            <Meter
              label="Buffers / cache (reclaimable)"
              percent={cachePct}
              color="#7cc4ff"
              right={formatBytes(mem.buffcache)}
            />
          </GlassCard>
        ) : (
          <EmptyHint
            icon={<DashboardOutlined />}
            title="No memory readings"
            description="Live memory statistics are not available on this system."
          />
        )}
      </Section>

      <Section icon={<SwapOutlined />} title="SWAP MEMORY" color={ACCENT}>
        {mem.swaptotal > 0 ? (
          <GlassCard className="ds-glow" glow="#f59e0b">
            <Meter label="Swap in use" percent={swapPct} color={usageColor(swapPct)} />
            <div style={{ marginTop: 12 }}>
              <SpecGrid
                columns={3}
                items={[
                  { label: 'Swap Total', value: formatBytes(mem.swaptotal) },
                  { label: 'Swap Used', value: formatBytes(mem.swapused), color: '#f59e0b' },
                  { label: 'Swap Free', value: formatBytes(mem.swapfree), color: '#10b981' }
                ]}
              />
            </div>
          </GlassCard>
        ) : (
          <EmptyHint
            icon={<SwapOutlined />}
            title="No swap configured"
            description="This system has no swap or page file in use."
          />
        )}
      </Section>

      <Section
        icon={<AppstoreOutlined />}
        title="INSTALLED MODULES"
        color={ACCENT}
        extra={
          memLayout.length > 0 ? (
            <span>
              {formatBytes(installed)} across {memLayout.length} slot
              {memLayout.length === 1 ? '' : 's'}
              {eccModules > 0 ? ` · ${eccModules} ECC` : ''}
            </span>
          ) : undefined
        }
      >
        {memLayout.length === 0 ? (
          <EmptyHint
            icon={<AppstoreOutlined />}
            title="No module data"
            description="Physical memory module details are not available on this system."
          />
        ) : (
          <div className="ds-cards-2">
            {memLayout.map((mod: Systeminformation.MemLayoutData, i) => {
              const eccStatus: 'good' | 'idle' = mod.ecc ? 'good' : 'idle'
              return (
                <GlassCard key={i} className="ds-glow" glow={ACCENT}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: 12
                    }}
                  >
                    <StatTile
                      icon={<DatabaseOutlined />}
                      label={mod.bank || `Slot ${i + 1}`}
                      value={formatBytes(mod.size)}
                      sub={display(mod.type)}
                      color={ACCENT}
                    />
                    <HealthPill status={eccStatus}>{mod.ecc ? 'ECC' : 'Non-ECC'}</HealthPill>
                  </div>
                  <SpecGrid
                    columns={2}
                    items={[
                      {
                        label: 'Clock Speed',
                        value: mod.clockSpeed == null ? 'N/A' : `${mod.clockSpeed} MHz`,
                        color: '#7cc4ff'
                      },
                      { label: 'Form Factor', value: display(mod.formFactor) },
                      { label: 'Manufacturer', value: display(mod.manufacturer), span: 2 },
                      {
                        label: 'Part Number',
                        value: display(mod.partNum),
                        mono: true,
                        copyable: true,
                        span: 2
                      },
                      {
                        label: 'Serial Number',
                        value: display(mod.serialNum),
                        mono: true,
                        copyable: true,
                        span: 2
                      },
                      {
                        label: 'Voltage (Configured)',
                        value: mod.voltageConfigured == null ? 'N/A' : `${mod.voltageConfigured} V`
                      },
                      {
                        label: 'Voltage Range',
                        value:
                          mod.voltageMin == null && mod.voltageMax == null
                            ? 'N/A'
                            : `${mod.voltageMin == null ? '?' : mod.voltageMin} to ${
                                mod.voltageMax == null ? '?' : mod.voltageMax
                              } V`
                      }
                    ]}
                  />
                </GlassCard>
              )
            })}
          </div>
        )}
      </Section>

      {hasMem && (
        <Section icon={<BarsOutlined />} title="LOW-LEVEL BREAKDOWN" color={ACCENT}>
          <SpecGrid
            columns={4}
            items={[
              { label: 'Free', value: formatBytes(mem.free), color: '#10b981' },
              { label: 'Buffers', value: formatBytes(mem.buffers) },
              { label: 'Cached', value: formatBytes(mem.cached) },
              { label: 'Slab', value: formatBytes(mem.slab), hint: 'Kernel data structures' },
              {
                label: 'Reclaimable',
                value: formatBytes(mem.reclaimable),
                hint: 'Slab memory that can be freed'
              },
              {
                label: 'Writeback',
                value: mem.writeback == null ? 'N/A' : formatBytes(mem.writeback),
                hint: 'Pages queued for disk write'
              },
              {
                label: 'Dirty',
                value: mem.dirty == null ? 'N/A' : formatBytes(mem.dirty),
                hint: 'Modified pages not yet written'
              },
              {
                label: 'Physical Installed',
                value: installed > 0 ? formatBytes(installed) : 'N/A',
                hint: 'Sum of module capacities reported by SMBIOS'
              }
            ]}
          />
        </Section>
      )}
    </div>
  )
}
