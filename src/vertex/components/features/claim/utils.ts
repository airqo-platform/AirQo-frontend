import { getApiErrorMessage } from '@/core/utils/getApiErrorMessage';

// "AirQo" is hardcoded here to match every other label in this feature; making
// the org name configurable is tracked separately in the template-coupling audit.
export const DEVICE_NOT_FOUND_MESSAGE =
  "We couldn't find this device. Double-check the device name and claim token, or contact AirQo support if you just received this device.";

export const DEVICE_ALREADY_CLAIMED_MESSAGE =
  "This device has already been claimed. If it was shipped to you, contact AirQo support so it can be transferred to your account.";

export const CLAIM_TOKEN_MISMATCH_MESSAGE =
  "The claim token doesn't match this device. Check the token printed on the shipping label and try again.";

export const CLAIM_TOKEN_EXPIRED_MESSAGE =
  "This claim token has expired. Contact AirQo support to get a new one for this device.";

/**
 * Maps a raw backend claim failure message to user-facing copy.
 *
 * The backend reports the same four failure classes with slightly different
 * wording depending on the path (single claim throws HttpErrors; bulk claim
 * returns per-device strings), so match on the meaning rather than the exact
 * text. Anything unrecognised is returned untouched.
 */
export function getClaimFailureMessage(message: string): string {
  if (/does(n't| not) exist|not found/i.test(message)) {
    return DEVICE_NOT_FOUND_MESSAGE;
  }
  if (/expired/i.test(message)) {
    return CLAIM_TOKEN_EXPIRED_MESSAGE;
  }
  if (/token.*(mismatch|does(n't| not) match)|invalid claim token/i.test(message)) {
    return CLAIM_TOKEN_MISMATCH_MESSAGE;
  }
  if (/already claimed|not available for claiming|claimed by another/i.test(message)) {
    return DEVICE_ALREADY_CLAIMED_MESSAGE;
  }
  return message;
}

/**
 * Claim-specific error copy for POST /devices/claim.
 *
 * The raw backend messages read like bugs to a user who is holding the
 * device ("Device doesn't exist yet", "Claim token does not match"), so
 * replace the known failure classes with copy that points at what they can
 * actually check. Status codes are the primary signal (404 not found, 409
 * already claimed, 403 token mismatch, 410 token expired); the message text
 * is the fallback for older deployments that return a generic 400.
 * Every other failure keeps the backend's own message.
 */
export function getClaimErrorMessage(error: unknown): string {
  const status = (error as { response?: { status?: number } })?.response?.status;
  const message = getApiErrorMessage(error);

  switch (status) {
    case 404:
      return DEVICE_NOT_FOUND_MESSAGE;
    case 409:
      return DEVICE_ALREADY_CLAIMED_MESSAGE;
    case 403:
      return CLAIM_TOKEN_MISMATCH_MESSAGE;
    case 410:
      return CLAIM_TOKEN_EXPIRED_MESSAGE;
    default:
      return getClaimFailureMessage(message);
  }
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