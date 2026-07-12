import fs from "fs";
import path from "path";
import dotenv from "dotenv";

/**
 * Mutation-flow specs call this in beforeAll as a safety net: the local dev
 * server proxies /api/* to whatever NEXT_PUBLIC_API_URL points at, and specs
 * that exercise write flows must never run against a production backend —
 * even with route interception in place, a bad glob would let real POSTs
 * through. Staging is a sanctioned playground; production is not.
 */
export function assertNonProductionApiTarget(): void {
  const vertexRoot = path.resolve(__dirname, "../..");
  let apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    for (const file of [".env.local", ".env"]) {
      const envPath = path.join(vertexRoot, file);
      if (fs.existsSync(envPath)) {
        const parsed = dotenv.parse(fs.readFileSync(envPath));
        if (parsed.NEXT_PUBLIC_API_URL) {
          apiUrl = parsed.NEXT_PUBLIC_API_URL;
          break;
        }
      }
    }
  }

  if (!apiUrl) {
    throw new Error(
      "Could not resolve NEXT_PUBLIC_API_URL from the environment or src/vertex/.env.local — " +
        "refusing to run mutation e2e specs against an unknown backend."
    );
  }

  if (!/staging|localhost|127\.0\.0\.1/i.test(apiUrl)) {
    throw new Error(
      `NEXT_PUBLIC_API_URL (${apiUrl}) does not look like a staging or local backend — ` +
        "refusing to run mutation e2e specs against what may be production."
    );
  }
}
