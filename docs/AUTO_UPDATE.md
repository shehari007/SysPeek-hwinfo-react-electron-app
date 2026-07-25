# Automatic updates

SysPeek uses electron-updater with GitHub releases as the update feed. The configuration lives in `electron-builder.yml` under the `publish` block, and the main process wiring is in `src/main/updater.ts`.

## How it works

1. On launch, a packaged build asks GitHub for the latest release.
2. If a newer version exists, it downloads in the background. The UI shows a progress banner.
3. When the download finishes, the banner offers a "Restart and Install" button. The user can also let it install on the next quit.

The updater only runs in packaged builds. In development it is disabled to avoid noise.

## Publishing a release

1. Bump `version` in `package.json`, for example from `2.0.0` to `2.0.1`.
2. Commit the change.
3. Create a tag that matches the version and push it:

   ```bash
   git tag v2.0.1
   git push origin v2.0.1
   ```

4. The `Release` GitHub Actions workflow builds installers for Windows, macOS, and Linux and uploads them, along with the `latest.yml`, `latest-mac.yml`, and `latest-linux.yml` update manifests, to a draft GitHub release.
5. Open the draft release on GitHub and publish it. Clients ignore draft releases, so nothing updates until you publish.

The tag and the `package.json` version must match. Keep the `.blockmap` files that electron-builder produces on the release so clients can download small differential updates.

## Targets and update support

- Windows: NSIS installer. Updates work out of the box.
- macOS: dmg for first install and zip for updates. Squirrel.Mac requires the zip target.
- Linux: AppImage updates automatically. The deb package is provided for convenience but does not self update.

## Code signing

Unsigned builds still update, but the operating system will warn users on first run.

- **Windows.** Provide a signing certificate to remove SmartScreen warnings. An OV or EV certificate, or Azure Trusted Signing, gives the best experience.
- **macOS.** Auto update requires the app to be signed and notarized. Set `notarize: true` in `electron-builder.yml` and provide the signing and Apple credentials as GitHub secrets (`MAC_CSC_LINK`, `MAC_CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`). Without notarization, macOS auto update silently fails.

The release workflow already reads these secrets. If they are not set, it produces unsigned builds.

## Testing the flow

1. Build and publish version `2.0.0`.
2. Install it.
3. Bump to `2.0.1`, tag, and publish the new release.
4. Launch the installed `2.0.0`. It should detect, download, and offer to install `2.0.1`.
