import { useMemo } from 'react';
import {
  DesktopOutlined,
  CloudServerOutlined,
  KeyOutlined,
  AppstoreOutlined,
  ApiOutlined,
  SafetyCertificateOutlined,
  BranchesOutlined,
  DeploymentUnitOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import type { StaticInfo } from '@shared/ipc';
import type { Systeminformation } from 'systeminformation';
import {
  PageHeader,
  Section,
  GlassCard,
  SpecGrid,
  HealthPill,
  EmptyHint,
} from '../ui/kit';
import { display } from '../../lib/format';

const ACCENT = '#5dd39e';

function hasAny(...values: unknown[]): boolean {
  return values.some((v) => v !== null && v !== undefined && v !== '' && v !== -1);
}

export default function OS({ siData }: { siData: StaticInfo | null }): React.JSX.Element {
  const osInfo = siData?.osInfo ?? ({} as Systeminformation.OsData);
  const uuid = siData?.uuid ?? ({} as Systeminformation.UuidData);
  const versions = siData?.versions ?? ({} as Systeminformation.VersionData);
  const macs = uuid.macs ?? [];

  const versionsList = useMemo(
    () =>
      Object.entries(versions)
        .filter(([, v]) => v !== null && v !== undefined && v !== '')
        .map(([name, version]) => ({ name, version: String(version) })),
    [versions],
  );

  const uefiStatus = osInfo.uefi === true ? 'good' : osInfo.uefi === false ? 'info' : 'idle';
  const uefiLabel =
    osInfo.uefi === true ? 'UEFI Boot' : osInfo.uefi === false ? 'Legacy BIOS' : 'Firmware Unknown';

  const hypervisorStatus =
    osInfo.hypervizor === true ? 'warn' : osInfo.hypervizor === false ? 'good' : 'idle';
  const hypervisorLabel =
    osInfo.hypervizor === true
      ? 'Hypervisor Present'
      : osInfo.hypervizor === false
        ? 'Bare Metal'
        : 'Hypervisor Unknown';

  const remoteStatus =
    osInfo.remoteSession === true ? 'info' : osInfo.remoteSession === false ? 'good' : 'idle';
  const remoteLabel =
    osInfo.remoteSession === true
      ? 'Remote Session'
      : osInfo.remoteSession === false
        ? 'Local Session'
        : 'Session Unknown';

  const hasHost = hasAny(osInfo.hostname, osInfo.fqdn, osInfo.serial, osInfo.codepage);
  const hasPlatform = hasAny(osInfo.platform, osInfo.codename, osInfo.servicepack);
  const hasIdentifiers = hasAny(uuid.os, uuid.hardware, osInfo.logofile) || macs.length > 0;

  return (
    <div className="section-container">
      <PageHeader
        icon={<DesktopOutlined />}
        title="Operating System"
        subtitle={
          <>
            {display(osInfo.distro)} {display(osInfo.release)}
          </>
        }
        color={ACCENT}
        extra={
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <HealthPill status={uefiStatus}>{uefiLabel}</HealthPill>
            <HealthPill status={hypervisorStatus}>{hypervisorLabel}</HealthPill>
            <HealthPill status={remoteStatus}>{remoteLabel}</HealthPill>
          </div>
        }
        stats={[
          { label: 'Architecture', value: display(osInfo.arch) },
          { label: 'Kernel', value: display(osInfo.kernel), color: ACCENT },
          { label: 'Build', value: display(osInfo.build) },
          { label: 'Tools Detected', value: versionsList.length, color: '#7cc4ff' },
        ]}
      />

      <Section icon={<CloudServerOutlined />} title="HOST IDENTITY" color={ACCENT}>
        {hasHost ? (
          <SpecGrid
            columns={2}
            items={[
              { label: 'Hostname', value: display(osInfo.hostname), mono: true, copyable: true },
              { label: 'FQDN', value: display(osInfo.fqdn), mono: true, copyable: true },
              {
                label: 'Serial Number',
                value: display(osInfo.serial),
                mono: true,
                copyable: true,
              },
              { label: 'Code Page', value: display(osInfo.codepage), mono: true },
            ]}
          />
        ) : (
          <EmptyHint
            icon={<CloudServerOutlined />}
            title="No host identity reported"
            description="This system did not expose a hostname, FQDN or serial number."
          />
        )}
      </Section>

      <Section icon={<DesktopOutlined />} title="PLATFORM DETAILS" color="#7cc4ff">
        {hasPlatform ? (
          <SpecGrid
            columns={3}
            items={[
              { label: 'Platform', value: display(osInfo.platform) },
              { label: 'Codename', value: display(osInfo.codename) },
              { label: 'Service Pack', value: display(osInfo.servicepack) },
            ]}
          />
        ) : (
          <EmptyHint
            icon={<DesktopOutlined />}
            title="No platform details"
            description="No platform, codename or service pack information was reported."
          />
        )}
      </Section>

      <Section icon={<AppstoreOutlined />} title="RUNTIME & TOOLS" color="#c9a6ff">
        {versionsList.length > 0 ? (
          <div className="ds-cards-auto">
            {versionsList.map((item) => (
              <GlassCard key={item.name}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                    {toolIcon(item.name)}
                    <span
                      style={{
                        fontWeight: 600,
                        color: '#e5eefb',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {item.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--mono, monospace)',
                      color: ACCENT,
                      fontWeight: 600,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.version}
                  </span>
                </div>
              </GlassCard>
            ))}
          </div>
        ) : (
          <EmptyHint
            icon={<AppstoreOutlined />}
            title="No tools detected"
            description="No runtime or developer tool versions were reported for this system."
          />
        )}
      </Section>

      <Section
        icon={<KeyOutlined />}
        title="IDENTIFIERS"
        color={ACCENT}
        extra={
          <HealthPill status={macs.length > 0 ? 'good' : 'idle'}>
            {macs.length} MAC {macs.length === 1 ? 'address' : 'addresses'}
          </HealthPill>
        }
      >
        {hasIdentifiers ? (
          <SpecGrid
            columns={2}
            items={[
              { label: 'OS UUID', value: display(uuid.os), mono: true, copyable: true, span: 2 },
              {
                label: 'Hardware UUID',
                value: display(uuid.hardware),
                mono: true,
                copyable: true,
                span: 2,
              },
              ...macs.map((mac, i) => ({
                label: `MAC ${i + 1}`,
                value: display(mac),
                mono: true,
                copyable: true,
              })),
              { label: 'Logo File', value: display(osInfo.logofile), mono: true, span: 2 },
            ]}
          />
        ) : (
          <EmptyHint
            icon={<ApiOutlined />}
            title="No identifiers reported"
            description="No UUIDs or physical network adapter addresses were exposed by this system."
          />
        )}
      </Section>
    </div>
  );
}

function toolIcon(name: string): React.JSX.Element {
  const key = name.toLowerCase();
  const style = { color: ACCENT };
  if (key.includes('openssl')) return <SafetyCertificateOutlined style={style} />;
  if (key.includes('git')) return <BranchesOutlined style={style} />;
  if (key.includes('docker') || key.includes('virtualbox'))
    return <DeploymentUnitOutlined style={style} />;
  if (key.includes('nginx') || key.includes('php') || key.includes('node'))
    return <GlobalOutlined style={style} />;
  return <AppstoreOutlined style={style} />;
}
