# AGENTS.md — AirQo Nexus

Scope: **this file governs the Nexus app only** (codebase path `src/vertex/`
in the AirQo-frontend monorepo, public product name "AirQo Nexus"). It does
not apply to `vertex-desktop`, `platform`, `website`, `mobile`, `netmanager`,
`beacon`, `calibrate`, or `docs-website`. If an agent is touching any of
those, this file does not govern that work.

## Purpose

- Keep changes consistent with Nexus's own conventions and performance
  goals — not generic Next.js best practices, this app's actual rules.
- Prefer small, safe edits that reduce request storms and stale cache risk.
- This file speaks to AI coding agents. Humans read the app's own README.

## Stack

- Next.js 14 App Router
- React 18 + TypeScript, strict mode. Don't loosen `tsconfig.json` to make an
  error disappear — fix the type, don't silence the checker.
- Tailwind CSS

## Commands

Run all of these from `src/vertex/`, not the monorepo root.

- `yarn dev` — local dev server
- `yarn lint` — ESLint
- `yarn build` — production build. A change that only passes `dev` is not
  verified; run this before calling anything done.
- `yarn format` — Prettier
- `yarn type-check` — **[CONFIRM exact script name in this app's
  package.json]**. If it doesn't exist, add
  `"type-check": "tsc --noEmit"` rather than skipping the check.
- `yarn test` — **[CONFIRM exact script name and runner — Jest/Vitest/RTL]**.
  If this app has no test command, say that explicitly in the PR instead of
  silently skipping verification.
- The repo has root-level pre-commit hooks (`.pre-commit-config.yaml`).
  Don't bypass with `--no-verify` unless the hook itself is broken — if it's
  broken, fix or flag it, don't silence it.

## Environment

- Copy `.env.example` to `.env.local` and fill required keys.
- API config uses `API_BASE_URL` or `NEXT_PUBLIC_API_BASE_URL`.
- Auth requires `NEXTAUTH_SECRET` and `NEXTAUTH_URL`.
- Adding a new env var without updating `.env.example` makes a PR incomplete
  — not "needs a follow-up," incomplete.

## Data Fetching and Caching

- Server fetches: Next.js App Router conventions; `cache: 'no-store'` for
  auth/sensitive reads.
- Client fetches: SWR/React Query with stable keys. No ad-hoc `useEffect`
  fetch loops.
- Retry policy — be explicit, "avoid retries" alone isn't a rule an agent can
  act on:
  - Never retry: 5xx, `ERR_NETWORK`, aborted/cancelled requests.
  - Bounded retry allowed: idempotent GETs on 429, exponential backoff,
    capped at **[CONFIRM max attempts — recommend 2]**.
  - Anything else: fail once, show a clear error state, don't loop.
- Use `AbortController` for cohort endpoints and any query that can re-fire
  on re-render.
- Invalidate or drop group-scoped caches on group switch. A request fired
  for group A must never resolve into group B's cache after a fast switch.
- Use `buildServerApiUrl` / `buildBrowserApiUrl` for versioned endpoints. No
  hard-coded `/api/v2` strings — this blocks merge, it's not a style note.

## Auth and Session Handling

- NextAuth session is client-visible; keep tokens out of logs and sanitize
  error payloads before they reach Sentry/console.
- Silent refresh on 401, single-flight queue — never parallel refresh calls.
- On refresh **success**: update both `ApiClient` defaults and the NextAuth
  session via the token-refreshed event.
- On refresh **failure** — **[CONFIRM: currently undocumented, this is a
  guess]**: clear the session, redirect to sign-in, preserve intended
  destination for post-login redirect. Do not leave a user on a page
  silently re-issuing 401s.
- Normalize OAuth tokens with `normalizeOAuthAccessToken` before storing.

## UI/UX Smoothness

- No full-white loading flashes — delayed overlays / subtle backdrops.
- Minimal transitions, no layout thrash on group/route changes.
- Respect `prefers-reduced-motion` for any new animation.

## Error Handling

- App router boundaries: `src/app/error.tsx`, `src/app/global-error.tsx`.
- Treat 401 as an auth-flow signal; escalate to the user only after refresh
  attempts fail.
- `AbortError` from cancelled requests must never surface as a user-facing
  failure.

---

## Code Review Style

Reviews on this app read like a senior engineer walked the diff, not like a
linter dumped a list. Structure modeled on CodeRabbit's review format,
adapted to Nexus's actual rules above. Applies whether the reviewer is human
or an agent posting PR comments.

### 1. Open with a walkthrough, not a file list

Before any inline comments:

- **What changed** — 2–4 plain-language sentences.
- **Why** — pull from the PR description / linked issue. Don't invent
  intent that isn't stated anywhere.
- **Changed files table**, grouped by concern, not alphabetically:

  | Area         | Files                                   | What changed                                |
  | ------------ | --------------------------------------- | ------------------------------------------- |
  | Auth refresh | `useAuthRefresh.ts`, `AuthProvider.tsx` | Added single-flight queue for token refresh |

- **Sequence diagram, only when it earns its keep** — include a short
  Mermaid diagram for changes to async flows, auth sequences, or cache
  invalidation. Skip it for styling/copy-only changes; a diagram for a CSS
  tweak is noise.

### 2. Tag every comment with type and severity — don't leave it implicit

**Type:**

- 🔴 **Potential issue** — breaks something or violates a hard rule above
  (retry storms, hard-coded API versions, token leakage, cross-group cache
  bleed).
- 🟠 **Refactor suggestion** — works, but a clearly better pattern already
  exists elsewhere in this app.
- 🔵 **Nitpick** — style/naming/preference. Never blocks merge alone.

**Severity** (🔴 / 🟠 only):

- **Blocking** — must fix before merge.
- **Major** — should fix; merging without it needs an explicit stated
  tradeoff from the author.
- **Minor** — fix now or file a follow-up, reviewer's call.

### 3. Every actionable comment ships a fix, not just a complaint

"This will cause a retry storm" is a vibe, not a review comment. Required:

- Exact file and line/range.
- Why it's wrong **against this file's stated rules** — cite the section
  (e.g. "violates the AbortController rule") — not generic best-practice
  hand-waving.
- A concrete suggested diff or snippet.

Can't propose a fix? Downgrade the comment to a question, not a directive.

### 4. One issue per comment, closed after the first pass

Don't bundle three unrelated problems into one paragraph. Don't repeat the
same nitpick on every file it appears in — flag it once, note "same pattern
in N other files."

### 5. What actually blocks merge here

Blocking, no exceptions:

- Hard-coded `/api/v2`-style endpoint strings.
- Missing `AbortController` on a query that can re-fire on re-render.
- Cross-group cache reuse after a group switch.
- Tokens/auth headers in logs or error payloads.
- Retrying 5xx / `ERR_NETWORK` / aborted requests.
- New env var without a matching `.env.example` update.

Everything else — styling, naming, minor refactors — is advisory. Say so
explicitly in the comment; don't make the author guess whether it's a
blocker.

### 6. End with a verdict

Every review closes with one line: **Approve**, **Approve with follow-ups
filed**, or **Changes requested — see blocking items above**. Don't leave it
implicit in the tone of the comments.

## References

- Next.js App Router data fetching/caching:
  https://nextjs.org/docs/14/app/building-your-application/data-fetching/fetching-caching-and-revalidating
- AGENTS.md format: https://agents.md/
- CodeRabbit review structure (source for the style above):
  https://docs.coderabbit.ai/pr-reviews/walkthroughs
