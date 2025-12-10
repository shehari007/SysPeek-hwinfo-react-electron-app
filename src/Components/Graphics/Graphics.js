import React, { useMemo } from 'react';
import { Card, Row, Col, Typography, Tag, Progress, Statistic } from 'antd';
import { DesktopOutlined, ThunderboltOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Graphics = ({ siData }) => {
  const formatBytes = (bytes) => {
    if (!bytes) return 'N/A';
    if (bytes < 1024) return `${bytes} MB`;
    return `${(bytes / 1024).toFixed(1)} GB`;
  };

  const controllers = siData?.graphics?.controllers || [];

  const totalVRAM = useMemo(() => 
    controllers.reduce((acc, c) => acc + (c.vram || 0), 0)
  , [controllers]);

  const getVendorColor = (vendor) => {
    if (vendor?.toLowerCase().includes('nvidia')) return '#76b900';
    if (vendor?.toLowerCase().includes('amd') || vendor?.toLowerCase().includes('ati')) return '#ed1c24';
    if (vendor?.toLowerCase().includes('intel')) return '#0071c5';
    if (vendor?.toLowerCase().includes('apple')) return '#555555';
    return '#8b5cf6';
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <DesktopOutlined className="section-icon" style={{ color: '#ef4444' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>Graphics Controllers</Title>
          <Text type="secondary">{controllers.length} GPU(s) • {formatBytes(totalVRAM)} total VRAM</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Overview */}
        <Col xs={24}>
          <Card className="info-card" bordered={false}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Total GPUs" 
                  value={controllers.length}
                  prefix={<ThunderboltOutlined style={{ color: '#ef4444' }} />}
                  valueStyle={{ color: '#ef4444' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Total VRAM" 
                  value={formatBytes(totalVRAM)}
                  valueStyle={{ color: '#10b981' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <div className="gpu-vendors">
                  {[...new Set(controllers.map(c => c.vendor))].map((v, i) => (
                    <Tag key={i} color={getVendorColor(v)}>{v}</Tag>
                  ))}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* GPU Cards */}
        {controllers.map((gpu, index) => (
          <Col xs={24} lg={controllers.length === 1 ? 24 : 12} key={index}>
            <Card className="info-card gpu-card" bordered={false}>
              <div className="gpu-header">
                <div className="gpu-title">
                  <div 
                    className="gpu-icon" 
                    style={{ backgroundColor: getVendorColor(gpu.vendor) }}
                  >
                    <ThunderboltOutlined />
                  </div>
                  <div>
                    <Text strong style={{ color: '#f1f5f9', fontSize: '16px' }}>
                      {gpu.model || 'Unknown GPU'}
                    </Text>
                    <Text type="secondary" style={{ display: 'block' }}>{gpu.vendor}</Text>
                  </div>
                </div>
                {gpu.vram > 0 && (
                  <Tag color="blue">{formatBytes(gpu.vram)} VRAM</Tag>
                )}
              </div>

              <div className="gpu-specs">
                <Row gutter={[12, 12]}>
                  <Col xs={12}>
                    <div className="spec-item">
                      <Text type="secondary">Bus</Text>
                      <Text>{gpu.bus || 'N/A'}</Text>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="spec-item">
                      <Text type="secondary">VRAM Type</Text>
                      <Text>{gpu.vramDynamic ? 'Dynamic' : 'Dedicated'}</Text>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="spec-item">
                      <Text type="secondary">Sub Device</Text>
                      <Text>{gpu.subDeviceId || 'N/A'}</Text>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="spec-item">
                      <Text type="secondary">Driver Version</Text>
                      <Text>{gpu.driverVersion || 'N/A'}</Text>
                    </div>
                  </Col>
                </Row>
              </div>

              {gpu.temperatureGpu && (
                <div className="gpu-temp" style={{ marginTop: 12 }}>
                  <Text type="secondary">Temperature</Text>
                  <Progress 
                    percent={Math.min(gpu.temperatureGpu, 100)}
                    strokeColor={{
                      '0%': '#10b981',
                      '50%': '#f59e0b',
                      '100%': '#ef4444',
                    }}
                    format={() => `${gpu.temperatureGpu}°C`}
                    trailColor="rgba(255,255,255,0.1)"
                  />
                </div>
              )}

              {(gpu.deviceId || gpu.external) && (
                <div style={{ marginTop: 12 }}>
                  {gpu.deviceId && <Text type="secondary" style={{ fontSize: '11px' }}>Device ID: {gpu.deviceId}</Text>}
                  {gpu.external && <Tag color="purple" style={{ marginLeft: 8 }}>External</Tag>}
                </div>
              )}
            </Card>
          </Col>
        ))}

        {controllers.length === 0 && (
          <Col xs={24}>
            <Card className="info-card" bordered={false}>
              <Text type="secondary">No graphics controllers detected</Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Graphics;
