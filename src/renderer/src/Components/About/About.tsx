import { Card, Typography, Space, Divider, Tag, Row, Col, Button } from 'antd'
import {
  GithubOutlined,
  HeartFilled,
  InfoCircleOutlined,
  CodeOutlined,
  DesktopOutlined,
  GlobalOutlined,
  CloudSyncOutlined
} from '@ant-design/icons'
import type { SystemMeta } from '@shared/ipc'
import { sysapi, updater } from '../../lib/api'

const { Title, Text, Paragraph } = Typography

const REPO = 'https://github.com/shehari007/SysPeek-hwinfo-react-electron-app'

const dependencies = [
  { name: 'Electron', version: '43', color: '#47848F' },
  { name: 'React', version: '19', color: '#61DAFB' },
  { name: 'Ant Design', version: '6', color: '#1677FF' },
  { name: 'electron-vite', version: '5', color: '#747BFF' },
  { name: 'systeminformation', version: '5', color: '#10B981' },
  { name: 'TypeScript', version: '6', color: '#3178C6' },
  { name: 'uPlot', version: '1.6', color: '#F59E0B' }
]

const features = [
  'Real-time CPU, memory, disk and network monitoring',
  'Live history charts and per-core load',
  'Process manager with search and sorting',
  'GPU, display and battery health',
  'USB, Bluetooth, audio and printer inventory',
  'WiFi network scanner',
  'System tray with live stats and threshold alerts',
  'Automatic updates from GitHub releases',
  'Sandboxed, context-isolated architecture'
]

function platformName(platform?: string): string {
  if (platform === 'darwin') return 'macOS'
  if (platform === 'win32') return 'Windows'
  if (platform === 'linux') return 'Linux'
  return platform ?? 'Unknown'
}

export default function About({ meta }: { meta: SystemMeta | null }): React.JSX.Element {
  const openExternal = (url: string): void => {
    sysapi.openExternal(url)
  }

  return (
    <div className="about-container" style={{ padding: '0 4px' }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card className="glass-card" variant="borderless">
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <img
                src="logo192.png"
                alt="SysPeek"
                style={{
                  width: 80,
                  height: 80,
                  marginBottom: 16,
                  filter: 'drop-shadow(0 4px 12px rgba(59, 130, 246, 0.3))'
                }}
              />
              <Title level={2} style={{ margin: 0, color: 'var(--ds-ink)' }}>
                SysPeek
              </Title>
              <Space size={8} style={{ marginTop: 8 }}>
                <Tag color="blue">v{meta?.appVersion ?? '2.0.0'}</Tag>
                <Tag color="purple">{meta?.arch ?? ''}</Tag>
                {meta?.isElevated && <Tag color="green">Elevated</Tag>}
              </Space>
              <Paragraph style={{ color: 'var(--ds-ink-2)', marginTop: 16 }}>
                A modern, secure, cross platform system information and monitoring app built with
                Electron, React and electron-vite.
              </Paragraph>
            </div>

            <Divider style={{ borderColor: 'var(--ds-line)' }} />

            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <MetaLine
                icon={<InfoCircleOutlined style={{ color: '#3b82f6', fontSize: 18 }} />}
                label="Version"
                value={meta?.appVersion ?? '2.0.0'}
              />
              <MetaLine
                icon={<DesktopOutlined style={{ color: '#10b981', fontSize: 18 }} />}
                label="Platform"
                value={`${platformName(meta?.platform)} (${meta?.arch ?? ''})`}
              />
              <MetaLine
                icon={<CodeOutlined style={{ color: '#f59e0b', fontSize: 18 }} />}
                label="Runtime"
                value={`Electron ${meta?.electronVersion ?? ''} • Node ${meta?.nodeVersion ?? ''} • Chromium ${meta?.chromeVersion ?? ''}`}
              />
            </Space>

            <Divider style={{ borderColor: 'var(--ds-line)' }} />

            <Space wrap>
              <Button type="primary" icon={<GithubOutlined />} onClick={() => openExternal(REPO)}>
                GitHub
              </Button>
              <Button
                icon={<GlobalOutlined />}
                onClick={() => openExternal('https://github.com/shehari007')}
                style={{ borderColor: 'var(--ds-line-strong)', color: 'var(--ds-ink)' }}
              >
                Profile
              </Button>
              <Button icon={<CloudSyncOutlined />} onClick={() => updater.check()}>
                Check for updates
              </Button>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            className="glass-card"
            variant="borderless"
            title={
              <span style={{ color: 'var(--ds-ink)' }}>
                <HeartFilled style={{ color: '#ef4444', marginRight: 8 }} />
                Features
              </span>
            }
          >
            <Space direction="vertical" size={8} style={{ width: '100%' }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 12px',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: 8,
                    border: '1px solid rgba(59, 130, 246, 0.2)'
                  }}
                >
                  <span style={{ color: '#3b82f6' }}>✓</span>
                  <Text style={{ color: 'var(--ds-ink)' }}>{feature}</Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        <Col xs={24}>
          <Card
            className="glass-card"
            variant="borderless"
            title={
              <span style={{ color: 'var(--ds-ink)' }}>
                <CodeOutlined style={{ color: '#3b82f6', marginRight: 8 }} />
                Built With
              </span>
            }
          >
            <Row gutter={[12, 12]}>
              {dependencies.map((dep, index) => (
                <Col xs={12} sm={8} md={6} lg={4} key={index}>
                  <div
                    style={{
                      padding: '16px 12px',
                      background: 'var(--ds-surface-2)',
                      borderRadius: 12,
                      border: '1px solid var(--ds-line)',
                      textAlign: 'center'
                    }}
                  >
                    <Text strong style={{ color: dep.color, display: 'block' }}>
                      {dep.name}
                    </Text>
                    <Text style={{ color: 'var(--ds-ink-3)', fontSize: 12 }}>
                      v{dep.version}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        <Col xs={24}>
          <Card className="glass-card" variant="borderless">
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ color: 'var(--ds-ink)', marginBottom: 8 }}>
                Created with <HeartFilled style={{ color: '#ef4444' }} /> by
              </Title>
              <Title
                level={3}
                style={{ color: '#3b82f6', margin: 0, cursor: 'pointer' }}
                onClick={() => openExternal('https://github.com/shehari007')}
              >
                Muhammad Sheharyar Butt
              </Title>
              <Paragraph style={{ color: 'var(--ds-ink-3)', marginTop: 16, marginBottom: 0 }}>
                © {new Date().getFullYear()} SysPeek. Released under the MIT License.
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

function MetaLine({
  icon,
  label,
  value
}: {
  icon: React.ReactNode
  label: string
  value: string
}): React.JSX.Element {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      {icon}
      <div>
        <Text strong style={{ color: 'var(--ds-ink)' }}>
          {label}
        </Text>
        <br />
        <Text style={{ color: 'var(--ds-ink-2)' }}>{value}</Text>
      </div>
    </div>
  )
}
