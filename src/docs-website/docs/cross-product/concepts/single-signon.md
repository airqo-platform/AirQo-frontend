---
sidebar_position: 3
---

# Single Sign-On (SSO) Across AirQo Web Apps

## Overview

AirQo uses **NextAuth.js v4** with **JWT session strategy** to enable Single Sign-On across subdomains. When a user logs into any AirQo application (Platform, Vertex, or future products), they are automatically authenticated on all other participating applications without needing to log in again.

### Architecture

Each app uses its own cookie name, but all cookies share the same parent domain (`.airqo.net`) and the same `NEXTAUTH_SECRET`. This means a JWT created by one app can be decoded by another.

```
┌──────────────────────────────────────────────────────────────┐
│                      Browser Cookies                         │
│                 Domain: .airqo.net                           │
│                                                              │
│  Platform cookie: __Secure-next-auth.session-token           │
│  Vertex cookie:   __Secure-next-auth.session-token-v2        │
│  Strategy: JWT (stateless)                                   │
└──────────────┬──────────────────────────┬────────────────────┘
               │                          │
    ┌──────────▼──────┐         ┌─────────▼──────────┐
    │  app.airqo.net  │         │ admin.airqo.net    │
    │   (Platform)    │         │    (Vertex)        │
    │   Port: 443     │         │    Port: 443       │
    └─────────────────┘         └────────────────────┘
               │                          │
               └────────────┬─────────────┘
                            │
                   ┌────────▼────────┐
                   │  api.airqo.net  │
                   │  (Backend API)  │
                   └─────────────────┘
```

### How It Works

1. User logs into **Platform** → NextAuth creates a JWT session cookie (`__Secure-next-auth.session-token`) with domain `.airqo.net`
2. User opens **Vertex** in a new tab → browser sends the Vertex cookie (`__Secure-next-auth.session-token-v2`)
3. Vertex's NextAuth reads its cookie → decodes the JWT using the shared `NEXTAUTH_SECRET` → user is authenticated
4. No redirect, no re-login — instant SSO

:::note
Platform and Vertex currently use **different cookie names** but share the same `NEXTAUTH_SECRET` and `NEXTAUTH_COOKIE_DOMAIN`. This allows each app to maintain independent sessions while still enabling SSO through shared JWT verification.
:::

---

## Prerequisites

All participating applications **MUST** share:

| Requirement | Purpose |
|---|---|
| Same `NEXTAUTH_SECRET` | JWT signed by one app must be verifiable by the other |
| Same `NEXTAUTH_COOKIE_DOMAIN` | Cookie must be accessible across all subdomains |
| Same JWT session strategy | Both must use `strategy: "jwt"` (not database sessions) |

Each app uses its own cookie name (see [Current Cookie Names](#current-cookie-names) below). The cookie names don't need to match — SSO works because both apps verify the JWT with the same shared secret.

All apps must be subdomains of the same parent domain (for example `*.airqo.net`) with HTTPS enabled in production.

---

## Step 1: Environment Variables

### Required (must be identical across all apps)

```bash
# The shared secret used to sign JWTs. Generate once, use everywhere.
# Generate with: openssl rand -base64 48
NEXTAUTH_SECRET="<your-shared-256-bit-secret>"

# The parent domain for cookie sharing.
# Cookie will be accessible on all *.airqo.net subdomains.
NEXTAUTH_COOKIE_DOMAIN=.airqo.net
```

### Per-app (different for each application)

```bash
# Platform
NEXTAUTH_URL=https://app.airqo.net
NEXT_PUBLIC_BASE_URL=https://app.airqo.net

# Vertex
NEXTAUTH_URL=https://admin.airqo.net
NEXT_PUBLIC_BASE_URL=https://admin.airqo.net
```

### Generating a shared secret

```bash
# macOS / Linux
openssl rand -base64 48

# PowerShell (Windows)
[Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }) -as [byte[]])
```

:::caution CRITICAL
The `NEXTAUTH_SECRET` **MUST** be the same across all apps. If it differs, JWTs signed by one app cannot be decoded by another, and SSO will fail silently.
:::

---

## Step 2: NextAuth Configuration

Every participating app must configure NextAuth with these exact settings.

### Cookie Configuration

Each app defines its own cookie name. Use the table below to pick the correct name for your app:

#### Current Cookie Names

| App | Production | Development |
|-----|-----------|-------------|
| **Platform** | `__Secure-next-auth.session-token` | `analytics.next-auth.session-token` |
| **Vertex** | `__Secure-next-auth.session-token-v2` | `next-auth.session-token-v2` |

:::tip Adding a New App?
Choose a unique cookie name for your app to avoid collisions. Follow the pattern: `__Secure-next-auth.session-token-<suffix>` for production and `next-auth.session-token-<suffix>` for development.
:::

```typescript
const isProduction = process.env.NODE_ENV === 'production';
const configuredCookieDomain =
  process.env.NEXTAUTH_COOKIE_DOMAIN?.trim() || undefined;

// Validates cookie domain matches NEXTAUTH_URL before applying
const getCookieDomain = () => {
  if (!configuredCookieDomain) return undefined;

  const referenceUrl = process.env.NEXTAUTH_URL;
  if (!referenceUrl) return configuredCookieDomain;

  try {
    const host = new URL(referenceUrl).hostname.toLowerCase();
    const normalizedDomain = configuredCookieDomain.replace(/^\./, '').toLowerCase();
    const hostMatches =
      host === normalizedDomain || host.endsWith(`.${normalizedDomain}`);

    return hostMatches ? configuredCookieDomain : undefined;
  } catch {
    return undefined;
  }
};

const cookieDomain = getCookieDomain();

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  path: '/',
  secure: isProduction,
  domain: cookieDomain,
};

// Platform example:
const sessionCookieName = isProduction
  ? '__Secure-next-auth.session-token'
  : 'analytics.next-auth.session-token';

// Vertex example:
// const sessionCookieName = isProduction
//   ? '__Secure-next-auth.session-token-v2'
//   : 'next-auth.session-token-v2';
```

### NextAuth Options

```typescript
export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  useSecureCookies: isProduction,

  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },

  cookies: {
    sessionToken: {
      name: sessionCookieName,
      options: cookieOptions,
    },
  },

  // ... providers, callbacks, etc.
};
```

### Middleware (must match cookie name)

The middleware reads the same cookie name defined in the NextAuth options above. Use the same per-app cookie name here.

```typescript
import { withAuth } from 'next-auth/middleware';

const isProduction = process.env.NODE_ENV === 'production';

// Platform middleware:
const sessionCookieName = isProduction
  ? '__Secure-next-auth.session-token'
  : 'analytics.next-auth.session-token';

// Vertex middleware:
// const sessionCookieName = isProduction
//   ? '__Secure-next-auth.session-token-v2'
//   : 'next-auth.session-token-v2';

export default withAuth(
  function middleware() {},
  {
    callbacks: {
      authorized: () => true,
    },
    pages: {
      signIn: '/login',
    },
    cookies: {
      sessionToken: {
        name: sessionCookieName,
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
  }
);
```

---

## Step 3: Unified Session Structure

For SSO to work correctly, **all apps must store and expose the same session fields**. This is critical because when App A creates a session and App B reads it, App B needs all the fields it depends on.

### Canonical Session Shape

```typescript
{
  user: {
    // Identity
    id: string;           // Backend user ID (used by Vertex's UserDataFetcher)
    _id: string;          // Same as id (used by Platform's UserDataFetcher)
    email: string;
    name: string;         // Full name (firstName + lastName)

    // Profile
    firstName: string;
    lastName: string;
    image: string;        // Profile picture URL
    userName: string;     // Username / email

    // Organization & Access
    organization: string;
    privilege: string;    // "user", "admin", etc.
    country: string;
    phoneNumber: string;

    // Platform-specific (optional but recommended)
    authMethods?: {
      password: boolean;
      google: boolean;
      github: boolean;
      linkedin: boolean;
      microsoft: boolean;
      twitter: boolean;
      facebook: boolean;
      apple: boolean;
    };
  },

  // Token metadata
  accessToken: string;    // Backend JWT for API calls
  expiresAt?: string;     // ISO date string of token expiry
}
```

### JWT Token Shape (stored in cookie)

```typescript
{
  // Identity
  id: string;
  _id: string;

  // Profile
  firstName: string;
  lastName: string;
  userName: string;
  image?: string;

  // Organization & Access
  organization: string;
  privilege: string;
  country: string;
  phoneNumber: string;

  // Token
  accessToken: string;
  expiresAt?: string;
  exp?: number;           // Unix timestamp

  // Platform-specific
  authMethods?: AuthMethods;

  // NextAuth defaults
  sub?: string;
  iat?: number;
  jti?: string;
}
```

---

## Step 4: Authorize Function (Credentials Provider)

The `authorize` function must return **all fields** that any participating app needs. Decode the backend JWT to extract extra fields not returned by the profile API.

```typescript
async authorize(credentials) {
  const oauthToken = normalizeOAuthAccessToken(
    typeof credentials?.oauthToken === 'string' ? credentials.oauthToken : ''
  );

  if (oauthToken) {
    // OAuth path
    const profile = await fetchOAuthProfile(oauthToken);
    if (!profile) return null;

    // Decode backend JWT for extra fields
    let decoded: Record<string, unknown> | null = null;
    try {
      const parts = oauthToken.split('.');
      if (parts.length === 3) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
        decoded = JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'));
      }
    } catch { decoded = null; }

    return {
      // Identity
      id: profile._id,
      _id: profile._id,
      email: profile.email,
      name: `${profile.firstName} ${profile.lastName}`.trim() || profile.email,

      // Profile
      firstName: profile.firstName,
      lastName: profile.lastName,
      image: profile.profilePicture || '',
      userName: (decoded?.userName as string) || profile.email,

      // Organization & Access
      organization: (decoded?.organization as string) || '',
      privilege: (decoded?.privilege as string) || '',
      country: (decoded?.country as string) || '',
      phoneNumber: (decoded?.phoneNumber as string) || '',

      // Token
      accessToken: oauthToken,
      expiresAt: (decoded?.expiresAt as string) || '',
      exp: (decoded?.exp as number) || 0,

      // Platform-specific
      authMethods: normalizeAuthMethods(profile.authMethods),
    };
  }

  // Credentials path (email/password) — same shape as above
  // ...
}
```

---

## Step 5: JWT Callback

Store **all fields** from the user object into the token. This ensures they persist across page loads and are available to the session callback.

```typescript
async jwt({ token, user, trigger, session }) {
  if (user) {
    token.id = user.id;
    token._id = (user as any)._id || user.id;
    token.accessToken = typeof user.accessToken === 'string' ? user.accessToken : undefined;
    token.expiresAt = typeof user.expiresAt === 'string' ? user.expiresAt : undefined;
    token.firstName = user.firstName;
    token.lastName = user.lastName;
    token.userName = (user as any).userName || user.email;
    token.organization = (user as any).organization || '';
    token.privilege = (user as any).privilege || '';
    token.country = (user as any).country || '';
    token.phoneNumber = (user as any).phoneNumber || '';
    token.image = (user as any).image;
    token.authMethods = normalizeAuthMethods((user as any).authMethods);
    token.exp = (user as any).exp || 0;
  }

  // Handle session updates (token refresh, etc.)
  if (trigger === 'update' && session) {
    if (typeof session.accessToken === 'string') {
      token.accessToken = normalizeOAuthAccessToken(session.accessToken) || undefined;
    }
    if (typeof session.expiresAt === 'string') {
      token.expiresAt = session.expiresAt;
    }
    if (session.authMethods) {
      token.authMethods = normalizeAuthMethods(session.authMethods) || token.authMethods;
    }
  }

  return token;
}
```

---

## Step 6: Session Callback

Expose **all fields** from the token into the session. Use fallbacks for cross-app SSO where fields might be missing.

```typescript
async session({ session, token }) {
  const accessToken = typeof token?.accessToken === 'string'
    ? normalizeOAuthAccessToken(token.accessToken) : undefined;
  const expiresAt = typeof token?.expiresAt === 'string'
    ? token.expiresAt : undefined;
  const authMethods = normalizeAuthMethods(token?.authMethods);

  // Invalidate if no valid token
  if (isTokenInvalid(accessToken, expiresAt)) {
    return { user: null };
  }

  // Set session-level fields
  session.accessToken = accessToken;
  session.expiresAt = expiresAt;
  session.authMethods = authMethods;

  // Set user fields — use fallbacks for cross-app SSO
  if (session.user) {
    session.user._id = (token as any)._id || (token as any).id;
    session.user.firstName = (token as any).firstName;
    session.user.lastName = (token as any).lastName;
    session.user.userName = (token as any).userName || session.user.email;
    session.user.organization = (token as any).organization || '';
    session.user.privilege = (token as any).privilege || '';
    session.user.country = (token as any).country || '';
    session.user.phoneNumber = (token as any).phoneNumber || '';
    if ((token as any).image) {
      session.user.image = (token as any).image;
    }
  }

  return session;
}
```

:::tip Key Detail
`session.user._id = token._id || token.id` — The `|| token.id` fallback is essential for SSO. If App A stores `_id` but App B's JWT only has `id`, the fallback ensures `_id` is still populated.
:::

---

## Step 7: Type Definitions

Update `next-auth.d.ts` in every app to include all session fields:

```typescript
// next-auth.d.ts
import type { DefaultSession, DefaultUser } from 'next-auth';
import type { AuthMethods } from 'your-types-path';

type SessionUser = NonNullable<DefaultSession['user']> & {
  _id?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
  organization?: string;
  privilege?: string;
  country?: string;
  phoneNumber?: string;
};

declare module 'next-auth' {
  interface User extends DefaultUser {
    _id?: string;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    expiresAt?: string;
    authMethods?: AuthMethods;
    userName?: string;
    organization?: string;
    privilege?: string;
    country?: string;
    phoneNumber?: string;
    exp?: number;
  }

  interface Session extends DefaultSession {
    accessToken?: string;
    expiresAt?: string;
    authMethods?: AuthMethods;
    user: SessionUser | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id?: string;
    firstName?: string;
    lastName?: string;
    accessToken?: string;
    expiresAt?: string;
    authMethods?: AuthMethods;
    userName?: string;
    organization?: string;
    privilege?: string;
    country?: string;
    phoneNumber?: string;
    image?: string;
    exp?: number;
  }
}
```

---

## Step 8: Logout Configuration

### Cookie Domain on Logout

When `signOut()` is called, NextAuth clears the cookie by setting it with an expired date. The cookie options (including domain) are used for the clearing cookie. This means the `cookies.sessionToken.options` configuration must be correct for logout to work.

### Logout Hook Pattern

```typescript
await signOut({ redirect: false });
window.location.href = callbackUrl || '/login';  // Full page reload, not router.push
```

:::info Why `window.location.href`?
Using `router.push()` does client-side navigation which doesn't fully clear in-memory NextAuth state. `window.location.href` forces a full page reload, ensuring all session state is cleared.
:::

---

## Adding a New App to the SSO Ecosystem

### Checklist

1. Set `NEXTAUTH_SECRET` to the **same value** as other apps
2. Set `NEXTAUTH_COOKIE_DOMAIN=.airqo.net` (or your parent domain)
3. Set `NEXTAUTH_URL` to the app's own URL
4. Choose a **unique cookie name** for your app (see [Current Cookie Names](#current-cookie-names))
5. Configure `cookies.sessionToken` with your app's cookie name and domain options
6. Update middleware to use the same cookie name as the NextAuth options
7. Implement `authorize` returning **all fields** from the canonical session shape
8. Implement `jwt` callback storing **all fields**
9. Implement `session` callback exposing **all fields** with `_id` fallback
10. Update `next-auth.d.ts` with all session/jwt fields
11. Test: Login on existing app → open new app → verify session
12. Test: Login on new app → open existing app → verify session
13. Test: Logout on both apps → verify cookie is cleared

### Minimum Required Session Fields

If your app only needs a subset, you still **must store all fields** in the JWT callback so other apps can read them. At minimum:

| Field | Required By |
|---|---|
| `id` / `_id` | All apps (UserDataFetcher) |
| `email` | All apps (display, identification) |
| `firstName` / `lastName` | All apps (display) |
| `accessToken` | All apps (API calls) |
| `userName` | Vertex (display, identification) |
| `organization` | Vertex (org context) |
| `privilege` | Vertex (role-based access) |
| `country` | Vertex (location context) |

---

## Testing SSO Locally

### Prerequisites

1. Add entries to your hosts file (`C:\Windows\System32\drivers\etc\hosts` on Windows, `/etc/hosts` on macOS/Linux):

```
127.0.0.1  app.airqo.local
127.0.0.1  admin.airqo.local
```

2. Use **dev mode** (`yarn dev` / `npm run dev`) — production mode requires HTTPS for `__Secure-` cookie prefixes

3. Set environment variables:

```bash
# Both apps
NEXTAUTH_SECRET=<same-secret>
NEXTAUTH_COOKIE_DOMAIN=.airqo.local

# Platform
NEXTAUTH_URL=http://app.airqo.local:3000

# Vertex
NEXTAUTH_URL=http://admin.airqo.local:3001
```

### Test Flow

1. Open `http://app.airqo.local:3000/user/login`
2. Log in with credentials
3. Open new tab → `http://admin.airqo.local:3001`
4. **Expected**: You should be logged in automatically (no login page)
5. Open DevTools → Application → Cookies → verify cookie domain is `.airqo.local`

---

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| SSO doesn't work (login required on both) | Cookie domain not set or mismatched | Verify `NEXTAUTH_COOKIE_DOMAIN=.airqo.net` in both apps |
| SSO doesn't work (login required on both) | `NEXTAUTH_SECRET` differs between apps | Ensure both apps use the **exact same** secret |
| Session data missing on target app | JWT callback not storing all fields | Ensure jwt callback stores all fields from canonical shape |
| Logout doesn't clear cookie | Cookie domain mismatch on clear | Verify `cookies.sessionToken.options.domain` is set |
| Works in dev but not prod | `__Secure-` prefix requires HTTPS | Ensure production uses HTTPS |
| `_id` is undefined in session | JWT has `id` but not `_id` | Use `token._id \|\| token.id` fallback in session callback |
| Middleware rejects valid session | Cookie name mismatch between options and middleware | Ensure `cookies.sessionToken.name` in middleware matches the NextAuth options |

---

## Security Considerations

1. **`NEXTAUTH_SECRET`**: Never commit to version control. Use environment variables or secret managers.
2. **`NEXTAUTH_COOKIE_DOMAIN`**: Use `.airqo.net` (with leading dot) for production. The leading dot makes it a domain cookie accessible to all subdomains.
3. **`sameSite: 'lax'`**: Required for cross-subdomain SSO. `strict` would block the cookie on cross-site navigations.
4. **`secure: true`** in production: Cookies are only sent over HTTPS. Required for `__Secure-` prefixed cookie names.
5. **JWT expiry**: Set `maxAge` consistently across apps. Mismatched expiry can cause session desync.
6. **Unique cookie names**: Each app should use a unique cookie name suffix to avoid collisions when multiple AirQo apps run on the same domain during development.

---

## File Reference

| File | Purpose |
|---|---|
| `src/shared/lib/auth.ts` | Platform NextAuth config (authorize, callbacks, cookies) |
| `src/shared/hooks/useLogout.ts` | Platform logout logic |
| `src/shared/providers/auth-provider.tsx` | Platform session bootstrap and auth wrapper |
| `src/next-auth.d.ts` | Platform TypeScript type definitions |
| `middleware.ts` | Platform route protection |
| `vertex/app/api/auth/[...nextauth]/options.ts` | Vertex NextAuth config |
| `vertex/core/hooks/useLogout.ts` | Vertex logout logic |
| `vertex/core/auth/authProvider.tsx` | Vertex session bootstrap and auth wrapper |
| `vertex/types/next-auth.d.ts` | Vertex TypeScript type definitions |
| `vertex/middleware.ts` | Vertex route protection |
