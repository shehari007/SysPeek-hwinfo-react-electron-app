import React, { useMemo } from 'react';
import { Card, Row, Col, Progress, Typography, Tag, Statistic } from 'antd';
import { DatabaseOutlined, ThunderboltOutlined, FieldTimeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const MemoryInfo = ({ siData }) => {
  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  };

  const mem = siData?.mem || {};
  const memLayout = siData?.memLayout || [];

  const usedPercent = useMemo(() => 
    mem.total ? Math.round((mem.used / mem.total) * 100) : 0
  , [mem]);

  const memStats = useMemo(() => [
    { label: 'Total', value: formatBytes(mem.total), color: '#3b82f6' },
    { label: 'Used', value: formatBytes(mem.used), color: '#ef4444' },
    { label: 'Free', value: formatBytes(mem.free), color: '#10b981' },
    { label: 'Available', value: formatBytes(mem.available), color: '#8b5cf6' },
  ], [mem]);

  const swapStats = useMemo(() => [
    { label: 'Swap Total', value: formatBytes(mem.swaptotal) },
    { label: 'Swap Used', value: formatBytes(mem.swapused) },
    { label: 'Swap Free', value: formatBytes(mem.swapfree) },
  ], [mem]);

  return (
    <div className="section-container">
      <div className="section-header">
        <DatabaseOutlined className="section-icon" style={{ color: '#10b981' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>Memory Information</Title>
          <Text type="secondary">RAM & Swap Usage Overview</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Usage Overview */}
        <Col xs={24} lg={8}>
          <Card className="info-card" bordered={false}>
            <div className="gauge-card-content">
              <Progress
                type="dashboard"
                percent={usedPercent}
                strokeColor={{
                  '0%': '#10b981',
                  '50%': '#f59e0b',
                  '100%': '#ef4444',
                }}
                trailColor="rgba(255,255,255,0.1)"
                size={180}
                format={(p) => (
                  <div className="gauge-inner">
                    <span className="gauge-value">{p}%</span>
                    <span className="gauge-label">Used</span>
                  </div>
                )}
              />
              <Text type="secondary" style={{ marginTop: 12 }}>
                {formatBytes(mem.used)} / {formatBytes(mem.total)}
              </Text>
            </div>
          </Card>
        </Col>

        {/* Memory Stats */}
        <Col xs={24} lg={16}>
          <Card className="info-card" title="Memory Breakdown" bordered={false}>
            <Row gutter={[12, 12]}>
              {memStats.map((stat, i) => (
                <Col xs={12} sm={6} key={i}>
                  <div className="stat-box" style={{ borderColor: stat.color }}>
                    <Text type="secondary">{stat.label}</Text>
                    <Text strong style={{ color: stat.color, fontSize: '18px', display: 'block' }}>
                      {stat.value}
                    </Text>
                  </div>
                </Col>
              ))}
            </Row>
            
            {/* Additional Stats */}
            <div style={{ marginTop: 16 }}>
              <Row gutter={[12, 12]}>
                <Col xs={8}>
                  <div className="mini-stat">
                    <Text type="secondary">Active</Text>
                    <Text>{formatBytes(mem.active)}</Text>
                  </div>
                </Col>
                <Col xs={8}>
                  <div className="mini-stat">
                    <Text type="secondary">Buffered</Text>
                    <Text>{formatBytes(mem.buffcache)}</Text>
                  </div>
                </Col>
                <Col xs={8}>
                  <div className="mini-stat">
                    <Text type="secondary">Slab</Text>
                    <Text>{formatBytes(mem.slab)}</Text>
                  </div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* Swap */}
        <Col xs={24} md={12}>
          <Card className="info-card" title={<><FieldTimeOutlined /> Swap Memory</>} bordered={false}>
            <div className="swap-stats">
              {swapStats.map((stat, i) => (
                <div key={i} className="swap-item">
                  <Text type="secondary">{stat.label}</Text>
                  <Text strong>{stat.value}</Text>
                </div>
              ))}
            </div>
            {mem.swaptotal > 0 && (
              <Progress 
                percent={Math.round((mem.swapused / mem.swaptotal) * 100) || 0}
                strokeColor="#f59e0b"
                trailColor="rgba(255,255,255,0.1)"
                style={{ marginTop: 12 }}
              />
            )}
          </Card>
        </Col>

        {/* Memory Modules */}
        <Col xs={24} md={12}>
          <Card className="info-card" title={<><ThunderboltOutlined /> Installed Modules ({memLayout.length})</>} bordered={false}>
            {memLayout.length === 0 ? (
              <Text type="secondary">No memory module data available</Text>
            ) : (
              <div className="module-list">
                {memLayout.map((module, i) => (
                  <div key={i} className="module-item">
                    <div className="module-header">
                      <Tag color="blue">{module.bank || `Slot ${i + 1}`}</Tag>
                      <Text strong>{formatBytes(module.size)}</Text>
                    </div>
                    <div className="module-details">
                      <Text type="secondary">
                        {module.type} • {module.clockSpeed} MHz • {module.manufacturer}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default MemoryInfo;
