---
sidebar_position: 3
---

# Single Sign-On (SSO) Across AirQo Web Apps

This guide explains how to enable Single Sign-On (SSO) across AirQo applications hosted under the same parent domain, such as:

- `analytics.airqo.net`
- `vertex.airqo.net`

With this setup, a user signs in once and can move between apps without logging in again.

## How it works

AirQo apps use NextAuth session cookies.  
SSO works by sharing the session cookie across subdomains using a parent cookie domain:

- Cookie domain: `.airqo.net`
- Shared auth secret: same `NEXTAUTH_SECRET` in all participating apps

## Prerequisites

- All apps are subdomains of the same parent domain (for example `*.airqo.net`)
- HTTPS is enabled in production
- Each app uses NextAuth for session management

## Required environment variables

Set the following in each app that should participate in SSO:

```bash
NEXTAUTH_SECRET=<same-shared-secret-across-apps>
NEXTAUTH_COOKIE_DOMAIN=.airqo.net
```

Important:

- `NEXTAUTH_SECRET` must be identical across apps.
- `NEXTAUTH_COOKIE_DOMAIN` must be the parent domain with a leading dot.

## Application configuration checklist

For each participating app:

1. Set NextAuth `secret` from `NEXTAUTH_SECRET`.
2. Configure session cookie domain from `NEXTAUTH_COOKIE_DOMAIN`.
3. Use secure cookie options in production:
   - `httpOnly: true`
   - `sameSite: 'lax'`
   - `secure: true` (production)
4. Keep JWT/session strategy consistent across apps.

## Troubleshooting

- **Still seeing login screen in second app**
  - Confirm both apps use the same `NEXTAUTH_SECRET`
  - Confirm cookie domain is set correctly (`.airqo.net`)
  - Restart app servers after env changes
  - Clear browser cookies and retry

- **Cookie not created/shared**
  - Check browser DevTools Application > Cookies
  - Confirm cookie domain and cookie name are correct
  - Confirm production traffic uses HTTPS

- **Random sign-outs across apps**
  - Ensure both apps use the same session max age policy
  - Ensure token expiration logic is consistent

## Security recommendations

- Keep `NEXTAUTH_SECRET` in secure secret management (not committed to git).
- Use HTTPS only in production.
- Keep cookies `httpOnly` and `secure` in production.
- Monitor login/logout and unauthorized events for anomalies.
