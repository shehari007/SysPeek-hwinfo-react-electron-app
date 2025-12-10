import React, { useEffect, useMemo, useState, useCallback, memo } from 'react';
import { Card, Col, Progress, Row, Typography, Table, Input, Tag, Tooltip, Tabs, Statistic, Badge, Dropdown } from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  CloudDownloadOutlined,
  CloudUploadOutlined,
  HddOutlined,
  DesktopOutlined,
  SearchOutlined,
  WifiOutlined,
  ClockCircleOutlined,
  UserOutlined,
  CodeOutlined,
  FieldTimeOutlined,
  DatabaseOutlined,
  SwapOutlined,
  FundOutlined
} from '@ant-design/icons';

const si = window.require('systeminformation');

// Memoized stat card for performance
const StatCard = memo(({ icon, title, children, color = '#7cc4ff', extra }) => (
  <Card className="dashboard-card" bordered={false}>
    <div className="card-header">
      <div className="card-icon" style={{ background: `${color}22`, color }}>
        {icon}
      </div>
      <Typography.Text className="card-title">{title}</Typography.Text>
      {extra && <div className="card-extra">{extra}</div>}
    </div>
    <div className="card-body">
      {children}
    </div>
  </Card>
));

// Circular gauge component
const CircularGauge = memo(({ percent, label, color, subLabel, size = 120 }) => (
  <div className="gauge-container">
    <Progress
      type="circle"
      percent={Math.min(percent, 100)}
      size={size}
      strokeWidth={8}
      strokeColor={{
        '0%': color,
        '100%': `${color}88`,
      }}
      trailColor="rgba(255,255,255,0.06)"
      format={() => (
        <div className="gauge-inner">
          <span className="gauge-value">{percent}%</span>
          <span className="gauge-label">{label}</span>
        </div>
      )}
    />
    {subLabel && <Typography.Text className="gauge-sub">{subLabel}</Typography.Text>}
  </div>
));

// Mini stat display
const MiniStat = memo(({ label, value, color, icon }) => (
  <div className="mini-stat">
    <div className="mini-stat-icon" style={{ color }}>{icon}</div>
    <div className="mini-stat-content">
      <Typography.Text className="mini-stat-value" style={{ color }}>{value}</Typography.Text>
      <Typography.Text className="mini-stat-label">{label}</Typography.Text>
    </div>
  </div>
));

const TaskManager = () => {
  const [stats, setStats] = useState({
    cpuLoad: 0,
    cpuSpeed: 0,
    cpuTemp: null,
    cpuModel: '',
    // Using correct memory keys from systeminformation v5
    mem: { 
      total: 0, 
      used: 0,        // Total - free
      free: 0,        // Truly free memory
      active: 0,      // Active memory
      available: 0,   // Memory available for apps (may include cached)
      buffcache: 0,   // Buffers + cached
      slab: 0,
      swaptotal: 0, 
      swapused: 0,
      swapfree: 0 
    },
    disks: { read: 0, write: 0, rIO: 0, wIO: 0, tIO: 0 },
    net: { rx: 0, tx: 0, rxTotal: 0, txTotal: 0, iface: '' },
    fsSize: [],
    cpuCores: [],
    uptime: 0,
    processCount: 0,
  });
  const [processes, setProcesses] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showSystemDrives, setShowSystemDrives] = useState(false);
  const [refreshMs, setRefreshMs] = useState(2000);

  const formatBytes = useCallback((bytes, decimals = 2) => {
    if (bytes === null || bytes === undefined) return '--';
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(Math.abs(bytes)) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(decimals)} ${sizes[i]}`;
  }, []);

  const formatSpeed = useCallback((bytesPerSec) => {
    if (bytesPerSec === null || bytesPerSec === undefined || isNaN(bytesPerSec)) return '0 B/s';
    if (bytesPerSec === 0) return '0 B/s';
    return `${formatBytes(bytesPerSec, 1)}/s`;
  }, [formatBytes]);

  const formatUptime = useCallback((seconds) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (d > 0) return `${d}d ${h}h ${m}m`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  }, []);

  const refreshMenuItems = useMemo(() => ([
    { key: '1000', label: '1 second' },
    { key: '2000', label: '2 seconds' },
    { key: '5000', label: '5 seconds' },
    { key: '10000', label: '10 seconds' },
  ]), []);

  // Live stats polling
  useEffect(() => {
    let active = true;

    const loadStats = async () => {
      try {
        const [cpuLoad, cpuSpeed, cpuTemp, cpuInfo, mem, disks, net, fsSize, time] = await Promise.all([
          si.currentLoad(),
          si.cpuCurrentSpeed(),
          si.cpuTemperature(),
          si.cpu(),
          si.mem(),
          si.disksIO(),
          si.networkStats(),
          si.fsSize(),
          si.time(),
        ]);

        if (!active) return;

        const netAgg = Array.isArray(net)
          ? net.reduce((acc, n) => ({
              rx: acc.rx + (n.rx_sec || 0),
              tx: acc.tx + (n.tx_sec || 0),
              rxTotal: acc.rxTotal + (n.rx_bytes || 0),
              txTotal: acc.txTotal + (n.tx_bytes || 0),
              iface: n.iface || acc.iface,
            }), { rx: 0, tx: 0, rxTotal: 0, txTotal: 0, iface: '' })
          : { 
              rx: net?.rx_sec || 0, 
              tx: net?.tx_sec || 0,
              rxTotal: net?.rx_bytes || 0,
              txTotal: net?.tx_bytes || 0,
              iface: net?.iface || ''
            };

        setStats(prev => {
          const smoothNumber = (val, fallback) => {
            if (!Number.isFinite(val)) return fallback;
            // Avoid momentary drop to zero when we just had a valid reading
            if (val === 0 && Number.isFinite(fallback) && fallback > 0) return fallback;
            return val;
          };

          return {
            cpuLoad: Number((cpuLoad.currentLoad || 0).toFixed(1)),
            cpuSpeed: cpuSpeed.avg || cpuSpeed.min || 0,
            cpuTemp: cpuTemp.main,
            cpuModel: cpuInfo.brand || 'Unknown CPU',
            cpuCores: cpuLoad.cpus?.map(c => Number(c.load.toFixed(1))) || [],
            // Correct memory values from systeminformation
            mem: {
              total: mem.total || 0,
              used: mem.used || 0,           // This is total - free
              free: mem.free || 0,           // Actually free
              active: mem.active || 0,       // Active memory
              available: mem.available || 0, // Available for applications
              buffcache: mem.buffcache || 0, // Buffers + cached
              slab: mem.slab || 0,
              swaptotal: mem.swaptotal || 0,
              swapused: mem.swapused || 0,
              swapfree: mem.swapfree || 0,
            },
            disks: {
              read: smoothNumber(disks?.rIO_sec, prev.disks.read),
              write: smoothNumber(disks?.wIO_sec, prev.disks.write),
              rIO: smoothNumber(disks?.rIO, prev.disks.rIO),
              wIO: smoothNumber(disks?.wIO, prev.disks.wIO),
              tIO: smoothNumber(disks?.tIO, prev.disks.tIO),
            },
            net: netAgg,
            fsSize: (fsSize || []).filter(fs => fs.size > 0),
            uptime: time?.uptime || 0,
            processCount: prev.processCount,
          };
        });
      } catch (err) {
        console.error('Stats error:', err);
      }
    };

    loadStats();
    const id = setInterval(loadStats, refreshMs);
    return () => { active = false; clearInterval(id); };
  }, [refreshMs]);

  // Load processes (with more details)
  useEffect(() => {
    let active = true;
    const loadProcesses = async () => {
      try {
        const procs = await si.processes();
        if (!active) return;

        const list = Array.isArray(procs.list) ? procs.list : [];
        const count = Number.isFinite(procs.all) ? procs.all : list.length;
        // Only update process count when positive; otherwise keep previous to avoid flicker
        if (count > 0) {
          setStats(prev => ({ ...prev, processCount: count }));
        }

        if (list.length) {
          const sorted = list
            .sort((a, b) => (b.cpu || 0) - (a.cpu || 0))
            .slice(0, 150)
            .map((p, idx) => ({ 
              ...p, 
              key: p.pid || idx,
              memVsz: p.memVsz || 0,
              memRss: p.memRss || 0,
            }));
          setProcesses(sorted);
        }
      } catch (err) {
        console.error('Process error:', err);
      }
    };

    loadProcesses();
    const id = setInterval(loadProcesses, refreshMs);
    return () => { active = false; clearInterval(id); };
  }, [refreshMs]);

  // Calculate memory usage - use 'used' which is (total - free)
  const memUsage = useMemo(() => {
    const { total, used } = stats.mem;
    if (!total) return 0;
    return Number(((used / total) * 100).toFixed(1));
  }, [stats.mem]);

  const swapUsage = useMemo(() => {
    const { swaptotal, swapused } = stats.mem;
    if (!swaptotal) return 0;
    return Number(((swapused / swaptotal) * 100).toFixed(1));
  }, [stats.mem]);

  const filteredProcesses = useMemo(() => {
    if (!searchText) return processes;
    const lower = searchText.toLowerCase();
    return processes.filter(p =>
      p.name?.toLowerCase().includes(lower) ||
      p.command?.toLowerCase().includes(lower) ||
      p.user?.toLowerCase().includes(lower) ||
      String(p.pid).includes(lower)
    );
  }, [processes, searchText]);

  // Enhanced process columns with more details
  const processColumns = useMemo(() => [
    {
      title: 'PID',
      dataIndex: 'pid',
      key: 'pid',
      width: 70,
      sorter: (a, b) => a.pid - b.pid,
      render: (pid) => <Typography.Text code>{pid}</Typography.Text>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      ellipsis: true,
      sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
      render: (text, record) => (
        <Tooltip title={record.command || text}>
          <div className="process-name-cell">
            <CodeOutlined style={{ marginRight: 6, opacity: 0.5 }} />
            <span className="process-name">{text}</span>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'User',
      dataIndex: 'user',
      key: 'user',
      width: 100,
      ellipsis: true,
      render: (user) => (
        <Typography.Text type="secondary">
          <UserOutlined style={{ marginRight: 4 }} />
          {user || 'system'}
        </Typography.Text>
      ),
    },
    {
      title: 'CPU %',
      dataIndex: 'cpu',
      key: 'cpu',
      width: 120,
      sorter: (a, b) => (a.cpu || 0) - (b.cpu || 0),
      defaultSortOrder: 'descend',
      render: (val) => (
        <div className="cpu-cell">
          <Progress
            percent={Math.min(val || 0, 100)}
            size="small"
            showInfo={false}
            strokeColor={val > 50 ? '#ff7875' : val > 20 ? '#ffd666' : '#5dd39e'}
            trailColor="rgba(255,255,255,0.08)"
          />
          <span style={{ color: val > 50 ? '#ff7875' : val > 20 ? '#ffd666' : '#5dd39e' }}>
            {(val || 0).toFixed(1)}%
          </span>
        </div>
      ),
    },
    {
      title: 'Memory %',
      dataIndex: 'mem',
      key: 'mem',
      width: 90,
      sorter: (a, b) => (a.mem || 0) - (b.mem || 0),
      render: (val) => (
        <Tag color={val > 10 ? 'orange' : val > 5 ? 'blue' : 'default'}>
          {(val || 0).toFixed(1)}%
        </Tag>
      ),
    },
    {
      title: 'Memory (RSS)',
      dataIndex: 'memRss',
      key: 'memRss',
      width: 100,
      sorter: (a, b) => (a.memRss || 0) - (b.memRss || 0),
      render: (val) => formatBytes(val * 1024, 1),  // memRss is in KB
    },
    {
      title: 'State',
      dataIndex: 'state',
      key: 'state',
      width: 90,
      filters: [
        { text: 'Running', value: 'running' },
        { text: 'Sleeping', value: 'sleeping' },
        { text: 'Idle', value: 'idle' },
      ],
      onFilter: (value, record) => record.state === value,
      render: (state) => {
        const colors = {
          running: 'green',
          sleeping: 'blue', 
          idle: 'default',
          stopped: 'orange',
          zombie: 'red',
        };
        return (
          <Tag color={colors[state] || 'default'}>
            {state || 'unknown'}
          </Tag>
        );
      },
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      width: 70,
      sorter: (a, b) => (a.priority || 0) - (b.priority || 0),
      render: (val) => <Typography.Text type="secondary">{val || 0}</Typography.Text>,
    },
  ], [formatBytes]);

  // Filter drives - hide system volumes on macOS unless toggled
  const filteredDrives = useMemo(() => {
    if (showSystemDrives) return stats.fsSize;
    return stats.fsSize.filter(fs => {
      const mount = (fs.mount || '').toLowerCase();
      // Filter out macOS system volumes
      const systemPaths = ['/system/volumes/', '/private/', '/dev', '/vm'];
      const isSystem = systemPaths.some(p => mount.includes(p)) || 
                       (mount !== '/' && mount.startsWith('/system'));
      return !isSystem;
    });
  }, [stats.fsSize, showSystemDrives]);

  const diskUsageCard = useMemo(() => (
    <Card className="dashboard-card disk-usage-card" bordered={false}>
      <div className="card-header">
        <div className="card-icon" style={{ background: '#ffd66622', color: '#ffd666' }}>
          <HddOutlined />
        </div>
        <Typography.Text className="card-title">Disk Usage</Typography.Text>
        <div className="card-header-actions">
          <Tag color="blue">{filteredDrives.length} / {stats.fsSize.length} volumes</Tag>
          <Tooltip title={showSystemDrives ? 'Hide system volumes' : 'Show system volumes'}>
            <Tag 
              color={showSystemDrives ? 'orange' : 'default'} 
              style={{ cursor: 'pointer' }}
              onClick={() => setShowSystemDrives(!showSystemDrives)}
            >
              {showSystemDrives ? 'All' : 'User'}
            </Tag>
          </Tooltip>
        </div>
      </div>
      <div className="card-body disk-grid">
        {filteredDrives.map((fs, idx) => {
          const usagePercent = Number(fs.use?.toFixed(1) || 0);
          const usageColor = usagePercent > 90 ? '#ff7875' : usagePercent > 70 ? '#ffd666' : '#5dd39e';
          const isMainDrive = fs.mount === '/' || fs.mount === 'C:' || fs.mount === 'C:\\';
          return (
            <div key={idx} className={`disk-grid-item ${isMainDrive ? 'main-drive' : ''}`}>
              <div className="disk-grid-header">
                <HddOutlined style={{ color: usageColor, fontSize: 16 }} />
                <Tooltip title={fs.fs}>
                  <Typography.Text strong ellipsis className="disk-mount-name">
                    {fs.mount || fs.fs}
                  </Typography.Text>
                </Tooltip>
                <Tag className="disk-type-tag">{fs.type || 'Unknown'}</Tag>
              </div>
              <div className="disk-grid-gauge">
                <Progress
                  type="dashboard"
                  percent={usagePercent}
                  size={80}
                  strokeWidth={6}
                  strokeColor={usageColor}
                  trailColor="rgba(255,255,255,0.08)"
                  format={(p) => <span style={{ color: usageColor, fontSize: 14, fontWeight: 600 }}>{p}%</span>}
                />
              </div>
              <div className="disk-grid-stats">
                <div className="disk-stat-row">
                  <Typography.Text type="secondary">Used</Typography.Text>
                  <Typography.Text style={{ color: usageColor }}>{formatBytes(fs.used)}</Typography.Text>
                </div>
                <div className="disk-stat-row">
                  <Typography.Text type="secondary">Total</Typography.Text>
                  <Typography.Text>{formatBytes(fs.size)}</Typography.Text>
                </div>
                <div className="disk-stat-row">
                  <Typography.Text type="secondary">Free</Typography.Text>
                  <Typography.Text style={{ color: '#5dd39e' }}>{formatBytes(fs.available)}</Typography.Text>
                </div>
              </div>
            </div>
          );
        })}
        {filteredDrives.length === 0 && (
          <div className="disk-empty">
            <Typography.Text type="secondary">No drives to display</Typography.Text>
          </div>
        )}
      </div>
    </Card>
  ), [filteredDrives, stats.fsSize.length, formatBytes, showSystemDrives]);

  // System summary card
  const systemSummaryCard = useMemo(() => (
    <Card className="dashboard-card summary-card" bordered={false}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Statistic
            title={<><ClockCircleOutlined /> Uptime</>}
            value={formatUptime(stats.uptime)}
            valueStyle={{ fontSize: '16px', color: '#7cc4ff' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title={<><FundOutlined /> Processes</>}
            value={stats.processCount}
            valueStyle={{ fontSize: '16px', color: '#5dd39e' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title={<><SwapOutlined /> Total Network</>}
            value={`↓${formatBytes(stats.net.rxTotal, 1)} ↑${formatBytes(stats.net.txTotal, 1)}`}
            valueStyle={{ fontSize: '12px', color: '#b37feb' }}
          />
        </Col>
        <Col xs={12} sm={6}>
          <Statistic
            title={<><DatabaseOutlined /> Disk I/O</>}
            value={`R: ${formatBytes(stats.disks.rIO, 1)} W: ${formatBytes(stats.disks.wIO, 1)}`}
            valueStyle={{ fontSize: '12px', color: '#ffd666' }}
          />
        </Col>
      </Row>
    </Card>
  ), [stats, formatUptime, formatBytes]);

  return (
    <div className="task-manager">
      <div className="tm-header">
        <div className="tm-title-section">
          <Typography.Title level={2} className="tm-title">
            <DashboardOutlined /> System Monitor
          </Typography.Title>
          <Typography.Text className="tm-subtitle">
            {stats.cpuModel} • Real-time performance monitoring
          </Typography.Text>
        </div>
        <div className="tm-badges">
          <Badge status="processing" />
          <Tag color="processing" icon={<ThunderboltOutlined />}>Live</Tag>
          <Dropdown
            trigger={["click"]}
            menu={{
              items: refreshMenuItems,
              onClick: ({ key }) => setRefreshMs(Number(key)),
            }}
          >
            <Tag color="cyan" style={{ cursor: 'pointer' }}>
              Refreshing every {refreshMs / 1000}s
            </Tag>
          </Dropdown>
        </div>
      </div>

      {/* System Summary */}
      {systemSummaryCard}

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        className="tm-tabs"
        style={{ marginTop: 16 }}
        items={[
          {
            key: 'overview',
            label: 'Overview',
            children: (
              <div className="tm-overview">
                <Row gutter={[16, 16]}>
                  {/* CPU Card */}
                  <Col xs={24} lg={12} xl={6}>
                    <StatCard 
                      icon={<DesktopOutlined />} 
                      title="CPU" 
                      color="#7cc4ff"
                      extra={stats.cpuTemp && (
                        <Tag color={stats.cpuTemp > 80 ? 'red' : stats.cpuTemp > 60 ? 'orange' : 'green'}>
                          {stats.cpuTemp}°C
                        </Tag>
                      )}
                    >
                      <CircularGauge
                        percent={stats.cpuLoad}
                        label="Usage"
                        color="#7cc4ff"
                        subLabel={`${stats.cpuSpeed.toFixed(2)} GHz`}
                      />
                    </StatCard>
                  </Col>

                  {/* Memory Card - Fixed calculation */}
                  <Col xs={24} lg={12} xl={6}>
                    <StatCard 
                      icon={<DatabaseOutlined />} 
                      title="Memory" 
                      color="#5dd39e"
                      extra={<Tag color="blue">{formatBytes(stats.mem.available)} avail</Tag>}
                    >
                      <CircularGauge
                        percent={memUsage}
                        label="Used"
                        color="#5dd39e"
                        subLabel={`${formatBytes(stats.mem.used)} / ${formatBytes(stats.mem.total)}`}
                      />
                      {stats.mem.swaptotal > 0 && (
                        <div className="swap-info">
                          <Typography.Text className="swap-label">
                            Swap: {formatBytes(stats.mem.swapused)} / {formatBytes(stats.mem.swaptotal)} ({swapUsage}%)
                          </Typography.Text>
                        </div>
                      )}
                    </StatCard>
                  </Col>

                  {/* Disk I/O Card */}
                  <Col xs={24} lg={12} xl={6}>
                    <StatCard icon={<HddOutlined />} title="Disk I/O" color="#ffd666">
                      <div className="io-stats">
                        <MiniStat
                          label="Read Speed"
                          value={formatSpeed(stats.disks.read)}
                          color="#7cc4ff"
                          icon={<CloudDownloadOutlined />}
                        />
                        <MiniStat
                          label="Write Speed"
                          value={formatSpeed(stats.disks.write)}
                          color="#ffd666"
                          icon={<CloudUploadOutlined />}
                        />
                      </div>
                    </StatCard>
                  </Col>

                  {/* Network Card */}
                  <Col xs={24} lg={12} xl={6}>
                    <StatCard 
                      icon={<WifiOutlined />} 
                      title="Network" 
                      color="#b37feb"
                      extra={stats.net.iface && <Tag>{stats.net.iface}</Tag>}
                    >
                      <div className="io-stats">
                        <MiniStat
                          label="Download"
                          value={formatSpeed(stats.net.rx)}
                          color="#5dd39e"
                          icon={<CloudDownloadOutlined />}
                        />
                        <MiniStat
                          label="Upload"
                          value={formatSpeed(stats.net.tx)}
                          color="#ff7875"
                          icon={<CloudUploadOutlined />}
                        />
                      </div>
                    </StatCard>
                  </Col>
                </Row>

                {/* CPU Cores & Disk Usage */}
                <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                  <Col xs={24} lg={12}>
                    <Card className="dashboard-card" bordered={false}>
                      <div className="card-header">
                        <div className="card-icon" style={{ background: '#7cc4ff22', color: '#7cc4ff' }}>
                          <DesktopOutlined />
                        </div>
                        <Typography.Text className="card-title">CPU Cores ({stats.cpuCores.length})</Typography.Text>
                      </div>
                      <div className="card-body cores-grid">
                        {stats.cpuCores.map((load, idx) => (
                          <div key={idx} className="core-item">
                            <div className="core-header">
                              <Typography.Text className="core-label">Core {idx}</Typography.Text>
                              <Typography.Text style={{ 
                                color: load > 80 ? '#ff7875' : load > 50 ? '#ffd666' : '#5dd39e',
                                fontWeight: 600 
                              }}>
                                {load}%
                              </Typography.Text>
                            </div>
                            <Progress
                              percent={load}
                              size="small"
                              showInfo={false}
                              strokeColor={load > 80 ? '#ff7875' : load > 50 ? '#ffd666' : '#5dd39e'}
                              trailColor="rgba(255,255,255,0.08)"
                            />
                          </div>
                        ))}
                      </div>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    {diskUsageCard}
                  </Col>
                </Row>
              </div>
            ),
          },
          {
            key: 'processes',
            label: `Processes (${stats.processCount})`,
            children: (
              <div className="tm-processes">
                <div className="process-toolbar">
                  <Input
                    placeholder="Search by name, command, user, or PID..."
                    prefix={<SearchOutlined />}
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="process-search"
                    allowClear
                  />
                  <div className="process-info">
                    <Typography.Text className="process-count">
                      Showing {filteredProcesses.length} of {processes.length} processes
                    </Typography.Text>
                    <Tag color="blue"><UserOutlined /> Total: {stats.processCount}</Tag>
                  </div>
                </div>
                <Table
                  columns={processColumns}
                  dataSource={filteredProcesses}
                  pagination={{ 
                    pageSize: 20, 
                    showSizeChanger: true,
                    pageSizeOptions: ['10', '20', '50', '100'],
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total}`,
                  }}
                  size="small"
                  className="process-table"
                  scroll={{ x: 800, y: 'calc(100vh - 400px)' }}
                />
              </div>
            ),
          },
        ]}
      />
    </div>
  );
};

export default memo(TaskManager);
