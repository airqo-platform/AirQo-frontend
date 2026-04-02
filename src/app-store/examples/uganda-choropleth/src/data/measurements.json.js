import logger from "../logger.js";

const API_BASE = "https://api.airqo.net/api/v2";
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
const target = new URL(`${API_BASE}/devices/measurements/grids/${gridId}`);
if (token) target.searchParams.set("token", token);

const response = await fetch(target.toString(), {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ start_time, end_time }),
});
const text = await response.text();
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
