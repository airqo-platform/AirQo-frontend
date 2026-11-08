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

For PRs with no meaningful change to record (e.g. a typo in a comment), a
maintainer can add the `skip-changelog` label to bypass the check.

History before this file was introduced lives in the git log
(`git log -- src/mobile`).

## [Unreleased]

## [3.0.10] - 2026-11-08

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
