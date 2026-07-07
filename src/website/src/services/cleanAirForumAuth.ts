/**
 * Shared-secret checks for the temporary Clean Air Forum selfie endpoints
 * (submission auth + wall moderation PIN). Both fail *open* when the
 * relevant env var isn't configured, but only outside production — an
 * unconfigured secret in production is a deploy mistake, not a dev
 * convenience, so it's rejected (and logged) instead of silently letting
 * every request through.
 */

const isProduction = process.env.NODE_ENV === 'production';

export function checkSharedSecret({
  configuredSecret,
  providedSecret,
  secretName,
}: {
  configuredSecret: string | undefined;
  providedSecret: string | null | undefined;
  secretName: string;
}): boolean {
  if (!configuredSecret) {
    if (isProduction) {
      console.warn(
        `[clean-air-forum] ${secretName} is not set in production — rejecting the request. Configure it to restore this endpoint.`,
      );
      return false;
    }
    return true;
  }

  return providedSecret === configuredSecret;
}
