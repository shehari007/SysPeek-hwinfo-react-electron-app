import type { StaticInfo } from '@shared/ipc'
import type { Systeminformation } from 'systeminformation'
import {
  PrinterOutlined,
  CheckCircleOutlined,
  ApiOutlined,
  GlobalOutlined,
  ShareAltOutlined,
  DesktopOutlined,
  CodeOutlined,
  IdcardOutlined
} from '@ant-design/icons'
import { PageHeader, Section, GlassCard, SpecGrid, StatTile, HealthPill, EmptyHint } from '../ui/kit'
import { display } from '../../lib/format'

type PrinterExtra = Systeminformation.PrinterData & {
  engine?: string
  engineVersion?: string
  portName?: string
}

type PillStatus = 'good' | 'warn' | 'bad' | 'info' | 'idle'

const ACCENT = '#ffd666'

function statusPill(status?: string): PillStatus {
  const s = (status ?? '').toLowerCase()
  if (!s) return 'idle'
  if (s.includes('error') || s.includes('offline') || s.includes('jam') || s.includes('stopped')) return 'bad'
  if (s.includes('printing') || s.includes('processing') || s.includes('busy')) return 'info'
  if (s.includes('warn') || s.includes('paused') || s.includes('low') || s.includes('paper')) return 'warn'
  if (s.includes('idle') || s.includes('ready') || s.includes('ok')) return 'good'
  return 'info'
}

export default function Printers({ siData }: { siData: StaticInfo | null }): React.JSX.Element {
  const printers = (siData?.printer ?? []) as PrinterExtra[]

  const total = printers.length
  const defaultPrinter = printers.find((p) => p.default)
  const localCount = printers.filter((p) => p.local).length
  const sharedCount = printers.filter((p) => p.shared).length
  const readyCount = printers.filter((p) => statusPill(p.status) === 'good').length

  return (
    <div className="section-container">
      <PageHeader
        icon={<PrinterOutlined />}
        title="Printers"
        subtitle={total > 0 ? `${total} printer${total === 1 ? '' : 's'} configured` : 'No printers configured'}
        color={ACCENT}
        stats={[
          { label: 'Printers', value: String(total), color: ACCENT },
          { label: 'Ready', value: String(readyCount), color: '#52c41a' },
          { label: 'Local', value: String(localCount), color: '#40a9ff' },
          { label: 'Shared', value: String(sharedCount), color: '#b37feb' }
        ]}
      />

      {total === 0 ? (
        <EmptyHint
          icon={<PrinterOutlined />}
          title="No printers detected"
          description="No printers are currently configured or discoverable on this system."
        />
      ) : (
        <>
          <Section icon={<PrinterOutlined />} title="OVERVIEW" color={ACCENT}>
            <div className="ds-cards-auto">
              <StatTile
                icon={<PrinterOutlined />}
                label="Total Printers"
                value={String(total)}
                sub={`${readyCount} ready`}
                color={ACCENT}
              />
              <StatTile
                icon={<CheckCircleOutlined />}
                label="Default"
                value={defaultPrinter?.name || defaultPrinter?.model || 'None'}
                sub={defaultPrinter ? display(defaultPrinter.status) : 'Not set'}
                color="#52c41a"
              />
              <StatTile
                icon={<DesktopOutlined />}
                label="Local"
                value={String(localCount)}
                sub={`${total - localCount} network`}
                color="#40a9ff"
              />
              <StatTile
                icon={<ShareAltOutlined />}
                label="Shared"
                value={String(sharedCount)}
                sub={`${total - sharedCount} private`}
                color="#b37feb"
              />
            </div>
          </Section>

          <Section icon={<PrinterOutlined />} title="PRINTER DEVICES" color={ACCENT}>
            <div className="ds-cards-2">
              {printers.map((printer, index) => {
                const pill = statusPill(printer.status)
                const uri = printer.uri || printer.portName
                return (
                  <GlassCard
                    key={printer.uuid || printer.id || index}
                    className="ds-glow"
                    glow={printer.default ? '#52c41a' : ACCENT}
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
                      <PrinterOutlined style={{ color: ACCENT, fontSize: 26 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--ds-ink)' }}>
                          {printer.name || printer.model || 'Unknown Printer'}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--ds-ink-2)' }}>
                          {printer.model || printer.name || 'Model unavailable'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                        <HealthPill status={pill}>{printer.status || 'Unknown'}</HealthPill>
                        {printer.default && <HealthPill status="good">Default</HealthPill>}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      <HealthPill status={printer.local ? 'info' : 'idle'}>
                        {printer.local ? 'Local' : 'Network'}
                      </HealthPill>
                      <HealthPill status={printer.shared ? 'info' : 'idle'}>
                        {printer.shared ? 'Shared' : 'Private'}
                      </HealthPill>
                    </div>

                    <SpecGrid
                      columns={2}
                      items={[
                        { label: 'Name', value: display(printer.name), span: 2 },
                        { label: 'Model', value: display(printer.model), span: 2 },
                        { label: 'Status', value: display(printer.status) },
                        { label: 'Printer ID', value: display(printer.id), mono: true },
                        {
                          label: 'Connection',
                          value: printer.local ? 'Local' : 'Network',
                          color: printer.local ? 'var(--ds-info)' : 'var(--ds-warn)'
                        },
                        {
                          label: 'Shared',
                          value: display(printer.shared),
                          color: printer.shared ? 'var(--ds-info)' : undefined
                        },
                        {
                          label: 'Default',
                          value: display(printer.default),
                          color: printer.default ? 'var(--ds-good)' : undefined
                        },
                        {
                          label: 'URI / Port',
                          value: display(uri),
                          mono: true,
                          copyable: !!uri,
                          span: 2
                        },
                        {
                          label: 'UUID',
                          value: display(printer.uuid),
                          mono: true,
                          copyable: !!printer.uuid,
                          span: 2
                        },
                        { label: 'Engine', value: display(printer.engine) },
                        { label: 'Engine Version', value: display(printer.engineVersion), mono: true }
                      ]}
                    />
                  </GlassCard>
                )
              })}
            </div>
          </Section>

          <Section icon={<IdcardOutlined />} title="IDENTIFIERS & CONNECTIVITY" color={ACCENT}>
            <GlassCard>
              <SpecGrid
                columns={4}
                items={printers.flatMap((printer, index) => {
                  const label = printer.name || printer.model || `Printer ${index + 1}`
                  const uri = printer.uri || printer.portName
                  return [
                    {
                      label: `${label} · ID`,
                      value: display(printer.id),
                      mono: true,
                      color: 'var(--ds-warn)'
                    },
                    {
                      label: `${label} · UUID`,
                      value: display(printer.uuid),
                      mono: true,
                      copyable: !!printer.uuid
                    },
                    {
                      label: `${label} · URI`,
                      value: display(uri),
                      mono: true,
                      copyable: !!uri,
                      span: 2
                    }
                  ]
                })}
              />
            </GlassCard>
          </Section>

          <Section icon={<ApiOutlined />} title="LEGEND" color={ACCENT} extra={<GlobalOutlined style={{ color: ACCENT }} />}>
            <GlassCard>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} /> Ready / Idle
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <DesktopOutlined style={{ color: '#40a9ff' }} /> Local device
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <ShareAltOutlined style={{ color: '#b37feb' }} /> Shared on network
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                  <CodeOutlined style={{ color: ACCENT }} /> Engine / driver
                </span>
              </div>
            </GlassCard>
          </Section>
        </>
      )}
    </div>
  )
}
