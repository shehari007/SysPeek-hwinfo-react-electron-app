import type { StaticInfo } from '@shared/ipc'
import type { Systeminformation } from 'systeminformation'
import {
  DesktopOutlined,
  ExpandOutlined,
  EyeOutlined,
  ThunderboltOutlined,
  ColumnWidthOutlined,
  BorderOuterOutlined
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
import { display } from '../../lib/format'
import type { SpecItem } from '../ui/kit'

const ACCENT = '#7cc4ff'

function connectionHealth(connection: string | null | undefined): 'good' | 'warn' | 'info' {
  const c = (connection ?? '').toLowerCase()
  if (c.includes('internal') || c.includes('built')) return 'info'
  if (c.includes('displayport') || c.includes('dp') || c.includes('thunderbolt')) return 'good'
  if (c.includes('hdmi')) return 'warn'
  return 'info'
}

function resText(x: number | null, y: number | null): string {
  return x && y ? `${x} x ${y}` : 'N/A'
}

function megapixels(x: number | null, y: number | null): string {
  if (!x || !y) return 'N/A'
  return `${((x * y) / 1_000_000).toFixed(1)} MP`
}

function aspectRatio(x: number | null, y: number | null): string {
  if (!x || !y) return 'N/A'
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))
  const g = gcd(x, y)
  return `${x / g}:${y / g}`
}

// systeminformation reports physical display size in centimeters, so convert to
// inches for the size, diagonal and PPI figures.
const CM_PER_INCH = 2.54

function diagonalInches(sizeX: number | null, sizeY: number | null): string {
  if (!sizeX || !sizeY) return 'N/A'
  return `${(Math.sqrt(sizeX * sizeX + sizeY * sizeY) / CM_PER_INCH).toFixed(1)}"`
}

function physicalInches(sizeX: number | null | undefined, sizeY: number | null | undefined): string {
  if (!sizeX || !sizeY) return 'N/A'
  return `${(sizeX / CM_PER_INCH).toFixed(1)}" x ${(sizeY / CM_PER_INCH).toFixed(1)}"`
}

function ppi(
  resX: number | null,
  resY: number | null,
  sizeX: number | null,
  sizeY: number | null
): string {
  if (!resX || !resY || !sizeX || !sizeY) return 'N/A'
  const diagPx = Math.sqrt(resX * resX + resY * resY)
  const diagIn = Math.sqrt(sizeX * sizeX + sizeY * sizeY) / CM_PER_INCH
  if (diagIn === 0) return 'N/A'
  return `${Math.round(diagPx / diagIn)} PPI`
}

export default function Display({ siData }: { siData: StaticInfo | null }): React.JSX.Element {
  const displays: Systeminformation.GraphicsDisplayData[] = siData?.graphics?.displays ?? []

  if (displays.length === 0) {
    return (
      <div className="section-container">
        <PageHeader
          icon={<ExpandOutlined />}
          title="Displays"
          subtitle="Connected monitors and their capabilities"
          color={ACCENT}
          stats={[{ label: 'Displays', value: '0' }]}
        />
        <EmptyHint
          icon={<DesktopOutlined />}
          title="No displays detected"
          description="No display devices were reported by the system information provider."
        />
      </div>
    )
  }

  const primary = displays.find((d) => d.main) ?? displays[0]
  const maxRefresh = displays.reduce((m, d) => Math.max(m, d.currentRefreshRate ?? 0), 0)
  const builtinCount = displays.filter((d) => d.builtin).length
  const connections = [...new Set(displays.map((d) => d.connection).filter(Boolean))] as string[]

  const primaryRes = resText(primary?.resolutionX ?? null, primary?.resolutionY ?? null)

  // Virtual desktop bounding box, derived from each display's offset plus its
  // active resolution. Falls back to the native resolution when the current one
  // is not reported.
  const activeW = (d: Systeminformation.GraphicsDisplayData): number =>
    d.currentResX ?? d.resolutionX ?? 0
  const activeH = (d: Systeminformation.GraphicsDisplayData): number =>
    d.currentResY ?? d.resolutionY ?? 0

  const virtualW = displays.reduce((m, d) => Math.max(m, (d.positionX ?? 0) + activeW(d)), 0)
  const virtualH = displays.reduce((m, d) => Math.max(m, (d.positionY ?? 0) + activeH(d)), 0)
  const virtualDesktop = virtualW && virtualH ? `${virtualW} x ${virtualH}` : 'N/A'

  const totalPixels = displays.reduce((sum, d) => sum + activeW(d) * activeH(d), 0)
  const totalMp = totalPixels ? `${(totalPixels / 1_000_000).toFixed(1)} MP` : 'N/A'

  const showLayout = displays.length > 1

  return (
    <div className="section-container">
      <PageHeader
        icon={<ExpandOutlined />}
        title="Displays"
        subtitle="Connected monitors, native and current resolutions, and physical geometry"
        color={ACCENT}
        stats={[
          { label: 'Displays', value: String(displays.length), color: ACCENT },
          { label: 'Primary Native', value: primaryRes, color: '#a78bfa' },
          { label: 'Max Refresh', value: maxRefresh ? `${maxRefresh} Hz` : 'N/A', color: '#34d399' },
          { label: 'Built-in', value: `${builtinCount} / ${displays.length}`, color: '#fbbf24' }
        ]}
      />

      {showLayout && (
        <Section
          icon={<DesktopOutlined />}
          title="DESKTOP LAYOUT"
          color={ACCENT}
          extra={
            connections.length > 0 ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                {connections.map((c) => (
                  <HealthPill key={c} status={connectionHealth(c)}>
                    {c}
                  </HealthPill>
                ))}
              </div>
            ) : undefined
          }
        >
          <div className="ds-cards-3">
            <StatTile
              icon={<EyeOutlined />}
              label="Primary Display"
              value={display(primary?.model || primary?.deviceName)}
              sub={display(primary?.vendor)}
              color="#a78bfa"
            />
            <StatTile
              icon={<ExpandOutlined />}
              label="Virtual Desktop"
              value={virtualDesktop}
              sub={`${displays.length - builtinCount} external · ${builtinCount} built-in`}
              color={ACCENT}
            />
            <StatTile
              icon={<DesktopOutlined />}
              label="Combined Pixels"
              value={totalMp}
              sub="Sum of all active desktop areas"
              color="#34d399"
            />
          </div>
        </Section>
      )}

      {displays.map((d, index) => {
        const nativeRes = resText(d.resolutionX, d.resolutionY)
        const currentRes = resText(d.currentResX, d.currentResY)

        const nativePx =
          d.resolutionX && d.resolutionY ? d.resolutionX * d.resolutionY : 0
        const currentPx = d.currentResX && d.currentResY ? d.currentResX * d.currentResY : 0
        const scaleRatio = nativePx && currentPx ? (currentPx / nativePx) * 100 : null
        const isNative = scaleRatio !== null && Math.round(scaleRatio) === 100

        const items: SpecItem[] = [
          { label: 'Model', value: display(d.model), span: 2 },
          { label: 'Vendor', value: display(d.vendor) },
          { label: 'Device Name', value: display(d.deviceName), mono: true, span: 2 },
          { label: 'Vendor ID', value: display(d.vendorId), mono: true },
          { label: 'Connection', value: display(d.connection), color: ACCENT },
          {
            label: 'Role',
            value: d.main ? 'Primary' : 'Secondary',
            color: d.main ? '#34d399' : undefined
          },
          { label: 'Built-in', value: d.builtin ? 'Yes' : 'No' },
          { label: 'Pixel Depth', value: d.pixelDepth ? `${d.pixelDepth} bit` : 'N/A' },
          { label: 'Production Year', value: display(d.productionYear) },
          {
            label: 'Physical Size',
            value: physicalInches(d.sizeX, d.sizeY),
            hint: 'Width x height of the active area, converted from the reported centimeters'
          },
          {
            label: 'Position',
            value:
              d.positionX !== undefined && d.positionY !== undefined
                ? `(${d.positionX}, ${d.positionY})`
                : 'N/A',
            hint: 'Top-left offset within the virtual desktop'
          },
          { label: 'Serial', value: display(d.serial), mono: true, copyable: true, span: 2 },
          { label: 'Display ID', value: display(d.displayId), mono: true, copyable: true, span: 3 }
        ]

        const glow = d.main ? '#34d399' : ACCENT

        return (
          <Section
            key={d.displayId ?? d.deviceName ?? index}
            icon={<EyeOutlined />}
            title={(d.model || d.deviceName || `DISPLAY ${index + 1}`).toUpperCase()}
            color={glow}
            extra={
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {d.main && <HealthPill status="good">Primary</HealthPill>}
                {d.builtin && <HealthPill status="info">Built-in</HealthPill>}
                {scaleRatio !== null && (
                  <HealthPill status={isNative ? 'good' : 'warn'}>
                    {isNative ? 'Native' : 'Scaled'}
                  </HealthPill>
                )}
                {d.connection && (
                  <HealthPill status={connectionHealth(d.connection)}>{d.connection}</HealthPill>
                )}
              </div>
            }
          >
            <div className="ds-cards-3">
              <StatTile
                icon={<ColumnWidthOutlined />}
                label="Native Resolution"
                value={nativeRes}
                sub={`${megapixels(d.resolutionX, d.resolutionY)} · ${aspectRatio(d.resolutionX, d.resolutionY)}`}
                color="#7cc4ff"
              />
              <StatTile
                icon={<ThunderboltOutlined />}
                label="Current Mode"
                value={currentRes}
                sub={d.currentRefreshRate ? `${d.currentRefreshRate} Hz` : 'Refresh N/A'}
                color="#a78bfa"
              />
              <StatTile
                icon={<BorderOuterOutlined />}
                label="Panel Size"
                value={diagonalInches(d.sizeX, d.sizeY)}
                sub={ppi(d.resolutionX, d.resolutionY, d.sizeX, d.sizeY)}
                color="#34d399"
              />
            </div>
            {scaleRatio !== null && (
              <GlassCard>
                <Meter
                  label="Active pixels vs native panel"
                  percent={scaleRatio}
                  color={isNative ? '#34d399' : '#fbbf24'}
                  right={`${scaleRatio.toFixed(0)}%`}
                />
              </GlassCard>
            )}
            <GlassCard className="ds-glow" glow={glow}>
              <SpecGrid columns={3} items={items} />
            </GlassCard>
          </Section>
        )
      })}
    </div>
  )
}
