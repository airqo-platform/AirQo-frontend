import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import {
  PUBLIC_ENV_KEYS,
  getPublicEnv,
  getPublicEnvScript,
  getPublicEnvSnapshot,
  readServerEnv,
} from "./public-env";

describe("public-env", () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    originalEnv = process.env;
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    delete window.__VERTEX_PUBLIC_ENV__;
  });

  it("reads from the copy the server wrote into the page", () => {
    process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN = "from-process";
    window.__VERTEX_PUBLIC_ENV__ = { NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN: "from-page" };

    expect(getPublicEnv("NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN")).toBe("from-page");
  });

  it("does not fall back to process.env once the page copy exists", () => {
    process.env.NEXT_PUBLIC_ENV = "from-process";
    window.__VERTEX_PUBLIC_ENV__ = {};

    expect(getPublicEnv("NEXT_PUBLIC_ENV")).toBeUndefined();
  });

  it("falls back to process.env without a page copy (server, tests)", () => {
    process.env.NEXT_PUBLIC_ENV = "staging";

    expect(getPublicEnv("NEXT_PUBLIC_ENV")).toBe("staging");
  });

  it("keeps the API token out of the page", () => {
    process.env.NEXT_PUBLIC_API_TOKEN = "secret-token";
    process.env.NEXT_PUBLIC_API_URL = "https://api.example.test";

    expect(PUBLIC_ENV_KEYS).not.toContain("NEXT_PUBLIC_API_TOKEN");
    expect(getPublicEnvSnapshot()).not.toHaveProperty("NEXT_PUBLIC_API_TOKEN");
    expect(getPublicEnvScript()).not.toContain("secret-token");
    expect(readServerEnv("NEXT_PUBLIC_API_TOKEN")).toBe("secret-token");
  });

  it("leaves out empty values", () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "";

    expect(getPublicEnvSnapshot()).not.toHaveProperty("NEXT_PUBLIC_POSTHOG_KEY");
  });

  it("escapes < so a value cannot close the script tag", () => {
    const script = getPublicEnvScript({
      NEXT_PUBLIC_APP_VERSION: "</script><script>alert(1)</script>",
    });

    expect(script).not.toContain("</script>");
    expect(script.startsWith("window.__VERTEX_PUBLIC_ENV__=")).toBe(true);
  });

  // Next.js freezes every literal process.env.NEXT_PUBLIC_* into the build, so one
  // stray read brings back the need for a .env at build time (and, for the API
  // token, shipped it to the browser). next.config.* is evaluated at build anyway.
  it("has no literal process.env.NEXT_PUBLIC_ reads outside next.config", () => {
    const root = path.resolve(__dirname, "..");
    const skipDirs = new Set(["node_modules", ".next", "e2e", "test", "coverage", "public"]);
    const offenders: string[] = [];

    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith(".")) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!skipDirs.has(entry.name) && entry.name !== "__tests__") walk(full);
          continue;
        }
        if (!/\.(ts|tsx|js|jsx|mjs)$/.test(entry.name)) continue;
        if (/\.test\.|\.spec\.|^next\.config\.|^vitest\./.test(entry.name)) continue;
        const source = fs.readFileSync(full, "utf8");
        if (/process\.env\.NEXT_PUBLIC_/.test(source)) offenders.push(path.relative(root, full));
      }
    };
    walk(root);

    expect(offenders, "use getPublicEnv() from lib/public-env instead").toEqual([]);
  });
});
