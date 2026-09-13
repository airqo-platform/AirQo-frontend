import { DeviceProfile, MetricDefinition } from "@/types/diagnostics";

/**
 * Synthetic telemetry for the bench simulator, generated from a device profile's own
 * metric limits so every scenario exercises one of the engine's generic checks.
 */

export type ScenarioId =
  | "nominal"
  | "below_min"
  | "above_max"
  | "rate_spike"
  | "stuck"
  | "missing"
  | "sensor_disagreement"
  | "data_gaps";

export interface SimMetric {
  ref: string; // "component.metric", as reported by diagnostic readiness
  componentName: string;
  metric: MetricDefinition;
  field: string; // Raw record field: the telemetry slot, so records look like device data
}

export interface ScenarioDefinition {
  id: ScenarioId;
  label: string;
  description: string;
  target: "none" | "metric" | "pair";
  /** Whether a metric can be the target of this scenario. */
  supports?: (m: SimMetric) => boolean;
}

export const SCENARIOS: ScenarioDefinition[] = [
  { id: "nominal", label: "Nominal", description: "Every metric oscillates inside its expected range.", target: "none" },
  {
    id: "below_min",
    label: "Below minimum",
    description: "The metric drops below expected_min for the second half of the window.",
    target: "metric",
    supports: (m) => m.metric.expected_min !== null && m.metric.expected_min !== undefined,
  },
  {
    id: "above_max",
    label: "Above maximum",
    description: "The metric rises above expected_max for the second half of the window.",
    target: "metric",
    supports: (m) => m.metric.expected_max !== null && m.metric.expected_max !== undefined,
  },
  {
    id: "rate_spike",
    label: "Rate spike",
    description: "The metric ramps at 3× max_rate_of_change for an hour, then back.",
    target: "metric",
    supports: (m) => typeof m.metric.max_rate_of_change === "number" && m.metric.max_rate_of_change > 0,
  },
  { id: "stuck", label: "Stuck value", description: "The metric reports the same value for the whole window.", target: "metric" },
  { id: "missing", label: "Missing metric", description: "The metric is absent from every record.", target: "metric" },
  {
    id: "sensor_disagreement",
    label: "Sensor disagreement",
    description: "Halfway through the window, the second sensor of a MEASURES_SAME_AS pair starts moving opposite to the first.",
    target: "pair",
  },
  {
    id: "data_gaps",
    label: "Data gaps",
    description: "60% of the expected records are dropped.",
    target: "none",
  },
];

const TIME_UNIT_SECONDS: Record<string, number> = {
  ms: 0.001, s: 1, sec: 1, second: 1, seconds: 1,
  min: 60, minute: 60, minutes: 60, h: 3600, hour: 3600, hours: 3600,
};

const MAX_RECORDS = 1500;
const DEFAULT_INTERVAL_SECONDS = 300;

/** Mirrors the backend: the `reporting_interval` config mapping's default, converted to seconds. */
export function resolveReportingIntervalSeconds(profile: DeviceProfile, intervalKey = "reporting_interval"): number | null {
  for (const meta of Object.values(profile.config_mappings || {})) {
    if (!meta || meta.key !== intervalKey) continue;
    const value = Number(meta.default);
    if (!Number.isFinite(value) || value <= 0) return null;
    return value * (TIME_UNIT_SECONDS[String(meta.unit || "s").toLowerCase()] ?? 1);
  }
  return null;
}

/** Telemetry-mapped component metrics, i.e. the ones the engine evaluates. */
export function listSimMetrics(profile: DeviceProfile): SimMetric[] {
  const slotByKey = new Map<string, string>();
  Object.entries(profile.telemetry_mappings || {}).forEach(([slot, meta]) => {
    const key = typeof meta === "string" ? meta : meta?.key;
    if (key && !slotByKey.has(key)) slotByKey.set(key, slot);
  });

  const metrics: SimMetric[] = [];
  (profile.components || []).forEach((component) => {
    (component.metrics || []).forEach((metric) => {
      if (metric.is_telemetry_field === false) return;
      const slot = slotByKey.get(metric.key);
      if (!slot) return;
      metrics.push({ ref: `${component.name}.${metric.key}`, componentName: component.name, metric, field: slot });
    });
  });
  return metrics;
}

/** "a.metric ~ b.metric" pairs from diagnostic readiness. */
export function parseRedundantPair(pair: string): [string, string] | null {
  const parts = pair.split("~").map((p) => p.trim());
  return parts.length === 2 && parts[0] && parts[1] ? [parts[0], parts[1]] : null;
}

interface Envelope {
  mid: number;
  span: number;
}

const envelopeFor = (metric: MetricDefinition): Envelope => {
  const min = metric.expected_min ?? null;
  const max = metric.expected_max ?? null;
  if (min !== null && max !== null && max > min) return { mid: (min + max) / 2, span: max - min };
  if (min !== null) {
    const mid = min === 0 ? 10 : min + Math.abs(min) * 0.5;
    return { mid, span: Math.abs(mid - min) * 2 || 10 };
  }
  if (max !== null) {
    const mid = max === 0 ? -10 : max - Math.abs(max) * 0.5;
    return { mid, span: Math.abs(max - mid) * 2 || 10 };
  }
  return { mid: 10, span: 10 };
};

// Deterministic jitter in [-0.5, 0.5) so regenerated payloads are reproducible.
const jitter = (i: number, seed: number) => {
  const x = Math.sin(i * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x) - 0.5;
};

const round = (v: number) => Math.round(v * 10000) / 10000;

export interface GeneratedScenario {
  records: Record<string, any>[];
  intervalSeconds: number;
}

export function generateScenarioTelemetry(options: {
  profile: DeviceProfile;
  scenario: ScenarioId;
  target?: string | null; // metric ref, or a readiness pair string for sensor_disagreement
  windowHours: number;
  now?: number;
}): GeneratedScenario {
  const { profile, scenario, target, windowHours } = options;
  const metrics = listSimMetrics(profile);
  const windowSeconds = Math.max(1, windowHours) * 3600;

  let intervalSeconds = resolveReportingIntervalSeconds(profile) || DEFAULT_INTERVAL_SECONDS;
  if (windowSeconds / intervalSeconds > MAX_RECORDS) {
    intervalSeconds = Math.ceil(windowSeconds / MAX_RECORDS);
  }
  const count = Math.max(2, Math.floor(windowSeconds / intervalSeconds));
  const end = Math.floor((options.now ?? Date.now()) / (intervalSeconds * 1000)) * intervalSeconds * 1000;
  const start = end - count * intervalSeconds * 1000;
  const halfHours = (count * intervalSeconds) / 7200;

  const pair = scenario === "sensor_disagreement" && target ? parseRedundantPair(target) : null;

  const records: Record<string, any>[] = [];
  for (let i = 0; i < count; i++) {
    if (scenario === "data_gaps" && i % 5 >= 2) continue;

    const hours = (i * intervalSeconds) / 3600;
    const secondHalf = hours >= halfHours;
    const record: Record<string, any> = { datetime: new Date(start + i * intervalSeconds * 1000).toISOString() };

    metrics.forEach((m, seed) => {
      const isTarget = m.ref === target;
      if (scenario === "missing" && isTarget) return;

      const { mid, span } = envelopeFor(m.metric);
      const maxRate = m.metric.max_rate_of_change;
      // Keep the daily oscillation well under the allowed rate of change.
      let amplitude = span * 0.2;
      if (typeof maxRate === "number" && maxRate >= 0) {
        amplitude = Math.min(amplitude, ((maxRate * 24) / (2 * Math.PI)) * 0.3);
      }
      let noise = Math.max(amplitude * 0.02, span * 0.001, 0.001);
      if (typeof maxRate === "number" && maxRate > 0) noise = Math.min(noise, maxRate * 0.05);

      let value = mid + amplitude * Math.sin((2 * Math.PI * hours) / 24) + noise * jitter(i, seed);

      if (isTarget) {
        const offset = Math.max(span * 0.2, 0.5);
        if (scenario === "below_min" && secondHalf && m.metric.expected_min != null) {
          value = m.metric.expected_min - offset + noise * jitter(i, seed + 1);
        } else if (scenario === "above_max" && secondHalf && m.metric.expected_max != null) {
          value = m.metric.expected_max + offset + noise * jitter(i, seed + 1);
        } else if (scenario === "stuck") {
          value = mid;
        } else if (scenario === "rate_spike" && typeof maxRate === "number" && maxRate > 0) {
          const t = hours - halfHours;
          const peak = maxRate * 3;
          if (t >= 0 && t < 1) value += peak * t;
          else if (t >= 1 && t < 2) value += peak * (2 - t);
        }
      }

      // Mirror the second sensor around its midpoint: it stays inside its own limits
      // but moves opposite to its pair, so only the agreement check fires.
      if (pair && m.ref === pair[1] && secondHalf) {
        value = 2 * mid - value;
      }

      record[m.field] = round(value);
    });

    records.push(record);
  }

  return { records, intervalSeconds };
}
