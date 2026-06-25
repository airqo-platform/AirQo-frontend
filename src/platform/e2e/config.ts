import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(__dirname, ".env") });

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value || value.includes("your-") || value.includes("example")) {
    console.warn(
      `\n⚠️  Missing or placeholder value for ${name}.\n` +
      `   Copy .env.example to .env and fill in your real values:\n` +
      `   cp .env.example .env\n`
    );
  }
  return value || "";
}

export const Config = {
  BASE_URL: requireEnv("BASE_URL") || "http://localhost:3000",
  BROWSER: process.env.BROWSER || "chrome",
  HEADLESS: process.env.HEADLESS !== "false",
  IMPLICIT_WAIT: parseInt(process.env.IMPLICIT_WAIT || "10", 10),
  PAGE_LOAD_TIMEOUT: parseInt(process.env.PAGE_LOAD_TIMEOUT || "30", 10),
  TEST_USER_EMAIL: requireEnv("TEST_USER_EMAIL"),
  TEST_USER_PASSWORD: requireEnv("TEST_USER_PASSWORD"),
  TEST_ORG_SLUG: requireEnv("TEST_ORG_SLUG"),
};
