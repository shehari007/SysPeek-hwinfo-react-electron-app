import React from 'react';
import { Card, Row, Col, Typography, Tag, Statistic } from 'antd';
import { ExpandOutlined, DesktopOutlined, EyeOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Display = ({ siData }) => {
  const displays = siData?.graphics?.displays || [];

  const getConnectionColor = (connection) => {
    if (connection?.toLowerCase().includes('internal')) return 'blue';
    if (connection?.toLowerCase().includes('hdmi')) return 'red';
    if (connection?.toLowerCase().includes('displayport') || connection?.toLowerCase().includes('dp')) return 'green';
    if (connection?.toLowerCase().includes('thunderbolt')) return 'purple';
    return 'default';
  };

  return (
    <div className="section-container">
      <div className="section-header">
        <ExpandOutlined className="section-icon" style={{ color: '#8b5cf6' }} />
        <div>
          <Title level={3} style={{ margin: 0, color: '#f1f5f9' }}>Displays</Title>
          <Text type="secondary">{displays.length} display(s) connected</Text>
        </div>
      </div>

      <Row gutter={[16, 16]}>
        {/* Overview */}
        {displays.length > 0 && (
          <Col xs={24}>
            <Card className="info-card" bordered={false}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8}>
                  <Statistic 
                    title="Connected Displays" 
                    value={displays.length}
                    prefix={<DesktopOutlined style={{ color: '#8b5cf6' }} />}
                    valueStyle={{ color: '#8b5cf6' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <Statistic 
                    title="Primary Display" 
                    value={displays.find(d => d.main)?.model || displays[0]?.model || 'Unknown'}
                    valueStyle={{ fontSize: '14px' }}
                  />
                </Col>
                <Col xs={24} sm={8}>
                  <div className="display-connections">
                    {[...new Set(displays.map(d => d.connection).filter(Boolean))].map((c, i) => (
                      <Tag key={i} color={getConnectionColor(c)}>{c}</Tag>
                    ))}
                  </div>
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {/* Display Cards */}
        {displays.map((display, index) => (
          <Col xs={24} md={displays.length === 1 ? 24 : 12} key={index}>
            <Card className="info-card display-card" bordered={false}>
              <div className="display-header">
                <div className="display-title">
                  <EyeOutlined style={{ color: display.main ? '#10b981' : '#8b5cf6', fontSize: '24px' }} />
                  <div>
                    <Text strong style={{ color: '#f1f5f9', fontSize: '16px' }}>
                      {display.model || display.deviceName || `Display ${index + 1}`}
                    </Text>
                    <Text type="secondary" style={{ display: 'block' }}>
                      {display.vendor || 'Unknown Vendor'}
                    </Text>
                  </div>
                </div>
                <div>
                  {display.main && <Tag color="success">Primary</Tag>}
                  {display.connection && (
                    <Tag color={getConnectionColor(display.connection)}>{display.connection}</Tag>
                  )}
                </div>
              </div>

              <div className="display-specs">
                <Row gutter={[12, 12]}>
                  <Col xs={12}>
                    <div className="spec-item">
                      <Text type="secondary">Resolution</Text>
                      <Text strong style={{ color: '#3b82f6' }}>
                        {display.resolutionX && display.resolutionY 
                          ? `${display.resolutionX} x ${display.resolutionY}`
                          : display.currentResX && display.currentResY
                          ? `${display.currentResX} x ${display.currentResY}`
                          : 'N/A'
                        }
                      </Text>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="spec-item">
                      <Text type="secondary">Refresh Rate</Text>
                      <Text strong style={{ color: '#10b981' }}>
                        {display.currentRefreshRate ? `${display.currentRefreshRate} Hz` : 'N/A'}
                      </Text>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="spec-item">
                      <Text type="secondary">Size</Text>
                      <Text>
                        {display.sizeX && display.sizeY 
                          ? `${display.sizeX}" x ${display.sizeY}"`
                          : display.size 
                          ? `${display.size}"`
                          : 'N/A'
                        }
                      </Text>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div className="spec-item">
                      <Text type="secondary">Pixel Depth</Text>
                      <Text>{display.pixelDepth ? `${display.pixelDepth} bit` : 'N/A'}</Text>
                    </div>
                  </Col>
                </Row>
              </div>

              {(display.builtin !== undefined || display.positionX !== undefined) && (
                <div style={{ marginTop: 12 }}>
                  {display.builtin && <Tag color="blue">Built-in</Tag>}
                  {display.positionX !== undefined && display.positionY !== undefined && (
                    <Text type="secondary" style={{ fontSize: '11px', marginLeft: 8 }}>
                      Position: ({display.positionX}, {display.positionY})
                    </Text>
                  )}
                </div>
              )}
            </Card>
          </Col>
        ))}

        {displays.length === 0 && (
          <Col xs={24}>
            <Card className="info-card" bordered={false}>
              <Text type="secondary">No displays detected</Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default Display;
