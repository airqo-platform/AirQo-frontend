# AirQo App Store - Changelog

> **Note**: This changelog tracks improvements, features, and fixes for the AirQo App Store frontend.

---

## Version 0.1.0
**Released:** April 01, 2026

### Initial Frontend MVP (Theme-Aligned)

<details>
<summary><strong>Features Added (6)</strong></summary>

- **Standalone App Store App**: Created a dedicated Next.js app under `src/app-store`.
- **Theme Alignment**: Reused Tailwind config and CSS tokens from the platform app for consistent styling.
- **App Registry Loader**: Added manifest-driven registry in `src/app-store-projects` and a shared loader in `packages/app-store-modules`.
- **Browse & Detail Views**: Implemented app browsing, search, and detailed view pages.
- **Install State Mocking**: Added a localStorage-backed install state for frontend testing.
- **Developer & Admin Stubs**: Added placeholder screens for developer submission and admin review.

</details>

<details>
<summary><strong>Technical Changes (4)</strong></summary>

- **Shared Contracts**: Added `AppManifest` schema and `AirQoAppProps` contract in `packages/app-store-modules`.
- **Mock Registry Client**: Implemented mock registry client to support frontend-only workflows.
- **App Store Projects**: Created `src/app-store-projects` to host standalone internal app code.
- **Changelog Tracking**: Introduced this changelog to document ongoing App Store changes.

</details>

<details>
<summary><strong>Files Created (3)</strong></summary>

- `src/app-store/CHANGELOG.md`
- `src/app-store-projects/registry.ts`
- `packages/app-store-modules/src/index.ts`

</details>

---

## Breaking Changes

**None** - All changes are additive for the initial MVP.

---

## Support

For questions or issues:
1. Check this changelog for recent changes
2. Review the App Store README for setup details
3. Contact the AirQo development team

---

**Last Updated:** April 01, 2026