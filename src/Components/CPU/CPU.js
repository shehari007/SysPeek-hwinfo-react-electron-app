import React, { useMemo } from 'react';
import { Card, Row, Col, Tag, Typography, Progress, Statistic } from 'antd';
import { ThunderboltOutlined, DatabaseOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const CPU = ({ siData }) => {
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const cpu = siData?.cpu || {};
  const cache = siData?.cpuCache || {};

  const mainSpecs = useMemo(() => [
    { label: 'Manufacturer', value: cpu.manufacturer },
    { label: 'Brand', value: cpu.brand },
    { label: 'Family', value: cpu.family },
    { label: 'Model', value: cpu.model },
    { label: 'Stepping', value: cpu.stepping },
    { label: 'Revision', value: cpu.revision },
    { label: 'Socket', value: cpu.socket },
  ], [cpu]);

  const performanceSpecs = useMemo(() => [
    { label: 'Cores', value: cpu.cores, color: '#3b82f6' },
    { label: 'Physical Cores', value: cpu.physicalCores, color: '#10b981' },
    { label: 'Performance Cores', value: cpu.performanceCores, color: '#f59e0b' },
    { label: 'Efficiency Cores', value: cpu.efficiencyCores, color: '#8b5cf6' },
  ], [cpu]);

  const speedSpecs = useMemo(() => [
    { label: 'Base Speed', value: cpu.speed ? `${cpu.speed} GHz` : 'N/A' },
    { label: 'Min Speed', value: cpu.speedMin ? `${cpu.speedMin} GHz` : 'N/A' },
    { label: 'Max Speed', value: cpu.speedMax ? `${cpu.speedMax} GHz` : 'N/A' },
  ], [cpu]);

  const cacheSpecs = useMemo(() => [
    { label: 'L1 Data', value: formatBytes(cache.l1d), color: '#ef4444' },
    { label: 'L1 Instruction', value: formatBytes(cache.l1i), color: '#f97316' },
    { label: 'L2 Cache', value: formatBytes(cache.l2), color: '#eab308' },
    { label: 'L3 Cache', value: formatBytes(cache.l3), color: '#22c55e' },
  ], [cache]);

  const features = useMemo(() => {
    const f = [];
    if (cpu.virtualization) f.push({ label: 'Virtualization', color: 'blue' });
    if (cpu.flags?.includes('avx')) f.push({ label: 'AVX', color: 'green' });
    if (cpu.flags?.includes('avx2')) f.push({ label: 'AVX2', color: 'cyan' });
    if (cpu.flags?.includes('sse4_2')) f.push({ label: 'SSE4.2', color: 'purple' });
    return f;
  }, [cpu]);

  return (
    <div className="section-container">
      <div className="section-header">
        <ThunderboltOutlined className="section-icon" style={{ color: '#3b82f6' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>CPU Information</Title>
          <Text type="secondary">{cpu.manufacturer} {cpu.brand}</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Main Info Card */}
        <Col xs={24} lg={12}>
          <Card className="info-card" title="Processor Details" bordered={false}>
            <div className="info-grid">
              {mainSpecs.map((spec, i) => (
                <div key={i} className="info-item">
                  <Text type="secondary" className="info-label">{spec.label}</Text>
                  <Text className="info-value">{spec.value || 'N/A'}</Text>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Performance Card */}
        <Col xs={24} lg={12}>
          <Card className="info-card" title="Core Configuration" bordered={false}>
            <Row gutter={[12, 12]}>
              {performanceSpecs.map((spec, i) => (
                <Col xs={12} sm={6} key={i}>
                  <div className="stat-box" style={{ borderColor: spec.color }}>
                    <Statistic 
                      title={spec.label} 
                      value={spec.value || 0}
                      valueStyle={{ color: spec.color, fontSize: '24px' }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Speed Card */}
        <Col xs={24} md={12}>
          <Card className="info-card" title="Clock Speeds" bordered={false}>
            <div className="speed-meters">
              {speedSpecs.map((spec, i) => (
                <div key={i} className="speed-item">
                  <div className="speed-header">
                    <Text>{spec.label}</Text>
                    <Text strong style={{ color: '#3b82f6' }}>{spec.value}</Text>
                  </div>
                  <Progress 
                    percent={cpu.speedMax ? ((parseFloat(spec.value) || 0) / cpu.speedMax * 100) : 0} 
                    showInfo={false}
                    strokeColor={{ from: '#3b82f6', to: '#8b5cf6' }}
                    trailColor="rgba(255,255,255,0.1)"
                  />
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* Cache Card */}
        <Col xs={24} md={12}>
          <Card className="info-card" title={<><DatabaseOutlined /> Cache Hierarchy</>} bordered={false}>
            <Row gutter={[12, 12]}>
              {cacheSpecs.map((spec, i) => (
                <Col xs={12} key={i}>
                  <div className="cache-item" style={{ borderLeftColor: spec.color }}>
                    <Text type="secondary">{spec.label}</Text>
                    <Text strong style={{ color: spec.color, fontSize: '16px' }}>{spec.value}</Text>
                  </div>
                </Col>
              ))}
            </Row>
          </Card>
        </Col>

        {/* Features */}
        {features.length > 0 && (
          <Col xs={24}>
            <Card className="info-card" title="CPU Features" bordered={false}>
              <div className="features-list">
                {features.map((f, i) => (
                  <Tag key={i} color={f.color} className="feature-tag">{f.label}</Tag>
                ))}
                {cpu.vendor && <Tag color="magenta">{cpu.vendor}</Tag>}
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default CPU;
