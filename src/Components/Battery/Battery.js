import React, { useMemo } from 'react';
import { Card, Row, Col, Typography, Tag, Progress, Statistic } from 'antd';
import { ThunderboltOutlined, BulbOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Battery = ({ siData }) => {
  const battery = siData?.battery || {};

  const chargeColor = useMemo(() => {
    if (battery.percent >= 80) return '#10b981';
    if (battery.percent >= 40) return '#f59e0b';
    return '#ef4444';
  }, [battery.percent]);

  const healthColor = useMemo(() => {
    const health = battery.capacityUnit ? 
      (battery.currentCapacity / battery.maxCapacity * 100) : 100;
    if (health >= 80) return '#10b981';
    if (health >= 50) return '#f59e0b';
    return '#ef4444';
  }, [battery]);

  const formatTime = (minutes) => {
    if (!minutes || minutes < 0) return 'Calculating...';
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
  };

  if (!battery.hasBattery) {
    return (
      <div className="section-container">
        <div className="section-header">
          <ThunderboltOutlined className="section-icon" style={{ color: '#10b981' }} />
          <div>
            <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>Battery</Title>
            <Text type="secondary">Power information</Text>
          </div>
        </div>
        <Card className="info-card" bordered={false}>
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <BulbOutlined style={{ fontSize: '48px', color: '#f59e0b', marginBottom: 16 }} />
            <Title level={4} style={{ color: '#f1f5f9' }}>No Battery Detected</Title>
            <Text type="secondary">This device is running on AC power</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="section-container">
      <div className="section-header">
        <ThunderboltOutlined className="section-icon" style={{ color: '#10b981' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>Battery</Title>
          <Text type="secondary">
            {battery.manufacturer} {battery.model}
          </Text>
        </div>
        {battery.isCharging && <Tag color="blue" icon={<ThunderboltOutlined />}>Charging</Tag>}
        {battery.acConnected && <Tag color="green">AC Connected</Tag>}
      </div>

      <Row gutter={[16, 16]}>
        {/* Main Battery Status */}
        <Col xs={24} lg={8}>
          <Card className="info-card" bordered={false}>
            <div className="gauge-card-content">
              <Progress
                type="dashboard"
                percent={battery.percent || 0}
                strokeColor={chargeColor}
                trailColor="rgba(255,255,255,0.1)"
                size={160}
                format={(p) => (
                  <div className="gauge-inner">
                    <span className="gauge-value" style={{ color: chargeColor }}>{p}%</span>
                    <span className="gauge-label">Charge</span>
                  </div>
                )}
              />
              <div style={{ marginTop: 16, textAlign: 'center' }}>
                {battery.timeRemaining > 0 && (
                  <Tag icon={<ClockCircleOutlined />} color="blue">
                    {formatTime(battery.timeRemaining)} remaining
                  </Tag>
                )}
              </div>
            </div>
          </Card>
        </Col>

        {/* Battery Details */}
        <Col xs={24} lg={16}>
          <Card className="info-card" title="Battery Details" bordered={false}>
            <Row gutter={[12, 16]}>
              <Col xs={12} sm={8}>
                <Statistic 
                  title="Manufacturer" 
                  value={battery.manufacturer || 'N/A'}
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic 
                  title="Model" 
                  value={battery.model || 'N/A'}
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic 
                  title="Type" 
                  value={battery.type || 'N/A'}
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic 
                  title="Voltage" 
                  value={battery.voltage ? `${battery.voltage}V` : 'N/A'}
                  valueStyle={{ fontSize: '14px', color: '#f59e0b' }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic 
                  title="Cycles" 
                  value={battery.cycleCount || 'N/A'}
                  valueStyle={{ fontSize: '14px', color: '#3b82f6' }}
                />
              </Col>
              <Col xs={12} sm={8}>
                <Statistic 
                  title="Design Capacity" 
                  value={battery.designedCapacity ? `${battery.designedCapacity} ${battery.capacityUnit || 'mWh'}` : 'N/A'}
                  valueStyle={{ fontSize: '14px' }}
                />
              </Col>
            </Row>

            {battery.maxCapacity && battery.designedCapacity && (
              <div style={{ marginTop: 16 }}>
                <Text type="secondary">Battery Health</Text>
                <Progress 
                  percent={Math.round((battery.maxCapacity / battery.designedCapacity) * 100)}
                  strokeColor={healthColor}
                  trailColor="rgba(255,255,255,0.1)"
                  format={(p) => `${p}%`}
                />
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Battery;
