import type { CSSProperties, ReactNode } from 'react'
import { Typography, Tooltip } from 'antd'

const { Text } = Typography

/* Shared inline tokens. These live here (not in design-system.css) so this file can be
   refined without touching class names other pages rely on. */
const truncate: CSSProperties = {
  minWidth: 0,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  whiteSpace: 'nowrap'
}

const clamp2: CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  minWidth: 0
}

/** Pick a column count (max 4) that never leaves a single stranded item on the last row. */
function balancedColumns(count: number, max = 4): number {
  if (count <= max) return count
  for (let c = max; c >= 2; c--) {
    if (count % c === 0) return c
  }
  for (let c = max; c >= 2; c--) {
    if (count % c !== 1) return c
  }
  return max
}

/* -------------------------------------------------------------------------- */
/* PageHeader: the hero at the top of every detail page                        */
/* -------------------------------------------------------------------------- */

export interface HeaderStat {
  label: string
  value: ReactNode
  color?: string
}

interface PageHeaderProps {
  icon: ReactNode
  title: string
  subtitle?: ReactNode
  color?: string
  stats?: HeaderStat[]
  extra?: ReactNode
}

export function PageHeader({
  icon,
  title,
  subtitle,
  color = '#7cc4ff',
  stats,
  extra
}: PageHeaderProps): React.JSX.Element {
  const cols = stats && stats.length > 0 ? balancedColumns(stats.length) : 0

  return (
    <div className="page-header">
      <div className="page-header-main" style={{ alignItems: 'center', columnGap: 14 }}>
        <div
          className="page-header-icon"
          style={{
            background: `${color}1f`,
            color,
            border: `1px solid ${color}2e`,
            boxShadow: `0 6px 18px ${color}14`
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
        <div className="page-header-text" style={{ flex: '1 1 220px', minWidth: 0 }}>
          <h1 className="page-header-title" style={{ ...truncate, lineHeight: 1.15 }} title={title}>
            {title}
          </h1>
          {subtitle && (
            <div className="page-header-subtitle" style={{ ...clamp2, lineHeight: 1.4 }}>
              {subtitle}
            </div>
          )}
        </div>
        {extra && (
          <div
            className="page-header-extra"
            style={{ marginLeft: 'auto', flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8 }}
          >
            {extra}
          </div>
        )}
      </div>
      {stats && stats.length > 0 && (
        <div
          className={`page-header-stats ph-stats-${cols}`}
          style={{ alignItems: 'stretch' }}
        >
          {stats.map((s, i) => (
            <div
              key={i}
              className="page-header-stat"
              style={{ minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
            >
              <span
                className="page-header-stat-value"
                style={{ color: s.color, ...truncate, lineHeight: 1.2 }}
              >
                {s.value}
              </span>
              <span className="page-header-stat-label" style={{ ...truncate }} title={s.label}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Section + GlassCard                                                         */
/* -------------------------------------------------------------------------- */

interface SectionProps {
  icon?: ReactNode
  title: string
  extra?: ReactNode
  color?: string
  children: ReactNode
}

export function Section({ icon, title, extra, color = '#7cc4ff', children }: SectionProps): React.JSX.Element {
  return (
    <section className="ds-section" aria-label={title}>
      <div className="ds-section-head" style={{ minWidth: 0 }}>
        {icon && (
          <span className="ds-section-icon" style={{ color }} aria-hidden="true">
            {icon}
          </span>
        )}
        <span className="ds-section-title" style={{ ...truncate }} title={title}>
          {title}
        </span>
        {extra && (
          <span
            className="ds-section-extra"
            style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 8, flex: '0 0 auto' }}
          >
            {extra}
          </span>
        )}
      </div>
      {children}
    </section>
  )
}

interface GlassCardProps {
  children: ReactNode
  className?: string
  glow?: string
}

export function GlassCard({ children, className = '', glow }: GlassCardProps): React.JSX.Element {
  return (
    <div className={`ds-card ${className}`} style={glow ? { ['--glow' as string]: glow } : undefined}>
      {children}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* SpecGrid: the label/value workhorse                                         */
/* -------------------------------------------------------------------------- */

export interface SpecItem {
  label: string
  value: ReactNode
  mono?: boolean
  copyable?: boolean
  color?: string
  span?: 1 | 2 | 3 | 4
  hint?: string
}

export function SpecGrid({ items, columns = 2 }: { items: SpecItem[]; columns?: 2 | 3 | 4 }): React.JSX.Element {
  return (
    <div className={`ds-grid ds-grid-${columns}`}>
      {items.map((item, i) => {
        const isEmpty =
          item.value === null ||
          item.value === undefined ||
          item.value === '' ||
          item.value === 'N/A'
        return (
          <div
            key={i}
            className="ds-cell"
            style={{
              gridColumn: item.span ? `span ${item.span}` : undefined,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minWidth: 0
            }}
          >
            <div className="ds-cell-label" style={{ marginBottom: 0, minWidth: 0 }}>
              <span title={item.label}>{item.label}</span>
              {item.hint && (
                <Tooltip title={item.hint}>
                  <span
                    className="ds-cell-hint"
                    tabIndex={0}
                    role="img"
                    aria-label={item.hint}
                    style={{ flex: '0 0 auto' }}
                  >
                    <span aria-hidden="true">?</span>
                  </span>
                </Tooltip>
              )}
            </div>
            <div
              className={`ds-cell-value ${item.mono ? 'ds-mono' : ''} ${isEmpty ? 'ds-muted' : ''}`}
              style={{
                color: !isEmpty ? item.color : undefined,
                minWidth: 0,
                opacity: isEmpty ? 0.72 : undefined,
                fontWeight: isEmpty ? 500 : undefined
              }}
            >
              {item.copyable && !isEmpty ? (
                <Text copyable={{ text: String(item.value) }} className="ds-copy">
                  {item.value}
                </Text>
              ) : (
                item.value ?? 'N/A'
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* StatTile: KPI                                                               */
/* -------------------------------------------------------------------------- */

interface StatTileProps {
  icon?: ReactNode
  label: string
  value: ReactNode
  sub?: ReactNode
  color?: string
}

export function StatTile({ icon, label, value, sub, color = '#7cc4ff' }: StatTileProps): React.JSX.Element {
  return (
    <div
      className="ds-stat"
      style={{
        ['--accent' as string]: color,
        height: '100%',
        alignItems: 'flex-start',
        minWidth: 0
      }}
    >
      {icon && (
        <div
          className="ds-stat-icon"
          style={{
            background: `${color}1f`,
            color,
            border: `1px solid ${color}2b`,
            alignSelf: 'flex-start'
          }}
          aria-hidden="true"
        >
          {icon}
        </div>
      )}
      <div
        className="ds-stat-body"
        style={{ minWidth: 0, display: 'flex', flexDirection: 'column', flex: '1 1 auto' }}
      >
        <div className="ds-stat-value" style={{ color }}>
          {value}
        </div>
        <div className="ds-stat-label" style={{ marginTop: 3 }} title={label}>
          {label}
        </div>
        {sub && (
          <div className="ds-stat-sub" style={{ marginTop: 'auto', paddingTop: 4, lineHeight: 1.35 }}>
            {sub}
          </div>
        )}
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Meter: labeled linear bar                                                   */
/* -------------------------------------------------------------------------- */

interface MeterProps {
  label: ReactNode
  percent: number
  color?: string
  right?: ReactNode
  /** Track thickness in px. Defaults to the design-system value. */
  height?: number
}

export function Meter({ label, percent, color = '#7cc4ff', right, height }: MeterProps): React.JSX.Element {
  const raw = Number.isFinite(percent) ? percent : 0
  const clamped = Math.max(0, Math.min(100, raw))
  const readout = `${clamped.toFixed(0)}%`
  const ariaLabel = typeof label === 'string' ? label : undefined

  return (
    <div className="ds-meter" style={{ minWidth: 0 }}>
      <div className="ds-meter-head" style={{ gap: 10, minWidth: 0 }}>
        <span className="ds-meter-label" style={{ flex: '1 1 auto', minWidth: 0, lineHeight: 1.35 }}>
          {label}
        </span>
        <span
          className="ds-meter-right"
          style={{ color, flex: '0 0 auto', textAlign: 'right', lineHeight: 1.35 }}
        >
          {right ?? readout}
        </span>
      </div>
      <div
        className="ds-meter-track"
        role="meter"
        aria-label={ariaLabel}
        aria-valuenow={Math.round(clamped)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={readout}
        style={{
          height: height ?? undefined,
          position: 'relative',
          boxShadow: 'inset 0 0 0 1px rgba(148, 176, 224, 0.08)'
        }}
      >
        <div
          className="ds-meter-fill"
          style={{
            width: `${clamped}%`,
            background: `linear-gradient(90deg, ${color}cc, ${color})`,
            boxShadow: clamped > 0 ? `0 0 8px ${color}59` : undefined,
            minWidth: clamped > 0 ? 3 : 0
          }}
        />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* HealthPill + EmptyHint                                                      */
/* -------------------------------------------------------------------------- */

type Health = 'good' | 'warn' | 'bad' | 'info' | 'idle'

export function HealthPill({ status, children }: { status: Health; children: ReactNode }): React.JSX.Element {
  return (
    <span
      className={`ds-pill ds-pill-${status}`}
      data-status={status}
      style={{ whiteSpace: 'nowrap', lineHeight: 1.5, maxWidth: '100%', overflow: 'hidden' }}
    >
      {children}
    </span>
  )
}

export function EmptyHint({
  icon,
  title,
  description
}: {
  icon?: ReactNode
  title: string
  description?: string
}): React.JSX.Element {
  return (
    <div className="ds-empty" role="note" aria-label={title}>
      {icon && (
        <div className="ds-empty-icon" aria-hidden="true">
          {icon}
        </div>
      )}
      <div className="ds-empty-title" style={{ lineHeight: 1.35 }}>
        {title}
      </div>
      {description && (
        <div className="ds-empty-desc" style={{ lineHeight: 1.5 }}>
          {description}
        </div>
      )}
    </div>
  )
}
