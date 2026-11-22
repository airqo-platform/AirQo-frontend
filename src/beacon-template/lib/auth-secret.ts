/**
 * Secret that signs the session cookie. Shared by lib/auth.ts and middleware.ts, which runs on
 * the Edge runtime and must not import the NextAuth options.
 *
 * With `auth.provider: "none"` there is nothing to protect, so a fixed fallback keeps the
 * template running without an env file. Set NEXTAUTH_SECRET as soon as you add a real provider.
 */
export const AUTH_SECRET =
  process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET || "beacon-template-demo-secret-change-me"
