import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useDeviceAvailability } from '@/core/hooks/useDevices';
import { useDebouncedValue } from '@/core/hooks/useDebouncedValue';

// Mirrors the device_id rules in claimDeviceSchema (min 3 chars, letters,
// digits, underscores and hyphens, no trimming) so we never look up, or
// report as available, a name the form would reject on submit.
const CLAIMABLE_NAME_PATTERN = /^[a-zA-Z0-9_-]{3,}$/;

export const DEVICE_AVAILABLE_HINT = 'This device is available to claim.';
export const DEVICE_CLAIMED_HINT =
  'This device has already been claimed. If it was shipped to you, contact AirQo support.';
export const DEVICE_UNKNOWN_HINT =
  "We couldn't find a device with this name. Check the name printed on the shipping label.";

/**
 * Live availability feedback for the claim form's Device Name field.
 *
 * Informational only — the claim request is still the source of truth, so a
 * failed lookup (network error, 5xx) shows nothing rather than blocking the
 * user. Lookups are debounced and only fire for names the form would accept.
 */
export function DeviceAvailabilityHint({ deviceName }: { deviceName: string }) {
  const debouncedName = useDebouncedValue(deviceName);
  const candidate = CLAIMABLE_NAME_PATTERN.test(debouncedName) ? debouncedName : '';

  const { data, error, isFetching } = useDeviceAvailability(candidate);

  // Hide stale results while the user is still typing a different name.
  if (!candidate || candidate !== deviceName) return null;

  if (isFetching) {
    return (
      <p role="status" className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
        <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />
        Checking device availability…
      </p>
    );
  }

  if (error) {
    const status = (error as { response?: { status?: number } }).response?.status;
    if (status !== 404) return null;
    return (
      <p role="status" className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
        {DEVICE_UNKNOWN_HINT}
      </p>
    );
  }

  if (!data) return null;

  return data.data?.available ? (
    <p role="status" className="flex items-center gap-1.5 text-xs text-green-700 dark:text-green-400">
      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      {DEVICE_AVAILABLE_HINT}
    </p>
  ) : (
    <p role="status" className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
      {DEVICE_CLAIMED_HINT}
    </p>
  );
}

export default DeviceAvailabilityHint;
