/**
 * Copies src/vertex-template into this package's template/ directory so it
 * ships inside the published npm tarball. Runs automatically on prepack.
 *
 * Two transformations happen here:
 *  - Build artifacts, lockfiles, and monorepo-only files are excluded.
 *  - .gitignore is stored as _gitignore because npm always strips
 *    .gitignore files from published packages; the CLI renames it back
 *    when scaffolding.
 */
import { cp, rm, rename, access } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const templateSource = path.resolve(packageRoot, "../../src/vertex-template");
const templateDest = path.join(packageRoot, "template");

// Excluded when any path segment matches (relative to the template root).
const EXCLUDED_SEGMENTS = new Set([
  "node_modules",
  ".next",
  ".git",
  "coverage",
  "out",
]);

// Excluded only as top-level entries of the template.
const EXCLUDED_TOP_LEVEL = new Set([
  "package-lock.json",
  "Dockerfile",
  ".dockerignore",
  "lighthouserc.json",
  "docs",
  ".env.local",
]);

try {
  await access(templateSource);
} catch {
  console.error(`Template source not found: ${templateSource}`);
  console.error("This script must run from within the AirQo-frontend monorepo.");
  process.exit(1);
}

await rm(templateDest, { recursive: true, force: true });

await cp(templateSource, templateDest, {
  recursive: true,
  filter: (source) => {
    const relative = path.relative(templateSource, source);
    if (relative === "") return true;
    const segments = relative.split(path.sep);
    if (segments.some((segment) => EXCLUDED_SEGMENTS.has(segment))) {
      return false;
    }
    if (EXCLUDED_TOP_LEVEL.has(segments[0])) return false;
    return true;
  },
});

await rename(
  path.join(templateDest, ".gitignore"),
  path.join(templateDest, "_gitignore"),
);

console.log(`Template synced: ${templateSource} -> ${templateDest}`);
