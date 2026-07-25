import type { StaticInfo } from '@shared/ipc';
import type { Systeminformation } from 'systeminformation';
import {
  ThunderboltOutlined,
  PoweroffOutlined,
  ApiOutlined,
  HeartOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  ReloadOutlined,
  ExperimentOutlined,
  BulbOutlined,
  DisconnectOutlined
} from '@ant-design/icons';
import {
  PageHeader,
  Section,
  SpecGrid,
  StatTile,
  Meter,
  HealthPill,
  EmptyHint,
  type SpecItem,
  type HeaderStat
} from '../ui/kit';
import { formatDuration, display, usageColor } from '../../lib/format';

const ACCENT = '#ffd666';

export default function Battery({ siData }: { siData: StaticInfo | null }): React.JSX.Element {
  const battery = siData?.battery ?? ({} as Systeminformation.BatteryData);

  if (!battery.hasBattery) {
    return (
      <div className="section-container">
        <PageHeader
          icon={<ThunderboltOutlined />}
          title="Battery"
          subtitle="Power source & battery health"
          color={ACCENT}
        />
        <EmptyHint
          icon={<DisconnectOutlined />}
          title="No Battery Detected"
          description="This device is running on AC power with no removable or internal battery reported."
        />
      </div>
    );
  }

  const percent = battery.percent ?? 0;
  const timeRemainingMin = battery.timeRemaining ?? -1;
  const hasTime = timeRemainingMin > 0;

  // Health = maxCapacity / designedCapacity * 100
  const canHealth = battery.designedCapacity > 0 && battery.maxCapacity > 0;
  const health = canHealth ? (battery.maxCapacity / battery.designedCapacity) * 100 : 0;
  const healthPct = Math.round(health);

  // Charge / capacity ratio (currentCapacity vs maxCapacity)
  const canCharge = battery.maxCapacity > 0 && battery.currentCapacity > 0;
  const chargeRatio = canCharge ? (battery.currentCapacity / battery.maxCapacity) * 100 : percent;

  const unit = battery.capacityUnit || 'mWh';

  const chargeStatus: 'good' | 'warn' | 'bad' | 'info' | 'idle' = battery.isCharging
    ? 'info'
    : percent >= 40
      ? 'good'
      : percent >= 20
        ? 'warn'
        : 'bad';

  const healthStatus: 'good' | 'warn' | 'bad' = healthPct >= 80 ? 'good' : healthPct >= 50 ? 'warn' : 'bad';

  const stats: HeaderStat[] = [
    { label: 'Charge', value: `${percent}%`, color: usageColor(percent) },
    {
      label: 'Power',
      value: battery.isCharging ? 'Charging' : battery.acConnected ? 'AC / Full' : 'On Battery',
      color: battery.isCharging || battery.acConnected ? '#69db7c' : ACCENT
    },
    {
      label: 'Time Remaining',
      value: hasTime ? formatDuration(timeRemainingMin * 60) : battery.isCharging ? 'Charging' : 'N/A'
    },
    ...(canHealth ? [{ label: 'Health', value: `${healthPct}%`, color: usageColor(100 - healthPct) }] : [])
  ];

  const powerItems: SpecItem[] = [
    { label: 'Has Battery', value: display(battery.hasBattery), color: '#69db7c' },
    { label: 'Charging', value: display(battery.isCharging), color: battery.isCharging ? '#69db7c' : undefined },
    { label: 'AC Connected', value: display(battery.acConnected), color: battery.acConnected ? '#69db7c' : undefined },
    { label: 'Current Charge', value: `${percent}%`, color: usageColor(percent) },
    { label: 'Time Remaining', value: hasTime ? formatDuration(timeRemainingMin * 60) : 'N/A' },
    { label: 'Cycle Count', value: display(battery.cycleCount) }
  ];

  const capacityItems: SpecItem[] = [
    { label: 'Current Capacity', value: battery.currentCapacity ? `${battery.currentCapacity.toLocaleString()} ${unit}` : 'N/A' },
    { label: 'Max Capacity', value: battery.maxCapacity ? `${battery.maxCapacity.toLocaleString()} ${unit}` : 'N/A' },
    { label: 'Designed Capacity', value: battery.designedCapacity ? `${battery.designedCapacity.toLocaleString()} ${unit}` : 'N/A' },
    { label: 'Capacity Unit', value: display(battery.capacityUnit), mono: true },
    { label: 'Voltage', value: battery.voltage ? `${battery.voltage} V` : 'N/A', color: ACCENT },
    { label: 'Cycle Count', value: display(battery.cycleCount) }
  ];

  const hardwareItems: SpecItem[] = [
    { label: 'Manufacturer', value: display(battery.manufacturer) },
    { label: 'Model', value: display(battery.model) },
    { label: 'Type / Chemistry', value: display(battery.type) },
    { label: 'Serial Number', value: display(battery.serial), mono: true, copyable: true, span: 2 }
  ];

  const additional = battery.additionalBatteries ?? [];

  return (
    <div className="section-container">
      <PageHeader
        icon={<ThunderboltOutlined />}
        title="Battery"
        subtitle={
          [battery.manufacturer, battery.model].filter(Boolean).join(' ') || 'Power source & battery health'
        }
        color={ACCENT}
        stats={stats}
        extra={<HealthPill status={chargeStatus}>{battery.isCharging ? 'Charging' : `${percent}% Charge`}</HealthPill>}
      />

      <Section icon={<DashboardOutlined />} title="POWER STATUS" color={ACCENT}>
        <div className="ds-cards-3">
          <StatTile
            icon={<ThunderboltOutlined />}
            label="Charge Level"
            value={`${percent}%`}
            sub={battery.isCharging ? 'Charging' : 'Discharging'}
            color={usageColor(percent)}
          />
          <StatTile
            icon={<PoweroffOutlined />}
            label="Power Source"
            value={battery.acConnected ? 'AC Power' : 'Battery'}
            sub={battery.isCharging ? 'Charging' : battery.acConnected ? 'Connected' : 'Unplugged'}
            color={battery.acConnected ? '#69db7c' : ACCENT}
          />
          <StatTile
            icon={<ClockCircleOutlined />}
            label="Time Remaining"
            value={hasTime ? formatDuration(timeRemainingMin * 60) : battery.isCharging ? 'Charging' : 'N/A'}
            sub={hasTime ? 'Estimated' : undefined}
            color="#7cc4ff"
          />
          <StatTile
            icon={<ReloadOutlined />}
            label="Cycle Count"
            value={display(battery.cycleCount)}
            sub="Charge cycles"
            color="#b197fc"
          />
          <StatTile
            icon={<ApiOutlined />}
            label="Voltage"
            value={battery.voltage ? `${battery.voltage} V` : 'N/A'}
            sub="Terminal"
            color={ACCENT}
          />
          <StatTile
            icon={<HeartOutlined />}
            label="Health"
            value={canHealth ? `${healthPct}%` : 'N/A'}
            sub="Max vs designed"
            color={canHealth ? usageColor(100 - healthPct) : '#94a3b8'}
          />
        </div>

        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <Meter
            label="Charge Level"
            percent={percent}
            color={usageColor(percent)}
            right={<span>{percent}%</span>}
          />
          {canCharge && (
            <Meter
              label="Current / Max Capacity"
              percent={Math.min(100, Math.round(chargeRatio))}
              color="#7cc4ff"
              right={<span>{Math.round(chargeRatio)}%</span>}
            />
          )}
          {canHealth && (
            <Meter
              label={
                <span>
                  Battery Health <HealthPill status={healthStatus}>{healthStatus === 'good' ? 'Good' : healthStatus === 'warn' ? 'Worn' : 'Degraded'}</HealthPill>
                </span>
              }
              percent={Math.min(100, healthPct)}
              color={usageColor(100 - healthPct)}
              right={<span>{healthPct}%</span>}
            />
          )}
        </div>
      </Section>

      <Section icon={<PoweroffOutlined />} title="POWER & CHARGE STATE" color={ACCENT}>
        <SpecGrid columns={3} items={powerItems} />
      </Section>

      <Section icon={<ExperimentOutlined />} title="CAPACITY & ELECTRICAL" color={ACCENT}>
        <SpecGrid columns={3} items={capacityItems} />
      </Section>

      <Section icon={<BulbOutlined />} title="BATTERY HARDWARE" color={ACCENT}>
        <SpecGrid columns={3} items={hardwareItems} />
      </Section>

      {additional.length > 0 && (
        <Section icon={<ThunderboltOutlined />} title={`ADDITIONAL BATTERIES (${additional.length})`} color={ACCENT}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {additional.map((b, i) => {
              const bUnit = b.capacityUnit || 'mWh';
              const items: SpecItem[] = [
                { label: 'Charge', value: `${b.percent ?? 0}%`, color: usageColor(b.percent ?? 0) },
                { label: 'Charging', value: display(b.isCharging) },
                { label: 'Manufacturer', value: display(b.manufacturer) },
                { label: 'Model', value: display(b.model) },
                { label: 'Type', value: display(b.type) },
                { label: 'Voltage', value: b.voltage ? `${b.voltage} V` : 'N/A' },
                { label: 'Cycle Count', value: display(b.cycleCount) },
                { label: 'Current Capacity', value: b.currentCapacity ? `${b.currentCapacity.toLocaleString()} ${bUnit}` : 'N/A' },
                { label: 'Max Capacity', value: b.maxCapacity ? `${b.maxCapacity.toLocaleString()} ${bUnit}` : 'N/A' },
                { label: 'Designed Capacity', value: b.designedCapacity ? `${b.designedCapacity.toLocaleString()} ${bUnit}` : 'N/A' },
                { label: 'Serial', value: display(b.serial), mono: true, copyable: true }
              ];
              return (
                <div key={`${b.serial || b.model || 'battery'}-${i}`}>
                  <SpecGrid columns={3} items={items} />
                </div>
              );
            })}
          </div>
        </Section>
      )}
    </div>
  );
}
