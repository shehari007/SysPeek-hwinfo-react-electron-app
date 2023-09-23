

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

With SysPeek, users can quickly access vital information about their system, including details about the CPU, memory, storage, operating system, network connections, and more. This user-friendly tool offers a straightforward interface, making it easy for both novice and experienced users.

## Tech Stack

**CLIENT:** React, Hooks, Ant Design 5+, Electron, Node

**SYSTEM API:** SystemInformation npm package from -> (https://systeminformation.io/)


## Features

- Get detailed insights into your computer's hardware components.
-  Access info about your OS, Hardware, software, and drivers and many more.
- Monitor CPU, disk, and network usage in real-time. _(in progress..)_
- View IP, DNS, and network adapters information.
- Check disk space and file system details.
- Show current detected Bluetooth, WiFi, Printers, USB Devices.
- Deployable on Windows, Linux, macOS 

## Screenshots

<details>
  <summary>See SS here.</summary>
  <div align="center">
  <h4>App View</h4>
  <img src="https://github.com/shehari007/SysPeek-hwinfo-react-electron-app/blob/main/screenshots/syspeek%20(1).png?raw=true" name="image-1">
  <h4>Home (About) View</h4>
  <img src="https://github.com/shehari007/SysPeek-hwinfo-react-electron-app/blob/main/screenshots/syspeek%20(2).png?raw=true" name="image-2">
  </div>
</details>

## Pre Requirements For Local Development

- React 18+
- Node, NPM
- Python with pip
- VSCODE With ES6+ Module
## Installation

Clone the project

```bash
git clone https://github.com/shehari007/SysPeek-hwinfo-react-electron-app.git
```

Go to the project directory

```bash
cd SysPeek-hwinfo-ract-electron-app
```

Install dependencies

```bash
npm install
```

Start the Electron Project in Windows

```bash
npm run electron:start
```
Project will open in window mode not in browser as normal react app would, Happy Hacking!
## Deployment

Deployment is never been easy before, package.json is already configured for every platform (Window, Linux, MacOs). Just need to run build commands for each platform as follows:
## For Windows
```bash
npm run electron:package:win
```
## For Linux
```bash
npm run electron:package:linux
```
## For MacOS
```bash
npm run electron:package:mac
```
Running these commands will give you a package file (Windows->NSIS .exe) || (Linux->.deb) || (macOS->.dmg).
## License

[MIT](https://choosealicense.com/licenses/mit/)


## Feedback

If you have any feedback, please reach out at shehariyar@gmail.com
dont't forget to give us a star if you like this project.

## Liked my dedication? Buy me a coffee?
<a href="https://www.buymeacoffee.com/shehari007">☕ Buy Me A Coffee</a>
