/**
 * Status code sets: decoding the status values devices report (e.g. BAM-1020 error codes).
 *
 * A set holds one device type's codes and its decode rule. A device profile points the
 * telemetry field that carries the status at a set by name (`status_code_set` in the
 * field's mapping). Decoding here matches beacon-api's `/status-code-sets/{name}/decode`.
 */
import type {
  DecodedStatus,
  DeviceProfile,
  StatusCode,
  StatusCodeKind,
  StatusCodeSet,
  StatusDecodeResult,
  StatusDecodeRule,
} from "@/types/diagnostics"

// A decoded value takes the most serious kind among its parts; an undefined part ranks below a fault.
const STATUS_RANK: Record<Exclude<DecodedStatus, "invalid">, number> = { ok: 0, info: 1, unknown: 2, fault: 3 }

// Whole numbers are only exact below 2^53 (beacon-api reads values as floats and rejects larger ones too)
const MAX_VALUE = 2 ** 53

const invalid = (value: number | null): StatusDecodeResult => ({ value, status: "invalid", codes: [], unknown_codes: [] })

// Division instead of bitwise operators, which JavaScript limits to 32 bits.
const bitsOf = (value: number): number[] => {
  const bits: number[] = []
  for (let bit = 1; bit <= value; bit *= 2) {
    if (Math.floor(value / bit) % 2 === 1) bits.push(bit)
  }
  return bits
}

const isSingleBit = (code: number): boolean => code > 0 && Number.isInteger(Math.log2(code))

/**
 * Translate one reported value into its codes. With the `bitmask` rule the value is the sum of
 * its active codes (17 = 16 + 1); with `exact` it is one code. The value must be a non-negative
 * whole number below 2^53 (`17`, `17.0` or `"17"`), otherwise the result is `invalid`.
 */
export function decodeStatus(set: Pick<StatusCodeSet, "decode_rule" | "codes">, value: unknown): StatusDecodeResult {
  if ((typeof value !== "number" && typeof value !== "string") || value === "") return invalid(null)
  const number = Number(value)
  if (!Number.isFinite(number)) return invalid(null)
  if (number < 0 || number >= MAX_VALUE || Math.abs(number - Math.round(number)) > 1e-6) return invalid(number)

  const whole = Math.round(number)
  const byCode = new Map(set.codes.map((code) => [code.code, code]))
  let codes: StatusCode[]
  let unknownCodes: number[]
  if (set.decode_rule === "bitmask" && whole === 0) {
    codes = byCode.has(0) ? [byCode.get(0)!] : []
    unknownCodes = []
  } else {
    const wanted = set.decode_rule === "bitmask" ? bitsOf(whole) : [whole]
    codes = wanted.filter((code) => byCode.has(code)).map((code) => byCode.get(code)!)
    unknownCodes = wanted.filter((code) => !byCode.has(code))
  }

  const kinds: Array<keyof typeof STATUS_RANK> = [...codes.map((code) => code.kind), ...(unknownCodes.length ? ["unknown" as const] : [])]
  const status = kinds.reduce<keyof typeof STATUS_RANK>((worst, kind) => (STATUS_RANK[kind] > STATUS_RANK[worst] ? kind : worst), "ok")
  return { value: number, status, codes, unknown_codes: unknownCodes }
}

/** A part of a reported status that needs attention: a fault or info code, or an undefined code. */
export interface StatusIssue {
  code: number
  label: string
  description: string | null
  kind: StatusCodeKind | "unknown"
}

/**
 * A decoded value's parts as issues: its codes (without `ok` ones unless `includeOk`), then each
 * part with no defined code as an `unknown` issue.
 */
export function toStatusIssues(result: StatusDecodeResult, setName: string, includeOk = false): StatusIssue[] {
  return [
    ...result.codes
      .filter((code) => includeOk || code.kind !== "ok")
      .map((code) => ({ ...code, description: code.description ?? null })),
    ...result.unknown_codes.map((code) => ({
      code,
      label: "Unknown code",
      description: `Not defined in the ${setName} status code set.`,
      kind: "unknown" as const,
    })),
  ]
}

/**
 * The parts of a reported status worth showing, i.e. everything except `ok` codes. Without a set
 * (none linked to the device's profile, or still loading) a non-zero value is listed undecoded.
 */
export function getStatusIssues(set: StatusCodeSet | null, value: unknown): StatusIssue[] {
  if (!set) {
    const number = Number(value)
    if (value === null || value === undefined || value === "" || !Number.isInteger(number) || number <= 0) return []
    return [{
      code: number,
      label: "Not decoded",
      description: "No status code set is linked to this device type's profile.",
      kind: "unknown",
    }]
  }
  return toStatusIssues(decodeStatus(set, value), set.name)
}

/** What is wrong with `codes` under `rule`, matching beacon-api's validation; empty when valid. */
export function validateStatusCodes(rule: StatusDecodeRule, codes: Array<Pick<StatusCode, "code" | "kind" | "label">>): string[] {
  const errors: string[] = []
  const seen = new Set<number>()
  for (const code of codes) {
    if (!Number.isInteger(code.code) || code.code < 0) {
      errors.push(Number.isNaN(code.code) ? "Every code needs a number." : `Code ${code.code} must be a whole number of 0 or more.`)
      continue
    }
    if (!code.label.trim()) errors.push(`Code ${code.code} needs a label.`)
    if (seen.has(code.code)) errors.push(`Code ${code.code} is listed more than once.`)
    seen.add(code.code)
    if (rule !== "bitmask") continue
    if (code.code !== 0 && !isSingleBit(code.code)) {
      errors.push(`Code ${code.code} is not a single bit (1, 2, 4, 8, ...), so a value like 17 couldn't be decoded one way only.`)
    }
    if (code.code === 0 && code.kind !== "ok") errors.push("Code 0 means no status is set, so its kind must be OK.")
    if (code.code !== 0 && code.kind === "ok") errors.push(`Code ${code.code} is OK; with the bitmask rule only code 0 can be.`)
  }
  return errors
}

/** A profile's status field: the telemetry slot linked to a status code set, and that set's name. */
export interface ProfileStatusField {
  slot: string
  key: string
  label: string
  setName: string
}

/**
 * The status code set linked to a profile: the `device_status` field's set if it has one,
 * otherwise the first telemetry field linked to a set.
 */
export function getProfileStatusField(profile: Pick<DeviceProfile, "telemetry_mappings"> | null | undefined): ProfileStatusField | null {
  const linked = Object.entries(profile?.telemetry_mappings || {}).filter(([, mapping]) => mapping?.status_code_set)
  const [slot, mapping] = linked.find(([, m]) => m.key === "device_status") ?? linked[0] ?? []
  if (!slot || !mapping?.status_code_set) return null
  return { slot, key: mapping.key, label: mapping.label, setName: mapping.status_code_set }
}

// Profile names some legacy categories use, mirroring beacon-api's `_resolve_profile_id`
const CATEGORY_PROFILE_ALIASES: Record<string, string[]> = {
  gas: ["lowcost_gas"],
  lowcost: ["lowcost", "AirQo-v5-DualPM"],
  "airqo-v5-dualpm": ["lowcost", "AirQo-v5-DualPM"],
}

/**
 * The profile a device category uses, matched the way beacon-api does: a profile named like the
 * category (case-insensitive, e.g. "bam"), else a legacy alias (`gas` → `lowcost_gas`). A device
 * without a category counts as `lowcost`.
 */
export function findProfileForCategory<T extends Pick<DeviceProfile, "name">>(profiles: T[], category: string | null | undefined): T | null {
  const wanted = (category || "lowcost").trim().toLowerCase()
  const direct = profiles.find((profile) => profile.name.trim().toLowerCase() === wanted)
  if (direct) return direct
  for (const alias of CATEGORY_PROFILE_ALIASES[wanted] ?? []) {
    const match = profiles.find((profile) => profile.name === alias)
    if (match) return match
  }
  return null
}
