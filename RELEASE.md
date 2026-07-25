# Release guide

This is the exact checklist to cut a new SysPeek release and ship it to users through automatic updates. The release pipeline is already set up in `.github/workflows/release.yml`.

## How releases work in one sentence

You push a version tag, GitHub Actions builds installers for all three platforms and uploads them to a draft release, you press Publish, and installed apps update themselves.

## One time setup

You only do this section once.

1. **Confirm the repo settings.** In `electron-builder.yml`, the `publish` block already points at `owner: shehari007` and `repo: SysPeek-hwinfo-react-electron-app`. If you fork or rename, update those two values.

2. **Give Actions permission to publish.** In the GitHub repo, open Settings, then Actions, then General. Under "Workflow permissions" select "Read and write permissions" and save. The workflow also declares this with `permissions: contents: write`, so this is a safety check.

3. **Optional but recommended, code signing.** Unsigned apps still auto update, but the operating system shows a warning on first run. To sign, add these repository secrets under Settings, then Secrets and variables, then Actions:
   - Windows: a code signing certificate. Options are an OV or EV certificate, or Azure Trusted Signing.
   - macOS: `MAC_CSC_LINK` (base64 of your .p12), `MAC_CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID`. To make macOS auto update actually work, also set `notarize: true` in `electron-builder.yml`.

   If you skip this, everything still works, users just see a first run warning.

## Cutting a release

Do these steps for every new version.

1. **Make sure the branch is clean and green.**

   ```bash
   npm install
   npm run typecheck
   npm run lint
   npm run build
   ```

2. **Bump the version.** Edit the `version` field in `package.json`, for example from `2.0.0` to `2.0.1`. Use a patch bump for fixes, a minor bump for features, a major bump for breaking changes.

3. **Update the changelog.** Add a section for the new version at the top of `CHANGELOG.md` describing what changed.

4. **Commit the version bump.**

   ```bash
   git add package.json CHANGELOG.md
   git commit -m "Release v2.0.1"
   git push
   ```

5. **Create and push a matching tag.** The tag must be the version prefixed with `v`, and it must match `package.json` exactly.

   ```bash
   git tag v2.0.1
   git push origin v2.0.1
   ```

6. **Watch the build.** Pushing the tag starts the Release workflow. Open the Actions tab on GitHub and wait for the three jobs (Windows, macOS, Linux) to finish. This usually takes several minutes.

7. **Publish the draft release.** When the workflow finishes it creates a draft release with the installers and the update manifests attached. Open the Releases page, review the draft, and press Publish. Clients ignore drafts, so nothing updates until you publish.

## What gets published

For each platform the workflow uploads the installer plus the manifest that the updater reads:

- Windows: `SysPeek-<version>-setup.exe` and `latest.yml`
- macOS: `SysPeek-<version>.dmg`, a `.zip`, and `latest-mac.yml`
- Linux: `SysPeek-<version>.AppImage`, a `.deb`, and `latest-linux.yml`

Keep the `.blockmap` files that appear next to the installers. They let clients download small differential updates instead of the full installer.

## Verifying auto update works

1. Install the current version, for example `2.0.0`.
2. Release a newer version, for example `2.0.1`, following the steps above, and publish it.
3. Launch the installed `2.0.0`. Within a few seconds it should show the update banner, download in the background, and offer "Restart and Install".

## Troubleshooting

- **The workflow fails with a 403 when publishing.** Actions does not have write permission. Fix it in Settings, then Actions, then General, then Workflow permissions.
- **Clients never see the update.** The release is still a draft. Publish it. Also confirm the tag matches the `package.json` version.
- **macOS update is silent or blocked.** macOS requires the app to be signed and notarized for auto update. Set `notarize: true` and provide the Apple secrets.
- **Windows SmartScreen warning.** The build is unsigned. Add a Windows code signing certificate to remove the warning.

For the deeper technical details see [docs/AUTO_UPDATE.md](docs/AUTO_UPDATE.md).
