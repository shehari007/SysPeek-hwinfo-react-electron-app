import React from 'react';
import { Card, Row, Col, Typography, Tag, Empty } from 'antd';
import { RadarChartOutlined, LinkOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Bluetooth = ({ siData }) => {
  const devices = siData?.bluetoothDevices || [];

  const getTypeColor = (type) => {
    if (type?.toLowerCase().includes('audio')) return 'blue';
    if (type?.toLowerCase().includes('keyboard')) return 'green';
    if (type?.toLowerCase().includes('mouse')) return 'purple';
    if (type?.toLowerCase().includes('phone')) return 'orange';
    return 'default';
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <RadarChartOutlined className="section-icon" style={{ color: '#3b82f6' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>Bluetooth Devices</Title>
          <Text type="secondary">{devices.length} device(s) found</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {devices.map((device, index) => (
          <Col xs={24} sm={12} lg={8} key={index}>
            <Card className="info-card device-card" bordered={false}>
              <div className="device-header">
                <LinkOutlined style={{ color: '#3b82f6', fontSize: '24px' }} />
                <div className="device-info">
                  <Text strong style={{ color: '#f1f5f9' }}>
                    {device.name || 'Unknown Device'}
                  </Text>
                  <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                    {device.manufacturer || device.macDevice || 'Unknown'}
                  </Text>
                </div>
              </div>

              <div className="device-details">
                {device.type && <Tag color={getTypeColor(device.type)}>{device.type}</Tag>}
                {device.connected && <Tag color="success">Connected</Tag>}
                {!device.connected && <Tag color="default">Paired</Tag>}
              </div>

              {device.macDevice && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>MAC: {device.macDevice}</Text>
                </div>
              )}

              {device.batteryPercent !== undefined && (
                <div style={{ marginTop: 8 }}>
                  <Tag color="blue">Battery: {device.batteryPercent}%</Tag>
                </div>
              )}
            </Card>
          </Col>
        ))}

        {devices.length === 0 && (
          <Col xs={24}>
            <Card className="info-card" bordered={false}>
              <Empty description="No Bluetooth devices detected" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Bluetooth;
