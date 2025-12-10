import React from 'react';
import { Card, Row, Col, Typography, Tag, Empty } from 'antd';
import { PrinterOutlined, CheckCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Printers = ({ siData }) => {
  const printers = siData?.printer || [];

  const getStatusColor = (status) => {
    if (status?.toLowerCase().includes('idle') || status?.toLowerCase().includes('ready')) return 'success';
    if (status?.toLowerCase().includes('printing')) return 'processing';
    if (status?.toLowerCase().includes('error')) return 'error';
    return 'default';
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <PrinterOutlined className="section-icon" style={{ color: '#8b5cf6' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>Printers</Title>
          <Text type="secondary">{printers.length} printer(s) configured</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {printers.map((printer, index) => (
          <Col xs={24} md={12} key={index}>
            <Card className="info-card device-card" bordered={false}>
              <div className="device-header">
                <PrinterOutlined style={{ color: '#8b5cf6', fontSize: '28px' }} />
                <div className="device-info">
                  <Text strong style={{ color: '#f1f5f9', fontSize: '15px' }}>
                    {printer.name || printer.model || 'Unknown Printer'}
                  </Text>
                  <Text type="secondary" style={{ display: 'block', fontSize: '12px' }}>
                    {printer.model || printer.name || ''}
                  </Text>
                </div>
              </div>

              <div className="device-details" style={{ marginTop: 12 }}>
                {printer.default && (
                  <Tag color="success" icon={<CheckCircleOutlined />}>Default</Tag>
                )}
                {printer.status && (
                  <Tag color={getStatusColor(printer.status)}>{printer.status}</Tag>
                )}
                {printer.local !== undefined && (
                  <Tag color={printer.local ? 'blue' : 'orange'}>
                    {printer.local ? 'Local' : 'Network'}
                  </Tag>
                )}
                {printer.shared && <Tag color="purple">Shared</Tag>}
              </div>

              {(printer.uri || printer.portName) && (
                <div style={{ marginTop: 12, padding: '8px 12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '11px' }}>
                    {printer.uri || printer.portName}
                  </Text>
                </div>
              )}
            </Card>
          </Col>
        ))}

        {printers.length === 0 && (
          <Col xs={24}>
            <Card className="info-card" bordered={false}>
              <Empty description="No printers configured" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Printers;
