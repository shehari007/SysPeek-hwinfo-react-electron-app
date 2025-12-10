import React, { useMemo } from 'react';
import { Card, Row, Col, Tag, Typography, Divider } from 'antd';
import { DesktopOutlined, KeyOutlined, AppstoreOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const OS = ({ siData }) => {
  const osInfo = siData?.osInfo || {};
  const uuid = siData?.uuid || {};
  const versions = siData?.versions || {};

  const mainOsInfo = useMemo(() => [
    { label: 'Platform', value: osInfo.platform },
    { label: 'Distribution', value: osInfo.distro },
    { label: 'Release', value: osInfo.release },
    { label: 'Codename', value: osInfo.codename },
    { label: 'Kernel', value: osInfo.kernel },
    { label: 'Architecture', value: osInfo.arch },
    { label: 'Hostname', value: osInfo.hostname },
    { label: 'FQDN', value: osInfo.fqdn },
  ], [osInfo]);

  const uuidInfo = useMemo(() => [
    { label: 'OS UUID', value: uuid.os },
    { label: 'Hardware UUID', value: uuid.hardware },
    { label: 'MACs', value: uuid.macs?.join(', ') || 'N/A' },
  ], [uuid]);

  const versionsList = useMemo(() => 
    Object.entries(versions)
      .filter(([_, v]) => v && v !== '')
      .map(([key, value]) => ({ name: key, version: value }))
  , [versions]);

  return (
    <div className="section-container">
      <div className="section-header">
        <DesktopOutlined className="section-icon" style={{ color: '#8b5cf6' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>Operating System</Title>
          <Text type="secondary">{osInfo.distro} {osInfo.release}</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* OS Info */}
        <Col xs={24} lg={12}>
          <Card className="info-card" title={<><DesktopOutlined /> System Details</>} bordered={false}>
            <div className="info-grid">
              {mainOsInfo.map((item, i) => (
                <div key={i} className="info-item">
                  <Text type="secondary" className="info-label">{item.label}</Text>
                  <Text className="info-value">{item.value || 'N/A'}</Text>
                </div>
              ))}
            </div>
            
            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />
            
            <Row gutter={[8, 8]}>
              <Col span={12}>
                <div className="mini-stat">
                  <ClockCircleOutlined style={{ color: '#f59e0b', marginRight: 8 }} />
                  <div>
                    <Text type="secondary">Logo File</Text>
                    <Text style={{ display: 'block' }}>{osInfo.logofile || 'N/A'}</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <div className="mini-stat">
                  <Text type="secondary">Build</Text>
                  <Text style={{ display: 'block' }}>{osInfo.build || 'N/A'}</Text>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* UUID Info */}
        <Col xs={24} lg={12}>
          <Card className="info-card" title={<><KeyOutlined /> System Identifiers</>} bordered={false}>
            <div className="uuid-list">
              {uuidInfo.map((item, i) => (
                <div key={i} className="uuid-item">
                  <Text type="secondary">{item.label}</Text>
                  <Text copyable={{ text: item.value }} className="uuid-value">
                    {item.value?.length > 36 ? item.value.substring(0, 36) + '...' : item.value || 'N/A'}
                  </Text>
                </div>
              ))}
            </div>
            
            <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '16px 0' }} />
            
            <div>
              <Text type="secondary">Serial Number</Text>
              <Text style={{ display: 'block' }}>{osInfo.serial || 'N/A'}</Text>
            </div>
          </Card>
        </Col>

        {/* Installed Versions */}
        <Col xs={24}>
          <Card className="info-card" title={<><AppstoreOutlined /> Installed System Tools ({versionsList.length})</>} bordered={false}>
            <div className="versions-grid">
              {versionsList.map((item, i) => (
                <Tag key={i} className="version-tag">
                  <span className="version-name">{item.name}</span>
                  <span className="version-number">{item.version}</span>
                </Tag>
              ))}
            </div>
            {versionsList.length === 0 && (
              <Text type="secondary">No version information available</Text>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default OS;
