/**
 * Environment values read when the server runs, not when the app is built.
 *
 * Next.js replaces every `NEXT_PUBLIC_*` read written as a literal property of
 * process.env with the value it sees during `next build`, in server code as
 * well as in the browser. Reading with a variable key skips that, so the server
 * uses the container's own environment, and the root layout hands the browser a
 * copy of the keys below.
 * The image can then be built with no `.env` at all, the same way Beacon is.
 *
 * Only list values that anyone who opens the page may see: they are written
 * into every HTML response. The API token stays out (see `readServerEnv`).
 */
export const PUBLIC_ENV_KEYS = [
  'NEXT_PUBLIC_ENV',
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_API_BASE_URL',
  'NEXT_PUBLIC_BASE_URL',
  'NEXT_PUBLIC_AIRQO_API_BASE_URL',
  'NEXT_PUBLIC_AIRQO_STAGING_API_BASE_URL',
  'NEXT_PUBLIC_ANALYTICS_URL',
  'NEXT_PUBLIC_COOKIE_POLICY_URL',
  'NEXT_PUBLIC_VERTEX_DESKTOP_WINDOWS_DOWNLOAD_URL',
  'NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN',
  'NEXT_PUBLIC_CLOUDINARY_NAME',
  'NEXT_PUBLIC_CLOUDINARY_PRESET',
  'NEXT_PUBLIC_HCAPTCHA_SITE_KEY',
  'NEXT_PUBLIC_POSTHOG_KEY',
  'NEXT_PUBLIC_POSTHOG_HOST',
  'NEXT_PUBLIC_MOCK_PERMISSIONS_ENABLED',
  'NEXT_PUBLIC_ALLOW_DEV_TOOLS',
  'NEXT_PUBLIC_APP_VERSION',
] as const;

export type PublicEnvKey = (typeof PUBLIC_ENV_KEYS)[number];
export type PublicEnv = Partial<Record<PublicEnvKey, string>>;

export const PUBLIC_ENV_GLOBAL = '__VERTEX_PUBLIC_ENV__';
export const PUBLIC_ENV_SCRIPT_ID = 'vertex-public-env';

declare global {
  interface Window {
    __VERTEX_PUBLIC_ENV__?: PublicEnv;
  }
}

/**
 * Reads a variable from the server's environment at runtime. Never sent to the
 * browser, where it returns undefined.
 */
export const readServerEnv = (key: string): string | undefined => {
  if (typeof process === 'undefined' || !process.env) return undefined;
  return process.env[key];
};

/**
 * Reads a browser-safe setting. In the browser it comes from the copy the root
 * layout wrote into the page; on the server (and in tests) from process.env.
 */
export const getPublicEnv = (key: PublicEnvKey): string | undefined => {
  if (typeof window !== 'undefined') {
    const fromServer = window[PUBLIC_ENV_GLOBAL];
    if (fromServer) return fromServer[key];
  }
  return readServerEnv(key);
};

export const getPublicEnvSnapshot = (): PublicEnv => {
  const snapshot: PublicEnv = {};
  for (const key of PUBLIC_ENV_KEYS) {
    const value = readServerEnv(key);
    if (value !== undefined && value !== '') snapshot[key] = value;
  }
  return snapshot;
};

/**
 * Inline script for the root layout. `<` is escaped so a value can't close the
 * script tag.
 */
export const getPublicEnvScript = (snapshot: PublicEnv = getPublicEnvSnapshot()): string => {
  const json = JSON.stringify(snapshot).replace(/</g, '\\u003c');
  return `window.${PUBLIC_ENV_GLOBAL}=${json};`;
};
