import React from 'react';
import { Card, Row, Col, Typography, Tag, Empty } from 'antd';
import { SoundOutlined, AudioOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Audio = ({ siData }) => {
  const audioDevices = siData?.audio || [];

  const getTypeColor = (type) => {
    if (type?.toLowerCase().includes('input')) return 'blue';
    if (type?.toLowerCase().includes('output')) return 'green';
    return 'default';
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <SoundOutlined className="section-icon" style={{ color: '#f59e0b' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>Audio Devices</Title>
          <Text type="secondary">{audioDevices.length} device(s) detected</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {audioDevices.map((device, index) => (
          <Col xs={24} md={12} lg={8} key={index}>
            <Card className="info-card device-card" bordered={false}>
              <div className="device-header">
                <AudioOutlined style={{ color: '#f59e0b', fontSize: '24px' }} />
                <div className="device-info">
                  <Text strong style={{ color: '#f1f5f9' }}>
                    {device.name || 'Unknown Device'}
                  </Text>
                  <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                    {device.manufacturer || 'Unknown Manufacturer'}
                  </Text>
                </div>
              </div>
              
              <div className="device-details">
                {device.type && <Tag color={getTypeColor(device.type)}>{device.type}</Tag>}
                {device.default && <Tag color="success">Default</Tag>}
                {device.status && (
                  <Tag color={device.status === 'online' ? 'success' : 'default'}>
                    {device.status}
                  </Tag>
                )}
              </div>

              {device.driver && (
                <div style={{ marginTop: 8 }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>Driver: {device.driver}</Text>
                </div>
              )}
            </Card>
          </Col>
        ))}

        {audioDevices.length === 0 && (
          <Col xs={24}>
            <Card className="info-card" bordered={false}>
              <Empty description="No audio devices detected" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Audio;
