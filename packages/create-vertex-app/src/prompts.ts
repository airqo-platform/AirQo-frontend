import * as p from "@clack/prompts";
import path from "node:path";
import fs from "node:fs";
import {
  isValidHexColor,
  isValidPackageName,
  toKebabCase,
} from "./utils";
import type { ProjectAnswers } from "./vertex-config";

export interface CliFlags {
  yes: boolean;
  orgName?: string;
  shortName?: string;
  color?: string;
  tiles?: string;
  git?: boolean;
}

const DEFAULT_COLOR = "#145FFF";

function bail(message = "Cancelled."): never {
  p.cancel(message);
  process.exit(1);
}

function unwrap<T>(value: T | symbol): T {
  if (p.isCancel(value)) bail();
  return value as T;
}

function directoryIsUsable(dir: string): true | string {
  if (!fs.existsSync(dir)) return true;
  if (!fs.statSync(dir).isDirectory()) {
    return `"${dir}" already exists and is not a directory.`;
  }
  const entries = fs.readdirSync(dir);
  if (entries.length === 0) return true;
  return `Directory "${dir}" already exists and is not empty.`;
}

export async function collectAnswers(
  positionalDir: string | undefined,
  flags: CliFlags,
): Promise<ProjectAnswers> {
  let directory = positionalDir;
  if (!directory) {
    if (flags.yes) {
      directory = "my-vertex-app";
    } else {
      directory = unwrap(
        await p.text({
          message: "Where should the project be created?",
          placeholder: "my-vertex-app",
          defaultValue: "my-vertex-app",
          validate: (value) => {
            const dir = value || "my-vertex-app";
            const usable = directoryIsUsable(dir);
            if (usable !== true) return usable;
            if (!isValidPackageName(path.basename(path.resolve(dir)))) {
              return "Directory name must be a valid npm package name (lowercase, no spaces).";
            }
            return undefined;
          },
        }),
      );
    }
  }

  directory = directory.trim() || "my-vertex-app";

  const resolvedDir = path.resolve(directory);
  const packageName = path.basename(resolvedDir);
  const usable = directoryIsUsable(resolvedDir);
  if (usable !== true) bail(usable);
  if (!isValidPackageName(packageName)) {
    bail(
      `"${packageName}" is not a valid npm package name (lowercase, no spaces).`,
    );
  }

  const askText = async (
    provided: string | undefined,
    fallback: string,
    message: string,
    validate?: (value: string) => string | undefined,
  ): Promise<string> => {
    if (provided !== undefined) {
      const value = provided.trim();
      const error = value ? validate?.(value) : `Value for "${message}" cannot be empty.`;
      if (error) bail(error);
      return value;
    }
    if (flags.yes) return fallback;
    const answer = unwrap(
      await p.text({
        message,
        defaultValue: fallback,
        placeholder: fallback,
        validate: (value) => {
          const trimmed = value.trim();
          return trimmed ? validate?.(trimmed) : undefined;
        },
      }),
    );
    return answer.trim() || fallback;
  };

  const orgName = await askText(
    flags.orgName,
    "Vertex Demo",
    "Organization name (used in titles, footer, metadata):",
  );

  const orgShortName = await askText(
    flags.shortName,
    orgName.split(/\s+/)[0],
    "Short name (compact UI spots):",
  );

  const primaryColor = await askText(
    flags.color,
    DEFAULT_COLOR,
    "Primary theme color (hex):",
    (value) =>
      isValidHexColor(value)
        ? undefined
        : "Enter a hex color like #145FFF.",
  );

  let tileProvider: ProjectAnswers["tileProvider"];
  if (flags.tiles !== undefined) {
    if (flags.tiles !== "openstreetmap" && flags.tiles !== "mapbox") {
      bail(`--tiles must be "openstreetmap" or "mapbox", got "${flags.tiles}".`);
    }
    tileProvider = flags.tiles;
  } else if (flags.yes) {
    tileProvider = "openstreetmap";
  } else {
    tileProvider = unwrap(
      await p.select({
        message: "Map tile provider:",
        options: [
          {
            value: "openstreetmap" as const,
            label: "OpenStreetMap",
            hint: "no token required",
          },
          {
            value: "mapbox" as const,
            label: "Mapbox",
            hint: "requires NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN",
          },
        ],
      }),
    );
  }

  let initGit: boolean;
  if (flags.git !== undefined) {
    initGit = flags.git;
  } else if (flags.yes) {
    initGit = true;
  } else {
    initGit = unwrap(
      await p.confirm({
        message: "Initialize a git repository?",
        initialValue: true,
      }),
    );
  }

  return {
    directory: resolvedDir,
    packageName,
    orgName,
    orgShortName,
    orgSlug: toKebabCase(orgName) || "vertex-app",
    primaryColor,
    tileProvider,
    initGit,
  };
}
