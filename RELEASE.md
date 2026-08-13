# Release guide

This is the checklist to cut a new SysPeek release and ship it to users through
automatic updates.

## Releases are built locally

Releases are cut on a maintainer's machine rather than on CI. The two workflows
in `.github/workflows` are set to `workflow_dispatch`, so they run on request
instead of on every push and tag. Each carries a comment showing the trigger to
restore if you would rather drive them automatically.

Nothing about the auto updater depends on that choice. electron-builder writes
the `latest.yml` update manifest as part of packaging, with the same version,
file names, sizes and sha512 hashes on a laptop as on a runner. The updater
cannot tell the difference.

## How updates work in one paragraph

A packaged SysPeek asks GitHub for the latest published release and downloads
`latest.yml` from it. That file names the installer, its size, and its sha512
hash. If the version inside is newer than the running one, the updater fetches
that installer, checks the hash against the manifest, and offers to restart and
install. A hash that does not match is refused, which is why `npm run
verify:manifest` recomputes all of them before you upload anything.

## Cutting a release

### 1. Check the tree is green

```bash
npm install
npm run verify
```

`verify` is typecheck, lint and build in one command.

### 2. Bump the version

Edit `version` in `package.json`, for example `2.0.0` to `2.0.1`. Patch for
fixes, minor for features, major for breaking changes. Add a matching section to
the top of `CHANGELOG.md`.

The version in `package.json` is what ends up in `latest.yml`, and it is the
only thing an installed copy compares against. Forget the bump and clients see
no update no matter what you upload.

### 3. Build and verify

```bash
npm run release:win
```

That typechecks, bundles, packages the NSIS installer, and then verifies the
manifest. When it finishes, `release/` holds:

| File                                   | What it is                                   |
| -------------------------------------- | -------------------------------------------- |
| `SysPeek-2.0.1-x64-setup.exe`          | the installer                                |
| `SysPeek-2.0.1-x64-setup.exe.blockmap` | lets clients download only changed chunks    |
| `latest.yml`                           | the update manifest, with version and sha512 |

The verify step prints something like:

```text
latest.yml
  version   2.0.1  ok
  SysPeek-2.0.1-x64-setup.exe
      size    ok  84.2 MB
      sha512  ok  fJ2r9xKq1vN8mBcT0aWs...

OK. 1 artifact(s) match their manifest across 1 file(s).
```

If it reports a mismatch, do not upload. Rebuild and run it again.

### 4. Tag the commit

```bash
git add package.json CHANGELOG.md
git commit -m "Release v2.0.1"
git push
git tag v2.0.1
git push origin v2.0.1
```

Pushing the tag no longer starts anything. It exists so the release page can
point at the commit the installer was built from.

### 5. Upload

Only three files from `release/` belong on the release. Everything else in there
is build scratch: `win-unpacked/` is the unpacked app the installer was made
from, and `builder-debug.yml` and `builder-effective-config.yaml` are diagnostic
output.

- `SysPeek-2.0.1-x64-setup.exe`, the installer.
- `SysPeek-2.0.1-x64-setup.exe.blockmap`, which lets clients download only the
  changed chunks. Without it every update is a full download.
- `latest.yml`, the update manifest. Without it no client ever learns the
  release exists.

Three ways. Pick one.

**With the GitHub CLI.** Reads the version out of `package.json` so the file
names cannot drift out of sync with the tag:

```powershell
$v = (Get-Content package.json -Raw | ConvertFrom-Json).version
gh release create "v$v" `
  "release/SysPeek-$v-x64-setup.exe" `
  "release/SysPeek-$v-x64-setup.exe.blockmap" `
  "release/latest.yml" `
  --draft --title "SysPeek v$v" --notes-file CHANGELOG.md
```

That creates a draft. Review the asset list, then publish:

```powershell
gh release edit "v$v" --draft=false
```

To add files to a release that already exists, `gh release upload "v$v" <files>`,
with `--clobber` to replace an asset of the same name.

**Manually, no token needed.** Open the
[new release page](https://github.com/shehari007/SysPeek-hwinfo-react-electron-app/releases/new),
choose the `v2.0.1` tag, and drag in all three files from `release/`: the `.exe`,
the `.exe.blockmap` and `latest.yml`. Save it as a draft first, check the asset
list, then press Publish.

**With electron-builder.** Create a token with the `repo` scope under
[personal access tokens](https://github.com/settings/tokens), then:

```powershell
$env:GH_TOKEN = "ghp_yourtokenhere"
npm run release
```

This builds and uploads in one go. It creates a **draft** release, because
`publish.releaseType` in `electron-builder.yml` is `draft`. Check the assets,
then press Publish on the releases page.

Either way, `latest.yml` must be attached to the release. It is the whole update
mechanism. An installer without it is just a download link.

### 6. Confirm

Installed copies check on launch. Start an older build and it should show the
update banner within a few seconds.

## Things that will bite you

**The release is still a draft.** Drafts are invisible to `latest.yml` lookups
by design, so nothing updates until you press Publish. This is deliberate: it
lets you assemble a release before anyone can download half of it.

**You uploaded the exe but not `latest.yml`.** Clients have no way to learn a
new version exists. Nothing happens and nothing errors.

**You rebuilt after uploading.** Two builds of the same source do not produce
byte identical installers, so the hash in the uploaded `latest.yml` no longer
matches the exe next to it. The updater downloads the full installer and then
refuses it. Upload the exe and the yml from the same build, every time.

**Windows SmartScreen warns on first run.** The build is unsigned. It still
installs and still auto updates. Removing the warning needs an OV or EV code
signing certificate, or Azure Trusted Signing.

## macOS and Linux

`release:mac` and `release:linux` exist and work, but only on those operating
systems. electron-builder cannot produce a macOS dmg or a Linux AppImage from
Windows, so from this machine a release is Windows only. That is fine, and the
Windows updater does not care that `latest-mac.yml` is absent.

One thing to know before you ship a mac build: macOS auto update requires the app
to be signed with an Apple Developer ID and notarized, and this one is not.
`src/main/updater.ts` handles that rather than pretending otherwise. A mac client
still checks for updates and still tells the user a new version exists, but it
does not download or install one. The banner offers an "Open Releases" button
instead. See [docs/AUTO_UPDATE.md](docs/AUTO_UPDATE.md) for what to change when
there is a certificate.

For the deeper technical detail see [docs/AUTO_UPDATE.md](docs/AUTO_UPDATE.md).
