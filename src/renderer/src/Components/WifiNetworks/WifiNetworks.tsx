import { useMemo } from 'react';
import {
  WifiOutlined,
  LockOutlined,
  UnlockOutlined,
  SignalFilled,
  ThunderboltOutlined,
  ApiOutlined,
  SafetyCertificateOutlined,
  InfoCircleOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import type { StaticInfo } from '@shared/ipc';
import type { Systeminformation } from 'systeminformation';
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
} from '../ui/kit';
import { display } from '../../lib/format';

const ACCENT = '#5dd39e';

type WifiNetwork = Systeminformation.WifiNetworkData;

function signalColor(quality: number): string {
  if (quality >= 70) return '#10b981';
  if (quality >= 40) return '#f59e0b';
  return '#ef4444';
}

function signalHealth(quality: number): 'good' | 'warn' | 'bad' {
  if (quality >= 70) return 'good';
  if (quality >= 40) return 'warn';
  return 'bad';
}

function signalLabel(quality: number): string {
  if (quality >= 80) return 'Excellent';
  if (quality >= 70) return 'Strong';
  if (quality >= 40) return 'Fair';
  if (quality > 0) return 'Weak';
  return 'Unknown';
}

function bandOf(frequency: number): string {
  if (!frequency) return 'N/A';
  if (frequency >= 5925) return '6 GHz';
  if (frequency >= 5000) return '5 GHz';
  if (frequency >= 2400) return '2.4 GHz';
  return `${frequency} MHz`;
}

function isRedacted(net: WifiNetwork): boolean {
  return net.ssid === '<redacted>' || net.ssid === '<hidden>';
}

function displayName(net: WifiNetwork): string {
  const ssid = net.ssid;
  if (!ssid || ssid === '') return 'Hidden Network';
  if (isRedacted(net)) {
    return net.bssid ? `Network (${net.bssid.substring(0, 8)}…)` : 'Private Network';
  }
  return ssid;
}

function securityColor(sec: string): string {
  const s = (sec || '').toUpperCase();
  if (s.includes('WPA3')) return '#10b981';
  if (s.includes('WPA2')) return '#5dd39e';
  if (s.includes('WPA')) return '#22d3ee';
  if (s.includes('WEP')) return '#f59e0b';
  return '#f87171';
}

function TagRow({ items, color }: { items: string[]; color?: string }): React.JSX.Element {
  if (!items || items.length === 0) {
    return <span style={{ color: 'var(--ds-ink-3)' }}>None</span>;
  }
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {items.map((t, i) => (
        <span
          key={i}
          style={{
            fontSize: 11,
            padding: '2px 8px',
            borderRadius: 6,
            fontWeight: 600,
            color: color ?? 'var(--ds-ink-2)',
            background: `${color ?? '#94a3b8'}1f`,
            border: `1px solid ${color ?? '#94a3b8'}40`
          }}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

export default function WifiNetworks({
  siData
}: {
  siData: StaticInfo | null;
}): React.JSX.Element {
  const networks: WifiNetwork[] = siData?.wifiNetworks ?? [];

  const sorted = useMemo(
    () => [...networks].sort((a, b) => (b.quality || 0) - (a.quality || 0)),
    [networks]
  );

  const hasRedacted = useMemo(() => networks.some(isRedacted), [networks]);

  const strongCount = networks.filter((n) => (n.quality || 0) >= 70).length;
  const fiveGhzCount = networks.filter((n) => (n.frequency || 0) >= 5000).length;
  const securedCount = networks.filter((n) => n.security && n.security.length > 0).length;
  const openCount = networks.length - securedCount;
  const bestQuality = networks.reduce((m, n) => Math.max(m, n.quality || 0), 0);

  return (
    <div className="section-container">
      <PageHeader
        icon={<WifiOutlined />}
        title="WiFi Networks"
        subtitle={`${networks.length} network${networks.length === 1 ? '' : 's'} in range`}
        color={ACCENT}
        stats={[
          { label: 'In Range', value: networks.length },
          { label: 'Strong Signal', value: strongCount, color: '#10b981' },
          { label: 'Secured', value: securedCount, color: ACCENT },
          { label: 'Best Quality', value: `${bestQuality}%`, color: signalColor(bestQuality) }
        ]}
      />

      {networks.length === 0 ? (
        <Section icon={<WifiOutlined />} title="SCAN RESULTS" color={ACCENT}>
          <EmptyHint
            icon={<WifiOutlined />}
            title="No WiFi networks detected"
            description="WiFi may be disabled, unsupported, or no networks are currently in range."
          />
        </Section>
      ) : (
        <>
          {hasRedacted && (
            <Section icon={<EyeInvisibleOutlined />} title="PRIVACY NOTICE" color={ACCENT}>
              <GlassCard>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <InfoCircleOutlined style={{ color: ACCENT, fontSize: 18, marginTop: 2 }} />
                  <div style={{ color: 'var(--ds-ink-2)', fontSize: 13, lineHeight: 1.6 }}>
                    <strong style={{ color: 'var(--ds-ink)' }}>macOS WiFi privacy is active.</strong>{' '}
                    Network names (SSIDs) are hidden by the operating system for privacy. This is a
                    system-level restriction. Affected networks are identified by their BSSID
                    (hardware address) instead.
                  </div>
                </div>
              </GlassCard>
            </Section>
          )}

          <Section icon={<SignalFilled />} title="OVERVIEW" color={ACCENT}>
            <div className="ds-cards-auto">
              <StatTile
                icon={<WifiOutlined />}
                label="Networks Found"
                value={networks.length}
                sub="in range"
                color={ACCENT}
              />
              <StatTile
                icon={<SignalFilled />}
                label="Strong Signal"
                value={strongCount}
                sub="quality ≥ 70%"
                color="#10b981"
              />
              <StatTile
                icon={<ThunderboltOutlined />}
                label="5 GHz Networks"
                value={fiveGhzCount}
                sub={`${networks.length - fiveGhzCount} on 2.4 GHz`}
                color="#a78bfa"
              />
              <StatTile
                icon={<LockOutlined />}
                label="Secured"
                value={securedCount}
                sub={`${openCount} open`}
                color="#22d3ee"
              />
            </div>
          </Section>

          {sorted.map((net, index) => {
            const quality = net.quality || 0;
            const secList = net.security ?? [];
            const primarySec = secList[0] ?? '';
            const secured = secList.length > 0;
            const specs: SpecItem[] = [
              { label: 'SSID', value: net.ssid && !isRedacted(net) ? net.ssid : 'N/A' },
              { label: 'BSSID', value: net.bssid, mono: true, copyable: true },
              { label: 'Mode', value: display(net.mode) },
              { label: 'Band', value: bandOf(net.frequency), color: signalColor(quality) },
              { label: 'Channel', value: display(net.channel) },
              {
                label: 'Frequency',
                value: net.frequency ? `${net.frequency} MHz` : 'N/A',
                mono: true
              },
              {
                label: 'Signal Level',
                value: net.signalLevel ? `${net.signalLevel} dBm` : 'N/A',
                mono: true,
                color: signalColor(quality)
              },
              {
                label: 'Quality',
                value: `${quality}%`,
                color: signalColor(quality)
              },
              { label: 'Security', value: <TagRow items={secList} color={securityColor(primarySec)} />, span: 2 },
              { label: 'WPA Flags', value: <TagRow items={net.wpaFlags ?? []} color="#22d3ee" />, span: 2 },
              { label: 'RSN Flags', value: <TagRow items={net.rsnFlags ?? []} color="#a78bfa" />, span: 2 }
            ];

            return (
              <Section
                key={`${net.bssid || 'net'}-${index}`}
                icon={<WifiOutlined />}
                title={displayName(net).toUpperCase()}
                color={signalColor(quality)}
                extra={
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <HealthPill status={signalHealth(quality)}>
                      {signalLabel(quality)}
                    </HealthPill>
                    <HealthPill status={secured ? 'good' : 'warn'}>
                      {secured ? (
                        <>
                          <SafetyCertificateOutlined /> {primarySec || 'Secured'}
                        </>
                      ) : (
                        <>
                          <UnlockOutlined /> Open
                        </>
                      )}
                    </HealthPill>
                    {isRedacted(net) && <HealthPill status="info">macOS Private</HealthPill>}
                  </div>
                }
              >
                <GlassCard className="ds-glow" glow={signalColor(quality)}>
                  <Meter
                    label={
                      <span>
                        <SignalFilled /> Signal Quality
                      </span>
                    }
                    percent={quality}
                    color={signalColor(quality)}
                    right={
                      <span style={{ color: signalColor(quality), fontWeight: 600 }}>
                        {quality}% · {net.signalLevel ? `${net.signalLevel} dBm` : bandOf(net.frequency)}
                      </span>
                    }
                  />
                  <div style={{ height: 14 }} />
                  <div className="ds-cards-3" style={{ marginBottom: 14 }}>
                    <StatTile
                      icon={<ThunderboltOutlined />}
                      label="Band"
                      value={bandOf(net.frequency)}
                      sub={net.frequency ? `${net.frequency} MHz` : undefined}
                      color={signalColor(quality)}
                    />
                    <StatTile
                      icon={<ApiOutlined />}
                      label="Channel"
                      value={display(net.channel)}
                      sub={display(net.mode)}
                      color="#a78bfa"
                    />
                    <StatTile
                      icon={secured ? <LockOutlined /> : <UnlockOutlined />}
                      label="Security"
                      value={secured ? primarySec || 'Secured' : 'Open'}
                      sub={secured ? `${secList.length} protocol(s)` : 'Unencrypted'}
                      color={secured ? securityColor(primarySec) : '#f87171'}
                    />
                  </div>
                  <SpecGrid columns={2} items={specs} />
                </GlassCard>
              </Section>
            );
          })}
        </>
      )}
    </div>
  );
}
