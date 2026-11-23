#!/usr/bin/env node
/**
 * Exports the domain-neutral Beacon template from this app.
 *
 *   npm run export:template                       # writes dist/beacon-template
 *   npm run export:template -- --out ../somewhere # another folder
 *   npm run export:template -- --skip-lock        # don't regenerate package-lock.json (offline)
 *
 * Steps, driven by template/manifest.json:
 *   1. Copy the app's files (tracked, or new and not ignored), leaving out `exclude`.
 *   2. Copy template/overlay/ over the result: the demo config, the generic integration files,
 *      and the template's README, env example, Dockerfile and docs.
 *   3. Rename the package, drop dependencies only Beacon uses, and refresh the lockfile.
 *   4. Fail if any line still mentions AirQo, apart from `neutrality.allow`.
 *
 * Template users get the output; they never run this script.
 */
import { execFileSync } from "node:child_process"
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const appDir = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const templateDir = join(appDir, "template")
const overlayDir = join(templateDir, "overlay")
const manifest = JSON.parse(readFileSync(join(templateDir, "manifest.json"), "utf8"))

// ─── Arguments ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2)
const option = (name) => {
  const index = args.indexOf(name)
  return index >= 0 ? args[index + 1] : undefined
}
const outDir = resolve(appDir, option("--out") ?? "dist/beacon-template")
const skipLock = args.includes("--skip-lock")

if (outDir === appDir || appDir.startsWith(`${outDir}/`)) {
  fail(`--out can't be the app folder or one of its parents: ${outDir}`)
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function fail(message) {
  console.error(`export-template: ${message}`)
  process.exit(1)
}

/** `**` matches across folders, `*` within one; everything else is literal. */
function globToRegExp(glob) {
  let pattern = ""
  for (let i = 0; i < glob.length; i++) {
    const char = glob[i]
    if (char === "*" && glob[i + 1] === "*") {
      pattern += ".*"
      i++
    } else if (char === "*") {
      pattern += "[^/]*"
    } else {
      pattern += char.replace(/[.+?^${}()|[\]\\]/g, "\\$&")
    }
  }
  return new RegExp(`^${pattern}$`)
}

const excluded = manifest.exclude.map(globToRegExp)
const isExcluded = (file) => excluded.some((pattern) => pattern.test(file))

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

// ─── 1. Copy the app ────────────────────────────────────────────────────────

if (existsSync(outDir)) {
  const existing = join(outDir, "package.json")
  const isExport = existsSync(existing) && JSON.parse(readFileSync(existing, "utf8")).name === manifest.package.name
  if (!isExport) fail(`${outDir} exists and isn't a previous export; choose another --out`)
  rmSync(outDir, { recursive: true, force: true })
}

const files = execFileSync("git", ["ls-files", "--cached", "--others", "--exclude-standard", "-z", "."], {
  cwd: appDir,
  encoding: "utf8",
})
  .split("\0")
  .filter(Boolean)
  .filter((file) => existsSync(join(appDir, file)))

let copied = 0
for (const file of files) {
  if (isExcluded(file)) continue
  const target = join(outDir, file)
  mkdirSync(dirname(target), { recursive: true })
  cpSync(join(appDir, file), target)
  copied++
}

// ─── 2. Overlay ─────────────────────────────────────────────────────────────

const overlaid = walk(overlayDir).map((source) => {
  const file = relative(overlayDir, source)
  const target = join(outDir, file)
  mkdirSync(dirname(target), { recursive: true })
  cpSync(source, target)
  return file
})

// ─── 3. Package ─────────────────────────────────────────────────────────────

const packagePath = join(outDir, "package.json")
const pkg = JSON.parse(readFileSync(packagePath, "utf8"))
pkg.name = manifest.package.name
pkg.version = manifest.package.version
for (const dependency of manifest.package.removeDependencies) delete pkg.dependencies?.[dependency]
for (const dependency of manifest.package.removeDevDependencies) delete pkg.devDependencies?.[dependency]
for (const glob of manifest.package.removeTestGlobs) {
  pkg.scripts.test = pkg.scripts.test.replace(` ${glob}`, "")
}
delete pkg.scripts["export:template"]
writeFileSync(packagePath, `${JSON.stringify(pkg, null, 2)}\n`)

const lockPath = join(outDir, "package-lock.json")
if (skipLock) {
  rmSync(lockPath, { force: true })
  console.warn("export-template: --skip-lock: package-lock.json removed; run npm install in the output to create one")
} else {
  try {
    execFileSync("npm", ["install", "--package-lock-only", "--ignore-scripts", "--no-audit", "--no-fund"], {
      cwd: outDir,
      stdio: "inherit",
    })
  } catch {
    fail("couldn't refresh package-lock.json (offline?). Rerun with --skip-lock to export without one.")
  }
}

// ─── 4. Neutrality check ────────────────────────────────────────────────────

const skipped = manifest.neutrality.skip.map(globToRegExp)
const allowed = manifest.neutrality.allow.map((pattern) => new RegExp(pattern))
const TEXT = /\.(?:[cm]?[jt]sx?|json|md|css|ya?ml|html|txt|example|svg)$|(?:^|\/)(?:Dockerfile|\.env\.example|\.gitignore|\.dockerignore)$/

const leaks = []
for (const path of walk(outDir)) {
  const file = relative(outDir, path)
  if (file.startsWith("node_modules/") || !TEXT.test(file) || skipped.some((pattern) => pattern.test(file))) continue
  readFileSync(path, "utf8")
    .split("\n")
    .forEach((line, index) => {
      if (/airqo/i.test(line) && !allowed.some((pattern) => pattern.test(line))) {
        leaks.push(`${file}:${index + 1}: ${line.trim().slice(0, 140)}`)
      }
    })
}

if (leaks.length > 0) {
  console.error(leaks.join("\n"))
  fail(`${leaks.length} line(s) still mention AirQo. Move them behind beacon.config.ts or an integration file, or allow them in template/manifest.json.`)
}

console.log(`export-template: ${copied} files copied, ${overlaid.length} overlaid → ${relative(process.cwd(), outDir) || outDir}`)
