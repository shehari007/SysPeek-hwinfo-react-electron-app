import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Layout,
  Menu,
  Spin,
  Grid,
  ConfigProvider,
  App as AntApp,
  theme
} from 'antd'
import type { MenuProps } from 'antd'
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
} from '@ant-design/icons'
import type { StaticInfo, SystemMeta, AppSettings } from '@shared/ipc'
import { sysapi, updater } from './lib/api'
import Topbar from './Components/Layout/Topbar'
import Brand from './Components/Layout/Brand'
import StatusBar from './Components/Layout/StatusBar'
import SystemInfo from './Components/SystemInfo/SystemInfo'
import CPU from './Components/CPU/CPU'
import MemoryInfo from './Components/MemoryInfo/MemoryInfo'
import Graphics from './Components/Graphics/Graphics'
import Battery from './Components/Battery/Battery'
import OS from './Components/OS/OS'
import StorageDevices from './Components/StorageDevices/StorageDevices'
import NetworkInterfaces from './Components/NetworkInterfaces/NetworkInterfaces'
import WifiNetworks from './Components/WifiNetworks/WifiNetworks'
import Display from './Components/Display/Display'
import Audio from './Components/Audio/Audio'
import Bluetooth from './Components/Bluetooth/Bluetooth'
import Printers from './Components/Printers/Printers'
import USB from './Components/USB/USB'
import TaskManager from './Components/TaskManager/TaskManager'
import About from './Components/About/About'
import SettingsPanel from './Components/Settings/SettingsPanel'
import UpdateBanner from './Components/Updates/UpdateBanner'

const { Footer, Sider, Content } = Layout
const { useBreakpoint } = Grid


const menuConfig: MenuProps['items'] = [
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
  { key: 'about', label: 'About', icon: <QuestionCircleOutlined /> }
]

const SECTION_META: Record<string, { title: string; icon: React.ReactNode }> = {
  dashboard: { title: 'System Monitor', icon: <DashboardOutlined /> },
  system: { title: 'System Information', icon: <InfoCircleOutlined /> },
  cpu: { title: 'Processor', icon: <ThunderboltOutlined /> },
  memory: { title: 'Memory', icon: <DatabaseOutlined /> },
  graphics: { title: 'Graphics', icon: <DesktopOutlined /> },
  display: { title: 'Displays', icon: <PictureOutlined /> },
  storage: { title: 'Storage', icon: <HddOutlined /> },
  network: { title: 'Network', icon: <GlobalOutlined /> },
  wifi: { title: 'WiFi Networks', icon: <WifiOutlined /> },
  battery: { title: 'Battery', icon: <ThunderboltOutlined /> },
  os: { title: 'Operating System', icon: <AppleOutlined /> },
  audio: { title: 'Audio', icon: <SoundOutlined /> },
  bluetooth: { title: 'Bluetooth', icon: <SettingOutlined /> },
  printers: { title: 'Printers', icon: <PrinterOutlined /> },
  usb: { title: 'USB Devices', icon: <UsbOutlined /> },
  about: { title: 'About SysPeek', icon: <QuestionCircleOutlined /> }
}

function AppShell(): React.JSX.Element {
  const [staticInfo, setStaticInfo] = useState<StaticInfo | null>(null)
  const [meta, setMeta] = useState<SystemMeta | null>(null)
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedKey, setSelectedKey] = useState('dashboard')
  const [collapsed, setCollapsed] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const screens = useBreakpoint()

  // Bootstrap: settings, meta and the one-shot static inventory.
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const [s, m] = await Promise.all([sysapi.getSettings(), sysapi.getMeta()])
        if (!mounted) return
        setSettings(s)
        setMeta(m)
        const data = await sysapi.getStatic()
        if (!mounted) return
        setStaticInfo(data)
        setLoading(false)
      } catch (err) {
        if (!mounted) return
        setError(err instanceof Error ? err.message : 'Failed to load system information')
        setLoading(false)
      } finally {
        sysapi.notifyLoaded()
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  // Keep in sync when settings change elsewhere, and react to the menu action.
  useEffect(() => sysapi.onSettingsChange((s) => setSettings(s)), [])
  useEffect(() => sysapi.onOpenSettings(() => setSettingsOpen(true)), [])

  useEffect(() => {
    setCollapsed(!screens.lg)
  }, [screens])

  // Reset the content scroll position when switching pages. This runs in a frame
  // after commit so the incoming page has already been laid out, and assigns
  // scrollTop directly, which is the most reliable way to land at the top.
  useEffect(() => {
    const el = document.querySelector<HTMLElement>('.main-content')
    if (!el) return
    const frame = requestAnimationFrame(() => {
      el.scrollTop = 0
    })
    return () => cancelAnimationFrame(frame)
  }, [selectedKey])

  const isDark = settings?.theme !== 'light'
  useEffect(() => {
    document.documentElement.dataset.theme = isDark ? 'dark' : 'light'
  }, [isDark])

  const handleMenuChange = useCallback<NonNullable<MenuProps['onClick']>>(
    (e) => setSelectedKey(e.key),
    []
  )

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    const next = await sysapi.setSettings(patch)
    setSettings(next)
  }, [])

  const renderContent = useCallback(() => {
    if (selectedKey === 'dashboard') {
      return <TaskManager settings={settings} />
    }
    if (loading) {
      return (
        <div className="center-loading">
          <Spin size="large" description="Loading system information…" />
        </div>
      )
    }
    if (error) {
      return <div className="error-state">{error}</div>
    }
    switch (selectedKey) {
      case 'system':
        return <SystemInfo siData={staticInfo} />
      case 'cpu':
        return <CPU siData={staticInfo} />
      case 'memory':
        return <MemoryInfo siData={staticInfo} />
      case 'graphics':
        return <Graphics siData={staticInfo} />
      case 'display':
        return <Display siData={staticInfo} />
      case 'storage':
        return <StorageDevices siData={staticInfo} />
      case 'network':
        return <NetworkInterfaces siData={staticInfo} />
      case 'wifi':
        return <WifiNetworks siData={staticInfo} />
      case 'battery':
        return <Battery siData={staticInfo} />
      case 'os':
        return <OS siData={staticInfo} />
      case 'audio':
        return <Audio siData={staticInfo} />
      case 'bluetooth':
        return <Bluetooth siData={staticInfo} />
      case 'printers':
        return <Printers siData={staticInfo} />
      case 'usb':
        return <USB siData={staticInfo} />
      case 'about':
        return <About meta={meta} />
      default:
        return <TaskManager settings={settings} />
    }
  }, [selectedKey, loading, error, staticInfo, meta, settings])

  const themeConfig = useMemo(
    () => ({
      algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
      token: {
        colorPrimary: settings?.accentColor || '#3b82f6',
        borderRadius: 12,
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      },
      components: {
        Menu: {
          itemBg: 'transparent',
          subMenuItemBg: 'transparent',
          itemSelectedBg: 'rgba(59, 130, 246, 0.18)',
          itemHoverBg: 'rgba(255, 255, 255, 0.05)'
        }
      }
    }),
    [isDark, settings?.accentColor]
  )

  return (
    <ConfigProvider theme={themeConfig}>
      <AntApp>
        <Layout className="app-shell">
          <Sider
            className="app-sider"
            /* antd's Sider defaults to theme="dark", which is what left the
               collapse trigger dark in light mode. */
            theme={isDark ? 'dark' : 'light'}
            collapsible
            collapsed={collapsed}
            onCollapse={setCollapsed}
            breakpoint="lg"
            width={240}
            collapsedWidth={80}
          >
            <Brand collapsed={collapsed} meta={meta} />
            <Menu
              className="app-menu"
              mode="inline"
              theme={isDark ? 'dark' : 'light'}
              selectedKeys={[selectedKey]}
              onClick={handleMenuChange}
              items={menuConfig}
            />
          </Sider>
          <Layout className="main-layout">
            <Topbar
              title={SECTION_META[selectedKey]?.title ?? 'SysPeek'}
              icon={SECTION_META[selectedKey]?.icon}
              onExport={() => sysapi.exportReport()}
              onSettings={() => setSettingsOpen(true)}
              onCheckUpdates={() => updater.check()}
            />
            <UpdateBanner />
            <Content className="main-content">{renderContent()}</Content>
            <Footer className="app-footer">
              <StatusBar meta={meta} staticInfo={staticInfo} />
            </Footer>
          </Layout>
        </Layout>
        <SettingsPanel
          open={settingsOpen}
          settings={settings}
          meta={meta}
          onClose={() => setSettingsOpen(false)}
          onChange={updateSettings}
        />
      </AntApp>
    </ConfigProvider>
  )
}

export default function App(): React.JSX.Element {
  return <AppShell />
}
