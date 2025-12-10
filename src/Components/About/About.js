import React from 'react';
import { Card, Typography, Space, Divider, Tag, Row, Col, Button } from 'antd';
import {
  GithubOutlined,
  HeartFilled,
  InfoCircleOutlined,
  CodeOutlined,
  DesktopOutlined,
  GlobalOutlined,
  MailOutlined
} from '@ant-design/icons';

const { ipcRenderer } = window.require('electron');

const { Title, Text, Paragraph, Link } = Typography;

// Helper to open links in system browser
const openExternal = (url) => {
  ipcRenderer.send('open-external-link', url);
};

const About = ({ version, arch }) => {
  const dependencies = [
    { name: 'Electron', version: '26.2.1', color: '#47848F' },
    { name: 'React', version: '18.2.0', color: '#61DAFB' },
    { name: 'Ant Design', version: '5.9.2', color: '#1677FF' },
    { name: 'systeminformation', version: '5.27.13', color: '#10B981' },
    { name: 'Chart.js', version: '4.4.0', color: '#FF6384' },
    { name: 'Recharts', version: '2.8.0', color: '#8884D8' }
  ];

  const features = [
    'Real-time CPU, Memory & Disk monitoring',
    'Process manager with resource tracking',
    'Network interface statistics',
    'GPU & Display information',
    'Battery health monitoring',
    'USB, Bluetooth & Audio device info',
    'WiFi networks scanner',
    'Cross-platform support'
  ];

  return (
    <div className="about-container" style={{ padding: '0 4px' }}>
      <Row gutter={[16, 16]}>
        {/* Main About Card */}
        <Col xs={24} lg={12}>
          <Card className="glass-card">
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
              <Title level={2} style={{ margin: 0, color: '#e2e8f0' }}>
                SysPeek
              </Title>
              <Space size={8} style={{ marginTop: 8 }}>
                <Tag color="blue">v{version}</Tag>
                <Tag color="purple">{arch}</Tag>
              </Space>
              <Paragraph style={{ color: 'rgba(226, 232, 240, 0.7)', marginTop: 16 }}>
                A modern, cross-platform system information and monitoring application 
                built with Electron and React.
              </Paragraph>
            </div>

            <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <InfoCircleOutlined style={{ color: '#3b82f6', fontSize: 18 }} />
                <div>
                  <Text strong style={{ color: '#e2e8f0' }}>Version</Text>
                  <br />
                  <Text style={{ color: 'rgba(226, 232, 240, 0.7)' }}>{version}</Text>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <DesktopOutlined style={{ color: '#10b981', fontSize: 18 }} />
                <div>
                  <Text strong style={{ color: '#e2e8f0' }}>Architecture</Text>
                  <br />
                  <Text style={{ color: 'rgba(226, 232, 240, 0.7)' }}>{arch}</Text>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CodeOutlined style={{ color: '#f59e0b', fontSize: 18 }} />
                <div>
                  <Text strong style={{ color: '#e2e8f0' }}>Platform</Text>
                  <br />
                  <Text style={{ color: 'rgba(226, 232, 240, 0.7)' }}>
                    {process.platform === 'darwin' ? 'macOS' : 
                     process.platform === 'win32' ? 'Windows' : 
                     process.platform === 'linux' ? 'Linux' : process.platform}
                  </Text>
                </div>
              </div>
            </Space>

            <Divider style={{ borderColor: 'rgba(255, 255, 255, 0.08)' }} />

            <Space wrap>
              <Button 
                type="primary" 
                icon={<GithubOutlined />}
                onClick={() => openExternal('https://github.com/shehari007/SysPeek-hwinfo-react-electron-app')}
              >
                GitHub
              </Button>
              <Button 
                icon={<GlobalOutlined />}
                onClick={() => openExternal('https://github.com/shehari007')}
                style={{ borderColor: 'rgba(255, 255, 255, 0.15)', color: '#e2e8f0' }}
              >
                Profile
              </Button>
            </Space>
          </Card>
        </Col>

        {/* Features Card */}
        <Col xs={24} lg={12}>
          <Card className="glass-card" title={
            <span style={{ color: '#e2e8f0' }}>
              <HeartFilled style={{ color: '#ef4444', marginRight: 8 }} />
              Features
            </span>
          }>
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
                  <Text style={{ color: 'rgba(226, 232, 240, 0.85)' }}>{feature}</Text>
                </div>
              ))}
            </Space>
          </Card>
        </Col>

        {/* Technologies Card */}
        <Col xs={24}>
          <Card className="glass-card" title={
            <span style={{ color: '#e2e8f0' }}>
              <CodeOutlined style={{ color: '#3b82f6', marginRight: 8 }} />
              Built With
            </span>
          }>
            <Row gutter={[12, 12]}>
              {dependencies.map((dep, index) => (
                <Col xs={12} sm={8} md={6} lg={4} key={index}>
                  <div style={{
                    padding: '16px 12px',
                    background: 'rgba(15, 23, 42, 0.6)',
                    borderRadius: 12,
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    textAlign: 'center',
                    transition: 'all 0.3s ease'
                  }}>
                    <Text strong style={{ color: dep.color, display: 'block' }}>
                      {dep.name}
                    </Text>
                    <Text style={{ color: 'rgba(226, 232, 240, 0.5)', fontSize: 12 }}>
                      v{dep.version}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Credits Card */}
        <Col xs={24}>
          <Card className="glass-card">
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ color: '#e2e8f0', marginBottom: 8 }}>
                Created with <HeartFilled style={{ color: '#ef4444' }} /> by
              </Title>
              <Title 
                level={3} 
                style={{ color: '#3b82f6', margin: 0, cursor: 'pointer' }}
                onClick={() => openExternal('https://github.com/shehari007')}
              >
                Muhammad Sheharyar Butt
              </Title>
              <Paragraph style={{ color: 'rgba(226, 232, 240, 0.6)', marginTop: 16, marginBottom: 0 }}>
                © {new Date().getFullYear()} SysPeek. All rights reserved.
              </Paragraph>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default About;
