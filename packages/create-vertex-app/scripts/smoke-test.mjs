/**
 * End-to-end smoke test: syncs the template, builds the CLI, scaffolds a
 * project non-interactively into a temp directory, and asserts the output.
 * Intended for CI; exits non-zero on any failure.
 */
import { execSync } from "node:child_process";
import { mkdtempSync, rmSync, existsSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("..", import.meta.url));
const run = (cmd, cwd = packageRoot) =>
  execSync(cmd, { cwd, stdio: "inherit" });

run("node scripts/sync-template.mjs");
run("npx tsup");

const workDir = mkdtempSync(path.join(tmpdir(), "cva-smoke-"));
const projectDir = path.join(workDir, "smoke-app");

try {
  run(
    `node "${path.join(packageRoot, "dist/index.js")}" "${projectDir}" --yes ` +
      `--org-name "Smoke Test Org" --color "#00A86B" --no-git`,
    workDir,
  );

  const mustExist = [
    "package.json",
    "vertex.config.ts",
    ".gitignore",
    "app",
    "core/config/vertex-config.ts",
    "next.config.js",
  ];
  for (const file of mustExist) {
    if (!existsSync(path.join(projectDir, file))) {
      throw new Error(`Missing expected file in scaffold: ${file}`);
    }
  }

  const mustNotExist = ["_gitignore", "package-lock.json", "Dockerfile", ".git"];
  for (const file of mustNotExist) {
    if (existsSync(path.join(projectDir, file))) {
      throw new Error(`Unexpected file in scaffold: ${file}`);
    }
  }

  const pkg = JSON.parse(
    readFileSync(path.join(projectDir, "package.json"), "utf8"),
  );
  if (pkg.name !== "smoke-app") {
    throw new Error(`package.json name not applied: got "${pkg.name}"`);
  }

  const config = readFileSync(path.join(projectDir, "vertex.config.ts"), "utf8");
  for (const expected of ['"Smoke Test Org"', '"#00A86B"', '"smoke-test-org"']) {
    if (!config.includes(expected)) {
      throw new Error(`vertex.config.ts missing ${expected}`);
    }
  }

  console.log("\nSmoke test passed.");
} finally {
  rmSync(workDir, { recursive: true, force: true });
}
