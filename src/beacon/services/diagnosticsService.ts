import { config } from "@/lib/config";
import { fetchWithAuth } from "@/lib/api-client";
import {
  DeviceHealthSnapshot,
  DiagnosticEvaluationResult,
  DiagnosticFeedbackCreate,
  DiagnosticTemplate,
  DeviceProfile,
  FleetTriageDeviceItem,
  FleetTriageSummary,
  LifecycleState,
} from "@/types/diagnostics";

const getBaseUrl = () => {
  if (typeof window !== "undefined") {
    return process.env.NEXT_PUBLIC_BEACON_API_URL || config.apiUrl || "http://localhost:8000";
  }
  return process.env.NEXT_PUBLIC_BEACON_API_URL || "http://localhost:8000";
};

const getAuthHeaders = (): HeadersInit => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
};

// Helper to calculate lifecycle state from health score if not provided
export const calculateLifecycleState = (healthScore: number, topConfidence: number = 0): LifecycleState => {
  if (healthScore < 20) return "FAILED";
  if (healthScore < 50 || topConfidence >= 85) return "LIKELY_FAILURE";
  if (healthScore < 70 || topConfidence >= 70) return "SUSPICIOUS";
  if (healthScore < 85) return "DEGRADING";
  return "HEALTHY";
};

// ==========================================
// REAL API SERVICE IMPLEMENTATION (NO MOCK DATA)
// ==========================================

export const diagnosticsService = {
  /**
   * Fetch Latest Device Health & Diagnoses
   * GET /api/v1/diagnostics/devices/{device_id}/health
   */
  async getDeviceHealth(deviceId: string): Promise<DeviceHealthSnapshot> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/api/v1/diagnostics/devices/${encodeURIComponent(deviceId)}/health`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to fetch health for device ${deviceId} (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return await res.json();
  },

  /**
   * Fetch Historical Health Trajectory
   * GET /api/v1/diagnostics/devices/{device_id}/health/history?limit=30
   */
  async getDeviceHealthHistory(deviceId: string, limit: number = 30): Promise<DeviceHealthSnapshot[]> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/api/v1/diagnostics/devices/${encodeURIComponent(deviceId)}/health/history?limit=${limit}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to fetch health history for device ${deviceId} (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Run Live On-Demand Device Evaluation
   * POST /api/v1/diagnostics/evaluate/{device_id}?save_snapshot=true
   */
  async evaluateDevice(
    deviceId: string,
    payload?: { context?: Record<string, any>; window_hours?: number }
  ): Promise<DiagnosticEvaluationResult> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/api/v1/diagnostics/evaluate/${encodeURIComponent(deviceId)}?save_snapshot=true`,
      {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload || { window_hours: 24 }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Evaluation failed for device ${deviceId} (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return await res.json();
  },

  /**
   * Ad-Hoc Payload Evaluation (Simulator / Bench Tester)
   * POST /api/v1/diagnostics/evaluate-payload
   */
  async evaluatePayload(payload: {
    device_id: string;
    telemetry_window: any[];
    context?: Record<string, any>;
    window_hours?: number;
    profile_id?: string;
  }): Promise<DiagnosticEvaluationResult> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/evaluate-payload`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Ad-hoc evaluation failed (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return await res.json();
  },

  /**
   * Submit Field Technician Feedback
   * POST /api/v1/diagnostics/feedback
   */
  async submitFeedback(feedback: DiagnosticFeedbackCreate): Promise<{ success: boolean; data?: any; error?: string }> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/feedback`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(feedback),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Feedback submission failed (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    const data = await res.json();
    return { success: true, data };
  },

  /**
   * Fetch Registered Device Profiles
   * GET /api/v1/diagnostics/profiles?skip=0&limit=100&category=...
   */
  async getProfiles(filters?: { skip?: number; limit?: number; category?: string }): Promise<DeviceProfile[]> {
    const baseUrl = getBaseUrl();
    const query = new URLSearchParams();
    if (filters?.skip !== undefined) query.set("skip", String(filters.skip));
    if (filters?.limit !== undefined) query.set("limit", String(filters.limit));
    if (filters?.category && filters.category !== "all") query.set("category", filters.category);

    const qs = query.toString();
    const url = `${baseUrl}/api/v1/diagnostics/profiles${qs ? `?${qs}` : ""}`;

    const res = await fetchWithAuth(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to fetch device profiles (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get Single Device Profile with complete component tree
   * GET /api/v1/diagnostics/profiles/{profile_id}
   */
  async getProfile(profileId: string): Promise<DeviceProfile> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(
      `${baseUrl}/api/v1/diagnostics/profiles/${encodeURIComponent(profileId)}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to fetch device profile ${profileId} (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return await res.json();
  },

  /**
   * Save / Create Device Profile
   * POST /api/v1/diagnostics/profiles
   */
  async createProfile(profile: Partial<DeviceProfile>): Promise<DeviceProfile> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/profiles`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(profile),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to create device profile (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return await res.json();
  },

  /**
   * Update Device Profile
   * PUT /api/v1/diagnostics/profiles/{id}
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

    const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/profiles/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(sanitized),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to update profile ${id} (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return await res.json();
  },

  /**
   * Delete Device Profile
   * DELETE /api/v1/diagnostics/profiles/{id}
   */
  async deleteProfile(id: string): Promise<{ success: boolean }> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/profiles/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to delete profile ${id} (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return { success: true };
  },

  /**
   * Fetch Diagnostic Templates & Rule Packs
   * GET /api/v1/diagnostics/templates?skip=0&limit=100
   */
  async getTemplates(params?: { skip?: number; limit?: number }): Promise<DiagnosticTemplate[]> {
    const baseUrl = getBaseUrl();
    const query = new URLSearchParams();
    if (params?.skip !== undefined) query.set("skip", String(params.skip));
    if (params?.limit !== undefined) query.set("limit", String(params.limit));

    const qs = query.toString();
    const url = `${baseUrl}/api/v1/diagnostics/templates${qs ? `?${qs}` : ""}`;

    const res = await fetchWithAuth(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to fetch diagnostic templates (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    const data = await res.json();
    return Array.isArray(data) ? data : [];
  },

  /**
   * Get Specific Diagnostic Template
   * GET /api/v1/diagnostics/templates/{template_id}
   */
  async getTemplate(templateId: string): Promise<DiagnosticTemplate> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/templates/${encodeURIComponent(templateId)}`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to fetch diagnostic template ${templateId} (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return await res.json();
  },

  /**
   * Save / Create Diagnostic Template
   * POST /api/v1/diagnostics/templates
   */
  async createTemplate(template: Partial<DiagnosticTemplate>): Promise<DiagnosticTemplate> {
    const baseUrl = getBaseUrl();
    const sanitized: any = { ...template };
    if (!sanitized.target_component_type && sanitized.category) {
      sanitized.target_component_type = sanitized.category;
    }

    const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/templates`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(sanitized),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to create diagnostic template (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return await res.json();
  },

  /**
   * Update Diagnostic Template
   * PUT /api/v1/diagnostics/templates/{template_id}
   */
  async updateTemplate(templateId: string, template: Partial<DiagnosticTemplate>): Promise<DiagnosticTemplate> {
    const baseUrl = getBaseUrl();
    const sanitized: any = { ...template };
    if (!sanitized.target_component_type && sanitized.category) {
      sanitized.target_component_type = sanitized.category;
    }

    const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/templates/${encodeURIComponent(templateId)}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(sanitized),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to update diagnostic template ${templateId} (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return await res.json();
  },

  /**
   * Delete Diagnostic Template
   * DELETE /api/v1/diagnostics/templates/{template_id}
   */
  async deleteTemplate(templateId: string): Promise<{ success: boolean }> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/templates/${encodeURIComponent(templateId)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to delete diagnostic template ${templateId} (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return { success: true };
  },

  /**
   * Reset / Seed Default Profiles and Templates
   * POST /api/v1/diagnostics/seed-defaults
   */
  async seedDefaults(): Promise<{ message: string; profiles_seeded?: number; templates_seeded?: number }> {
    const baseUrl = getBaseUrl();
    const res = await fetchWithAuth(`${baseUrl}/api/v1/diagnostics/seed-defaults`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Seed defaults failed (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return await res.json();
  },

  /**
   * Fleet-Wide Triage Data
   * GET /api/v1/diagnostics/fleet-triage
   */
  async getFleetTriage(filters?: {
    category?: string;
    lifecycle_state?: string;
    search?: string;
  }): Promise<{ summary: FleetTriageSummary; devices: FleetTriageDeviceItem[] }> {
    const baseUrl = getBaseUrl();
    const query = new URLSearchParams();
    if (filters?.category && filters.category !== "all") query.set("category", filters.category);
    if (filters?.lifecycle_state && filters.lifecycle_state !== "all") query.set("state", filters.lifecycle_state);
    if (filters?.search) query.set("search", filters.search);

    const qs = query.toString();
    const url = `${baseUrl}/api/v1/diagnostics/fleet-triage${qs ? `?${qs}` : ""}`;

    const res = await fetchWithAuth(url, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(
        `Failed to fetch fleet triage (${res.status}: ${res.statusText || errorText || "Unknown Error"})`
      );
    }

    return await res.json();
  },
};
