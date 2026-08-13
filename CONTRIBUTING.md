# Contributing to SysPeek

Thanks for your interest in improving SysPeek. This guide covers local setup and the conventions the project follows.

## Prerequisites

- Node 20.19 or newer (Node 22 recommended)
- npm
- Git

## Setup

```bash
git clone https://github.com/shehari007/SysPeek-hwinfo-react-electron-app.git
cd SysPeek-hwinfo-react-electron-app
npm install
npm run dev
```

`npm run dev` starts the app with hot reload for both the renderer and the main process.

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development with hot reload |
| `npm run build` | Type check and bundle into `out/` |
| `npm run typecheck` | Type check main, preload, and renderer |
| `npm run lint` | Lint with ESLint 10 |
| `npm run format` | Format with Prettier |
| `npm run build:win` | Windows installer |
| `npm run build:mac` | macOS dmg and zip |
| `npm run build:linux` | Linux AppImage and deb |

## Project layout

- `src/main` is the Electron main process. It owns all windows, the tray, the updater, the settings store, and the polling loop. This is the only place `systeminformation` is used.
- `src/preload` exposes a small typed API to the renderer through `contextBridge`. Add new capabilities here as explicit functions.
- `src/shared` holds the IPC channel names and the TypeScript types shared by main, preload, and renderer.
- `src/renderer` is the React UI. Components read data through `src/renderer/src/lib/api.ts`, never through `window` or Node directly.

## Adding a feature that needs system data

1. Add the data gathering to `src/main` (in `sysinfo.ts` or a new module).
2. Add a channel name and the return type to `src/shared/ipc.ts`.
3. Register a handler in `src/main/index.ts` behind the sender check.
4. Expose one function for it in `src/preload/index.ts` and add it to the `SysApi` type.
5. Call it from the renderer through `sysapi` in `src/renderer/src/lib/api.ts`.

Keeping this pattern is what preserves the security model. Never reach for `window.require` or add a generic passthrough on the bridge.

## Coding conventions

- TypeScript everywhere, with the strict compiler options already configured.
- Prettier handles formatting. Run `npm run format` before committing.
- ESLint must pass with no errors. Warnings from the React Compiler hint rules are acceptable.
- Prefer small, focused components and typed props.

## Commit and pull requests

- Keep commits focused and describe the intent.
- Make sure `npm run typecheck`, `npm run lint`, and `npm run build` all pass before opening a pull request. `npm run verify` runs all three in order.
