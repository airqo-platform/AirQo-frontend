import { parseArgs } from "node:util";
import { readFileSync } from "node:fs";
import path from "node:path";
import * as p from "@clack/prompts";
import pc from "picocolors";
import { collectAnswers, type CliFlags } from "./prompts";
import { scaffold, initGitRepo } from "./scaffold";
import { detectPackageManager } from "./utils";

const HELP = `
${pc.bold("create-vertex-app")} — scaffold a Vertex IoT dashboard app

${pc.bold("Usage:")}
  npm create vertex-app@latest [directory] [options]

${pc.bold("Options:")}
  -y, --yes            Skip prompts and accept defaults
      --org-name       Organization name
      --short-name     Organization short name
      --color          Primary theme color (hex)
      --tiles          Map tiles: openstreetmap | mapbox
      --git / --no-git Initialize a git repository (default: git)
  -h, --help           Show this help
  -v, --version        Show the CLI version

The scaffolded app runs on mock data out of the box — no backend,
credentials, or .env file required. Customize it in vertex.config.ts.
`;

async function main(): Promise<void> {
  const { values, positionals } = parseArgs({
    args: process.argv.slice(2),
    allowPositionals: true,
    options: {
      yes: { type: "boolean", short: "y", default: false },
      "org-name": { type: "string" },
      "short-name": { type: "string" },
      color: { type: "string" },
      tiles: { type: "string" },
      git: { type: "boolean" },
      "no-git": { type: "boolean" },
      help: { type: "boolean", short: "h", default: false },
      version: { type: "boolean", short: "v", default: false },
    },
  });

  if (values.help) {
    console.log(HELP);
    return;
  }
  if (values.version) {
    const pkgPath = new URL("../package.json", import.meta.url);
    const pkg = JSON.parse(readFileSync(pkgPath, "utf8"));
    console.log(pkg.version);
    return;
  }

  const flags: CliFlags = {
    yes: values.yes ?? false,
    orgName: values["org-name"],
    shortName: values["short-name"],
    color: values.color,
    tiles: values.tiles,
    git: values["no-git"] ? false : values.git,
  };

  p.intro(pc.bgBlue(pc.white(" create-vertex-app ")));

  const answers = await collectAnswers(positionals[0], flags);

  const spinner = p.spinner();
  spinner.start("Scaffolding project");
  scaffold(answers);
  spinner.stop(
    `Project created in ${pc.cyan(path.relative(process.cwd(), answers.directory) || ".")}`,
  );

  if (answers.initGit) {
    if (initGitRepo(answers.directory)) {
      p.log.success("Initialized a git repository.");
    } else {
      p.log.warn("Could not initialize a git repository (is git installed?).");
    }
  }

  const pm = detectPackageManager();
  const run = pm === "npm" ? "npm run" : pm;
  const relative = path.relative(process.cwd(), answers.directory);

  p.note(
    [
      relative ? `cd ${relative}` : null,
      `${pm} install`,
      `${run} dev`,
    ]
      .filter(Boolean)
      .join("\n"),
    "Next steps",
  );

  const notes = [
    `The app runs on ${pc.bold("mock data")} — no backend or .env needed.`,
    `Customize branding and features in ${pc.cyan("vertex.config.ts")}.`,
  ];
  if (answers.tileProvider === "mapbox") {
    notes.push(
      `Mapbox tiles need ${pc.cyan("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN")} in .env.local.`,
    );
  }
  p.outro(notes.join("\n   "));
}

main().catch((error) => {
  console.error(pc.red(error instanceof Error ? error.message : String(error)));
  process.exit(1);
});
