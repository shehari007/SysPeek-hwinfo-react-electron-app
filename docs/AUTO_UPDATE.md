# Automatic updates

SysPeek updates itself with electron-updater, using GitHub releases as the feed.
Three things make that work:

- `publish` in `electron-builder.yml`, which points at the repository and makes
  electron-builder write the update manifest.
- `src/main/updater.ts`, which wires the updater events through to the renderer.
- `latest.yml`, uploaded alongside every installer.

For the step by step release checklist see [RELEASE.md](../RELEASE.md). This
document is the mechanism underneath it.

## The manifest is the whole feed

`latest.yml` is what an installed copy actually downloads to decide whether an
update exists. electron-builder generates it during packaging and it looks like
this:

```yaml
version: 2.0.1
files:
  - url: SysPeek-2.0.1-x64-setup.exe
    sha512: fJ2r9xKq1vN8mBcT0aWsE7hLpQ4uYd6RgXvZ3nKt1cB9sMwA0eIoU5yFjHrTlP2Q...
    size: 88301184
path: SysPeek-2.0.1-x64-setup.exe
sha512: fJ2r9xKq1vN8mBcT0aWsE7hLpQ4uYd6RgXvZ3nKt1cB9sMwA0eIoU5yFjHrTlP2Q...
releaseDate: '2026-08-13T09:14:22.031Z'
```

Four fields carry all the weight:

- **version** is compared against the running version. Newer means an update is
  offered. This comes from `package.json`, so forgetting to bump it means no
  client ever sees the release, whatever you upload.
- **url** is the file name to fetch from the same release.
- **sha512** is the base64 encoded SHA-512 of that file. After downloading, the
  updater hashes what it got and refuses to install if the two differ.
- **size** is used for the progress bar and as a first sanity check.

`path` and the top level `sha512` repeat the primary entry for older clients.

The hash check is the part that catches people out. Two builds of identical
source are not byte identical, so a `latest.yml` from one build and an installer
from another will always mismatch. The client downloads the entire installer and
then discards it, usually with an error nobody sees. Always upload the manifest
and the installer produced by the same run, and run `npm run verify:manifest`
first, which recomputes every hash from the files on disk and compares.

## Where the manifest comes from

electron-builder writes it during packaging whenever a `publish` block is
configured, whether or not anything is being uploaded. A plain local
`electron-builder --win` produces exactly the same `latest.yml` a build server
would. This is why releases can be cut from a laptop, and why the updater cannot
tell the two apart.

Remove the `publish` block and no manifest is written at all, which shows up as
installers appearing in `release/` with no yml beside them.

## Drafts

`publish.releaseType` is `draft`. electron-updater asks GitHub for the latest
published release, and drafts are not in that answer, so nothing updates until
you press Publish yourself.

That is deliberate. It gives you a window to check the assets before anyone can
download them, and it matters most when a release is assembled from more than
one machine or more than one build: a release that goes live the moment the first
file lands hands clients a manifest pointing at an installer that has not
finished uploading.

## The flow at runtime

1. A packaged build calls `checkForUpdates()` on launch. Development builds skip
   this unless `forceDevUpdateConfig` is on, which `dev-app-update.yml` exists to
   support.
2. The updater fetches `latest.yml` from the latest published release.
3. If the version is newer, the download starts in the background, because
   `autoDownload` is true. The renderer shows progress through the
   `updateStatus` channel.
4. On completion the banner offers "Restart and Install". Otherwise it installs
   on next quit, because `autoInstallOnAppQuit` is true.

Every state change is pushed to the renderer as an `UpdateStatus`, so the banner
in `src/renderer/src/Components/Updates/UpdateBanner.tsx` reflects checking,
available, downloading, downloaded and error without polling.

## Platform support

- **Windows**, NSIS installer. Updates work, and being unsigned does not stop
  them.
- **Linux**, AppImage. Updates work. The deb is a convenience for people who
  prefer it and does not self update.
- **macOS**, dmg to install and zip to update, because Squirrel.Mac needs the
  zip. Detects updates but cannot install them, see below.

Installers can only be produced on their own operating system, so a release cut
from Windows is Windows only. That is not a problem for the updater: a Windows
client only ever asks for `latest.yml` and never notices that `latest-mac.yml`
is absent.

### macOS checks but does not install

Squirrel, which is what Electron uses to swap the application bundle, refuses to
touch a build that is not signed with an Apple Developer ID.
`electron-builder.yml` sets `hardenedRuntime: true` with `notarize: false` and
there is no certificate, so SysPeek is unsigned on macOS.

Left alone this fails in the least helpful way possible: the client detects the
update, downloads the entire zip, then stalls at the last step. The user sees a
broken app rather than a missing signature.

So `src/main/updater.ts` sets `MANUAL_DOWNLOAD` on darwin, which turns off
`autoDownload` and `autoInstallOnAppQuit` and makes `quitAndInstall()` a no op.
Checking still happens, because that is only a manifest download and a version
comparison and it works everywhere. The status carries `manualDownload` and
`releaseUrl` through to the renderer, and the banner offers an "Open Releases"
button instead of a progress bar and a restart. Knowing a new version exists is
most of the value, and it beats a download that can never install.

To get real macOS updates, obtain an Apple Developer ID, set `notarize: true`,
provide `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`
and `APPLE_TEAM_ID`, then delete `MANUAL_DOWNLOAD` and the branch in
`UpdateBanner.tsx` that reads it.

### Windows signing

Unsigned Windows builds update fine. SmartScreen warns on first run, which an OV
or EV certificate or Azure Trusted Signing removes.

One trap: `publisherName` belongs under `win.signtoolOptions` and only once
there is a certificate. electron-updater checks the publisher on a downloaded
installer against that name, so setting it on an unsigned build makes every
update fail verification. It was previously set at the `win` level, which is not
valid in electron-builder 26 and made the whole configuration fail to load.

## Testing the flow

1. Build `2.0.0` and install it.
2. Bump to `2.0.1`, run `npm run release:win`, upload, and publish the release.
3. Launch the installed `2.0.0`. It should detect, download and offer `2.0.1`
   within a few seconds.

To watch it fail safely, publish a release with a hand edited `latest.yml` whose
sha512 is wrong. The client downloads the installer and then rejects it, which
is exactly the failure `npm run verify:manifest` exists to catch first.
