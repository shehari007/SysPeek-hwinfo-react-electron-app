import React, { useMemo } from 'react';
import { Card, Row, Col, Typography, Tag, Divider } from 'antd';
import { LaptopOutlined, ToolOutlined, BuildOutlined, BoxPlotOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const SystemInfo = ({ siData }) => {
  const system = siData?.system || {};
  const bios = siData?.bios || {};
  const baseboard = siData?.baseboard || {};
  const chassis = siData?.chassis || {};

  const systemSpecs = useMemo(() => [
    { label: 'Manufacturer', value: system.manufacturer },
    { label: 'Model', value: system.model },
    { label: 'Version', value: system.version },
    { label: 'Serial', value: system.serial },
    { label: 'UUID', value: system.uuid },
    { label: 'SKU', value: system.sku },
  ], [system]);

  const biosSpecs = useMemo(() => [
    { label: 'Vendor', value: bios.vendor },
    { label: 'Version', value: bios.version },
    { label: 'Release Date', value: bios.releaseDate },
    { label: 'Revision', value: bios.revision },
    { label: 'Serial', value: bios.serial },
  ], [bios]);

  const baseboardSpecs = useMemo(() => [
    { label: 'Manufacturer', value: baseboard.manufacturer },
    { label: 'Model', value: baseboard.model },
    { label: 'Version', value: baseboard.version },
    { label: 'Serial', value: baseboard.serial },
    { label: 'Asset Tag', value: baseboard.assetTag },
  ], [baseboard]);

  const chassisSpecs = useMemo(() => [
    { label: 'Manufacturer', value: chassis.manufacturer },
    { label: 'Model', value: chassis.model },
    { label: 'Type', value: chassis.type },
    { label: 'Version', value: chassis.version },
    { label: 'Serial', value: chassis.serial },
    { label: 'Asset Tag', value: chassis.assetTag },
    { label: 'SKU', value: chassis.sku },
  ], [chassis]);

  const InfoCard = ({ icon, title, color, specs }) => (
    <Card className="info-card" bordered={false}>
      <div className="card-title-row">
        {React.cloneElement(icon, { style: { color, fontSize: '20px' } })}
        <Title level={5} style={{ margin: 0, color: '#f1f5f9' }}>{title}</Title>
      </div>
      <Divider style={{ borderColor: 'rgba(255,255,255,0.1)', margin: '12px 0' }} />
      <div className="info-grid-compact">
        {specs.map((spec, i) => (
          <div key={i} className="info-item-compact">
            <Text type="secondary" className="info-label-sm">{spec.label}</Text>
            <Text className="info-value-sm">{spec.value || 'N/A'}</Text>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="section-container">
      <div className="section-header">
        <LaptopOutlined className="section-icon" style={{ color: '#f59e0b' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>System Information</Title>
          <Text type="secondary">{system.manufacturer} {system.model}</Text>
        </div>
        {system.virtual && <Tag color="purple">Virtual Machine</Tag>}
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <InfoCard 
            icon={<LaptopOutlined />} 
            title="System" 
            color="#3b82f6" 
            specs={systemSpecs} 
          />
        </Col>
        
        <Col xs={24} lg={12}>
          <InfoCard 
            icon={<ToolOutlined />} 
            title="BIOS / UEFI" 
            color="#10b981" 
            specs={biosSpecs} 
          />
        </Col>
        
        <Col xs={24} lg={12}>
          <InfoCard 
            icon={<BuildOutlined />} 
            title="Baseboard / Motherboard" 
            color="#f59e0b" 
            specs={baseboardSpecs} 
          />
        </Col>
        
        <Col xs={24} lg={12}>
          <InfoCard 
            icon={<BoxPlotOutlined />} 
            title="Chassis" 
            color="#8b5cf6" 
            specs={chassisSpecs} 
          />
        </Col>
      </Row>
    </div>
  );
};

export default SystemInfo;
