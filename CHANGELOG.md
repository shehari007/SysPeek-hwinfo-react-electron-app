# Changelog

All notable changes to SysPeek are documented here. This project follows [Semantic Versioning](https://semver.org/).

## 2.0.0

Version 2 is a full rewrite of the build system and the application architecture.

### Added

- Automatic updates through GitHub releases using electron-updater, with an in app "Restart and Install" prompt and a download progress banner.
- Release tooling that builds installers locally and verifies them before upload. `npm run release:win` packages the installer and then recomputes every sha512 and size in the generated `latest.yml` against the files on disk, so a manifest that does not describe its artifacts is caught before it reaches a user rather than after.
- macOS detects updates but does not install them, because Squirrel refuses an application bundle that is not signed with an Apple Developer ID. Rather than downloading an archive that can never be applied, the update banner links to the releases page.
- Live history charts for CPU and memory built with uPlot.
- System tray with a live CPU and memory readout and quick actions.
- Desktop notifications when CPU temperature, CPU load, memory, or disk usage cross configurable thresholds.
- Settings panel with theme (dark or light), accent color, refresh interval, tray behavior, launch at startup, and alert thresholds. Settings persist with electron-store.
- One click JSON report export of the full machine inventory and live stats.
- Optional "Relaunch as Administrator" on Windows to expose sensor data that requires elevation.
- Window position and size are remembered between sessions.
- A professional animated splash screen.
- A proper application menu with reload, zoom, update check, and help actions.

### Changed

- Build tooling moved from Create React App to electron-vite with Vite 7. Development now has hot reload for both the renderer and the main process.
- The entire codebase is now TypeScript: main process, preload bridge, and all React components, sharing a single IPC contract.
- Live telemetry is gathered on one consolidated interval in the main process and pushed to the renderer, instead of polling from the UI.
- Dependencies upgraded to Electron 43, React 19, Ant Design 6, systeminformation 5.33, electron-builder 26, and TypeScript 6.

### Security

- The renderer is fully sandboxed with context isolation on and Node integration off. `systeminformation` runs only in the main process.
- All access from the UI goes through a small, explicitly whitelisted preload bridge with one function per capability.
- Incoming IPC is validated against the main window.
- A strict Content Security Policy is applied, and navigation and window creation are locked down.
- Removed the insecure `nodeIntegration: true` and `contextIsolation: false` configuration and the direct `window.require` usage in the renderer.
- Removed the deprecated `protocol.registerHttpProtocol` call that no longer exists in current Electron.

## 1.1.0

- New glassmorphism UI, sticky footer, scrollable sidebar.
- Task Manager homepage with live CPU, memory, disk, and network readouts, per core gauges, and process search and sorting.
- Disk grid with a system drive toggle and WiFi scanner improvements.
- Dynamic version and architecture display, plus an About page with GitHub and profile links.
- Splash flow refinements and a maximized main window on start.
