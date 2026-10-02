# AirQo Nexus product analytics

This document describes the PostHog instrumentation in the Nexus app and how to use it to understand individual and organization journeys.

## Setup and identity

- `PostHogProvider` initializes `posthog-js` in the browser when `NEXT_PUBLIC_POSTHOG_KEY` is set. `NEXT_PUBLIC_POSTHOG_HOST` selects the ingestion host and defaults to `https://us.i.posthog.com`.
- Automatic click/form autocapture and automatic pageviews are disabled. Route changes emit one manual `$pageview`; page leave capture remains enabled. Session recording is disabled.
- After NextAuth resolves an authenticated user, Nexus calls `identify()` with the stable auth user ID. It keeps the anonymous distinct ID during the auth loading state, so pre-login activity can be associated with the user after login. It resets identity on logout or an account change.
- Person properties are limited to app name, organization, country, job title, verification, and active status. Email, names, and usernames are not added to the PostHog profile.
- Events on `/org/{slug}/...` are associated with the active group using PostHog's `organization` group type. Group association is cleared when leaving organization routes. Individual routes are distinguished by the `product_flow` event property.

PostHog's [Next.js setup guide](https://posthog.com/docs/libraries/next-js) recommends identifying logged-in users with a stable ID, and its [group analytics guide](https://posthog.com/docs/product-analytics/group-analytics) describes associating events with an organization group.

## Shared event utility

Use `capturePostHogEvent(client, eventName, properties?, options?)` from `src/shared/utils/analytics.ts` for PostHog events. It adds `app_name`, `app_version`, `environment`, and `product_flow`, and filters direct identifiers and sensitive fields from event properties. `trackEvent()` sends the same event to PostHog and Google Analytics; the domain helpers in `enhancedAnalytics.ts` use the shared PostHog capture path as well.

`product_flow` is one of:

| Value          | Route family                      |
| -------------- | --------------------------------- |
| `individual`   | `/user/...`                       |
| `organization` | `/org/{slug}/...`                 |
| `shared`       | Routes outside those two families |

Keep event names in `noun_verb` form and properties in `snake_case`. Capture completed actions, not component renders. Do not send emails, names, passwords, tokens, user IDs, raw site/location IDs, raw site/location names, or user-authored titles in event properties. Stable user identity belongs in `identify()`; organization analysis belongs in group analytics. `hashId()` is a deterministic FNV-1a hash for pseudonymous joins, not cryptographic anonymization.

## Individual and organization journeys

Nexus supports the individual `/user/...` route family and the organization `/org/{slug}/...` route family. The header organization selector is available to move between them. Both journeys share map, analytics, data export, data visualizer, and AI features; event properties and PostHog's group association show which flow and organization were active.

### Organization and cohort selection

| Event                          | When it fires                                                   | Useful properties                                                                         |
| ------------------------------ | --------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `organization_selector_opened` | User opens the organization chooser                             | `available_organization_count`                                                            |
| `organization_selected`        | User chooses a different organization or individual destination | `available_organization_count`, `selection_type`                                          |
| `group_switched`               | Active group changes                                            | `from_group_flow`, `to_group_flow`                                                        |
| `org_cohort_selector_opened`   | User opens the organization cohort dropdown                     | `selector_source`, `cohort_count`, `has_selected_cohort`, `selected_cohort_position`      |
| `org_cohort_selected`          | User changes the selected cohort                                | `selector_source`, `cohort_count`, `previous_cohort_position`, `selected_cohort_position` |
| `org_cohorts_retry_clicked`    | User retries a failed cohort load from the header               | `selector_source`, `cohort_count`                                                         |

Automatic persisted/default cohort selection does not count as a user selection. Opens count only when the dropdown changes from closed to open, including keyboard activation. Cohort identifiers and names are omitted so analysis measures selector use without exposing the organization's cohort inventory. Cohort positions are zero-based and reflect the option order at the time of the event.

To answer “how many users open the cohort selector, and how many select a cohort?” in PostHog:

1. Create a funnel with `org_cohort_selector_opened` followed by `org_cohort_selected`; filter `product_flow` to `organization` and use unique users for conversion.
2. Use a trends insight on `org_cohort_selector_opened` to compare total events with unique users. This separates repeat opens from reach.
3. Break down by `selector_source` or `cohort_count` to compare surfaces and selector complexity.
4. Use group analytics to compare organization-level engagement. `organization` group association is applied to events in organization routes.
5. Track `org_cohorts_retry_clicked` alongside selector opens as a signal of cohort loading friction.

PostHog's [funnels guide](https://posthog.com/docs/product-analytics/funnels) covers conversion analysis, while [retention and stickiness](https://posthog.com/docs/product-analytics/retention) distinguish return behavior from repeat event frequency.

### Air quality rankings

| Event                                    | When it fires                                                       | Useful properties                   |
| ---------------------------------------- | ------------------------------------------------------------------- | ----------------------------------- |
| `air_quality_rankings_viewed`            | Rankings page or tab is viewed                                      | `tab`, `level`, `country`           |
| `air_quality_rankings_tab_changed`       | User changes between live and historical rankings                   | `from_tab`, `to_tab`                |
| `air_quality_rankings_filter_changed`    | User changes a ranking level, sort, limit, country, or history year | `view`, `filter`, `value`           |
| `air_quality_rankings_search_changed`    | User pauses after changing the local table search                   | `view`, `has_query`, `query_length` |
| `air_quality_rankings_page_changed`      | User changes the results page                                       | `view`, `page`                      |
| `air_quality_rankings_page_size_changed` | User changes rows per page                                          | `view`, `page_size`                 |
| `air_quality_rankings_sort_changed`      | User sorts the historical table                                     | `view`, `column`, `direction`       |
| `air_quality_rankings_refresh_requested` | User refreshes results from the page or table                       | `view`, `source`                    |

Search events report only whether a query exists and its length; the location text is never sent.

### Data visualizer

`air_quality_explorer_*` events cover page views, upload start and outcome, retries and cancellations, datasets and sheets added or removed, chart creation/activation/configuration/removal/export, chart legend and zoom actions, map feature selection, date ranges, layouts, data review, workspace preferences, draft restore/clear, and documentation/tutorial use. Properties describe action types, chart settings, counts, and file types. Upload names, dataset labels, chart titles, series names, imported values, and error messages are not included. Chart-setting events are batched briefly so editing several settings together produces one event.

### Other instrumented behavior

- Authentication: `auth_login`, `auth_register`, `auth_password_reset_requested`, and `auth_password_reset_completed`.
- Home: `home_v2_viewed`, `home_action_selected`, and `home_continue_selected`.
- Map and location insights: `map_viewed`, `map_location_selected`, `location_selected`, `map_interaction`, and `feature_used`.
- Analytics and charts: `analytics_trends_viewed`, `analytics_card_clicked`, chart create/update/duplicate/delete events, export events, and standards interactions.
- Data export and visualization: export tab/filter changes, download start/failure/completion, visualizer actions, and `data_visualize_clicked`.
- AI assistant: `ask_airqo_opened`, `ask_airqo_prompt_submitted`, and `ask_airqo_action_selected`.
- Cross-cutting: `$pageview`, `page_dwell`, `session_quality`, `search_performed`, `preference_changed`, `error_occurred`, and sanitized API performance events.

The event list in code is authoritative; feature teams should add new events through the shared utility and update this section when they introduce a behavior used in dashboards or funnels.

## Privacy and operations

- The PostHog event utility recursively removes direct identifiers and sensitive property keys before capture. Autocapture is disabled so uncontrolled DOM text is not collected.
- Pageview URLs contain the route path only; query parameters are excluded.
- Event payloads may include hashed entity IDs where a pseudonymous join is required. Do not describe deterministic hashes as anonymous data.
- No event is sent if `NEXT_PUBLIC_POSTHOG_KEY` is unset. Verify data delivery in PostHog's live events view after deploying instrumentation, and ensure Content Security Policy allows the configured PostHog ingestion host.

See the official [PostHog identify guidance](https://posthog.com/docs/data/anonymous-vs-identified-events) for anonymous-to-identified event linking and user identity behavior.
