import { useMemo } from 'react'
import {
  HddOutlined,
  DatabaseOutlined,
  SafetyCertificateOutlined,
  FireOutlined,
  ThunderboltOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  ApiOutlined,
  WarningOutlined,
  ProfileOutlined,
  BarcodeOutlined
} from '@ant-design/icons'
import type { StaticInfo } from '@shared/ipc'
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
import { formatBytes, formatHours, display, tempColor } from '../../lib/format'
import { StorageLive } from '../Live/LiveSections'

const ACCENT = '#ffd666'

type Health = 'good' | 'warn' | 'bad' | 'info' | 'idle'

function smartHealth(status: string | undefined): Health {
  if (!status) return 'idle'
  const s = status.toLowerCase()
  if (s === 'ok' || s === 'passed') return 'good'
  if (s === 'unknown') return 'idle'
  return 'bad'
}

function typeColor(type: string | undefined): string {
  const t = (type ?? '').toLowerCase()
  if (t.includes('nvme')) return '#3b82f6'
  if (t.includes('ssd')) return '#10b981'
  if (t.includes('hd')) return '#f59e0b'
  return ACCENT
}

// systeminformation reports NVMe data_units in units of 1000 * 512 bytes
function dataUnitsToBytes(units: number): number {
  return units * 1000 * 512
}

/** Picks the row wrapper that exactly fits the tile count, so nothing is stranded. */
function tileRowClass(count: number): string {
  if (count === 2) return 'ds-cards-2'
  if (count === 3) return 'ds-cards-3'
  if (count === 4) return 'ds-cards-4'
  return 'ds-cards-auto'
}

/** True when at least one value is real, so we never render an all-N/A card. */
function hasData(items: SpecItem[]): boolean {
  return items.some((i) => i.value !== 'N/A' && i.value !== '' && i.value != null)
}

/** Widens trailing cells so the last grid row is always full (no orphan cell). */
function fillRows(items: SpecItem[], columns: 2 | 3 | 4): SpecItem[] {
  const out: SpecItem[] = items.map((i) => ({ ...i }))
  const units = out.reduce((acc, i) => acc + (i.span ?? 1), 0)
  let deficit = (columns - (units % columns)) % columns
  let guard = out.length * columns
  let idx = out.length - 1
  while (deficit > 0 && guard > 0) {
    const cur = out[idx].span ?? 1
    if (cur < columns) {
      out[idx].span = (cur + 1) as 1 | 2 | 3 | 4
      deficit--
    }
    idx = idx === 0 ? out.length - 1 : idx - 1
    guard--
  }
  return out
}

const num = (v: number | null | undefined): string => (v != null ? v.toLocaleString() : 'N/A')

export default function StorageDevices({
  siData
}: {
  siData: StaticInfo | null
}): React.JSX.Element {
  const diskLayout = siData?.diskLayout ?? []

  const totalStorage = useMemo(
    () => diskLayout.reduce((acc, d) => acc + (d.size || 0), 0),
    [diskLayout]
  )

  const ssdCount = useMemo(
    () => diskLayout.filter((d) => (d.type ?? '').toLowerCase().includes('ssd')).length,
    [diskLayout]
  )

  const healthyCount = useMemo(
    () => diskLayout.filter((d) => smartHealth(d.smartStatus) === 'good').length,
    [diskLayout]
  )

  return (
    <div className="section-container">
      <PageHeader
        icon={<HddOutlined />}
        title="Storage Devices"
        subtitle="Physical disk layout, SMART health and NVMe wear telemetry"
        color={ACCENT}
        stats={[
          { label: 'Drives', value: diskLayout.length, color: ACCENT },
          { label: 'Total Capacity', value: formatBytes(totalStorage), color: '#10b981' },
          { label: 'SSD / Flash', value: ssdCount, color: '#3b82f6' },
          { label: 'SMART Healthy', value: `${healthyCount}/${diskLayout.length}`, color: '#22c55e' }
        ]}
      />

      <StorageLive />

      {diskLayout.length === 0 ? (
        <EmptyHint
          icon={<DatabaseOutlined />}
          title="No storage devices detected"
          description="No physical disk layout information is available for this system."
        />
      ) : (
        diskLayout.map((drive, index) => {
          const dtColor = typeColor(drive.type)
          const smart = drive.smartData
          const nvme = smart?.nvme_smart_health_information_log
          const temp = drive.temperature ?? smart?.temperature?.current ?? null
          const wear = nvme?.percentage_used
          const spare = nvme?.available_spare

          /* --- headline tiles: capability numbers only, never repeated below --- */
          const tiles: React.JSX.Element[] = [
            <StatTile
              key="cap"
              icon={<DatabaseOutlined />}
              label="Capacity"
              value={formatBytes(drive.size)}
              sub={display(drive.type)}
              color={dtColor}
            />,
            <StatTile
              key="iface"
              icon={<ApiOutlined />}
              label="Interface"
              value={display(drive.interfaceType)}
              sub={display(smart?.device?.protocol, ' protocol')}
              color="#a78bfa"
            />
          ]
          if (temp != null) {
            tiles.push(
              <StatTile
                key="temp"
                icon={<FireOutlined />}
                label="Temperature"
                value={`${temp} °C`}
                sub="Drive sensor"
                color={tempColor(temp)}
              />
            )
          }
          if (drive.firmwareRevision) {
            tiles.push(
              <StatTile
                key="fw"
                icon={<SafetyCertificateOutlined />}
                label="Firmware"
                value={display(drive.firmwareRevision)}
                sub="Revision"
                color="#38bdf8"
              />
            )
          }

          /* --- identity: no capacity / interface / temp / firmware repeats --- */
          const identity = fillRows(
            [
              { label: 'Name', value: display(drive.name), span: 2 },
              { label: 'Vendor', value: display(drive.vendor) },
              { label: 'Device Path', value: display(drive.device), mono: true },
              {
                label: 'Serial Number',
                value: display(drive.serialNum),
                mono: true,
                copyable: !!drive.serialNum,
                span: 2
              }
            ],
            3
          )

          /* --- SMART lifetime tiles: different metrics from the headline row --- */
          const smartTiles: React.JSX.Element[] = []
          if (smart) {
            smartTiles.push(
              <StatTile
                key="pot"
                icon={<ClockCircleOutlined />}
                label="Power-On Time"
                value={formatHours(smart.power_on_time?.hours)}
                sub="Lifetime"
                color="#38bdf8"
              />,
              <StatTile
                key="cycles"
                icon={<ThunderboltOutlined />}
                label="Power Cycles"
                value={display(smart.power_cycle_count)}
                sub="Start / stop count"
                color="#facc15"
              />
            )
            if (nvme?.unsafe_shutdowns != null) {
              smartTiles.push(
                <StatTile
                  key="unsafe"
                  icon={<WarningOutlined />}
                  label="Unsafe Shutdowns"
                  value={num(nvme.unsafe_shutdowns)}
                  sub="NVMe log"
                  color="#f97316"
                />
              )
            }
            if (nvme?.media_errors != null) {
              smartTiles.push(
                <StatTile
                  key="media"
                  icon={<WarningOutlined />}
                  label="Media Errors"
                  value={num(nvme.media_errors)}
                  sub="NVMe log"
                  color={nvme.media_errors ? '#ef4444' : '#22c55e'}
                />
              )
            }
          }

          /* --- controller report: only what the tiles / identity do not show --- */
          const report: SpecItem[] = smart
            ? [
                { label: 'Model Family', value: display(smart.model_family) },
                { label: 'Model Name', value: display(smart.model_name) },
                { label: 'TRIM Support', value: display(smart.trim?.supported) },
                {
                  label: 'Available Spare Threshold',
                  value:
                    nvme?.available_spare_threshold != null
                      ? `${nvme.available_spare_threshold}%`
                      : 'N/A'
                },
                {
                  label: 'Critical Warning',
                  value: display(nvme?.critical_warning),
                  color: nvme?.critical_warning ? '#ef4444' : undefined
                },
                { label: 'Error Log Entries', value: display(nvme?.num_err_log_entries) },
                ...(smart.serial_number && smart.serial_number !== drive.serialNum
                  ? [
                      {
                        label: 'Controller Serial',
                        value: display(smart.serial_number),
                        mono: true,
                        copyable: true
                      } as SpecItem
                    ]
                  : []),
                ...(smart.firmware_version && smart.firmware_version !== drive.firmwareRevision
                  ? [
                      {
                        label: 'Controller Firmware',
                        value: display(smart.firmware_version),
                        mono: true
                      } as SpecItem
                    ]
                  : [])
              ]
            : []

          /* --- raw NVMe I/O counters --- */
          const io: SpecItem[] = [
            {
              label: 'Data Units Read',
              value:
                nvme?.data_units_read != null
                  ? `${nvme.data_units_read.toLocaleString()} (${formatBytes(
                      dataUnitsToBytes(nvme.data_units_read)
                    )})`
                  : 'N/A'
            },
            {
              label: 'Data Units Written',
              value:
                nvme?.data_units_written != null
                  ? `${nvme.data_units_written.toLocaleString()} (${formatBytes(
                      dataUnitsToBytes(nvme.data_units_written)
                    )})`
                  : 'N/A'
            },
            { label: 'Host Reads', value: num(nvme?.host_reads), mono: true },
            { label: 'Host Writes', value: num(nvme?.host_writes), mono: true },
            {
              label: 'Controller Busy Time',
              value: nvme?.controller_busy_time != null ? `${num(nvme.controller_busy_time)} min` : 'N/A'
            },
            ...(nvme?.temperature != null && nvme.temperature !== temp
              ? [
                  {
                    label: 'NVMe Sensor',
                    value: `${nvme.temperature} °C`,
                    color: tempColor(nvme.temperature)
                  } as SpecItem
                ]
              : [])
          ]

          /* --- low-level geometry, last because it matters least --- */
          const geometry: SpecItem[] = [
            { label: 'Bytes / Sector', value: num(drive.bytesPerSector), mono: true },
            { label: 'Total Sectors', value: num(drive.totalSectors), mono: true },
            { label: 'Sectors / Track', value: num(drive.sectorsPerTrack), mono: true },
            { label: 'Total Tracks', value: num(drive.totalTracks), mono: true },
            { label: 'Tracks / Cylinder', value: num(drive.tracksPerCylinder), mono: true },
            { label: 'Total Cylinders', value: num(drive.totalCylinders), mono: true },
            { label: 'Total Heads', value: num(drive.totalHeads), mono: true }
          ]

          return (
            <Section
              key={drive.serialNum || drive.device || index}
              icon={<HddOutlined />}
              title={(drive.name || drive.vendor || `Drive ${index + 1}`).toUpperCase()}
              color={dtColor}
              extra={
                <HealthPill status={smartHealth(drive.smartStatus)}>
                  SMART: {display(drive.smartStatus)}
                </HealthPill>
              }
            >
              <div className={tileRowClass(tiles.length)} style={{ marginBottom: 16 }}>
                {tiles}
              </div>

              <GlassCard className="ds-glow" glow={dtColor}>
                <SpecGrid columns={3} items={identity} />
              </GlassCard>

              {smart && (
                <>
                  <div style={{ height: 16 }} />
                  <Section
                    icon={<HeartOutlined />}
                    title="SMART HEALTH & WEAR"
                    color="#22c55e"
                    extra={
                      <HealthPill status={smart.smart_status?.passed ? 'good' : 'bad'}>
                        {smart.smart_status?.passed ? 'Passed' : 'Failing'}
                      </HealthPill>
                    }
                  >
                    {smartTiles.length > 0 && (
                      <div className={tileRowClass(smartTiles.length)} style={{ marginBottom: 16 }}>
                        {smartTiles}
                      </div>
                    )}

                    {(wear != null || spare != null) && (
                      <GlassCard>
                        {wear != null && (
                          <div style={{ marginBottom: spare != null ? 14 : 0 }}>
                            <Meter
                              label="Wear Level (percentage used)"
                              percent={Math.min(wear, 100)}
                              color={wear >= 90 ? '#ef4444' : wear >= 70 ? '#f59e0b' : '#22c55e'}
                              right={`${wear}%`}
                            />
                          </div>
                        )}
                        {spare != null && (
                          <Meter
                            label="Available Spare"
                            percent={Math.min(spare, 100)}
                            color={spare <= 10 ? '#ef4444' : spare <= 30 ? '#f59e0b' : '#22c55e'}
                            right={`${spare}%`}
                          />
                        )}
                      </GlassCard>
                    )}
                  </Section>

                  {hasData(report) && (
                    <Section icon={<ProfileOutlined />} title="CONTROLLER REPORT" color="#38bdf8">
                      <GlassCard className="ds-glow" glow="#38bdf8">
                        <SpecGrid columns={2} items={fillRows(report, 2)} />
                      </GlassCard>
                    </Section>
                  )}

                  {hasData(io) && (
                    <Section icon={<BarcodeOutlined />} title="NVMe I/O COUNTERS" color="#a78bfa">
                      <GlassCard>
                        <SpecGrid columns={2} items={fillRows(io, 2)} />
                      </GlassCard>
                    </Section>
                  )}
                </>
              )}

              {hasData(geometry) && (
                <>
                  <div style={{ height: 16 }} />
                  <Section icon={<DatabaseOutlined />} title="LOW-LEVEL GEOMETRY" color="#94a3b8">
                    <GlassCard>
                      <SpecGrid columns={3} items={fillRows(geometry, 3)} />
                    </GlassCard>
                  </Section>
                </>
              )}
            </Section>
          )
        })
      )}
    </div>
  )
}
