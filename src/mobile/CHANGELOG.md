# Changelog — AirQo Mobile

All notable changes to the AirQo mobile app (`src/mobile`) are recorded here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and
versions match `version:` in `pubspec.yaml`.

## How to update this file

**Every pull request that changes anything under `src/mobile/` must add an entry
here.** A CI check (`mobile-changelog`) fails the PR otherwise.

1. Add one or more bullets under **[Unreleased]**, in the right group:
   `Added`, `Changed`, `Fixed`, `Removed`, `Security` or `Deprecated`.
2. Write for the next developer: what changed and why, in a sentence or two.
   Link the issue or PR where there is one.
3. When cutting a release, rename **[Unreleased]** to the new version and date
   (e.g. `## [3.0.10] - 2026-11-20`) and start a fresh empty **[Unreleased]**.
   If a new build replaces one still in App Store review under the same
   version, label each section with its build, e.g. `(build 2)`.

For PRs with no meaningful change to record (e.g. a typo in a comment), a
maintainer can add the `skip-changelog` label to bypass the check.

History before this file was introduced lives in the git log
(`git log -- src/mobile`).

## [Unreleased]

### Fixed

- **The dashboard reloads when the connection returns after a failed load.**
  Starting offline with nothing cached leaves the dashboard on an error. On
  reconnect, `DashboardBloc` only refreshed an already-loaded dashboard whose
  data was over 30 minutes old, so the "Back online" banner appeared while the
  error stayed until a manual refresh. A reconnect now triggers
  `LoadDashboard(forceRefresh: true)` from the error state. Added
  `dashboard_bloc_reconnect_test.dart`; the reload test fails without the fix.

### Changed

- Recorded `3.0.10+2` in `pubspec.yaml`, the iOS build uploaded to App Store
  Connect, so the next build script run uses build 3.

## [3.0.10] - 2026-11-08 (build 2)

Replaces build 1 in App Store review; version 3.0.10 was never released, so
both builds ship as one version.

### Fixed

- **The mobile test suite passes again (339 tests, 0 failures, up from 18
  failing).** No CI workflow runs `flutter test`, so these had drifted from
  the code unnoticed:
  - `auto_update_service_test` (11): the store check only runs when
    `Platform.isAndroid`, which is false on macOS/Linux test machines, so
    these tests had never passed off-device. `AutoUpdateService.test()` now
    takes an `isAndroid` override, used for both the store check and opening
    the store; production still uses `Platform.isAndroid`. Added tests that
    other platforms skip the store check, that no override follows the real
    platform, and that a manual check shows the update dialog with its
    actions. Initialised the Flutter test binding the dialog path needs.
  - `map_repository_test` (3) and `dashboard_repository_test` (1): expected
    the old "No internet connection" message; they now check for "check your
    connection", which the current messages contain.
  - `forecast_repository_test` (1): the fixture predated the forecast API
    migration and sent `aqi.label` as the category. It now sends
    `aqi_category`, matching `predict/api/prediction.py`, and checks that the
    `label` guidance sentence is kept as `aqiLabel`.
  - `my_trips_view_test` (1): looked for `AqSearchMd`, which became
    `AqSearchSm` (same 18 px size) in the Exposure launch work.
  - `widget_test` (2): `shared_preferences` and `package_info` had no test
    implementation; now uses their built-in mock initial values.
- **`AutoUpdateService.manualUpdateCheck()` now checks immediately.** It used
  to apply the 3-day wait between automatic checks, so a manual check within 3
  days did nothing. `checkForUpdates()` gained a `force` flag for this. Nothing
  in the app calls the manual check yet, so users weren't affected.
- Documented that the version scraper keeps the numeric core of values like
  `v2.1.0` (→ `2.1.0`) and `1.0.0-beta` (→ `1.0.0`) through its general
  fallback pattern. The old test claimed these were rejected, but it only
  passed because the check never ran off Android.

- **Near You no longer promises readings from sites that stopped reporting
  long ago.** `NearbySiteCoverageService` now counts a site only if its device
  sent raw data (`lastRawData`) or it got a processed reading (`lastActive`)
  in the last 7 days. `lastRawData` comes from the device feed, so a
  processing backlog still shows "Fresh readings for your area are on their
  way". Sites that have been silent for longer, or never reported, now lead to
  "No air quality stations found nearby". Each timestamp is checked on its
  own, and one more than 10 minutes in the future (a wrong device clock) is
  ignored, so it can't make a silent site look active.
- **Near You no longer says "No air quality stations found nearby" when the
  coverage lookup fails.** A timeout, error, missing token or a count that
  hasn't been fetched yet now shows a neutral "Air quality for your area will
  appear here shortly" with a Refresh button. "No stations nearby" needs a
  confirmed count of zero. The empty-state choice moved into `nearbyCoverageState()` so it can
  be unit tested.
- **The offline banner no longer shows yellow underlined text.** It had no
  `Material` ancestor, so Flutter drew its debug text style.

### Changed

- `/sites/nearest` returns one row per device, so the coverage service now
  counts distinct sites by `_id`, and asks for 20 sites instead of 5. That
  makes it less likely, though not impossible, that silent sites closest to
  the user hide an active one further out.
- **Redesigned the offline banner** (`NoInternetBanner`), following the
  offline patterns in Google apps, YouTube and WhatsApp and Material's snackbar
  guidance. The full-width red "Internet Connection Lost" bar is now a floating
  rounded card under the status bar: charcoal (reversed in dark mode), a
  cloud-off icon, "You're offline" and "Check your Wi-Fi or mobile data
  connection.", with a 48 px dismiss button. The copy doesn't promise saved
  readings or an automatic refresh: with no cache the dashboard shows an
  error, and on reconnect it only refreshes data older than 30 minutes. After a
  reconnection, a brand-blue "Back online" card shows for 3 seconds. It slides
  and fades in, with no motion when reduce motion is on, and screen readers
  announce it. `main.dart` now keeps the banner mounted so it can show the
  reconnection.
- Added the new Near You and offline banner copy to the Sunbird translation
  prewarm list.
- Recorded `3.0.10+1` in `pubspec.yaml`, the iOS build delivered to App Store
  Connect, so the next build script run uses build 2.
- Added the offline banner to `ios/release_notes.txt`. The notes cover both
  builds, since 3.0.10 hasn't been released yet.

## [3.0.10] - 2026-11-08 (build 1)

### Fixed

- **Near You and the map no longer go empty when hourly readings run late.**
  Both screens use `/readings/recent`, which only returns sites with a reading in
  the backend's lookback window (6 h by default). When hourly processing fell
  behind (e.g. Kampala, 6–7 Nov 2026), whole cities disappeared and Near You
  wrongly said "No air quality stations found nearby". The app now checks
  `/sites/nearest` when no recent readings fall nearby, and tells "no coverage
  here" apart from "fresh readings are on their way".

### Added

- `NearbySiteCoverageService`: checks whether AirQo sites exist within a radius,
  whatever their reading freshness. It deliberately sends no `online_status`
  filter, because online status comes from the same hourly readings and reads
  "offline" during a processing delay. It formats coordinates so the endpoint's
  5-decimal-place validation always passes, and caches results for 30 minutes
  per area.
- Near You: a "Fresh readings for your area are on their way" empty state when
  sites exist nearby but have no recent readings.
- Near You and map: a calm, brand-coloured note when the newest nearby reading is
  over 6 hours old, plus a "Fresh update on its way" line on the map site card.
  The copy is positive and never shows reading ages or timestamps.
- Shared `StaleReadingsBanner` widget and `reading_freshness.dart` helpers.
- Tests for the coverage service, freshness helpers, map card and banner.

### Changed

- Renamed `ApiUtils.map` to `ApiUtils.recentReadings`. It points to
  `/api/v2/devices/readings/recent`, not the separate `/readings/map` endpoint,
  and the old name was misleading.
- The Near You empty state no longer hardcodes "AirQo covers 15 African cities";
  it now reads "AirQo monitors air quality in cities across Africa".
- Updated the Sunbird translation prewarm list to match the new copy.
- Set the app version to `3.0.10+0` for the iOS release, because 3.0.9 is
  already approved. The iOS build script builds it as 3.0.10 (1). Replaced
  `ios/release_notes.txt` with this release's App Store notes.
