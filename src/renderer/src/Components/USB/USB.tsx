import {
  UsbOutlined,
  BranchesOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  SafetyCertificateOutlined,
  DatabaseOutlined,
  IdcardOutlined
} from '@ant-design/icons';
import type { StaticInfo } from '@shared/ipc';
import type { Systeminformation } from 'systeminformation';
import { PageHeader, Section, GlassCard, SpecGrid, StatTile, HealthPill, EmptyHint } from '../ui/kit';
import type { SpecItem } from '../ui/kit';
import { display } from '../../lib/format';

const ACCENT = '#5dd39e';

function isHub(type: string | undefined): boolean {
  return !!type && type.toLowerCase().includes('hub');
}

function isStorage(type: string | undefined): boolean {
  const t = type?.toLowerCase() ?? '';
  return t.includes('storage') || t.includes('disk') || t.includes('mass');
}

function isInput(type: string | undefined): boolean {
  const t = type?.toLowerCase() ?? '';
  return t.includes('hid') || t.includes('input') || t.includes('keyboard') || t.includes('mouse');
}

function deviceColor(type: string | undefined): string {
  if (isHub(type)) return '#a78bfa';
  if (isStorage(type)) return '#7cc4ff';
  if (isInput(type)) return '#5dd39e';
  return ACCENT;
}

function DeviceIcon({ type }: { type: string | undefined }): React.JSX.Element {
  if (isHub(type)) return <BranchesOutlined />;
  if (isStorage(type)) return <DatabaseOutlined />;
  if (isInput(type)) return <ApiOutlined />;
  return <UsbOutlined />;
}

export default function USB({ siData }: { siData: StaticInfo | null }): React.JSX.Element {
  const usbDevices: Systeminformation.UsbData[] = siData?.usb ?? [];

  const total = usbDevices.length;
  const hubCount = usbDevices.filter((d) => isHub(d.type)).length;
  const storageCount = usbDevices.filter((d) => isStorage(d.type)).length;
  const removableCount = usbDevices.filter((d) => d.removable).length;
  const deviceCount = total - hubCount;

  // Unique vendors/manufacturers surfaced
  const vendorSet = new Set(
    usbDevices
      .map((d) => (d.vendor || d.manufacturer || '').trim())
      .filter((v) => v.length > 0)
  );

  if (total === 0) {
    return (
      <div className="section-container">
        <PageHeader
          icon={<UsbOutlined />}
          title="USB Devices"
          subtitle="Peripherals and controllers on the USB bus"
          color={ACCENT}
          stats={[
            { label: 'Devices', value: '0' },
            { label: 'Hubs', value: '0' },
            { label: 'Removable', value: '0' }
          ]}
        />
        <Section icon={<UsbOutlined />} title="CONNECTED DEVICES" color={ACCENT}>
          <EmptyHint
            icon={<UsbOutlined />}
            title="No USB devices detected"
            description="No devices are currently reported on the USB bus."
          />
        </Section>
      </div>
    );
  }

  return (
    <div className="section-container">
      <PageHeader
        icon={<UsbOutlined />}
        title="USB Devices"
        subtitle={`${deviceCount} device(s) across ${hubCount} hub(s) on the USB bus`}
        color={ACCENT}
        stats={[
          { label: 'Total Endpoints', value: String(total), color: ACCENT },
          { label: 'Devices', value: String(deviceCount), color: '#5dd39e' },
          { label: 'Hubs', value: String(hubCount), color: '#a78bfa' },
          { label: 'Removable', value: String(removableCount), color: '#fbbf24' }
        ]}
      />

      <Section icon={<ThunderboltOutlined />} title="OVERVIEW" color={ACCENT}>
        <div className="ds-cards-auto">
          <StatTile
            icon={<UsbOutlined />}
            label="Total Endpoints"
            value={total}
            sub="on USB bus"
            color={ACCENT}
          />
          <StatTile
            icon={<ApiOutlined />}
            label="Devices"
            value={deviceCount}
            sub="non-hub endpoints"
            color="#5dd39e"
          />
          <StatTile
            icon={<BranchesOutlined />}
            label="Hubs"
            value={hubCount}
            sub="controllers / hubs"
            color="#a78bfa"
          />
          <StatTile
            icon={<DatabaseOutlined />}
            label="Storage"
            value={storageCount}
            sub="mass-storage class"
            color="#7cc4ff"
          />
          <StatTile
            icon={<SafetyCertificateOutlined />}
            label="Removable"
            value={removableCount}
            sub="hot-pluggable"
            color="#fbbf24"
          />
          <StatTile
            icon={<IdcardOutlined />}
            label="Vendors"
            value={vendorSet.size}
            sub="unique makers"
            color="#f472b6"
          />
        </div>
      </Section>

      <Section icon={<UsbOutlined />} title={`CONNECTED DEVICES (${total})`} color={ACCENT}>
        <div className="ds-cards-2">
          {usbDevices.map((device: Systeminformation.UsbData, index: number) => {
            const color = deviceColor(device.type);
            const items: SpecItem[] = [
              { label: 'Name', value: display(device.name), span: 2 },
              { label: 'Type', value: display(device.type), color },
              {
                label: 'Removable',
                value: (
                  <HealthPill status={device.removable ? 'warn' : 'idle'}>
                    {device.removable ? 'Removable' : 'Fixed'}
                  </HealthPill>
                )
              },
              { label: 'Vendor', value: display(device.vendor) },
              { label: 'Manufacturer', value: display(device.manufacturer) },
              { label: 'Bus', value: display(device.bus), mono: true },
              { label: 'Max Power', value: display(device.maxPower) },
              { label: 'ID', value: display(device.id), mono: true, copyable: true },
              { label: 'Device ID', value: display(device.deviceId), mono: true, copyable: true },
              {
                label: 'Serial Number',
                value: display(device.serialNumber),
                mono: true,
                copyable: true,
                span: 2
              }
            ];

            return (
              <GlassCard key={`${device.id}-${index}`} className="ds-glow" glow={color}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 14
                  }}
                >
                  <span style={{ fontSize: 22, color, display: 'inline-flex' }}>
                    <DeviceIcon type={device.type} />
                  </span>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div
                      style={{
                        color: 'var(--ds-ink)',
                        fontWeight: 600,
                        fontSize: 14,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {device.name || 'Unknown Device'}
                    </div>
                    <div
                      style={{
                        color: 'var(--ds-ink-3)',
                        fontSize: 12,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                    >
                      {device.vendor || device.manufacturer || 'Unknown Vendor'}
                    </div>
                  </div>
                  <HealthPill status={isHub(device.type) ? 'info' : 'good'}>
                    {isHub(device.type) ? 'Hub' : 'Device'}
                  </HealthPill>
                </div>
                <SpecGrid columns={2} items={items} />
              </GlassCard>
            );
          })}
        </div>
      </Section>
    </div>
  );
}
