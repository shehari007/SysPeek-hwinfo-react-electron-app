import React, { useMemo } from 'react';
import { Card, Row, Col, Progress, Typography, Tag, Statistic } from 'antd';
import { HddOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const StorageDevices = ({ siData }) => {
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    if (bytes < 1024 * 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    return `${(bytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`;
  };

  const diskLayout = siData?.diskLayout || [];

  const totalStorage = useMemo(() => 
    diskLayout.reduce((acc, d) => acc + (d.size || 0), 0)
  , [diskLayout]);

  const getTypeColor = (type) => {
    if (type?.toLowerCase().includes('ssd')) return '#10b981';
    if (type?.toLowerCase().includes('nvme')) return '#3b82f6';
    return '#f59e0b';
  };

  const getInterfaceColor = (iface) => {
    if (iface?.toLowerCase().includes('nvme')) return 'blue';
    if (iface?.toLowerCase().includes('sata')) return 'green';
    if (iface?.toLowerCase().includes('usb')) return 'orange';
    return 'default';
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <HddOutlined className="section-icon" style={{ color: '#f59e0b' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>Storage Devices</Title>
          <Text type="secondary">{diskLayout.length} drive(s) • {formatBytes(totalStorage)} total</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Overview Card */}
        <Col xs={24}>
          <Card className="info-card" bordered={false}>
            <Row gutter={[16, 16]} align="middle">
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Total Drives" 
                  value={diskLayout.length}
                  prefix={<DatabaseOutlined style={{ color: '#3b82f6' }} />}
                  valueStyle={{ color: '#3b82f6' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Statistic 
                  title="Total Capacity" 
                  value={formatBytes(totalStorage)}
                  valueStyle={{ color: '#10b981' }}
                />
              </Col>
              <Col xs={24} sm={8}>
                <div className="drive-types">
                  {diskLayout.some(d => d.type?.toLowerCase().includes('ssd')) && <Tag color="green">SSD</Tag>}
                  {diskLayout.some(d => d.type?.toLowerCase().includes('hdd')) && <Tag color="orange">HDD</Tag>}
                  {diskLayout.some(d => d.interfaceType?.toLowerCase().includes('nvme')) && <Tag color="blue">NVMe</Tag>}
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Individual Drives */}
        {diskLayout.map((drive, index) => (
          <Col xs={24} lg={12} key={index}>
            <Card className="info-card drive-card" bordered={false}>
              <div className="drive-header">
                <div className="drive-title">
                  <HddOutlined style={{ color: getTypeColor(drive.type), fontSize: '24px' }} />
                  <div>
                    <Text strong style={{ color: '#f1f5f9', fontSize: '16px' }}>
                      {drive.name || drive.vendor || `Drive ${index + 1}`}
                    </Text>
                    <Text type="secondary" style={{ display: 'block' }}>{drive.device}</Text>
                  </div>
                </div>
                <Tag color={getInterfaceColor(drive.interfaceType)}>
                  {drive.interfaceType || 'Unknown'}
                </Tag>
              </div>

              <div className="drive-specs">
                <Row gutter={[12, 8]}>
                  <Col xs={12}>
                    <Text type="secondary">Vendor</Text>
                    <Text style={{ display: 'block' }}>{drive.vendor || 'N/A'}</Text>
                  </Col>
                  <Col xs={12}>
                    <Text type="secondary">Type</Text>
                    <Text style={{ display: 'block' }}>{drive.type || 'N/A'}</Text>
                  </Col>
                  <Col xs={12}>
                    <Text type="secondary">Size</Text>
                    <Text strong style={{ display: 'block', color: '#10b981' }}>
                      {formatBytes(drive.size)}
                    </Text>
                  </Col>
                  <Col xs={12}>
                    <Text type="secondary">Sectors</Text>
                    <Text style={{ display: 'block' }}>{drive.sectorsRead?.toLocaleString() || 'N/A'}</Text>
                  </Col>
                </Row>
              </div>

              {drive.smartStatus && (
                <div className="drive-health">
                  <Tag color={drive.smartStatus === 'Ok' ? 'success' : 'error'}>
                    S.M.A.R.T: {drive.smartStatus}
                  </Tag>
                </div>
              )}

              {drive.serial && (
                <div style={{ marginTop: 12 }}>
                  <Text type="secondary">Serial: </Text>
                  <Text copyable style={{ fontSize: '12px' }}>{drive.serial}</Text>
                </div>
              )}
            </Card>
          </Col>
        ))}

        {diskLayout.length === 0 && (
          <Col xs={24}>
            <Card className="info-card" bordered={false}>
              <Text type="secondary">No storage devices detected</Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default StorageDevices;
