import { config } from "@/lib/config";
import { fetchWithAuth } from "@/lib/api-client";
import authService from "@/services/api-service";
import {
  DailyDiagnosticsRunRequest,
  DailyDiagnosticsRunResponse,
  DeviceDailyDiagnostic,
  DeviceDailyDiagnosticSummary,
  DeviceHealthSnapshot,
  DeviceIndicatorSeries,
  DeviceIssueSummary,
  DeviceTrends,
  DiagnosticEvaluationResult,
  DiagnosticFeedbackCreate,
  DiagnosticTemplate,
  DeviceProfile,
  FleetDailySummary,
  FleetIssue,
  FleetIssueFilters,
  ProfileDiagnosticReadiness,
  StatusCodeSet,
  StatusCodeSetInput,
  StatusDecodeResponse,
} from "@/types/diagnostics";

// Same routing and auth as the other Beacon services: the Beacon API sits behind the platform
// gateway at /api/v1/beacon (plain /api/v1 when running against a local API), and the gateway
// expects the platform token as-is in Authorization. Anything else is rejected with 401, which
// fetchWithAuth treats as an expired session and signs the user out.
const getBaseUrl = () => `${config.apiUrl}${config.beaconApiPrefix}`;

const getAuthHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = authService.getToken();
  if (token) {
    headers["Authorization"] = token;
  }
  return headers;
};

/**
 * Error raised for non-2xx diagnostics responses. When the backend rejects an
 * evaluation because the device profile cannot drive a diagnostic analysis (422),
 * `errors` and `warnings` list what the profile is missing.
 */
export class DiagnosticsApiError extends Error {
  status: number;
  errors: string[];
  warnings: string[];

  constructor(message: string, status: number, errors: string[] = [], warnings: string[] = []) {
    super(message);
    this.name = "DiagnosticsApiError";
    this.status = status;
    this.errors = errors;
    this.warnings = warnings;
  }

  /** True when the device has no usable profile (evaluate endpoints return 422 with profile errors). */
  get isProfileNotDiagnosable(): boolean {
    return this.status === 422 && this.errors.length > 0;
  }
}

const toStringList = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === "string") : [];

const raiseForStatus = async (res: Response, context: string): Promise<void> => {
  if (res.ok) return;

  const text = await res.text().catch(() => "");
  let detail: unknown = undefined;
  try {
    detail = text ? JSON.parse(text)?.detail : undefined;
  } catch {
    detail = undefined;
  }

  // {"detail": {"message", "errors", "warnings"}} — profile cannot be diagnosed
  if (detail && typeof detail === "object" && !Array.isArray(detail)) {
    const d = detail as Record<string, unknown>;
    const errors = toStringList(d.errors);
    const message = typeof d.message === "string" ? d.message : `${context} (${res.status})`;
    throw new DiagnosticsApiError(message, res.status, errors, toStringList(d.warnings));
  }

  // {"detail": "..."} — HTTPException with a plain message
  if (typeof detail === "string") {
    throw new DiagnosticsApiError(`${context}: ${detail}`, res.status);
  }

  // {"detail": ["..."]} — e.g. invalid status codes (422) or a status code set name already in use (409)
  const detailMessages = toStringList(detail);
  if (detailMessages.length > 0) {
    throw new DiagnosticsApiError(`${context}: ${detailMessages.join(" ")}`, res.status, detailMessages);
  }

  // {"detail": [{"loc", "msg"}]} — request validation error
  if (Array.isArray(detail)) {
    const messages = detail
      .map((item: any) => (item?.msg ? `${(item.loc || []).slice(1).join(".") || "request"}: ${item.msg}` : null))
      .filter((m): m is string => Boolean(m));
    throw new DiagnosticsApiError(`${context}: ${messages.join("; ") || res.statusText}`, res.status);
  }

  throw new DiagnosticsApiError(
    `${context} (${res.status}: ${res.statusText || text || "Unknown Error"})`,
    res.status
  );
};

const buildQuery = (params: Record<string, string | number | boolean | string[] | undefined | null>): string => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((v) => query.append(key, v));
    } else {
      query.set(key, String(value));
    }
  });
  const qs = query.toString();
  return qs ? `?${qs}` : "";
};

// ==========================================
// REAL API SERVICE IMPLEMENTATION (NO MOCK DATA)
// ==========================================

export const diagnosticsService = {
  /**
   * Fetch Latest Device Health & Diagnoses (null when the device has never been evaluated)
   * GET /diagnostics/devices/{device_id}/health
   */
  async getDeviceHealth(deviceId: string): Promise<DeviceHealthSnapshot | null> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/diagnostics/devices/${encodeURIComponent(deviceId)}/health`,
      {
        headers: getAuthHeaders(),
      }
    );
    await raiseForStatus(res, `Failed to fetch health for device ${deviceId}`);
    return await res.json();
  },

  /**
   * Fetch Historical Health Trajectory
   * GET /diagnostics/devices/{device_id}/health/history?limit=30
   */
  async getDeviceHealthHistory(deviceId: string, limit: number = 30): Promise<DeviceHealthSnapshot[]> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/diagnostics/devices/${encodeURIComponent(deviceId)}/health/history?limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );
    await raiseForStatus(res, `Failed to fetch health history for device ${deviceId}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Run Live On-Demand Device Evaluation
   * POST /diagnostics/evaluate/{device_id}?save_snapshot=true
   * Throws DiagnosticsApiError (422, isProfileNotDiagnosable) when the device has no usable profile.
   */
  async evaluateDevice(
    deviceId: string,
    payload?: { context?: Record<string, any>; window_hours?: number; profile_id?: string }
  ): Promise<DiagnosticEvaluationResult> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/diagnostics/evaluate/${encodeURIComponent(deviceId)}?save_snapshot=true`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload || { window_hours: 24 }),
      }
    );
    await raiseForStatus(res, `Evaluation failed for device ${deviceId}`);
    return await res.json();
  },

  /**
   * Ad-Hoc Payload Evaluation (Simulator / Bench Tester)
   * POST /diagnostics/evaluate-payload
   * context accepts `expected_interval_seconds` and `policy` overrides.
   */
  async evaluatePayload(payload: {
    device_id: string;
    telemetry_window: any[];
    context?: Record<string, any>;
    window_hours?: number;
    profile_id?: string;
  }): Promise<DiagnosticEvaluationResult> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/diagnostics/evaluate-payload`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    await raiseForStatus(res, "Ad-hoc evaluation failed");
    return await res.json();
  },

  /**
   * Submit Field Technician Feedback
   * POST /diagnostics/feedback
   */
  async submitFeedback(feedback: DiagnosticFeedbackCreate): Promise<{ success: boolean; data?: any; error?: string }> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/diagnostics/feedback`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(feedback),
    });
    await raiseForStatus(res, "Feedback submission failed");
    const data = await res.json();
    return { success: true, data };
  },

  /**
   * Fetch Registered Device Profiles
   * GET /diagnostics/profiles?skip=0&limit=100&category=...
   */
  async getProfiles(filters?: { skip?: number; limit?: number; category?: string }): Promise<DeviceProfile[]> {
    const baseUrl = getBaseUrl();
    const qs = buildQuery({
      skip: filters?.skip,
      limit: filters?.limit,
      category: filters?.category && filters.category !== "all" ? filters.category : undefined,
    });
    const res = await fetchWithAuth(`${baseUrl}/diagnostics/profiles${qs}`, {
      headers: getAuthHeaders(),
    });
    await raiseForStatus(res, "Failed to fetch device profiles");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get Single Device Profile with complete component tree
   * GET /diagnostics/profiles/{profile_id}
   */
  async getProfile(profileId: string): Promise<DeviceProfile> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/diagnostics/profiles/${encodeURIComponent(profileId)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    await raiseForStatus(res, `Failed to fetch device profile ${profileId}`);
    return await res.json();
  },

  /**
   * What the diagnostic engine is missing to analyse devices on this profile
   * GET /diagnostics/profiles/{profile_id}/diagnostic-readiness
   */
  async getProfileReadiness(profileId: string): Promise<ProfileDiagnosticReadiness> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/diagnostics/profiles/${encodeURIComponent(profileId)}/diagnostic-readiness`,
      {
        headers: getAuthHeaders(),
      }
    );
    await raiseForStatus(res, `Failed to fetch diagnostic readiness for profile ${profileId}`);
    return await res.json();
  },

  /**
   * Save / Create Device Profile
   * POST /diagnostics/profiles
   */
  async createProfile(profile: Partial<DeviceProfile>): Promise<DeviceProfile> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/diagnostics/profiles`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });
    await raiseForStatus(res, "Failed to create device profile");
    return await res.json();
  },

  /**
   * Update Device Profile
   * PUT /diagnostics/profiles/{id}
   */
  async updateProfile(id: string, profile: Partial<DeviceProfile>): Promise<DeviceProfile> {
    const baseUrl = getBaseUrl();
    const sanitized: any = { ...profile };
    if (typeof sanitized.vendor === "object" && sanitized.vendor !== null) {
      if (sanitized.vendor.id && !sanitized.vendor_id) {
        sanitized.vendor_id = sanitized.vendor.id;
      }
      sanitized.vendor = sanitized.vendor.name || undefined;
    }

    const res = await fetchWithAuth(`${baseUrl}/diagnostics/profiles/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(sanitized),
    });
    await raiseForStatus(res, `Failed to update profile ${id}`);
    return await res.json();
  },

  /**
   * Delete Device Profile
   * DELETE /diagnostics/profiles/{id}
   */
  async deleteProfile(id: string): Promise<{ success: boolean }> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/diagnostics/profiles/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await raiseForStatus(res, `Failed to delete profile ${id}`);
    return { success: true };
  },

  /**
   * Fetch Diagnostic Templates & Rule Packs
   * GET /diagnostics/templates?skip=0&limit=100
   */
  async getTemplates(params?: { skip?: number; limit?: number }): Promise<DiagnosticTemplate[]> {
    const baseUrl = getBaseUrl();
    const qs = buildQuery({ skip: params?.skip, limit: params?.limit });
    const res = await fetchWithAuth(`${baseUrl}/diagnostics/templates${qs}`, {
      headers: getAuthHeaders(),
    });
    await raiseForStatus(res, "Failed to fetch diagnostic templates");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get Specific Diagnostic Template
   * GET /diagnostics/templates/{template_id}
   */
  async getTemplate(templateId: string): Promise<DiagnosticTemplate> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/diagnostics/templates/${encodeURIComponent(templateId)}`, {
      headers: getAuthHeaders(),
    });
    await raiseForStatus(res, `Failed to fetch diagnostic template ${templateId}`);
    return await res.json();
  },

  /**
   * Save / Create Diagnostic Template
   * POST /diagnostics/templates
   */
  async createTemplate(template: Partial<DiagnosticTemplate>): Promise<DiagnosticTemplate> {
    const baseUrl = getBaseUrl();
    const sanitized: any = { ...template };
    if (!sanitized.target_component_type && sanitized.category) {
      sanitized.target_component_type = sanitized.category;
    }

    const res = await fetchWithAuth(`${baseUrl}/diagnostics/templates`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(sanitized),
    });
    await raiseForStatus(res, "Failed to create diagnostic template");
    return await res.json();
  },

  /**
   * Update Diagnostic Template
   * PUT /diagnostics/templates/{template_id}
   */
  async updateTemplate(templateId: string, template: Partial<DiagnosticTemplate>): Promise<DiagnosticTemplate> {
    const baseUrl = getBaseUrl();
    const sanitized: any = { ...template };
    if (!sanitized.target_component_type && sanitized.category) {
      sanitized.target_component_type = sanitized.category;
    }

    const res = await fetchWithAuth(`${baseUrl}/diagnostics/templates/${encodeURIComponent(templateId)}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(sanitized),
    });
    await raiseForStatus(res, `Failed to update diagnostic template ${templateId}`);
    return await res.json();
  },

  /**
   * Delete Diagnostic Template
   * DELETE /diagnostics/templates/{template_id}
   */
  async deleteTemplate(templateId: string): Promise<{ success: boolean }> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/diagnostics/templates/${encodeURIComponent(templateId)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await raiseForStatus(res, `Failed to delete diagnostic template ${templateId}`);
    return { success: true };
  },

  /**
   * Reset / Seed Default Profiles and Templates
   * POST /diagnostics/seed-defaults
   */
  async seedDefaults(): Promise<{ message: string; profiles_seeded?: number; templates_seeded?: number }> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/diagnostics/seed-defaults`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    await raiseForStatus(res, "Seed defaults failed");
    return await res.json();
  },

  // ── Status Code Sets ────────────────────────────────────────────────────────

  /**
   * List status code sets with their codes
   * GET /status-code-sets/?skip=0&limit=100&search=
   */
  async getStatusCodeSets(params?: { skip?: number; limit?: number; search?: string }): Promise<StatusCodeSet[]> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/status-code-sets/${buildQuery({ ...params })}`, {
      headers: getAuthHeaders(),
    });
    await raiseForStatus(res, "Failed to fetch status code sets");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get a status code set by ID or name, e.g. "bam-1020"
   * GET /status-code-sets/{ref}
   */
  async getStatusCodeSet(ref: string): Promise<StatusCodeSet> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/status-code-sets/${encodeURIComponent(ref)}`, {
      headers: getAuthHeaders(),
    });
    await raiseForStatus(res, `Failed to fetch status code set ${ref}`);
    return await res.json();
  },

  /**
   * Create a status code set with its codes
   * POST /status-code-sets/
   */
  async createStatusCodeSet(input: StatusCodeSetInput): Promise<StatusCodeSet> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/status-code-sets/`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
    await raiseForStatus(res, "Failed to create status code set");
    return await res.json();
  },

  /**
   * Update a status code set; fields left out are kept and `codes`, when given, replaces the list
   * PATCH /status-code-sets/{ref}
   */
  async updateStatusCodeSet(ref: string, input: Partial<StatusCodeSetInput>): Promise<StatusCodeSet> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/status-code-sets/${encodeURIComponent(ref)}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(input),
    });
    await raiseForStatus(res, `Failed to update status code set ${ref}`);
    return await res.json();
  },

  /**
   * Delete a status code set and its codes
   * DELETE /status-code-sets/{ref}
   */
  async deleteStatusCodeSet(ref: string): Promise<{ success: boolean }> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/status-code-sets/${encodeURIComponent(ref)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    await raiseForStatus(res, `Failed to delete status code set ${ref}`);
    return { success: true };
  },

  /**
   * Translate reported values into their codes (up to 1,000 per request)
   * GET /status-code-sets/{ref}/decode?value=17&value=144
   */
  async decodeStatusValues(ref: string, values: Array<string | number>): Promise<StatusDecodeResponse> {
    const baseUrl = getBaseUrl();
    const qs = buildQuery({ value: values.map(String) });
    const res = await fetchWithAuth(`${baseUrl}/status-code-sets/${encodeURIComponent(ref)}/decode${qs}`, {
      headers: getAuthHeaders(),
    });
    await raiseForStatus(res, `Failed to decode status values with ${ref}`);
    return await res.json();
  },

  // ── Daily Diagnostics ───────────────────────────────────────────────────────

  /**
   * Day-by-day diagnosis history for a device (newest first)
   * GET /diagnostics/devices/{device_id}/daily
   */
  async getDeviceDailyDiagnostics(
    deviceId: string,
    filters?: { start_date?: string; end_date?: string; lifecycle_state?: string; limit?: number }
  ): Promise<DeviceDailyDiagnosticSummary[]> {
    const baseUrl = getBaseUrl();
    const qs = buildQuery({ ...filters });
    const res = await fetchWithAuth(
      `${baseUrl}/diagnostics/devices/${encodeURIComponent(deviceId)}/daily${qs}`,
      { headers: getAuthHeaders() }
    );
    await raiseForStatus(res, `Failed to fetch daily diagnostics for device ${deviceId}`);
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Full diagnosis for one device-day (evidence, causes, issues, metric summary)
   * GET /diagnostics/devices/{device_id}/daily/{diagnosis_date}
   */
  async getDeviceDailyDiagnostic(deviceId: string, diagnosisDate: string): Promise<DeviceDailyDiagnostic> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/diagnostics/devices/${encodeURIComponent(deviceId)}/daily/${encodeURIComponent(diagnosisDate)}`,
      { headers: getAuthHeaders() }
    );
    await raiseForStatus(res, `Failed to fetch diagnosis for ${deviceId} on ${diagnosisDate}`);
    return await res.json();
  },

  /**
   * Recurring / active issues and daily health trend for a device
   * GET /diagnostics/devices/{device_id}/issues?days=30
   */
  async getDeviceIssueSummary(deviceId: string, days: number = 30): Promise<DeviceIssueSummary> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/diagnostics/devices/${encodeURIComponent(deviceId)}/issues${buildQuery({ days })}`,
      { headers: getAuthHeaders() }
    );
    await raiseForStatus(res, `Failed to fetch issue summary for device ${deviceId}`);
    return await res.json();
  },

  /**
   * Daily indicator time series per component (charge cycle, coverage, sensor agreement, generation)
   * GET /diagnostics/devices/{device_id}/indicators?days=30&component=&indicator=
   */
  async getDeviceIndicators(
    deviceId: string,
    params?: { days?: number; component?: string; indicator?: string }
  ): Promise<DeviceIndicatorSeries> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/diagnostics/devices/${encodeURIComponent(deviceId)}/indicators${buildQuery({ ...params })}`,
      { headers: getAuthHeaders() }
    );
    await raiseForStatus(res, `Failed to fetch indicators for device ${deviceId}`);
    return await res.json();
  },

  /**
   * Multi-day trends of the device's indicators, degrading first
   * GET /diagnostics/devices/{device_id}/trends?window_days=&as_of=
   */
  async getDeviceTrends(deviceId: string, params?: { window_days?: number; as_of?: string }): Promise<DeviceTrends> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/diagnostics/devices/${encodeURIComponent(deviceId)}/trends${buildQuery({ ...params })}`,
      { headers: getAuthHeaders() }
    );
    await raiseForStatus(res, `Failed to fetch trends for device ${deviceId}`);
    return await res.json();
  },

  /**
   * Fleet health for one day (defaults to the latest diagnosed day). `group` limits it to
   * the group's devices and defaults the day to that group's latest diagnosed day.
   * GET /diagnostics/fleet/daily-summary
   */
  async getFleetDailySummary(params?: { diagnosis_date?: string; top_n?: number; group?: string }): Promise<FleetDailySummary> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/diagnostics/fleet/daily-summary${buildQuery({ ...params })}`,
      { headers: getAuthHeaders() }
    );
    await raiseForStatus(res, "Failed to fetch fleet daily summary");
    return await res.json();
  },

  /**
   * Search detected issues across the fleet
   * GET /diagnostics/fleet/issues
   */
  async getFleetIssues(filters?: FleetIssueFilters): Promise<FleetIssue[]> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/diagnostics/fleet/issues${buildQuery({ ...filters })}`,
      { headers: getAuthHeaders() }
    );
    await raiseForStatus(res, "Failed to fetch fleet issues");
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Run or backfill daily diagnostics in the background (only days with raw data, max 14 days back)
   * POST /diagnostics/daily/run
   */
  async triggerDailyRun(request: DailyDiagnosticsRunRequest = {}): Promise<DailyDiagnosticsRunResponse> {
    const baseUrl = getBaseUrl();
    const qs = buildQuery({
      start_date: request.start_date,
      end_date: request.end_date,
      device_id: request.device_ids && request.device_ids.length > 0 ? request.device_ids : undefined,
      force: request.force || undefined,
      lookback_days: request.lookback_days,
    });
    const res = await fetchWithAuth(`${baseUrl}/diagnostics/daily/run${qs}`, {
      method: "POST",
      headers: getAuthHeaders(),
    });
    await raiseForStatus(res, "Failed to start daily diagnostics");
    return await res.json();
  },
};
