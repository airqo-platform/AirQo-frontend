# Vertex product analytics (PostHog)

Vertex sends product analytics to PostHog so the team can see which parts of Vertex people use, how they get through device work (claim, import, deploy, recall), where they leave, and what they tell us about it. Beacon uses the same setup and the same shared event names, so both apps can be compared in one PostHog project.

## Setup

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | PostHog project API key (`phc_…`). Nothing is loaded or sent when it is empty. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Ingestion host. Defaults to `https://us.i.posthog.com`. |

Vertex reads both when the server runs, not when the image is built (`lib/public-env.ts`), and hands them to the browser in the page. In deployments they go in the app's env secret (`sta-env-vertex` for staging, `prod-env-vertex` for production) and take effect when the pods restart. A project API key is meant to be public, so it is safe in the page.

Code lives in:

- `lib/track.ts` — what the rest of Vertex imports: `trackEvent`, the sign-in helpers and `resetAnalytics`. It only forwards calls.
- `lib/analytics.ts` — the client: lazy loading, privacy filtering, identity, sign-in bookkeeping. Only the provider imports it; it connects itself to `lib/track.ts` as it loads.
- `core/providers/analytics-provider.tsx` — pageviews, `identify`, organisation group, `user_signed_in`. Mounted in `app/providers.tsx`.
- `lib/analytics.test.ts`, `lib/analytics.client.test.ts`, `lib/track.test.ts` — unit tests. The client test runs against a mocked `posthog-js`.

**Bundle budget.** Vertex's `size-limit` check counts route chunks (`.next/static/chunks/app/**`, 210 kB brotli).

- `posthog-js` (about 51 kB brotli) is imported dynamically once the browser is idle. It sits in its own lazy chunk and isn't counted.
- The client is about 2 kB and lives in the root layout chunk.
- Feature code must import `@/lib/track`, never `@/lib/analytics`. Importing the client from route code makes webpack give it a shared chunk. The device list routes are already at their initial-chunk limit, so webpack then copies other shared code into each of them. When this was tried, the total went from 203.0 kB to 217.8 kB; through `lib/track.ts` it is 198.5 kB.

Calls made before PostHog loads wait in a queue of up to 100 events and are replayed in order; identify, organisation and reset calls are always kept. If loading fails, the queue is kept and the next call retries, up to three times. Calls queued while PostHog is still loading are lost if the page unloads first, so an action that leaves the page in the first second or two (a sign-up link clicked straight away, say) may not be recorded. Once PostHog has loaded, `sendNow` events go out at once with a fetch keepalive request that survives navigation.

## Identity and context

- **Anonymous until sign-in.** Visitors get PostHog's anonymous id. With `person_profiles: 'identified_only'`, no person profile is created until sign-in, when `identify()` joins the anonymous events (the login page, for example) to the user.
- **The user id is the platform `_id`.** Person properties are limited to `vertex_privilege` and `country`. Emails, names, usernames and phone numbers are never sent.
- **Sign-out resets.** Every logout calls `posthog.reset()`, including automatic ones (expired session, sign-out in another tab), so the next person on the browser starts fresh. If PostHog hasn't loaded yet on that page, its stored id (local storage and the `.airqo.net` cookie) is removed directly. Nothing is identified again while a logout is in progress. If a different account signs in on a browser that is still identified, the client resets before identifying.
- **The organisation is applied only once the Redux state belongs to the signed-in user**, so a persisted organisation from the previous account isn't attached to the next one's events.
- **Organisations use PostHog's `organization` group type**, the same one Nexus uses. The group key is the group `_id`, with the group title as `name`.
- **Every event carries** `app_name: "vertex"`, `environment`, `platform` (`web` or `desktop`) and `user_context` (`personal` or `external-org`; `unknown` before the organisation is known). Pageviews and Vertex's named events also carry `route`; PostHog's own events (`$pageleave`, `$identify`, `$groupidentify`) don't.
  - `environment` comes from the host: `localhost` → `development`, a host containing `stage`/`staging` → `staging`, anything else → `production`. NODE_ENV is `production` on staging too, so it can't be used.
  - `route` is the page's route template, for example `/devices/overview/[id]`. Use it to add up usage across devices, sites and cohorts.

## What is and isn't collected

Collected:

- A `$pageview` for each route change, under its route template, plus PostHog's `$pageleave` (time on page).
- The named events listed below.

Not collected:

- **Autocapture, rage clicks and dead clicks are off.** They record the text of clicked elements, which in Vertex includes device names, site names and emails in tables.
- **No free text.** Search terms, feedback messages, notes, error text and the "Other: …" text typed into reason prompts are never sent. Searches send only `has_query` and `query_length`.
- **No entity names or user ids in event properties.** `sanitizeProperties()` drops any key that looks like an email, phone number, name, token, password, message, description or query, except `has_*`, `is_*`, `*_count` and `*_length` keys, which only describe a value. Strings are cut to 200 characters and arrays to 50 items.
- **No query strings or hashes in URLs.** `before_send` strips them from `$current_url`, `$referrer` and the `$initial_*` person properties, and session replay gets the same treatment through `maskCapturedNetworkRequestFn`. Campaign parameters (`utm_*`, click ids) aren't saved (`save_campaign_params: false`), since they're copied from the URL as-is. OAuth hand-offs and reset links carry tokens there, so PostHog doesn't start while the URL holds a `token` parameter. It waits up to a minute, then retries from the next clean page.

## Session replay and surveys

Session replay is allowed in code but follows the PostHog project setting (**Project settings → Session replay**), so it stays off until someone switches it on. When it is on:

- Every input is masked (`maskAllInputs: true`), and page URLs in recordings lose their query strings and hashes.
- Elements with the `ph-no-capture` class are left out of recordings, and text in `ph-mask` elements is masked. The claim tokens and QR codes on shipping pages use `ph-no-capture`, and the email shown on the sign-in password step uses `ph-mask`.
- Other on-screen text is recorded, including device and site names, and member emails on organisation pages. Before turning replay on, consider adding `ph-no-capture` to tables that list people.

In-app surveys are allowed as well: a survey created in PostHog shows in Vertex without a deploy. Surveys plus replay are the main tools for the "why" behind the numbers.

## Events

Shared with Beacon (same names, same meaning):

| Event | When | Properties | Answers |
| --- | --- | --- | --- |
| `user_signed_in` | First signed-in page after a sign-in (`core/providers/analytics-provider.tsx`) | `method` (`password`, `google`, `github`, `linkedin`, `twitter`, `sso_session`), `login_duration_ms` | How people sign in, and how long it takes |
| `user_sign_in_failed` | Password or OAuth sign-in rejected, or its request failed | `method`, `reason` (`invalid_credentials`, `network`, `no_session`, `error`) | Where sign-in breaks |
| `user_signed_out` | A sign-out the user confirmed in the top bar has gone through | — | Deliberate sign-outs (automatic ones reset without an event) |
| `organization_switched` | User picks a different organisation. Sent before the switch, so it carries the organisation being **left**; `to_context` describes the one being entered | `member_organization_count`, `to_context` | How often multi-org users switch, and from where |
| `app_link_opened` | Link to another AirQo app | `destination` (`beacon`, `nexus`, `calibrate`, `website`, `api_docs`, `mobile_app`, `ai_platform`, `desktop_download`), `source`, plus `link`, `card_state` or `store` (`google_play`, `app_store`) | Cross-app journeys, including Vertex → Beacon |
| `mobile_app_qr_viewed` | The mobile app QR code is shown from the apps menu | `source` | Interest in the mobile app |
| `data_exported` | Table exported to CSV (`ReusableTable`) | `source: 'table'`, `format`, `scope`, `row_count`, `column_count` | Which lists people take data out of (by `route`) |
| `list_searched` | Pause after typing in a table's search box | `has_query`, `query_length`, `server_side` | Whether people rely on search, per list (`route`) |
| `home_action_selected` | Action on Home | `action` (`claim_device`, `register_device`, `add_device`, `assign_cohort`, `set_visibility`, `status_card`), `source` (`header`, `empty_state`, `checklist`, `add_device_choice`), `status` for status cards | Which Home entry points work |
| `page_rating_submitted` | Page satisfaction 👍/👎 or follow-up | `rating` (5 or 1), `reason` (preset), `is_follow_up`, `has_detail`, `page_section` | How people feel about each page, and why |
| `page_rating_dismissed` | Satisfaction banner closed | — | Prompt fatigue |
| `login_rating_submitted` | Post-login rating | `rating`, `reason` (preset; typed text becomes `Other`), `login_duration_ms` | Sign-in experience |
| `feedback_submitted` | Feedback dialog sent | `category` (`issue`, `idea`), `issue_action` (preset), `rating`, `contact_consent`, `has_screenshot`, `from_dialog` | What people report, by area |

Vertex only:

| Event | When | Properties |
| --- | --- | --- |
| `device_claimed` | Claim succeeds (claim modal; a bulk request counts only if at least one claim succeeded) | `method` (`qr`, `manual`, `bulk`, `cohort`), `mode` (`guided`, `fast`), `device_count`, `successful_count`, `failed_count`, `input` (`file`, `typed`, `mixed`; bulk only, from the rows submitted), `context`, `has_default_cohort` |
| `device_imported` | Non-AirQo device registered | `mode` (`single`, `bulk`), `device_count`, `imported_count`, `failed_count`, `file_type` (bulk), `flow` (bulk), `category`, `auth_required`, `has_cohort`, `area` (single) |
| `import_template_downloaded` | Bulk import CSV template downloaded | `format` |
| `device_created` | Device created on an admin network page | `category`, `tag_count` |
| `device_deployed` | Deployment saved | `deployment_type`, `site_source` (`new`, `previous`), `input_mode` (`siteName`, `coordinates`, `previous_site`), `mount_type`, `power_type`, `is_primary_in_location`, `from_device_page` |
| `device_recalled` | Recall saved | `recall_type` |
| `device_decommissioned` | Decommission saved | `has_reason` |
| `maintenance_logged` | Maintenance log added | `maintenance_type`, `tag_count`, `has_notes` |
| `device_updated` | Device details saved | `scope` (`local`, `global`, `bulk`), `fields` (field names only), `device_count` |
| `device_assigned_to_organization` | Personal device shared with an organisation | — |
| `cohort_created` | Cohort created | `device_count` or `source_cohort_count`, `scope` (`organization`, `personal`, `combined`), `cohort_tags` (preset tags), `has_custom_slug` |
| `cohort_updated` | Cohort details or name saved | `fields` |
| `cohort_visibility_changed` | Cohort made public or private | `visibility`, `source` (`home`, `cohort_details`) |
| `cohort_devices_added` / `cohort_devices_removed` | Devices added to or removed from a cohort | `device_count`, `assigned_count`, `already_assigned_count` |
| `cohorts_assigned_to_organization` | Cohorts given to an organisation (also fires for a claim by cohort ID) | `cohort_count` |
| `site_created` / `site_updated` | Site saved | `input_mode` / `section`, `fields` |
| `grid_created` | Grid saved | `admin_level`, `shape_type` |
| `network_created` | Sensor manufacturer created | `network_category` |
| `network_access_requested` | New manufacturer requested | `network_category` |
| `network_request_reviewed` | Admin approves, denies or reviews a request | `action`, `previous_status`, `has_notes` |
| `shipping_batch_created` | Shipping batch prepared | `device_count`, `successful_count`, `failed_count`, `claim_code_format` |
| `shipping_labels_generated` | Labels generated | `scope` (`selected`, `all`), `label_count` |
| `shipping_labels_printed` | The print dialog opens for the labels | `label_count` |
| `module_switched` | The page lands in the other module after the user asked to switch | `to` |
| `onboarding_step_completed` / `onboarding_checklist_dismissed` | Checklist updated | `step`, `scope` |
| `desktop_app_download_clicked` | Download on `/download` | `source` (`primary_button`, `platform_card`), `platform`, `arch`, `package` (`mac_arm64_dmg`, `mac_x64_dmg`, `win_exe`, `linux_appimage`, `linux_deb`), `matches_detected_platform`, `has_release` (false when the button only scrolls to the list) |

Add new events through `trackEvent()` from `@/lib/track`: past-tense `object_action` names, snake_case properties, completed actions only (a mutation's `onSuccess`, not a button press that may fail). Update this table when you do.

## Recipes in PostHog

- **Which pages people use:** Trends → `$pageview`, breakdown by `route`, filtered to `environment = production`. Switch to unique users to see reach rather than repeat views. Add a breakdown by `user_context` to compare personal and organisation use.
- **Claim funnel, QR vs manual:**
  1. Build a funnel: `home_action_selected` (`action = claim_device`) → `device_claimed`.
  2. Break down the last step by `method`.
  3. A drop between the two is people who opened the claim modal and gave up. Watch a few replays of those sessions, if replay is on, to see where.
- **Bulk vs single registration:** Trends on `device_imported` by `mode`. Watch `failed_count` to spot file formats that fail (`file_type`).
- **Vertex → Beacon jumps:** Trends on `app_link_opened` where `destination = beacon`, broken down by `source` (`device_health_card`, `site_health_card`, `cohort_health_card`). To follow people across, filter Beacon's `group_link_opened` events (both apps, same project) and use a funnel by user.
- **What blocks people:** Break `page_rating_submitted` with `rating = 1` down by `route` and `reason`. Compare with `feedback_submitted` by `issue_action`.
- **Organisation adoption:** Any insight → "Aggregating by" → Unique organizations, to see which organisations are active and in which features.
- **Desktop vs web:** Breakdown any insight by `platform`. Combine with `desktop_app_download_clicked` to see whether downloads turn into desktop use.

## Operations

- **Verifying a deploy:** Open PostHog → Activity (live events) and filter `app_name = vertex`.
  - Locally, set the key in `.env.local` and use `localhost`. Events are marked as internal/test users there (`internal_or_test_user_hostname`), so "Filter out internal and test users" hides them from insights.
  - Add `?__posthog_debug=true` to a URL to log PostHog activity in the console.
- **Staging and production:** If both use the same project key, keep insights filtered by `environment`. Separate keys (one per secret) keep them apart entirely.
- **CSP:** Vertex sends no Content-Security-Policy header today. If one is added, allow the ingestion host (`connect-src`) and PostHog's asset host (`script-src` for the lazily loaded replay and survey code: `us-assets.i.posthog.com`).
- **Ad blockers** block the default PostHog hosts for some users. A reverse proxy (a Next.js rewrite to `/ingest`) avoids that if the numbers look low.

## Known gaps

- Events recorded from a dialog's own success callback (claim, deploy, bulk import, shipping labels) aren't sent if the user leaves the page before the request finishes, because the callback no longer runs. The result still happens; only the event is missed.
- Calls queued before PostHog loads are lost if the page unloads first (see the bundle note above).
