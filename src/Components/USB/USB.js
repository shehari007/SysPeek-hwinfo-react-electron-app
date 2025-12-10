import React from 'react';
import { Card, Row, Col, Typography, Tag, Empty, Tree } from 'antd';
import { UsbOutlined, BranchesOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const USB = ({ siData }) => {
  const usbDevices = siData?.usb || [];

  const getTypeColor = (type) => {
    if (type?.toLowerCase().includes('hub')) return 'purple';
    if (type?.toLowerCase().includes('storage')) return 'blue';
    if (type?.toLowerCase().includes('hid') || type?.toLowerCase().includes('input')) return 'green';
    return 'default';
  };

  // Count device types
  const hubCount = usbDevices.filter(d => d.type?.toLowerCase().includes('hub')).length;
  const deviceCount = usbDevices.length - hubCount;

  return (
    <div className="section-container">
      <div className="section-header">
        <UsbOutlined className="section-icon" style={{ color: '#10b981' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>USB Devices</Title>
          <Text type="secondary">{deviceCount} device(s) • {hubCount} hub(s)</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Summary */}
        {usbDevices.length > 0 && (
          <Col xs={24}>
            <Card className="info-card" bordered={false}>
              <Row gutter={[16, 8]}>
                <Col>
                  <Tag color="blue">{usbDevices.length} Total USB Devices</Tag>
                </Col>
                {hubCount > 0 && (
                  <Col>
                    <Tag color="purple">{hubCount} USB Hubs</Tag>
                  </Col>
                )}
                <Col>
                  <Tag color="green">{deviceCount} Connected Devices</Tag>
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {/* Device List */}
        {usbDevices.map((device, index) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={index}>
            <Card className="info-card device-card" bordered={false} size="small">
              <div className="device-header">
                {device.type?.toLowerCase().includes('hub') ? (
                  <BranchesOutlined style={{ color: '#8b5cf6', fontSize: '20px' }} />
                ) : (
                  <UsbOutlined style={{ color: '#10b981', fontSize: '20px' }} />
                )}
                <div className="device-info">
                  <Text strong style={{ color: '#f1f5f9', fontSize: '13px' }} ellipsis>
                    {device.name || 'Unknown Device'}
                  </Text>
                  <Text type="secondary" style={{ display: 'block', fontSize: '11px' }} ellipsis>
                    {device.vendor || device.manufacturer || 'Unknown Vendor'}
                  </Text>
                </div>
              </div>

              <div className="device-details" style={{ marginTop: 8 }}>
                {device.type && <Tag color={getTypeColor(device.type)} style={{ fontSize: '10px' }}>{device.type}</Tag>}
                {device.removable && <Tag color="orange" style={{ fontSize: '10px' }}>Removable</Tag>}
              </div>

              {(device.id || device.deviceId) && (
                <div style={{ marginTop: 6 }}>
                  <Text type="secondary" style={{ fontSize: '10px' }}>
                    ID: {device.id || device.deviceId}
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        ))}

        {usbDevices.length === 0 && (
          <Col xs={24}>
            <Card className="info-card" bordered={false}>
              <Empty description="No USB devices detected" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default USB;
