import React, { useMemo } from 'react';
import { Card, Row, Col, Typography, Tag, Statistic, Divider } from 'antd';
import { WifiOutlined, GlobalOutlined, ApiOutlined, SwapOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const NetworkInterfaces = ({ siData }) => {
  const formatSpeed = (speed) => {
    if (!speed) return 'N/A';
    if (speed >= 1000) return `${(speed / 1000).toFixed(1)} Gbps`;
    return `${speed} Mbps`;
  };

  const interfaces = siData?.networkInterfaces || [];
  const defaultIface = siData?.networkInterfaceDefault || 'N/A';
  const defaultGateway = siData?.networkGatewayDefault || 'N/A';

  const activeInterfaces = useMemo(() => 
    interfaces.filter(i => i.operstate === 'up' || i.ip4)
  , [interfaces]);

  const getTypeIcon = (type) => {
    if (type?.toLowerCase().includes('wireless') || type?.toLowerCase().includes('wifi')) 
      return <WifiOutlined style={{ color: '#3b82f6' }} />;
    return <ApiOutlined style={{ color: '#10b981' }} />;
  };

  const getStateColor = (state) => {
    if (state === 'up') return 'success';
    if (state === 'down') return 'error';
    return 'default';
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <GlobalOutlined className="section-icon" style={{ color: '#3b82f6' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>Network Interfaces</Title>
          <Text type="secondary">{interfaces.length} interface(s) • {activeInterfaces.length} active</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Default Network Info */}
        <Col xs={24}>
          <Card className="info-card" bordered={false}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Default Interface" 
                  value={defaultIface}
                  prefix={<SwapOutlined style={{ color: '#3b82f6' }} />}
                  valueStyle={{ color: '#3b82f6', fontSize: '16px' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Default Gateway" 
                  value={defaultGateway}
                  prefix={<GlobalOutlined style={{ color: '#10b981' }} />}
                  valueStyle={{ color: '#10b981', fontSize: '16px' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <div className="interface-stats">
                  <Tag color="blue">{interfaces.length} Total</Tag>
                  <Tag color="green">{activeInterfaces.length} Active</Tag>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Interface Cards */}
        {interfaces.map((iface, index) => (
          <Col xs={24} lg={12} key={index}>
            <Card className="info-card interface-card" bordered={false}>
              <div className="interface-header">
                <div className="interface-title">
                  {getTypeIcon(iface.type)}
                  <div>
                    <Text strong style={{ color: '#f1f5f9', fontSize: '16px' }}>
                      {iface.iface || iface.ifaceName}
                    </Text>
                    <Text type="secondary" style={{ display: 'block' }}>{iface.type || 'Unknown Type'}</Text>
                  </div>
                </div>
                <Tag color={getStateColor(iface.operstate)}>
                  {iface.operstate?.toUpperCase() || 'UNKNOWN'}
                </Tag>
              </div>

              <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />

              <div className="interface-details">
                <Row gutter={[12, 8]}>
                  <Col xs={24}>
                    <Text type="secondary">IPv4 Address</Text>
                    <Text strong style={{ display: 'block', color: '#10b981' }}>
                      {iface.ip4 || 'Not assigned'}
                    </Text>
                  </Col>
                  <Col xs={24}>
                    <Text type="secondary">IPv6 Address</Text>
                    <Text style={{ display: 'block', fontSize: '12px' }}>
                      {iface.ip6 || 'Not assigned'}
                    </Text>
                  </Col>
                  <Col xs={12}>
                    <Text type="secondary">MAC Address</Text>
                    <Text copyable style={{ display: 'block', fontSize: '12px' }}>
                      {iface.mac || 'N/A'}
                    </Text>
                  </Col>
                  <Col xs={12}>
                    <Text type="secondary">Speed</Text>
                    <Text style={{ display: 'block' }}>{formatSpeed(iface.speed)}</Text>
                  </Col>
                </Row>
              </div>

              {(iface.dhcp || iface.virtual !== undefined) && (
                <div style={{ marginTop: 12 }}>
                  {iface.dhcp && <Tag color="blue">DHCP</Tag>}
                  {iface.virtual && <Tag color="purple">Virtual</Tag>}
                  {iface.internal && <Tag color="orange">Internal</Tag>}
                </div>
              )}
            </Card>
          </Col>
        ))}

        {interfaces.length === 0 && (
          <Col xs={24}>
            <Card className="info-card" bordered={false}>
              <Text type="secondary">No network interfaces detected</Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default NetworkInterfaces;
