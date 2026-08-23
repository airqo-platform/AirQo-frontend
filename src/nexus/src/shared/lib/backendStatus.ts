/**
 * Framework-free backend-status tracker.
 *
 * Pure pub/sub with no React dependency — works from any service or hook.
 * The probe uses the same open-client pattern as maintenanceService
 * (createOpenClient + `/users/maintenances/analytics`) so no hard-coded
 * /api/v2 strings leak into the probe path.
 */

import { createOpenClient } from '@/shared/services/apiClient';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BackendStatusValue = 'unknown' | 'online' | 'outage';

export interface BackendStatus {
  status: BackendStatusValue;
  reason: string;
}

type Listener = () => void;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OUTAGE_FAILURE_THRESHOLD = 2;
const PROBE_TIMEOUT_MS = 8_000;

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

let _failureCount = 0;
let _currentStatus: BackendStatusValue = 'unknown';
let _reason = '';
const _listeners: Set<Listener> = new Set();

/**
 * Cached snapshot for useSyncExternalStore reference stability.
 * `getBackendStatus()` returns this exact object across calls while state is
 * unchanged, and replaces it with a NEW object only on an actual transition.
 */
let _snapshot: BackendStatus = { status: _currentStatus, reason: _reason };

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const notify = () => {
  _listeners.forEach(cb => {
    try {
      cb();
    } catch {
      // Swallow listener errors to protect other subscribers.
    }
  });
};

/** Replace the cached snapshot when a field has actually changed. */
const transitionTo = (status: BackendStatusValue, reason: string): void => {
  _currentStatus = status;
  _reason = reason;
  _snapshot = { status, reason };
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Read the current status (synchronous snapshot for useSyncExternalStore). */
export const getBackendStatus = (): BackendStatus => _snapshot;

/** Subscribe to status changes. Returns an unsubscribe function. */
export const subscribeBackendStatus = (cb: Listener): (() => void) => {
  _listeners.add(cb);
  return () => {
    _listeners.delete(cb);
  };
};

/** Current failure-streak count (for tests). */
export const getBackendFailureCount = (): number => _failureCount;

/** Full reset for tests. */
export const resetBackendStatus = (): void => {
  _failureCount = 0;
  transitionTo('unknown', '');
  notify();
};

/**
 * Record that the backend answered with ANY HTTP response.
 * Resets failure counter and transitions from outage → online.
 */
export const recordBackendResponded = (): void => {
  const wasOutage = _currentStatus === 'outage';
  _failureCount = 0;

  if (_currentStatus !== 'online') {
    transitionTo('online', wasOutage ? 'Backend recovered' : '');
    notify();
  }
};

/**
 * Record that the backend could not be reached (network error,
 * gateway 502/503/504, timeout). Increments the failure counter;
 * flips to outage once the threshold is hit.
 */
export const recordBackendUnreachable = (reason?: string): void => {
  _failureCount += 1;

  if (
    _currentStatus !== 'outage' &&
    _failureCount >= OUTAGE_FAILURE_THRESHOLD
  ) {
    transitionTo('outage', reason || 'Backend unreachable');
    notify();
  }
};

/**
 * Probe the backend via the open-client maintenances endpoint.
 * Returns `true` when the backend responded, `false` otherwise.
 * Never throws.
 */
export const probeBackend = async (): Promise<boolean> => {
  const client = createOpenClient();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), PROBE_TIMEOUT_MS);

  try {
    await client.get('/users/maintenances/analytics', {
      signal: controller.signal as unknown as AbortSignal,
    } as never);
    recordBackendResponded();
    return true;
  } catch {
    recordBackendUnreachable('Probe failed');
    return false;
  } finally {
    clearTimeout(timer);
  }
};
