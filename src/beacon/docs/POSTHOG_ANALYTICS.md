# Beacon product analytics (PostHog)

Beacon sends product analytics to PostHog so we can see which parts of Beacon people use, how they move between them, and why they stop or come back. Vertex uses the same setup (`src/vertex/docs/POSTHOG_ANALYTICS.md`), and both follow the conventions Nexus already uses (`src/nexus/docs/POSTHOG_ANALYTICS.md`).

## Turning it on

| Variable | Value |
| --- | --- |
| `NEXT_PUBLIC_POSTHOG_KEY` | The PostHog project API key (`phc_…`). Nothing is loaded or sent while it's empty. |
| `NEXT_PUBLIC_POSTHOG_HOST` | Ingestion host. Defaults to `https://us.i.posthog.com`. |

Both are read when the image is built, so they go in the env secret the deploy writes to `src/beacon/.env` (`sta-env-beacon` for staging, the production secret for production), not in the Kubernetes runtime config. Rebuild after changing them.

- **Same project as Nexus and Vertex, or separate?** Using one project lets you follow a person and an organisation across AirQo apps: PostHog's cookie is set on `.airqo.net`, so the same browser keeps one id across Beacon, Vertex and Nexus. Every event carries `app_name` (`beacon`) and `environment` (`development`, `staging`, `production`, from the hostname), so you can filter to one app or keep staging out of production charts.
- **Content Security Policy.** Beacon only sends a CSP header when `ENABLE_CSP=true`. If that's on, `CSP_HEADER` must allow the PostHog hosts in `connect-src` and `script-src` (`https://us.i.posthog.com https://us-assets.i.posthog.com`, or your region's).

## What is and isn't collected

- **Pageviews**, sent on every route change with `route` (the app route, e.g. `/dashboard/devices/[id]`, so usage adds up across devices) and `page_title` (`Device Details`). `tests/unit/analytics` fails if a new page in `app/` is missing from `ROUTE_TEMPLATES` in `lib/analytics.ts`.
- **Named events** for completed actions, listed below. Autocapture, rage clicks and dead clicks are off, so no clicked text or form contents are collected.
- **Identity.** After sign-in, events are tied to the user's platform `_id`, with `beacon_role` (their privilege) as the only person property. No email, name, phone or username is sent. Anonymous activity before sign-in (the sign-in page) is merged into the person when they sign in. Signing out resets the browser's id.
- **Organisation.** Events are associated with the active group through PostHog's `organization` group type (group key = group id, with `name` and `slug`), the same type Nexus uses.
- **Property filtering.** `trackEvent()` drops any property whose name looks like personal data or typed text (`email`, `phone`, `name`, `username`, `token`, `password`, `message`, `description`, `comment`, `query`, …). Flags and counts such as `has_query` and `query_length` are kept. Strings are capped at 200 characters.
- **URLs.** Query strings and hashes are removed from every URL property (`$current_url`, `$referrer`, the `$initial_*` person properties, …) before anything is sent. Google sign-in returns with a token in the URL hash, and reset links carry tokens in the query, so PostHog also waits to start until the URL no longer contains one.
- **Session replay** is allowed in code but follows the PostHog project setting (Settings → Session replay), so it's off until someone switches it on there. When on, every input is masked. Text on screen is not masked: replays of the Users page show the emails listed there.
- **Surveys** are allowed: a survey created in PostHog for this project can appear in Beacon without a deploy.
- posthog-js is imported lazily once the browser is idle, so it isn't in any route's JavaScript. Calls made before it loads wait in a queue of up to 100.

## Events

All events also carry `app_name`, `environment`, `route` and `page_title`.

### Sign-in and organisations

| Event | When | Properties | Answers |
| --- | --- | --- | --- |
| `user_signed_in` | First dashboard load after a sign-in, password or Google/OAuth | `method` (`password`, `google`, `github`, …), `login_duration_ms` | How people sign in, and how long it takes |
| `user_sign_in_failed` | Password sign-in rejected | `method`, `reason` (`invalid_credentials`, `error`) | Where sign-in goes wrong |
| `user_signed_out` | The user signs out from the top bar | — | Session ends (expired sessions don't send this) |
| `organization_switched` | The user picks a different organisation in the switcher | `member_organization_count`, `used_search` | Do people work across organisations? |
| `group_link_opened` | Beacon opened with `?group=`, e.g. from Vertex's device health cards | `matched` (whether the user belongs to that group) | Traffic arriving from Vertex, and broken links |
| `app_link_opened` | A link to another AirQo app is clicked | `destination` (`vertex`, `nexus`, `calibrate`, `ai_platform`, `mobile_app`, …), `source` (`home_first_device`, `empty_device_list`, `apps_menu`, `organisation_switcher_join`, …) | Which prompts send people to Vertex or Nexus |

### Home and onboarding

| Event | When | Properties | Answers |
| --- | --- | --- | --- |
| `home_action_selected` | A Home card or link is used | `action` (`feature_card`, `view_all_devices`, `continue_recent`), `feature` (card id), `page`, `position` | What people go to from Home |
| `tour_started` | A page tour starts | `tour_id`, `trigger` (`automatic`, `home`, `help_menu`), `step_count` | Which tours run, and who replays them |
| `tour_completed` | Done on the last step | `tour_id`, `trigger`, `step_count`, `steps_viewed` | Tour completion |
| `tour_dismissed` | Closed early, or the user left the page | `tour_id`, `trigger`, `step_count`, `steps_viewed`, `reason` (`closed`, `left_page`) | The step where people give up |

### Devices, sites and the map

| Event | When | Properties | Answers |
| --- | --- | --- | --- |
| `list_searched` | A device-list search returns (once per search) | `list`, `scope` (`org`, `my`), `query_length`, `result_count` | Do searches find something? (`result_count = 0`) |
| `list_filtered` | Manufacturer filter changed on a device list | `list`, `scope`, `filter`, `selected_count`, `manufacturers` | Which manufacturers people filter to |
| `device_tab_opened` | A tab is chosen on a device page | `tab`, `initial_tab` | Which device tabs get used |
| `remote_command_sent` | A command is sent from the remote terminal | `mode` (`cloud`, `local`), `command` (cloud commands and local quick commands only), `dangerous`, `role`, `parameter_count`, `source` (`typed`, `quick`, `history`), `sent` | Remote-terminal use; typed commands aren't named |
| `map_view_changed` | Maintenance map switched between devices and sites | `to` | Devices vs sites view |
| `map_filter_changed` | A maintenance-map filter changes | `filter` (`days`, `offline_days`, `uptime`, `error_margin`, `cohort`, `grid`, `grid_admin_level`, `tag`, `coverage`), `value` or `is_set`, `view` | Which filters matter to field teams |
| `map_item_selected` | A device or site is picked | `source` (`map`, `list`), `view` | Map vs list use |
| `maintenance_route_planned` | A maintenance route is calculated | `stop_count`, `by_road`, `planner`, `road_routing_failed`, `distance_km` | Route planning use and size |

### Diagnostics

| Event | When | Properties | Answers |
| --- | --- | --- | --- |
| `device_diagnosis_run` | A device evaluation finishes | `window_hours`, `lifecycle_state`, `health_score`, `diagnosis_count` | How often diagnostics are run, and on what |
| `diagnosis_feedback_submitted` | A technician confirms or corrects a diagnosis | `was_prediction_accurate`, `confirmed_cause_code` | Diagnosis accuracy in the field |
| `fleet_diagnosis_run_started` | Daily fleet run triggered | `mode`, `lookback_days`, `device_count`, `force` | Manual fleet runs |
| `fleet_issues_filtered` | Fleet issues filter changed or cleared | `filter` (`severity`, `new_only`, `sort`, `check_type`, `clear_all`), `value` | How people triage issues |
| `simulator_run` | Bench simulator evaluation | `scenario`, `window_hours`, `has_profile`, `lifecycle_state` | Simulator use |

### Reports and exports

| Event | When | Properties | Answers |
| --- | --- | --- | --- |
| `report_generated` | A report preview loads | `item_type` (`airqlouds`, `devices`), `item_count`, `result_count`, `days` | Report use and size |
| `report_failed` | A report preview fails | `item_type`, `item_count` | Reports people couldn't get |
| `report_exported` | Report PDF or a section image downloaded | `format` (`pdf`, `png`), `sections`, `has_map`, `section` | Which report parts people take away |
| `data_exported` | Any other download | `source` (`maintenance_map`, `maintenance_map_export`, `lorawan_gateways`, `sites_table`, `devices_table`, `cohorts_table`, `grids_table`, `stock`, `inlab_collocation`, `device_profile`, `device_profile_list`, `device_data_chart`, `device_data_table`), `format`, `row_count` | What data leaves Beacon, and in what format |
| `firmware_downloaded` | A firmware file is downloaded | `file_type`, `firmware_type` | Firmware downloads |

### Feedback (the "why")

| Event | When | Properties | Answers |
| --- | --- | --- | --- |
| `page_rating_submitted` | 👍/👎 on the page satisfaction banner, or detail added | `rating` (5 or 1), `reason` (preset only: `Confusing`, `Missing features`, `Slow to load`, …, `Other`), `is_follow_up`, `has_detail` | Which pages disappoint, and why |
| `page_rating_dismissed` | The banner is closed without rating | — | Prompt fatigue |
| `login_rating_submitted` | The post-sign-in rating | `rating`, `reason` (preset only), `login_duration_ms` | Sign-in experience |
| `login_rating_dismissed` | That prompt is closed | — | |
| `feedback_submitted` | The feedback form is sent | `category` (`issue`, `idea`), `issue_action` (preset: `Maintenance map`, `Remote terminal`, …), `rating`, `contact_consent`, `has_screenshot`, `opened_from` (`help_menu`, `page_rating`, `dialog`) | Where issues cluster |

Typed feedback text never goes to PostHog. It still reaches the team through the existing feedback service.

## Answering common questions in PostHog

- **Which pages are used?** Trends → `$pageview`, total count and unique users, broken down by `route` (or `page_title`). Add a filter on `environment = production`.
- **Who uses what?** The same chart broken down by the `organization` group, or by the person property `beacon_role`.
- **Do people come back?** Retention: `$pageview` as both start and return event, weekly.
- **How do people reach device pages?** User paths starting at `/dashboard/home`, or `$pageview` filtered to `route = /dashboard/devices/[id]` and broken down by `$prev_pageview_pathname`.
- **Does Vertex send people to Beacon?** Trends on `group_link_opened`; with one shared project, a funnel from Vertex's `app_link_opened` (`destination = beacon`) to Beacon's `$pageview`.
- **Are tours working?** Funnel `tour_started` → `tour_completed`, broken down by `tour_id`; break `tour_dismissed` down by `steps_viewed`.
- **Why don't people like a page?** `page_rating_submitted` where `rating = 1`, broken down by `page_title` and then `reason`. Open a few of those users' replays if replay is on.
- **Do searches fail?** `list_searched` where `result_count = 0`, as a share of all `list_searched`.

## Adding an event

Call `trackEvent("object_action", { … })` from `@/lib/analytics` where the action has completed (after the request succeeded, not when the button was pressed). Use snake_case, past tense, and plain values: ids of devices and sites are fine when needed; names, emails and anything a person typed are not. If a full page load follows straight away, pass `{ sendNow: true }`. Add the event to the tables above.
