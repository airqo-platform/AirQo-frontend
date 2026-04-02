import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tryLoadEnv = (envPath) => {
  try {
    const file = fs.readFileSync(envPath, "utf8");
    for (const line of file.split("\n")) {
      const match = line.match(/^\s*([A-Z_0-9]+)\s*=\s*(.*)/);
      if (match) {
        let val = match[2].trim();
        const commentIdx = val.indexOf(" #");
        if (commentIdx !== -1) val = val.substring(0, commentIdx).trim();
        if (!process.env[match[1]]) process.env[match[1]] = val;
      }
    }
  } catch (e) {}
};

// Actively hunt for the .env file in both the project root and the src folder just in case
tryLoadEnv(path.resolve(__dirname, "../../.env")); 
tryLoadEnv(path.resolve(__dirname, "../.env"));

const RAW_API_BASE = process.env.NEXT_PUBLIC_API_BASE;
if (!RAW_API_BASE) {
  console.error("[measurements.json] 🛑 FATAL: NEXT_PUBLIC_API_BASE is undefined. Please restart your dev server to load the new .env variables.");
  process.exit(1);
}
const API_BASE = RAW_API_BASE.replace(/\/$/, "");
const DEFAULT_GRID_ID = "64b7ef42d7249f0029fed6e6";

const getWeekRange = () => {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 7);
  const toISOString = (date) => date.toISOString().slice(0, 16);
  return { start_time: toISOString(start), end_time: toISOString(end) };
};

const log = (message, context = {}) => {
  console.warn(message, context);
};

const gridId = DEFAULT_GRID_ID;
const { start_time, end_time } = getWeekRange();
log("[measurements.json] request", { gridId, start_time, end_time });

const token = process.env.NEXT_PUBLIC_API_TOKEN || "";
if (!token) {
  console.warn("[measurements.json] missing NEXT_PUBLIC_API_TOKEN");
}
const target = new URL(`${API_BASE}/devices/measurements/grids/${gridId}/recent`);
if (token) target.searchParams.set("token", token);
target.searchParams.set("start_time", start_time);
target.searchParams.set("end_time", end_time);
target.searchParams.set("startTime", start_time);
target.searchParams.set("endTime", end_time);

const response = await fetch(target.toString(), {
  method: "GET",
  headers: { "Content-Type": "application/json" }
});

const text = await response.text();
console.warn("[measurements.json] API Response snippet:", text.slice(0, 500));

if (!response.ok) {
  console.warn("[measurements.json] upstream error", {
    status: response.status,
  });
  process.stdout.write(
    JSON.stringify({
      success: false,
      status: response.status,
      message: "Failed to load measurements",
      error: text.slice(0, 500),
    })
  );
} else {
  process.stdout.write(text);
}
