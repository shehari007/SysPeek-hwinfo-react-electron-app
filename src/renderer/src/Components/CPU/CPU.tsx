import { useMemo } from 'react'
import {
  ThunderboltOutlined,
  DatabaseOutlined,
  ClusterOutlined,
  DashboardOutlined,
  SafetyCertificateOutlined,
  ApiOutlined,
  ExperimentOutlined,
  BranchesOutlined
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
  EmptyHint,
  type SpecItem
} from '../ui/kit'
import { formatBytes, formatGHz, display } from '../../lib/format'
import { CpuLive } from '../Live/LiveSections'

const ACCENT = '#7cc4ff'

/** Friendly labels for notable CPU feature flags. */
const FLAG_LABELS: Record<string, string> = {
  avx: 'AVX',
  avx2: 'AVX2',
  avx512f: 'AVX-512',
  avx512: 'AVX-512',
  sse: 'SSE',
  sse2: 'SSE2',
  sse3: 'SSE3',
  ssse3: 'SSSE3',
  sse4_1: 'SSE4.1',
  sse4_2: 'SSE4.2',
  sse4a: 'SSE4a',
  aes: 'AES-NI',
  sha_ni: 'SHA',
  sha: 'SHA',
  fma: 'FMA3',
  fma4: 'FMA4',
  bmi1: 'BMI1',
  bmi2: 'BMI2',
  f16c: 'F16C',
  vmx: 'VT-x',
  svm: 'AMD-V',
  smx: 'TXT',
  ht: 'Hyper-Threading',
  nx: 'NX',
  rdrand: 'RDRAND',
  rdseed: 'RDSEED',
  mmx: 'MMX',
  popcnt: 'POPCNT',
  tsc: 'TSC',
  pae: 'PAE',
  pclmulqdq: 'PCLMULQDQ',
  pdpe1gb: '1GB Pages',
  lm: '64-bit'
}

function CPU({ siData }: { siData: StaticInfo | null }): React.JSX.Element {
  const cpu = siData?.cpu ?? ({} as Systeminformation.CpuData)
  const cache = siData?.cpuCache ?? ({} as Systeminformation.CpuCacheData)

  const hasData = Boolean(cpu.brand || cpu.manufacturer)

  // Parse the raw flags string into recognised + extra feature tags.
  const { known, extraCount, totalFlags } = useMemo(() => {
    const raw = (cpu.flags ?? '').trim()
    if (!raw) return { known: [] as { key: string; label: string }[], extraCount: 0, totalFlags: 0 }
    const parts = raw.split(/\s+/).filter(Boolean)
    const seen = new Set<string>()
    const list: { key: string; label: string }[] = []
    for (const p of parts) {
      const lower = p.toLowerCase()
      const label = FLAG_LABELS[lower]
      if (label && !seen.has(label)) {
        seen.add(label)
        list.push({ key: lower, label })
      }
    }
    return { known: list, extraCount: parts.length - seen.size, totalFlags: parts.length }
  }, [cpu.flags])

  // Cache levels, plus the total used for the share meters.
  const cacheItems = useMemo(
    () => [
      { label: 'L1 Data', value: cache.l1d, color: '#ff9d6b' },
      { label: 'L1 Instruction', value: cache.l1i, color: '#ffd666' },
      { label: 'L2 Unified', value: cache.l2, color: '#5dd39e' },
      { label: 'L3 Shared', value: cache.l3, color: ACCENT }
    ],
    [cache]
  )
  const totalCache = cacheItems.reduce((sum, c) => sum + (c.value || 0), 0)
  const reportedLevels = cacheItems.filter((c) => (c.value || 0) > 0).length

  if (!hasData) {
    return (
      <div className="section-container">
        <EmptyHint
          icon={<ThunderboltOutlined />}
          title="No CPU data"
          description="Processor information is not available yet."
        />
      </div>
    )
  }

  // systeminformation sometimes reports speedMax below the base speed when it
  // cannot read the turbo ceiling, so clamp it to at least the base clock.
  const maxClock = Math.max(cpu.speed || 0, cpu.speedMax || 0)
  const hasHybrid = Boolean(cpu.performanceCores || cpu.efficiencyCores)
  const threadsPerCore =
    cpu.physicalCores && cpu.cores ? (cpu.cores / cpu.physicalCores).toFixed(0) : null

  // Complementary tiles only: nothing here repeats a PageHeader stat.
  const tiles = [
    hasHybrid ? (
      <StatTile
        key="hybrid"
        icon={<BranchesOutlined />}
        label="Core Layout"
        value={`${display(cpu.performanceCores)}P + ${display(cpu.efficiencyCores)}E`}
        sub="Hybrid architecture"
        color="#5dd39e"
      />
    ) : null,
    threadsPerCore ? (
      <StatTile
        key="tpc"
        icon={<ClusterOutlined />}
        label="Threads per Core"
        value={threadsPerCore}
        sub={threadsPerCore === '1' ? 'No SMT' : 'SMT enabled'}
        color={ACCENT}
      />
    ) : null,
    totalCache > 0 ? (
      <StatTile
        key="cache"
        icon={<DatabaseOutlined />}
        label="Total Cache"
        value={formatBytes(totalCache)}
        sub={`${reportedLevels} level${reportedLevels === 1 ? '' : 's'} reported`}
        color="#ff9d6b"
      />
    ) : null,
    totalFlags > 0 ? (
      <StatTile
        key="flags"
        icon={<SafetyCertificateOutlined />}
        label="Feature Flags"
        value={totalFlags}
        sub={`${known.length} highlighted`}
        color="#c084fc"
      />
    ) : null
  ].filter(Boolean)

  const tileClass =
    tiles.length >= 4 ? 'ds-cards-4' : tiles.length === 3 ? 'ds-cards-3' : 'ds-cards-2'

  const identitySpecs: SpecItem[] = [
    { label: 'Manufacturer', value: display(cpu.manufacturer) },
    { label: 'Vendor', value: display(cpu.vendor) },
    { label: 'Socket', value: display(cpu.socket) },
    { label: 'Brand', value: display(cpu.brand), span: 2, copyable: Boolean(cpu.brand) },
    { label: 'Family', value: display(cpu.family), mono: true },
    { label: 'Model', value: display(cpu.model), mono: true },
    { label: 'Stepping', value: display(cpu.stepping), mono: true },
    { label: 'Revision', value: display(cpu.revision), mono: true }
  ]

  // Physical / logical counts live in the header; this is the breakdown only.
  const topologySpecs: SpecItem[] = [
    { label: 'Sockets / Packages', value: display(cpu.processors) },
    ...(hasHybrid
      ? ([
          { label: 'Performance Cores', value: display(cpu.performanceCores), color: '#5dd39e' },
          { label: 'Efficiency Cores', value: display(cpu.efficiencyCores), color: '#ffd666' }
        ] as SpecItem[])
      : ([
          { label: 'Physical Cores', value: display(cpu.physicalCores) },
          { label: 'Logical Processors', value: display(cpu.cores) }
        ] as SpecItem[]))
  ]

  const powerSpecs: SpecItem[] = [
    { label: 'Min Speed', value: formatGHz(cpu.speedMin) },
    { label: 'Governor', value: display(cpu.governor) },
    { label: 'Voltage', value: cpu.voltage ? `${cpu.voltage} V` : 'N/A' }
  ]

  const hasClockDetail = Boolean(maxClock || cpu.speedMin || cpu.governor || cpu.voltage)

  return (
    <div className="section-container">
      <PageHeader
        icon={<ThunderboltOutlined />}
        title="Processor"
        subtitle={`${display(cpu.manufacturer)} ${display(cpu.brand)}`}
        color={ACCENT}
        stats={[
          { label: 'Cores', value: display(cpu.physicalCores), color: ACCENT },
          { label: 'Threads', value: display(cpu.cores), color: '#5dd39e' },
          { label: 'Base Clock', value: formatGHz(cpu.speed), color: '#ffd666' }
        ]}
        extra={
          <HealthPill status={cpu.virtualization ? 'good' : 'idle'}>
            {cpu.virtualization ? 'Virtualization On' : 'Virtualization Off'}
          </HealthPill>
        }
      />

      {/* Live load and per-core activity first. */}
      <CpuLive />

      {tiles.length > 0 ? <div className={tileClass}>{tiles}</div> : null}

      <Section icon={<ApiOutlined />} title="IDENTITY" color={ACCENT}>
        <GlassCard>
          <SpecGrid columns={3} items={identitySpecs} />
        </GlassCard>
      </Section>

      <Section
        icon={<ClusterOutlined />}
        title="CORE TOPOLOGY"
        color="#5dd39e"
        extra={<HealthPill status="info">{hasHybrid ? 'Hybrid' : 'Uniform cores'}</HealthPill>}
      >
        <GlassCard>
          <SpecGrid columns={3} items={topologySpecs} />
        </GlassCard>
      </Section>

      {hasClockDetail ? (
        <Section icon={<DashboardOutlined />} title="CLOCKS & POWER" color="#ffd666">
          <GlassCard>
            <SpecGrid columns={3} items={powerSpecs} />
            {maxClock ? (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                <Meter
                  label="Base clock headroom"
                  percent={cpu.speed ? Math.min((cpu.speed / maxClock) * 100, 100) : 0}
                  color={ACCENT}
                  right={`${formatGHz(cpu.speed)} of ${formatGHz(maxClock)}`}
                />
                {cpu.speedMin ? (
                  <Meter
                    label="Idle floor"
                    percent={Math.min((cpu.speedMin / maxClock) * 100, 100)}
                    color="#8892b0"
                    right={`${formatGHz(cpu.speedMin)} of ${formatGHz(maxClock)}`}
                  />
                ) : null}
              </div>
            ) : null}
          </GlassCard>
        </Section>
      ) : null}

      <Section
        icon={<DatabaseOutlined />}
        title="CACHE HIERARCHY"
        color="#ff9d6b"
        extra={
          totalCache > 0 ? (
            <HealthPill status="info">{formatBytes(totalCache)} total</HealthPill>
          ) : undefined
        }
      >
        {totalCache > 0 ? (
          <GlassCard className="ds-glow" glow="#ff9d6b">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {cacheItems.map((c) => (
                <Meter
                  key={c.label}
                  label={c.label}
                  percent={c.value ? (c.value / totalCache) * 100 : 0}
                  color={c.color}
                  right={formatBytes(c.value)}
                />
              ))}
            </div>
          </GlassCard>
        ) : (
          <EmptyHint
            icon={<DatabaseOutlined />}
            title="No cache data"
            description="The processor did not report any cache sizes."
          />
        )}
      </Section>

      <Section
        icon={<ExperimentOutlined />}
        title="INSTRUCTION SET & FEATURES"
        color="#c084fc"
        extra={
          totalFlags > 0 ? (
            <HealthPill status="info">
              {known.length} of {totalFlags} recognised
            </HealthPill>
          ) : undefined
        }
      >
        {known.length > 0 || totalFlags > 0 ? (
          <GlassCard>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {known.map((f) => (
                <span
                  key={f.key}
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 8,
                    color: '#c084fc',
                    background: 'rgba(192,132,252,0.12)',
                    border: '1px solid rgba(192,132,252,0.28)'
                  }}
                >
                  {f.label}
                </span>
              ))}
              {extraCount > 0 ? (
                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '4px 10px',
                    borderRadius: 8,
                    color: '#8892b0',
                    background: 'rgba(136,146,176,0.12)',
                    border: '1px solid rgba(136,146,176,0.25)'
                  }}
                >
                  +{extraCount} more
                </span>
              ) : null}
            </div>
          </GlassCard>
        ) : (
          <EmptyHint
            icon={<ExperimentOutlined />}
            title="No feature flags"
            description="The processor did not report any instruction-set flags."
          />
        )}
      </Section>
    </div>
  )
}

export default CPU
