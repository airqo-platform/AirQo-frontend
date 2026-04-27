# AirQo Frontend Agent Notes

## Purpose

- Keep changes consistent with platform conventions and performance goals.
- Prefer small, safe edits that reduce request storms and stale cache risk.

## Stack

- Next.js 14 App Router
- React 18 + TypeScript
- Tailwind CSS

## Commands

- yarn dev
- yarn lint
- yarn build
- yarn format

## Environment

- Copy .env.example to .env.local and fill required keys.
- API config uses API_BASE_URL or NEXT_PUBLIC_API_BASE_URL.
- Auth requires NEXTAUTH_SECRET and NEXTAUTH_URL.
- Do not add new env vars without updating .env.example.

## Data Fetching and Caching

- Server fetches: use Next.js App Router conventions and `cache: 'no-store'` for auth/sensitive reads.
- Client fetches: prefer SWR/React Query with stable keys; avoid custom fetch loops.
- Avoid retry storms: do not retry 5xx, ERR_NETWORK, or aborted requests.
- Use AbortController for cohort endpoints and any query that can be re-fired on re-render.
- Invalidate or remove group-scoped caches on group switch; avoid cross-group data reuse.
- Use `buildServerApiUrl`/`buildBrowserApiUrl` for versioned endpoints (no hard-coded /api/v2 strings).

## Auth and Session Handling

- NextAuth session is client-visible; keep tokens out of logs and sanitize error payloads.
- Use silent refresh on 401 with a single-flight queue (do not trigger parallel refreshes).
- After refresh, update both ApiClient defaults and NextAuth session via the token-refreshed event.
- Normalize OAuth tokens with `normalizeOAuthAccessToken` before storing.

## UI/UX Smoothness

- Avoid full-white loading flashes; prefer delayed overlays and subtle backdrops.
- Keep transitions minimal and avoid layout thrash on group/route changes.

## Error Handling

- App router boundaries live in src/app/error.tsx and src/app/global-error.tsx.
- Treat 401s as auth flow signals; only escalate after refresh attempts fail.
- Ensure cancellation errors are not surfaced to users as real failures.

## References

- Next.js App Router data fetching and caching guidance: https://nextjs.org/docs/14/app/building-your-application/data-fetching/fetching-caching-and-revalidating
