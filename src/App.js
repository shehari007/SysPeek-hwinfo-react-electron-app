
import './App.css';
import { Layout, Menu, Spin, Grid, Typography, ConfigProvider, theme } from 'antd';
import { useEffect, useMemo, useState, useCallback, memo } from 'react';
import SystemInfo from './Components/SystemInfo/SystemInfo';
import CPU from './Components/CPU/CPU';
import MemoryInfo from './Components/MemoryInfo/MemoryInfo';
import Graphics from './Components/Graphics/Graphics';
import Battery from './Components/Battery/Battery';
import OS from './Components/OS/OS';
import StorageDevices from './Components/StorageDevices/StorageDevices';
import NetworkInterfaces from './Components/NetworkInterfaces/NetworkInterfaces';
import WifiNetworks from './Components/WifiNetworks/WifiNetworks';
import Display from './Components/Display/Display';
import Audio from './Components/Audio/Audio';
import Bluetooth from './Components/Bluetooth/Bluetooth';
import Printers from './Components/Printers/Printers';
import USB from './Components/USB/USB';
import TaskManager from './Components/TaskManager/TaskManager';
import About from './Components/About/About';
import {
  DashboardOutlined,
  DesktopOutlined,
  HddOutlined,
  ThunderboltOutlined,
  PictureOutlined,
  SettingOutlined,
  DatabaseOutlined,
  WifiOutlined,
  GlobalOutlined,
  SoundOutlined,
  PrinterOutlined,
  UsbOutlined,
  InfoCircleOutlined,
  AppleOutlined,
  QuestionCircleOutlined
} from '@ant-design/icons';

const { Footer, Sider, Content } = Layout;
const { useBreakpoint } = Grid;
const si = window.require('systeminformation');
const { ipcRenderer } = window.require('electron');
const packageJson = require('../package.json');

// App version and info
const APP_VERSION = packageJson.version;
const APP_NAME = 'SysPeek';

// Menu items with icons
const menuConfig = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardOutlined /> },
  { type: 'divider' },
  { key: 'system', label: 'System Info', icon: <InfoCircleOutlined /> },
  { key: 'cpu', label: 'CPU', icon: <ThunderboltOutlined /> },
  { key: 'memory', label: 'Memory', icon: <DatabaseOutlined /> },
  { key: 'graphics', label: 'Graphics', icon: <DesktopOutlined /> },
  { key: 'display', label: 'Display', icon: <PictureOutlined /> },
  { key: 'storage', label: 'Storage', icon: <HddOutlined /> },
  { type: 'divider' },
  { key: 'network', label: 'Network', icon: <GlobalOutlined /> },
  { key: 'wifi', label: 'WiFi', icon: <WifiOutlined /> },
  { type: 'divider' },
  { key: 'battery', label: 'Battery', icon: <ThunderboltOutlined /> },
  { key: 'os', label: 'OS', icon: <AppleOutlined /> },
  { type: 'divider' },
  { key: 'audio', label: 'Audio', icon: <SoundOutlined /> },
  { key: 'bluetooth', label: 'Bluetooth', icon: <SettingOutlined /> },
  { key: 'printers', label: 'Printers', icon: <PrinterOutlined /> },
  { key: 'usb', label: 'USB', icon: <UsbOutlined /> },
  { type: 'divider' },
  { key: 'about', label: 'About', icon: <QuestionCircleOutlined /> },
];

function App() {
  const [siObject, setsiObject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedKey, setSelectedKey] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [systemArch, setSystemArch] = useState('');
  const screens = useBreakpoint();

  // Fetch system architecture on mount
  useEffect(() => {
    si.osInfo().then(info => {
      setSystemArch(info.arch || process.arch);
    }).catch(() => {
      setSystemArch(process.arch);
    });
  }, []);

  const handleMenuChange = useCallback((e) => setSelectedKey(e.key), []);

  const systemInfoQuery = useMemo(() => ({
    cpu: '*',
    cpuCache: '*',
    mem: '*',
    memLayout: '*',
    graphics: 'controllers, displays',
    battery: '*',
    osInfo: '*',
    uuid: '*',
    versions: '*',
    diskLayout: '*',
    networkInterfaces: '*',
    networkGatewayDefault: '*',
    networkInterfaceDefault: '*',
    wifiNetworks: '*',
    system: '*',
    bios: '*',
    baseboard: '*',
    chassis: '*',
    audio: '*',
    bluetoothDevices: '*',
    printer: '*',
    usb: '*'
  }), []);

  useEffect(() => {
    setCollapsed(!screens.lg);
  }, [screens]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        const data = await si.get(systemInfoQuery);
        if (!mounted) return;
        setsiObject(data);
        setLoading(false);
        ipcRenderer.send('async-operation-complete');
      } catch (err) {
        setError(err.message || 'Failed to load system info');
        setLoading(false);
        ipcRenderer.send('async-operation-complete');
      }
    };
    load();
    return () => { mounted = false; };
  }, [systemInfoQuery]);

  const menuItems = useMemo(() =>
    menuConfig.map(item =>
      item.type === 'divider'
        ? { type: 'divider' }
        : {
            key: item.key,
            icon: item.icon,
            label: item.label,
          }
    ),
    []
  );

  const renderContent = useCallback(() => {
    if (selectedKey === 'dashboard') {
      return <TaskManager />;
    }

    if (loading) {
      return (
        <div className="center-loading">
          <Spin size="large" tip="Loading system information..." />
        </div>
      );
    }

    if (error) {
      return <div className="error-state">{error}</div>;
    }

    switch (selectedKey) {
      case 'system': return <SystemInfo siData={siObject} />;
      case 'cpu': return <CPU siData={siObject} />;
      case 'memory': return <MemoryInfo siData={siObject} />;
      case 'graphics': return <Graphics siData={siObject} />;
      case 'display': return <Display siData={siObject} />;
      case 'storage': return <StorageDevices siData={siObject} />;
      case 'network': return <NetworkInterfaces siData={siObject} />;
      case 'wifi': return <WifiNetworks siData={siObject} />;
      case 'battery': return <Battery siData={siObject} />;
      case 'os': return <OS siData={siObject} />;
      case 'audio': return <Audio siData={siObject} />;
      case 'bluetooth': return <Bluetooth siData={siObject} />;
      case 'printers': return <Printers siData={siObject} />;
      case 'usb': return <USB siData={siObject} />;
      case 'about': return <About version={APP_VERSION} arch={systemArch} />;
      default: return <TaskManager />;
    }
  }, [selectedKey, loading, error, siObject]);

  const darkTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#3b82f6',
      colorBgContainer: 'rgba(15, 23, 42, 0.8)',
      colorBgElevated: 'rgba(15, 23, 42, 0.95)',
      colorBorder: 'rgba(255, 255, 255, 0.08)',
      colorText: '#e2e8f0',
      colorTextSecondary: 'rgba(226, 232, 240, 0.7)',
      borderRadius: 12,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    },
    components: {
      Menu: {
        darkItemBg: 'transparent',
        darkSubMenuItemBg: 'transparent',
        darkItemSelectedBg: 'rgba(59, 130, 246, 0.2)',
        darkItemHoverBg: 'rgba(255, 255, 255, 0.05)',
      },
      Card: {
        colorBgContainer: 'rgba(15, 23, 42, 0.6)',
      },
      Table: {
        colorBgContainer: 'rgba(15, 23, 42, 0.4)',
        headerBg: 'rgba(15, 23, 42, 0.8)',
      },
    },
  };

  return (
    <ConfigProvider theme={darkTheme}>
      <Layout className="app-shell">
        <Sider
          className="app-sider"
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          breakpoint="lg"
          width={240}
          collapsedWidth={80}
        >
          <div className="brand">
            <div className="brand-logo">
              <img src='logo192.png' height={40} width={40} alt='SysPeek' />
            </div>
            {!collapsed && (
              <div className="brand-info">
                <span className="brand-name">{APP_NAME}</span>
                <span className="brand-version">v{APP_VERSION}</span>
              </div>
            )}
          </div>
          <Menu
            className='app-menu'
            mode="inline"
            theme='dark'
            selectedKeys={[selectedKey]}
            onClick={handleMenuChange}
            items={menuItems}
          />
        </Sider>
        <Layout className="main-layout">
          <Content className="main-content">
            {renderContent()}
          </Content>
          <Footer className='app-footer'>
            <span>{APP_NAME} v{APP_VERSION}</span>
            <span className="footer-divider">•</span>
            <span>{systemArch}</span>
            <span className="footer-divider">•</span>
            <span>{new Date().getFullYear()}</span>
            <span className="footer-divider">•</span>
            <span>Made with ❤️ by <span 
              style={{ color: '#3b82f6', cursor: 'pointer' }}
              onClick={() => ipcRenderer.send('open-external-link', 'https://github.com/shehari007')}
            >Muhammad Sheharyar Butt</span></span>
          </Footer>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}

export default memo(App);
