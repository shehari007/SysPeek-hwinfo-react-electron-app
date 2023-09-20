
import './App.css';
import { Layout, Menu } from 'antd';
import { useEffect, useState } from 'react';
import SystemInfo from './Components/SystemInfo/SystemInfo';
import CPU from './Components/CPU/CPU';
import MemoryInfo from './Components/MemoryInfo/MemoryInfo';
import Graphics from './Components/Graphics/Graphics';
import Battery from './Components/Battery/Battery';
import OS from './Components/OS/OS';
import StorageDevices from './Components/StorageDevices/StorageDevices';
import NetworkInterfaces from './Components/NetworkInterfaces/NetworkInterfaces';
import WifiNetworks from './Components/WifiNetworks/WifiNetworks';
const { Footer, Sider, Content } = Layout;
const si = window.require('systeminformation');

function App() {
  const [siObject, setsiObject] = useState(null);
  const [selectedMenuItemKey, setSelectedMenuItemKey] = useState('1');
  const handleMenuChange = (selectedKey) => {
    setSelectedMenuItemKey(selectedKey);
  };
  const obj = {
    cpu: '*',
    cpuCache: '*',
    mem: '*',
    memLayout: '*',
    graphics: 'controllers',
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
  }
  useEffect(() => {
    si.get(obj).then(data => setsiObject(data));
  }, [])
  return (

    <Layout hasSider>
      <Sider
        className='sider'
        style={{

          height: '100%',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div className="demo-logo-vertical" align="center" ><img align="center" src='logo192.png' height={64} width={64} alt='logo' /></div>
        {selectedMenuItemKey !== null ? (
          <Menu
            mode="vertical"
            theme='dark'
            defaultSelectedKeys={selectedMenuItemKey}
            onSelect={(e) => handleMenuChange(e.key)}
            style={{
              height: '100%',
            }}
            selectedKeys={selectedMenuItemKey}
          >
            <Menu.Item key="1">System Info</Menu.Item>
            <Menu.Item key="2">CPU</Menu.Item>
            <Menu.Item key="3">Memory</Menu.Item>
            <Menu.Item key="4">Graphics</Menu.Item>
            <Menu.Item key="5">Battery</Menu.Item>
            <Menu.Item key="6">OS</Menu.Item>
            <Menu.Item key="7">Storage Devices</Menu.Item>
            <Menu.Item key="8">Network Interfaces</Menu.Item>
            <Menu.Item key="9">Wifi Networks</Menu.Item>
          </Menu>
        ) : null}
      </Sider>
      <Layout
        className="site-layout"
        style={{
          marginLeft: 200,
          background: 'white',

        }}
      >
        {/* <Header
          style={{
            position: 'fixed',
            padding: 0,
            background: 'black',
          }}
        /> */}
        <Content
          style={{
            margin: '24px 16px 0',
            overflow: 'initial',
            justifyContent: 'center',

          }}
        ><div >
            {selectedMenuItemKey === '1' ?
              <SystemInfo siData={siObject} />
              :
              selectedMenuItemKey === '2' ?
                <CPU siData={siObject} />
                :
                selectedMenuItemKey === '3' ?
                  <MemoryInfo siData={siObject} />
                  :
                  selectedMenuItemKey === '4' ?
                    <Graphics siData={siObject} />
                    :
                    selectedMenuItemKey === '5' ?
                      <Battery siData={siObject} />
                      :
                      selectedMenuItemKey === '6' ?
                        <OS siData={siObject} />
                        :
                        selectedMenuItemKey === '7' ?
                          <StorageDevices siData={siObject} />
                          :
                          selectedMenuItemKey === '8' ?
                            <NetworkInterfaces siData={siObject} />
                            :
                            selectedMenuItemKey === '9' ?
                              <WifiNetworks siData={siObject} />
                              :
                              null}
          </div>
        </Content>
        <Footer
          style={{
            textAlign: 'center',
          }}
        >
          SYSPeek - System Information Viewer {new Date().getFullYear()} Made With By Muhammad Sheharyar Butt
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App;
