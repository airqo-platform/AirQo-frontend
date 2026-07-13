import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";
import { renderVertexConfig, type ProjectAnswers } from "./vertex-config";

export function templateDir(): string {
  const dir = fileURLToPath(new URL("../template", import.meta.url));
  if (!fs.existsSync(path.join(dir, "package.json"))) {
    throw new Error(
      `Bundled template not found at ${dir}. ` +
        "If running from source, run `npm run sync-template` first.",
    );
  }
  return dir;
}

export function scaffold(answers: ProjectAnswers): void {
  const source = templateDir();
  const target = answers.directory;

  fs.mkdirSync(target, { recursive: true });
  fs.cpSync(source, target, { recursive: true });

  // npm strips .gitignore from published packages, so the template
  // stores it as _gitignore; restore the real name here.
  const gitignore = path.join(target, "_gitignore");
  if (fs.existsSync(gitignore)) {
    fs.renameSync(gitignore, path.join(target, ".gitignore"));
  }

  // Brand the project: package.json identity + generated vertex.config.ts.
  const pkgPath = path.join(target, "package.json");
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  pkg.name = answers.packageName;
  pkg.version = "0.1.0";
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + "\n");

  fs.writeFileSync(
    path.join(target, "vertex.config.ts"),
    renderVertexConfig(answers),
  );
}

export function initGitRepo(target: string): boolean {
  try {
    execSync("git init", { cwd: target, stdio: "ignore" });
    execSync("git add -A", { cwd: target, stdio: "ignore" });
    execSync('git commit -m "Initial commit from create-vertex-app"', {
      cwd: target,
      stdio: "ignore",
    });
    return true;
  } catch {
    return false;
  }
}
