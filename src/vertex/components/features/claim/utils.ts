import { getApiErrorMessage } from '@/core/utils/getApiErrorMessage';

// "AirQo" is hardcoded here to match every other label in this feature; making
// the org name configurable is tracked separately in the template-coupling audit.
export const DEVICE_NOT_FOUND_MESSAGE =
  "We couldn't find this device. Double-check the device name and claim token, or contact AirQo support if you just received this device.";

/**
 * Claim-specific error copy.
 *
 * A 404 from POST /devices/claim means the device has not been registered and
 * shipping-prepped by AirQo yet — the raw backend message ("Device doesn't
 * exist yet") reads like a bug to a user who is holding the device, so replace
 * it with copy that points at the two things they can actually check.
 * Every other failure keeps the backend's own message.
 */
export function getClaimErrorMessage(error: unknown): string {
  const status = (error as { response?: { status?: number } })?.response?.status;
  const message = getApiErrorMessage(error);

  if (status === 404 || /does(n't| not) exist/i.test(message)) {
    return DEVICE_NOT_FOUND_MESSAGE;
  }

  return message;
}

export function parseQRCode(
  qrData: string
): { deviceId: string; claimToken: string } | null {
  try {
    const url = new URL(qrData);
    const deviceId = url.searchParams.get('id');
    const claimToken = url.searchParams.get('token');
    if (deviceId && claimToken) return { deviceId, claimToken };
  } catch {
    /* not a URL */
  }

  try {
    const parsed = JSON.parse(qrData);
    if (
      typeof parsed?.device_id === "string" &&
      parsed.device_id.trim() &&
      typeof parsed?.token === "string" &&
      parsed.token.trim()
    ) {
      return {
        deviceId: parsed.device_id,
        claimToken: parsed.token,
      };
    }
  } catch {
    /* not JSON */
  }

  return null;
}