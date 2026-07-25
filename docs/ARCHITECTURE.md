# Architecture

SysPeek is split into three isolated parts that electron-vite builds independently: the main process, the preload bridge, and the renderer.

## Process model

```text
+-------------------+        contextBridge         +----------------------+
|   Renderer (UI)   |  <------------------------>  |   Preload (bridge)   |
|  React + antd     |     window.sysapi / updater  |  whitelisted funcs   |
+-------------------+                              +----------+-----------+
                                                              | ipcRenderer.invoke / on
                                                              v
                                                   +----------------------+
                                                   |     Main process     |
                                                   |  systeminformation   |
                                                   |  store, tray, updater|
                                                   +----------------------+
```

The renderer never touches Node. It calls typed functions on `window.sysapi` and `window.updater`, which the preload defines. The preload forwards each call to the main process over a named IPC channel. The main process is the only place that reads hardware, touches the file system, or talks to the OS.

## Modules

### Main (`src/main`)

- `index.ts` owns the app lifecycle: it creates the splash and main windows with the secure `webPreferences`, applies the Content Security Policy, locks down navigation, registers IPC handlers, runs the single consolidated polling loop, and wires the tray, menu, and updater.
- `sysinfo.ts` gathers data with `systeminformation`. `getStatic` returns the one time hardware inventory (cached). `getDynamic` returns the live snapshot that gets pushed to the UI. `getProcesses` returns the sorted process list.
- `store.ts` persists settings and window bounds with electron-store.
- `updater.ts` wires electron-updater events to the renderer and exposes check and install actions.
- `tray.ts`, `menu.ts`, and `elevate.ts` handle the tray icon, the application menu, and the Windows elevation relaunch.

### Preload (`src/preload`)

- `index.ts` builds the `sysapi` and `updater` objects and exposes them with `contextBridge`. It is the only file allowed to use `ipcRenderer`. Each method maps to exactly one channel.
- `index.d.ts` declares the `window.sysapi` and `window.updater` globals so the renderer is fully typed.

### Shared (`src/shared`)

- `ipc.ts` is the single source of truth. It holds the channel name constants and the TypeScript interfaces for every payload (`StaticInfo`, `DynamicStats`, `ProcessInfo`, `AppSettings`, `UpdateStatus`, and the `SysApi` and `UpdaterApi` bridge shapes).

### Renderer (`src/renderer`)

- `src/App.tsx` bootstraps settings, metadata, and the static inventory, subscribes to the live stats stream, and renders the shell, navigation, footer, settings panel, and update banner.
- `src/Components` contains the dashboard (`TaskManager`), the detail pages, the settings panel, the charts, and the update banner.
- `src/lib/api.ts` re-exports the preload bridge so components import `sysapi` and `updater` from one place.

## Data flow

Static hardware data is fetched once through `sysapi.getStatic()` and passed to the detail pages as props. Live telemetry is computed on one interval in the main process and pushed to the renderer through `sysapi.onStats()`, which keeps the dashboard and the history charts current without the UI polling anything. The refresh interval is a setting, so changing it in the panel updates the main process loop.
