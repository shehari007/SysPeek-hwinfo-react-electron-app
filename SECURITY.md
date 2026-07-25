# Security

SysPeek reads low level system information, so it is built to follow the Electron security checklist closely.

## Threat model

The renderer displays data and must be treated as the least trusted part of the app. All privileged work (reading hardware sensors, file system access, shelling out to OS tools through systeminformation) happens in the main process. The renderer can only ask for results through a narrow, typed bridge.

## Controls in place

- **Context isolation is on.** The preload runs in an isolated world and communicates with the page only through `contextBridge`.
- **Sandbox is on.** The renderer process is sandboxed. The preload is CommonJS so it stays sandbox compatible.
- **Node integration is off.** The renderer cannot `require` Node modules. There is no `window.require` anywhere in the UI.
- **Whitelisted IPC.** The preload exposes one function per capability (`getStatic`, `getDynamic`, `getProcesses`, `openExternal`, and so on). There is no generic `invoke` and no raw `ipcRenderer` on the page.
- **Sender validation.** Every IPC handler checks that the request came from the app's own main window before acting.
- **Content Security Policy.** A strict CSP is applied through response headers. In production, script execution is limited to the app's own bundle, and remote connections are blocked.
- **Navigation lockdown.** Attempts to navigate away from the app are blocked. Links that open externally are validated to be http or https and are handed to the OS browser through `shell.openExternal`.
- **No remote content.** The UI, styles, fonts, and assets are all bundled locally. Nothing is loaded from a remote origin at runtime.

## Elevated privileges

SysPeek runs as a normal user process by default. This is intentional: it keeps automatic updates working and avoids asking for administrator rights just to launch.

Some sensor data (certain temperatures, SMART disk details, and a few process fields) is only available with elevated rights. On Windows, the settings panel offers an opt in "Relaunch as Administrator" action that restarts the app with a standard UAC prompt. On macOS and Linux, the OS presents its own prompt when a privileged tool is invoked.

## Reporting a vulnerability

If you find a security issue, please email shehariyar@gmail.com with the details and steps to reproduce. Please do not open a public issue for security reports. You will get an acknowledgement as soon as possible.
