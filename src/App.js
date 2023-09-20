
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
import Display from './Components/Display/Display';
const { Footer, Sider, Content } = Layout;
const si = window.require('systeminformation');
const { ipcRenderer } = window.require('electron');
function App() {
  const [siObject, setsiObject] = useState(null);
  const [selectedMenuItemKey, setSelectedMenuItemKey] = useState('0');
  const handleMenuChange = (selectedKey) => {
    setSelectedMenuItemKey(selectedKey);
  };
  const obj = {
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
  }
  useEffect(() => {
    si.get(obj)
      .then(data => {
       
        setsiObject(data);
  
        
        ipcRenderer.send('async-operation-complete');
      });
  }, []);
  
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
        <div className="demo-logo-vertical" align="center" ><img style={{marginBottom: '10px', marginTop:'20px'}} align="center" src='logo192.png' height={80} width={90} alt='logo' /></div>
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
            <Menu.Item key="1"><span ><img style={{marginRight: '10px', marginBottom: '-7px'}}  src='menuIcons/system-info.png' height={25} width={25}></img></span>System Info</Menu.Item>
            <Menu.Item key="2"><span ><img style={{marginRight: '10px', marginBottom: '-7px'}}  src='menuIcons/cpu.png' height={25} width={25}></img></span>CPU</Menu.Item>
            <Menu.Item key="3"><span ><img style={{marginRight: '10px', marginBottom: '-7px'}}   src='menuIcons/ram.png' height={25} width={25}></img></span>Memory</Menu.Item>
            <Menu.Item key="4"><span ><img style={{marginRight: '10px', marginBottom: '-7px'}}   src='menuIcons/gpu.png' height={25} width={25}></img></span>Graphics</Menu.Item>
            <Menu.Item key="10"><span ><img style={{marginRight: '10px', marginBottom: '-7px'}}  src='menuIcons/display.png' height={25} width={25}></img></span>Display</Menu.Item>
            <Menu.Item key="5"><span ><img style={{marginRight: '10px', marginBottom: '-7px'}}   src='menuIcons/battery.png' height={25} width={25}></img></span>Battery</Menu.Item>
            <Menu.Item key="6"><span ><img style={{marginRight: '10px', marginBottom: '-7px'}}   src='menuIcons/windows.png' height={25} width={25}></img></span>OS</Menu.Item>
            <Menu.Item key="7"><span ><img style={{marginRight: '10px', marginBottom: '-7px'}}   src='menuIcons/hdd.png' height={25} width={25}></img></span>Storage Devices</Menu.Item>
            <Menu.Item key="8"><span ><img style={{marginRight: '10px', marginBottom: '-7px'}}   src='menuIcons/computer-networks.png' height={25} width={25}></img></span>Network Interfaces</Menu.Item>
            <Menu.Item key="9"><span ><img style={{marginRight: '10px', marginBottom: '-7px'}}   src='menuIcons/wifi.png' height={25} width={25}></img></span>Wifi Networks</Menu.Item>
          </Menu>
        ) : null}
      </Sider>
      <Layout
        className="site-layout"
        style={{
          marginLeft: 200,
          // background: 'white',

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
                              selectedMenuItemKey === '10' ?
                              <Display siData={siObject} />
                              :
                              null}
          </div>
        </Content>
        <Footer
        className='footer'
          style={{
            textAlign: 'center',
          }}
        >
         v0.1.8 SYSPeek - System Information Viewer {new Date().getFullYear()} Made With ❤ By Muhammad Sheharyar Butt
        </Footer>
      </Layout>
    </Layout>
  );
}

export default App;
