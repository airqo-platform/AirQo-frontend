import { beaconConfig } from "@/beacon.config"

/**
 * Secret that signs the session cookie. Shared by lib/auth.ts and middleware.ts, which runs on the
 * Edge runtime and can't import the NextAuth options.
 *
 * Only the demo sign-in (`auth.provider: "none"`) falls back to a fixed value, so the demo runs
 * without an env file. A real provider needs NEXTAUTH_SECRET.
 */
export const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET ||
  process.env.AUTH_SECRET ||
  (beaconConfig.auth.provider === "none" ? "beacon-demo-secret-change-me" : undefined)

/**
 * Name of the session cookie, shared with the middleware. NextAuth's middleware would otherwise
 * guess it from NEXTAUTH_URL, and without one it looks for the non-secure name in production.
 */
export const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === "production" ? "__Secure-next-auth.session-token" : "next-auth.session-token"
