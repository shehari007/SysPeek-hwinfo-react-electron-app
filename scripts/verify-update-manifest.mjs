#!/usr/bin/env node
/**
 * Verifies the electron-updater manifests that electron-builder writes next to
 * the installers.
 *
 * electron-updater downloads `latest.yml`, reads the version out of it, then
 * downloads the installer named there and checks its sha512 against the one in
 * the manifest. If the two disagree by a single byte the update is refused, and
 * the failure surfaces on the user's machine rather than on yours. Uploading a
 * manifest that does not describe the files sitting beside it is the single
 * easiest way to ship a release that silently never installs.
 *
 * So this recomputes every hash and size from the artifacts on disk and
 * compares them to what the manifest claims, before anything is uploaded.
 *
 * Usage:
 *   node scripts/verify-update-manifest.mjs [outputDir]
 *
 * The output directory defaults to the `directories.output` value in
 * electron-builder.yml.
 */

import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import { readdir, readFile, stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

/**
 * js-yaml arrives as a transitive dependency of electron-builder rather than a
 * direct one, so it is used when npm happens to have hoisted it and a parser
 * for the one shape electron-builder emits is used when it has not. That shape
 * is fixed by electron-builder itself, so the fallback is not a general YAML
 * parser and does not need to be.
 */
async function loadYamlParser() {
  const require = createRequire(import.meta.url)
  try {
    const jsYaml = require('js-yaml')
    return (text) => jsYaml.load(text)
  } catch {
    return parseManifestYaml
  }
}

function stripQuotes(value) {
  const trimmed = value.trim()
  if (trimmed.length >= 2 && /^(['"]).*\1$/s.test(trimmed)) return trimmed.slice(1, -1)
  return trimmed
}

function coerce(value) {
  const raw = stripQuotes(value)
  if (/^\d+$/.test(raw)) return Number(raw)
  return raw
}

function parseManifestYaml(text) {
  const result = {}
  let currentList = null
  let currentEntry = null

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue

    const listItem = line.match(/^(\s*)-\s+(\w[\w-]*):\s*(.*)$/)
    if (listItem && currentList) {
      currentEntry = { [listItem[2]]: coerce(listItem[3]) }
      currentList.push(currentEntry)
      continue
    }

    const indented = line.match(/^(\s+)(\w[\w-]*):\s*(.*)$/)
    if (indented && currentEntry) {
      currentEntry[indented[2]] = coerce(indented[3])
      continue
    }

    const topLevel = line.match(/^(\w[\w-]*):\s*(.*)$/)
    if (topLevel) {
      const [, key, value] = topLevel
      if (value.trim() === '') {
        currentList = []
        currentEntry = null
        result[key] = currentList
      } else {
        currentList = null
        currentEntry = null
        result[key] = coerce(value)
      }
    }
  }

  return result
}

/** The digest electron-updater compares against: sha512, base64 encoded. */
function hashFile(file) {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha512')
    const stream = createReadStream(file)
    stream.on('error', reject)
    stream.on('data', (chunk) => hash.update(chunk))
    stream.on('end', () => resolve(hash.digest('base64')))
  })
}

async function resolveOutputDir(explicit) {
  if (explicit) return path.resolve(root, explicit)
  try {
    const config = await readFile(path.join(root, 'electron-builder.yml'), 'utf8')
    const match = config.match(/^\s{2}output:\s*(.+)$/m)
    if (match) return path.resolve(root, stripQuotes(match[1]))
  } catch {
    // Fall through to the electron-builder default.
  }
  return path.resolve(root, 'dist')
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  let value = bytes / 1024
  let unit = 0
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024
    unit += 1
  }
  return `${value.toFixed(1)} ${units[unit]}`
}

async function main() {
  const parseYaml = await loadYamlParser()
  const outputDir = await resolveOutputDir(process.argv[2])
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))

  let entries
  try {
    entries = await readdir(outputDir)
  } catch {
    console.error(`No build output at ${outputDir}. Run a packaging script first.`)
    process.exit(1)
  }

  const manifests = entries.filter((name) => /^(latest|beta|alpha)(-mac|-linux)?\.yml$/.test(name))
  if (manifests.length === 0) {
    console.error(
      `No update manifest in ${outputDir}.\n` +
        'electron-builder only writes one when a `publish` block is configured, ' +
        'so check electron-builder.yml if a packaging run produced installers but no yml.'
    )
    process.exit(1)
  }

  console.log(`Package version : ${pkg.version}`)
  console.log(`Output directory: ${outputDir}`)
  console.log('')

  const problems = []
  let checked = 0

  for (const name of manifests.sort()) {
    console.log(`${name}`)
    const manifest = parseYaml(await readFile(path.join(outputDir, name), 'utf8'))

    if (manifest.version !== pkg.version) {
      problems.push(
        `${name}: version is "${manifest.version}" but package.json says "${pkg.version}"`
      )
      console.log(`  version   ${manifest.version}  MISMATCH (package.json: ${pkg.version})`)
    } else {
      console.log(`  version   ${manifest.version}  ok`)
    }

    const files = Array.isArray(manifest.files) ? manifest.files : []
    if (files.length === 0) problems.push(`${name}: lists no files`)

    for (const entry of files) {
      const artifact = path.join(outputDir, decodeURIComponent(String(entry.url)))
      const label = `  ${entry.url}`

      let info
      try {
        info = await stat(artifact)
      } catch {
        problems.push(`${name}: "${entry.url}" is listed but not present in ${outputDir}`)
        console.log(`${label}\n      MISSING from the output directory`)
        continue
      }

      const actualHash = await hashFile(artifact)
      checked += 1

      const sizeOk = Number(entry.size) === info.size
      const hashOk = String(entry.sha512) === actualHash

      console.log(label)
      console.log(
        `      size    ${sizeOk ? 'ok' : 'MISMATCH'}  ${formatBytes(info.size)}` +
          (sizeOk ? '' : ` (manifest claims ${formatBytes(Number(entry.size))})`)
      )
      console.log(`      sha512  ${hashOk ? 'ok' : 'MISMATCH'}  ${actualHash.slice(0, 24)}...`)

      if (!sizeOk) problems.push(`${name}: size mismatch for "${entry.url}"`)
      if (!hashOk) problems.push(`${name}: sha512 mismatch for "${entry.url}"`)

      // The blockmap is what lets a client download only the changed chunks of
      // an installer instead of the whole thing. Its absence is not fatal, the
      // update just costs the user the full download.
      if (/\.(exe|AppImage)$/i.test(artifact)) {
        try {
          await stat(`${artifact}.blockmap`)
        } catch {
          console.log('      blockmap  missing, clients will do a full download')
        }
      }
    }

    // `path` and the top level `sha512` are what older clients read. They have
    // to agree with the matching entry in `files` or those clients refuse the
    // update while newer ones accept it.
    if (manifest.path) {
      const primary = files.find((entry) => String(entry.url) === String(manifest.path))
      if (!primary) {
        problems.push(`${name}: "path" points at "${manifest.path}", which is not in "files"`)
      } else if (String(primary.sha512) !== String(manifest.sha512)) {
        problems.push(
          `${name}: top level sha512 disagrees with the "files" entry for "${manifest.path}"`
        )
      }
    }

    console.log('')
  }

  if (problems.length > 0) {
    console.error(`FAILED. ${problems.length} problem(s):`)
    for (const problem of problems) console.error(`  - ${problem}`)
    console.error('\nDo not upload this build. Rebuild and verify again.')
    process.exit(1)
  }

  console.log(`OK. ${checked} artifact(s) match their manifest across ${manifests.length} file(s).`)
  console.log('Safe to attach these artifacts, the yml manifests and the blockmaps to the release.')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
