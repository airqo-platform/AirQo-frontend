# Product analytics

The template can send product analytics to PostHog. It is off unless a project key is set when the
app is built.

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key (`phc_…`). Nothing is loaded or sent while it's empty. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Ingestion host. Defaults to `https://us.i.posthog.com`. |

Both are read at build time; rebuild after changing them. Every event carries `app_name`
(`org.slug` from `beacon.config.ts`) and `environment` (`NEXT_PUBLIC_ENV`).

## What is collected

- **Pageviews** on every route change, reported by route template (`/dashboard/devices/[id]`), so usage adds up
  across devices. `tests/unit/analytics` fails if a page in `app/` is missing from `ROUTE_TEMPLATES` in
  `lib/analytics.ts`.
- **Named events** for completed actions (`trackEvent()` calls). Search the code for `trackEvent(` to list them.
  Autocapture, rage clicks and dead clicks are off.
- **Identity**: the user's id after sign-in, with their role as the only person property. No email, name or
  phone. Events are grouped by the active organisation with PostHog's `organization` group type.
- **Property filtering**: `trackEvent()` drops properties whose names look like personal data or typed text,
  and strips query strings and hashes from every URL before it leaves the browser.
- **Session replay** follows the PostHog project setting, with every input masked.

If you serve a Content Security Policy (`ENABLE_CSP=true`), allow the PostHog hosts in `connect-src` and
`script-src` through `CSP_HEADER`, or nothing reaches PostHog.
