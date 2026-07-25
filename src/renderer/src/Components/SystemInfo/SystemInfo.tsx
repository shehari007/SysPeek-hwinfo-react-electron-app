import React from 'react';
import { Tag } from 'antd';
import {
  LaptopOutlined,
  ToolOutlined,
  BuildOutlined,
  BoxPlotOutlined,
  CloudServerOutlined
} from '@ant-design/icons';
import type { StaticInfo } from '@shared/ipc';
import type { Systeminformation } from 'systeminformation';
import { PageHeader, Section, SpecGrid, HealthPill, EmptyHint } from '../ui/kit';
import { formatBytes, display } from '../../lib/format';

const ACCENT = '#7cc4ff';

/** True when at least one of the supplied values carries real content. */
function hasAny(...values: unknown[]): boolean {
  return values.some(
    (v) => v !== undefined && v !== null && v !== '' && v !== 'N/A' && !(typeof v === 'number' && v <= 0)
  );
}

export default function SystemInfo({ siData }: { siData: StaticInfo | null }): React.JSX.Element {
  const system = siData?.system ?? ({} as Systeminformation.SystemData);
  const bios = siData?.bios ?? ({} as Systeminformation.BiosData);
  const baseboard = siData?.baseboard ?? ({} as Systeminformation.BaseboardData);
  const chassis = siData?.chassis ?? ({} as Systeminformation.ChassisData);

  const hasData = Boolean(siData);
  const isVirtual = Boolean(system.virtual);
  const biosFeatures = bios.features ?? [];
  const memSlots = baseboard.memSlots;
  const memMax = baseboard.memMax;
  const memMaxLabel = memMax != null && memMax > 0 ? formatBytes(memMax) : 'N/A';

  const subtitle = (
    <span>
      Hardware identity, firmware and enclosure
      {isVirtual && (
        <Tag color="purple" style={{ marginLeft: 8 }}>
          Virtual Machine
        </Tag>
      )}
    </span>
  );

  if (!hasData) {
    return (
      <div className="section-container">
        <PageHeader
          icon={<LaptopOutlined />}
          title="System Information"
          subtitle="Hardware identity, firmware and enclosure"
          color={ACCENT}
        />
        <EmptyHint
          icon={<LaptopOutlined />}
          title="No system data"
          description="System identity information is not available yet."
        />
      </div>
    );
  }

  const hasSystem = hasAny(
    system.manufacturer,
    system.model,
    system.version,
    system.sku,
    system.serial,
    system.uuid,
    system.virtualHost
  );
  const hasBoard = hasAny(
    baseboard.manufacturer,
    baseboard.model,
    baseboard.version,
    baseboard.assetTag,
    baseboard.serial,
    memMax,
    memSlots
  );
  const hasChassis = hasAny(
    chassis.manufacturer,
    chassis.model,
    chassis.type,
    chassis.version,
    chassis.sku,
    chassis.assetTag,
    chassis.serial
  );
  const hasBios = hasAny(
    bios.vendor,
    bios.version,
    bios.releaseDate,
    bios.revision,
    bios.language,
    bios.serial,
    biosFeatures.length
  );

  return (
    <div className="section-container">
      <PageHeader
        icon={<LaptopOutlined />}
        title="System Information"
        subtitle={subtitle}
        color={ACCENT}
        stats={[
          { label: 'Manufacturer', value: display(system.manufacturer) },
          { label: 'Model', value: display(system.model) },
          { label: 'BIOS Version', value: display(bios.version), color: '#fbbf24' },
          {
            label: 'Environment',
            value: isVirtual ? 'Virtual' : 'Physical',
            color: isVirtual ? '#a78bfa' : '#4ade80'
          }
        ]}
      />

      {hasSystem ? (
        <Section icon={<LaptopOutlined />} title="IDENTITY" color={ACCENT}>
          <SpecGrid
            columns={2}
            items={[
              { label: 'Version', value: system.version },
              { label: 'SKU', value: system.sku, mono: true },
              {
                label: 'Environment',
                value: (
                  <HealthPill status={isVirtual ? 'info' : 'good'}>
                    {isVirtual ? 'Virtualized' : 'Physical'}
                  </HealthPill>
                )
              },
              {
                label: 'Virtual Host',
                value: system.virtualHost,
                hint: 'Hypervisor / host platform'
              },
              { label: 'Serial Number', value: system.serial, mono: true, copyable: true },
              { label: 'UUID', value: system.uuid, mono: true, copyable: true, span: 2 }
            ]}
          />
        </Section>
      ) : (
        <Section icon={<LaptopOutlined />} title="IDENTITY" color={ACCENT}>
          <EmptyHint
            icon={<LaptopOutlined />}
            title="Identity unavailable"
            description="This platform did not report manufacturer or serial details."
          />
        </Section>
      )}

      {hasBoard && (
        <Section icon={<BuildOutlined />} title="MOTHERBOARD" color="#4ade80">
          <SpecGrid
            columns={2}
            items={[
              { label: 'Manufacturer', value: baseboard.manufacturer },
              { label: 'Model', value: baseboard.model },
              { label: 'Version', value: baseboard.version },
              { label: 'Asset Tag', value: baseboard.assetTag, mono: true },
              {
                label: 'Max Memory',
                value: memMaxLabel,
                hint: 'Maximum installable RAM'
              },
              {
                label: 'Memory Slots',
                value: memSlots != null && memSlots > 0 ? memSlots : 'N/A'
              },
              { label: 'Serial Number', value: baseboard.serial, mono: true, copyable: true, span: 2 }
            ]}
          />
        </Section>
      )}

      {hasChassis && (
        <Section icon={<BoxPlotOutlined />} title="CHASSIS" color="#a78bfa">
          <SpecGrid
            columns={2}
            items={[
              {
                label: 'Type',
                value: chassis.type ? (
                  <span>
                    <CloudServerOutlined style={{ marginRight: 6, color: '#a78bfa' }} />
                    {chassis.type}
                  </span>
                ) : (
                  undefined
                )
              },
              { label: 'Manufacturer', value: chassis.manufacturer },
              { label: 'Model', value: chassis.model },
              { label: 'Version', value: chassis.version },
              { label: 'SKU', value: chassis.sku, mono: true },
              { label: 'Asset Tag', value: chassis.assetTag, mono: true },
              { label: 'Serial Number', value: chassis.serial, mono: true, copyable: true, span: 2 }
            ]}
          />
        </Section>
      )}

      {hasBios && (
        <Section
          icon={<ToolOutlined />}
          title="BIOS / UEFI FIRMWARE"
          color="#fbbf24"
          extra={biosFeatures.length > 0 ? `${biosFeatures.length} features` : undefined}
        >
          <SpecGrid
            columns={3}
            items={[
              { label: 'Vendor', value: bios.vendor },
              { label: 'Version', value: bios.version, mono: true },
              { label: 'Release Date', value: bios.releaseDate },
              { label: 'Revision', value: bios.revision, mono: true },
              { label: 'Language', value: bios.language },
              { label: 'Serial', value: bios.serial, mono: true, copyable: true }
            ]}
          />
          {biosFeatures.length > 0 && (
            <div style={{ marginTop: 16 }}>
              <div
                style={{
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                  opacity: 0.6,
                  marginBottom: 8
                }}
              >
                Firmware Features
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {biosFeatures.map((feature, i) => (
                  <Tag key={`${feature}-${i}`} color="gold" style={{ margin: 0 }}>
                    {feature}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}
    </div>
  );
}
