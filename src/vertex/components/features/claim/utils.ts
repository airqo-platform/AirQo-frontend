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