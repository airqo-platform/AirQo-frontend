# Clean Air Forum selfie feature — follow-ups for other teams

This feature (mobile selfie filter/sticker + `/selfies` conference wall
display) was built as a **temporary, fully client-side-and-mock-API
implementation** so it could be demoed end-to-end before any backend or
infra work existed for it. Everything below is scaffolding, explicitly
marked `TEMPORARY` in code, and needs real ownership before/soon after the
event it launches with.

Related PR: [#3753](https://github.com/airqo-platform/AirQo-frontend/pull/3753)

## 1. Backend team — replace the mock submissions API

**What exists today**: `src/website/src/services/cleanAirForumSelfiesStore.ts`
is a plain in-memory array behind `src/website/src/app/api/clean-air-forum/selfies/`
(`GET`/`POST`) and `.../selfies/[id]/` (`PATCH` to hide). It:

- Resets on every redeploy and isn't shared across replicas — a submission
  can vanish mid-event if the website pod restarts or scales out.
- Has no real auth beyond a shared secret/PIN (see §3) — fine for a
  short-lived event, not something to keep long-term.

**What's needed**: equivalent endpoints on the real AirQo backend, with
persistent storage (even a simple table is enough — submissions are
small: image URL + AQI metadata + timestamp + hidden flag). The
request/response shapes in the mock were deliberately kept simple so they
can carry over almost unchanged:

- `POST /selfies` — body `{ eventId, imageUrl, locationName?, pm25Value?, aqiCategory?, displayName? }` → `201 { submission }`
- `GET /selfies?eventId=...` — → `200 { submissions: [...] }`, newest first, hidden ones excluded
- `PATCH /selfies/:id` — hides (soft-deletes) a submission, used by wall moderation

Once these exist, the two Next.js routes above should just proxy to them
(or be deleted in favor of calling the real API directly from
`SelfiesWallPage.tsx` and the mobile app).

## 2. Cloudinary / whoever owns that account — harden the upload preset

Selfies are uploaded directly from the mobile app to Cloudinary using an
**unsigned upload preset** (`NEXT_PUBLIC_CLOUDINARY_NAME` /
`NEXT_PUBLIC_CLOUDINARY_PRESET`, read in
`src/mobile/lib/src/app/shared/services/clean_air_forum_submission_service.dart`).
Unsigned presets are bundled in the app binary by design (that's how
unsigned uploads work), so anyone who decompiles the app can extract the
preset name and cloud name and upload directly to this Cloudinary account.

Please apply, at minimum, on the `clean_air_forum_selfies` preset:

- **Folder lock** — restrict the preset to only write into
  `clean_air_forum_selfies/` (prevents overwriting/polluting other
  folders in the account).
- **File size / format limits** — cap to a few MB, images only.
- **Moderation** — consider enabling Cloudinary's built-in moderation
  add-on (or at least manual review capability) given this feeds a public
  venue display.
- Longer-term: move to a **signed upload** flow (mobile app calls our own
  backend for a signature, backend calls Cloudinary) once the real backend
  from §1 exists — this closes the preset-exposure issue completely
  instead of just mitigating it.

The website route already validates that submitted `imageUrl`s are
`https://res.cloudinary.com/.../clean_air_forum_selfies/...` before
accepting them (defense in depth), but that alone doesn't stop someone
with the preset from uploading directly to Cloudinary — it only stops them
from getting arbitrary *other* URLs onto the wall via our API.

## 3. DevOps / whoever manages GitHub Actions secrets — wire up new env vars

Two new secrets need to be created and referenced in the deploy workflows
(`.github/workflows/deploy-frontends-to-staging.yml`,
`deploy-frontends-to-production.yml`, the Azure equivalents, and
`deploy-frontend-pr-previews.yml` if selfie testing on PR previews matters).
These are **server-only** vars (no `NEXT_PUBLIC_` prefix), so they only need
adding to each workflow's `.env.yaml` generation step (same pattern as
`SLACK_WEBHOOK_URL`) — no Docker `--build-arg` needed.

| Env var | Where it's used | What it does |
|---|---|---|
| `CLEAN_AIR_FORUM_WALL_PIN` | `src/website/src/app/api/clean-air-forum/selfies/[id]/route.ts` | Staff PIN required to remove a photo from the wall via double-tap/long-press |
| `CLEAN_AIR_FORUM_SUBMISSION_SECRET` | `src/website/src/app/api/clean-air-forum/selfies/route.ts` | Shared secret the mobile app sends (`x-clean-air-forum-secret` header) so only the app can post to the wall |

**Important**: both checks now **fail closed in production** if the
corresponding env var is missing (they only fail open in
development/preview, for local testing convenience) — see
`src/website/src/services/cleanAirForumAuth.ts`. If these aren't
configured before a production deploy, moderation and/or submissions will
be rejected outright (with a `console.warn` in the server logs), not
silently left open. **Please set both before the forum goes live in
production.**

The mobile app also needs a matching secret in its own env
(`CLEAN_AIR_FORUM_API_SECRET` in `src/mobile/.env.prod` /
`.env.dev` — not committed to the repo) equal to whatever
`CLEAN_AIR_FORUM_SUBMISSION_SECRET` is set to on the website side.

## 4. Rate limiting — needs a real (distributed) solution

`route.ts` currently has a best-effort **in-memory, per-server-instance**
rate limit (5 submissions/IP/minute) as a stopgap — it resets per instance
and doesn't hold across replicas, so it only blunts casual spam, not a
determined abuser hitting a load-balanced deployment. If abuse becomes a
real concern for the event, this needs a proper distributed rate limiter
(e.g. Cloudflare in front of the site, or a Redis/Upstash-backed limiter)
— that's an infra decision beyond what this PR can set up.

## 5. Content moderation policy

Right now, moderation is manual only: a staff member double-taps or
long-presses a bad photo on the wall display itself and enters a shared
PIN. There's no automated image moderation (nudity/violence detection,
etc.). Given this is a public-facing conference wall, it may be worth
asking whoever owns Cloudinary to enable an automated moderation add-on
(see §2) as a first line of defense, with manual removal as the backstop.

## Real event details still needed

`src/mobile/lib/src/app/dashboard/utils/clean_air_forum_branding.dart`
has `edition` and `dateRange` set to `'Pretoria 2026'` and
`'13TH-16TH JULY'` based on the Figma design — please confirm these are
the actual confirmed host city/year and dates before the forum, or update
them.
