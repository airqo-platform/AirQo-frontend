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
    if (parsed.device_id && parsed.token)
      return { deviceId: parsed.device_id, claimToken: parsed.token };
  } catch {
    /* not JSON */
  }

  return null;
}