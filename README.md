

<div align="center">
  <a href="https://choosealicense.com/licenses/mit/">
    <img src="https://img.shields.io/badge/LICENSE-MIT-blue?style=flat-square" alt="MIT License">
  </a>
  
  <img src="https://img.shields.io/badge/BUILD-PASSING-green?style=flat-square" alt="Build Passing">
</div>

<br/>



<div align="center">
    <img src="https://github.com/shehari007/SysPeek-hwinfo-react-electron-app/blob/main/public/logo192.png?raw=true" height="250px" width="250px">
</div>



# SysPeek System Information Viewer

SysPeek is a modern Electron + React desktop app to inspect and monitor your machine in one place. The new glassmorphism UI delivers a Task Manager-style home, responsive layout, and quick access to CPU, memory, storage, network, and peripherals with live metrics.

## Tech Stack

**CLIENT:** React 18, Hooks, Ant Design 5, Electron, Recharts/Chart.js

**SYSTEM API:** [systeminformation](https://systeminformation.io/)

**Key Dependencies (current):** Electron 26.2.1, React 18.2.0, Ant Design 5.9.2, systeminformation 5.27.13, Recharts/Chart.js


## Features

- Live Task Manager-style dashboard with CPU, memory, disk I/O, network, uptime, and per-core load
- Detailed pages for System, CPU, Memory, Graphics, Display, Storage, Network, WiFi, Battery, Audio, Bluetooth, Printers, USB
- Disk grid with system-drive toggle, WiFi scanner, and process list with sorting/search
- Dynamic version/architecture display and About screen with credits and tech stack
- Sticky footer and responsive sider with scroll for long menus
- Cross-platform: Windows, macOS, Linux

## Screenshots

<div align="center">
  <table>
    <tr>
      <td align="center">
        <img src="./screenshots/1.png" alt="SysPeek Dashboard" width="100%">
        <br>
        <em>Task Manager Dashboard - Live system metrics at a glance</em>
      </td>
    </tr>
    <tr>
      <td align="center">
        <img src="./screenshots/2.png" alt="SysPeek Details View" width="100%">
        <br>
        <em>Detailed Hardware Information View</em>
      </td>
    </tr>
  </table>
</div>

## Getting Started (dev)

Prereqs: Node 18+, npm

```bash
git clone https://github.com/shehari007/SysPeek-hwinfo-react-electron-app.git
cd SysPeek-hwinfo-react-electron-app
npm install
npm run electron:start
```
The app opens in Electron (not the browser). Happy hacking!
## Build / Package

Configured for Windows, Linux, macOS. Run one of:

```bash
npm run electron:package:win    # Windows (.exe)
npm run electron:package:linux  # Linux (.deb)
npm run electron:package:mac    # macOS (.dmg)
```

## Changelog

### 1.1.0
- New glassmorphism UI, sticky footer, scrollable sidebar
- Task Manager homepage with live CPU/memory/disk/net, per-core gauges, process search and sorting
- Disk grid with system-drive toggle; WiFi scanner improvements
- Dynamic version/architecture display and About page with GitHub/profile links
- Splash flow refinements and maximized main window on start
- Dependencies refreshed: Electron 26.2.x, Ant Design 5.9.x, systeminformation 5.27.x
## License

[MIT](https://choosealicense.com/licenses/mit/)


## Feedback

If you have any feedback, please reach out at shehariyar@gmail.com
dont't forget to give us a star if you like this project.

## Liked my dedication? Buy me a coffee?
<a href="https://www.buymeacoffee.com/shehari007">☕ Buy Me A Coffee</a>
