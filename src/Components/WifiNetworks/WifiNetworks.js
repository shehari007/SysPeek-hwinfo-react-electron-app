import React, { useMemo } from 'react';
import { Card, Row, Col, Typography, Tag, Progress, Empty, Alert } from 'antd';
import { WifiOutlined, LockOutlined, GlobalOutlined, InfoCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const WifiNetworks = ({ siData }) => {
  const networks = siData?.wifiNetworks || [];

  const sortedNetworks = useMemo(() => 
    [...networks].sort((a, b) => (b.quality || 0) - (a.quality || 0))
  , [networks]);

  // Check if any network has redacted SSID (macOS privacy feature)
  const hasRedactedSSIDs = useMemo(() => 
    networks.some(n => n.ssid === '<redacted>' || n.ssid === '<hidden>')
  , [networks]);

  const getSignalColor = (quality) => {
    if (quality >= 70) return '#10b981';
    if (quality >= 40) return '#f59e0b';
    return '#ef4444';
  };

  const getSecurityColor = (security) => {
    if (!security || security === 'Open' || security === '') return 'warning';
    if (security.includes('WPA3')) return 'success';
    if (security.includes('WPA2')) return 'blue';
    if (security.includes('WPA')) return 'cyan';
    if (security.includes('WEP')) return 'orange';
    return 'default';
  };

  const getFrequencyBand = (frequency) => {
    if (!frequency) return null;
    if (frequency >= 5000) return '5 GHz';
    if (frequency >= 2400) return '2.4 GHz';
    return `${frequency} MHz`;
  };

  // Get display name for network (handle macOS redaction)
  const getNetworkDisplayName = (network) => {
    const ssid = network.ssid;
    if (!ssid || ssid === '') return 'Hidden Network';
    if (ssid === '<redacted>' || ssid === '<hidden>') {
      // On macOS, SSIDs are redacted for privacy - show BSSID instead
      return network.bssid ? `Network (${network.bssid.substring(0, 8)}...)` : 'Private Network';
    }
    return ssid;
  };

  // Check if SSID is redacted
  const isRedacted = (network) => {
    return network.ssid === '<redacted>' || network.ssid === '<hidden>';
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <WifiOutlined className="section-icon" style={{ color: '#3b82f6' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>WiFi Networks</Title>
          <Text type="secondary">{networks.length} network(s) in range</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* macOS Privacy Notice */}
        {hasRedactedSSIDs && (
          <Col xs={24}>
            <Alert
              message="macOS WiFi Privacy"
              description="Network names are hidden by macOS for privacy. This is a system-level restriction. Networks are identified by their BSSID (hardware address) instead."
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
              style={{ 
                background: 'rgba(59, 130, 246, 0.1)', 
                border: '1px solid rgba(59, 130, 246, 0.3)',
                borderRadius: '8px'
              }}
            />
          </Col>
        )}

        {/* Summary */}
        {networks.length > 0 && (
          <Col xs={24}>
            <Card className="info-card" bordered={false}>
              <Row gutter={[16, 8]}>
                <Col>
                  <Tag color="blue">
                    <WifiOutlined /> {networks.length} Networks Found
                  </Tag>
                </Col>
                <Col>
                  <Tag color="green">
                    {networks.filter(n => n.quality >= 70).length} Strong Signal
                  </Tag>
                </Col>
                <Col>
                  <Tag color="purple">
                    {networks.filter(n => n.frequency >= 5000).length} 5GHz Networks
                  </Tag>
                </Col>
                <Col>
                  <Tag color="orange">
                    {networks.filter(n => n.security && n.security.length > 0).length} Secured
                  </Tag>
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {/* Network List */}
        {sortedNetworks.map((network, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card className="info-card wifi-card" bordered={false}>
              <div className="wifi-header">
                <div className="wifi-signal">
                  <WifiOutlined style={{ 
                    color: getSignalColor(network.quality), 
                    fontSize: '24px' 
                  }} />
                </div>
                <div className="wifi-info">
                  <Text strong style={{ color: '#f1f5f9' }}>
                    {getNetworkDisplayName(network)}
                  </Text>
                  {isRedacted(network) && (
                    <Tag color="default" style={{ marginLeft: 8 }}>macOS Private</Tag>
                  )}
                  {!network.ssid && (
                    <Tag color="default" style={{ marginLeft: 8 }}>Hidden SSID</Tag>
                  )}
                </div>
              </div>

              <div className="wifi-quality">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text type="secondary">Signal Quality</Text>
                  <Text style={{ color: getSignalColor(network.quality) }}>
                    {network.quality || 0}%
                  </Text>
                </div>
                <Progress 
                  percent={network.quality || 0}
                  showInfo={false}
                  strokeColor={getSignalColor(network.quality)}
                  trailColor="rgba(255,255,255,0.1)"
                  size="small"
                />
              </div>

              <div className="wifi-details">
                <Row gutter={[8, 8]}>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>Channel</Text>
                    <Text style={{ display: 'block' }}>{network.channel || 'N/A'}</Text>
                  </Col>
                  <Col span={12}>
                    <Text type="secondary" style={{ fontSize: '11px' }}>Frequency</Text>
                    <Text style={{ display: 'block' }}>
                      {getFrequencyBand(network.frequency) || 'N/A'}
                    </Text>
                  </Col>
                </Row>
              </div>

              <div className="wifi-tags" style={{ marginTop: 8 }}>
                {network.security && network.security.length > 0 && (
                  <Tag 
                    color={getSecurityColor(Array.isArray(network.security) ? network.security[0] : network.security)} 
                    icon={<LockOutlined />}
                  >
                    {Array.isArray(network.security) ? network.security.join(', ') : network.security || 'Open'}
                  </Tag>
                )}
                {network.frequency >= 5000 && <Tag color="purple">5GHz</Tag>}
                {network.frequency < 5000 && network.frequency > 0 && <Tag color="cyan">2.4GHz</Tag>}
              </div>

              {network.bssid && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: '10px' }}>BSSID: {network.bssid}</Text>
                </div>
              )}
            </Card>
          </Col>
        ))}

        {networks.length === 0 && (
          <Col xs={24}>
            <Card className="info-card" bordered={false}>
              <Empty 
                description="No WiFi networks detected. WiFi may be disabled or no networks are in range." 
                image={Empty.PRESENTED_IMAGE_SIMPLE} 
              />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default WifiNetworks;
