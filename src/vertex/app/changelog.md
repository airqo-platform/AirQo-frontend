# AirQo Vertex - Changelog

> **Note**: This changelog consolidates all recent improvements, features, and fixes to the AirQo Vertex frontend.

## Version 2.0.8
**Released:** June 28, 2026

### Comprehensive Unit Testing & CI Integration

Introduced a robust unit testing infrastructure using Vitest and React Testing Library, alongside comprehensive CI/CD pipeline integration. This release focuses on improving code quality, ensuring robust component rendering, and validating API proxy behavior through extensive boundary testing.

<details>
<summary><strong>Test Infrastructure & CI Integration (3)</strong></summary>

- **Vitest & React Testing Library**: Replaced legacy test runners with a fast, modern Vitest setup configured to work seamlessly with Next.js App Router and absolute imports.
- **CI/CD Pipeline**: Added dedicated GitHub Actions workflows for automated type checking (`tsc --noEmit`) and unit testing (`vitest run --coverage`) on pull requests.
- **Testing Guidelines**: Introduced `TESTING.md` internal documentation to standardize component rendering, user-event interactions, and mocking strategies across the team.

</details>

<details>
<summary><strong>UI & Shared Component Testing (3)</strong></summary>

- **Core UI Components**: Added comprehensive tests for 30+ shadcn/radix UI components (Dialogs, Accords, Tooltips, Buttons, Inputs, Forms, etc.) verifying accessibility and interaction states without snapshot testing.
- **Shared Abstractions**: Extracted and tested shared wrappers including `ReusableTable`, `ReusableSelectInput`, `ReusableButton`, and `ReusableFileUpload`, ensuring robust prop forwarding and DOM nesting compliance.
- **Warning Resolutions**: Proactively fixed React DOM nesting warnings (e.g., `<a>` cannot appear as a descendant of `<a>`) and accessibility label warnings across components during test implementation.

</details>

<details>
<summary><strong>Service & API Boundary Testing (2)</strong></summary>

- **Mock Factories**: Created `apiResponseFactory.ts` and NextAuth session mocks to simulate full HTTP environments locally without hitting live staging endpoints or needing `axios-mock-adapter`.
- **Proxy Validation**: Validated both the Next.js App Router API handlers (`proxyClient`) and client-side Axios instances (`secureApiProxyClient`), verifying `JWT` vs `API_TOKEN` injection, error normalization, and custom event dispatching (`vertex-network-degraded`, `auth-token-expired`).

</details>

<details>
<summary><strong>Files Modified & Added (40+)</strong></summary>

- `package.json` [MODIFIED]
- `vitest.config.ts` [NEW]
- `.github/workflows/test.yml` [NEW]
- `src/vertex/app/_docs/internal/TESTING.md` [NEW]
- `src/vertex/components/ui/*.test.tsx` (30+ files) [NEW]
- `src/vertex/components/shared/**/*.test.tsx` [NEW]
- `src/vertex/core/services/*.test.ts` [NEW]
- `src/vertex/core/utils/*.test.ts` [NEW]
- `src/vertex/test/factories/apiResponseFactory.ts` [NEW]
- `src/vertex/test/mocks/nextAuth.ts` [NEW]
- `src/vertex/vitest.setup.ts` [NEW]

</details>

---

## Version 2.0.7
**Released:** June 17, 2026

### Toast-to-Banner Migration & Clipboard Hook Consolidation

Completed the migration of all remaining non-copy action notifications from floating `ReusableToast` calls to the context-aware `InfoBanner` system. Consolidated all clipboard copy logic under the shared `useClipboard` hook.

<details>
<summary><strong>BannerProvider Scope Fix (1)</strong></summary>

- **Provider Hierarchy Correction**: Moved `BannerProvider` above `AuthProvider` in `providers.tsx`. Previously, core auth components (`UserDataFetcher`, `AuthWrapper`) lived outside the `BannerProvider` boundary and could not call `useBanner`. The provider now wraps the full application tree, making banners available everywhere including auth-level components.

</details>

<details>
<summary><strong>Global Banner Migration — Auth & Core (3)</strong></summary>

- **Auth Provider (`authProvider.tsx`)**: Replaced all 4 `ReusableToast` calls with `showBanner({ scoped: false })` global banners. Affected messages: "Connection restored" (success), "Could not load user details" (error), "Your account has been deleted" (error), and "Your session has expired" (error ×2). These alerts now render in the `GlobalBannerContainer` regardless of the user's current page.
- **Recently Visited Hook (`useRecentlyVisited.ts`)**: Migrated the `localStorage` read failure toast ("Failed to load recently visited pages") to a global banner so it surfaces in the main layout instead of a floating overlay.
- **Clipboard Hook (`useClipboard.ts`)**: Updated the hook to use `toast.success` for successful copies (consistent with the intentional clipboard toast pattern) and `showBanner` for copy errors, aligning it with the dual-system convention.

</details>

<details>
<summary><strong>Scoped Banner Migration — Feature Components (2)</strong></summary>

- **Network Visibility Card (`network-visibility-card.tsx`)**: Replaced the "Failed to update network visibility" toast with a scoped banner (`scoped: true`). The error now renders inside the confirmation dialog via the existing `<BannerSlot />` in `ReusableDialog`, keeping the error contextually placed without requiring structural changes.
- **File Upload Parser (`FileUploadParser.tsx`)**: Replaced all 6 `ReusableToast` error calls with scoped banners. Added a `<BannerSlot />` inside the `BulkClaimColumnMapper` modal header and threaded `showBanner` down as a prop. Affected messages: invalid file format, file too large, CSV parse error, Excel read error, general import error, and no valid devices found.

</details>

<details>
<summary><strong>Clipboard Hook Consolidation (3)</strong></summary>

- **Cohort Detail Card (`cohort-detail-card.tsx`)**: Replaced inline `try/catch` clipboard logic with `useClipboard({ successMessage: 'Cohort ID copied to clipboard' })`.
- **Cohort Organizations Card (`cohort-organizations-card.tsx`)**: Removed the manual `handleCopyId` function and `ReusableToast` import. Now uses `useClipboard({ successMessage: 'Group ID copied to clipboard!' })`.
- **Networks Table (`client-paginated-networks-table.tsx`)**: Removed inline `useBanner` clipboard pattern. Now delegates to `useClipboard({ successMessage: 'Sensor Manufacturer ID copied' })` while preserving `event.stopPropagation()` at the call site.

</details>

---

## Version 2.0.6
**Released:** June 14, 2026

### Personal Onboarding Backend Integration & Code Refactoring

Migrated the personal onboarding checklist state from local storage to a centralized backend API and completely refactored the checklist UI into a cleaner, modular architecture.

<details>
<summary><strong>Onboarding Backend Synchronization (4)</strong></summary>

- **Server-Backed State**: Replaced the client-side `localStorage` mechanism with the `PATCH /users/onboarding` API. The personal onboarding state is now inherently tied to the user document on the backend.
- **Session Manager Cleanup**: Stopped clearing the `vertex_onboarding` key from the session manager during logout since local storage is no longer the source of truth.
- **UserDetails Type Update**: Updated the `UserDetails` type to include the `onboarding_checklist` object.
- **Robust Parsing & Syncing**: Modified the Welcome Page to parse generic checklist patches, issue backend API updates, and dispatch the updated user details to Redux in real-time. Added an `isMissing` flag to prevent rendering the checklist when server state is absent.

</details>

<details>
<summary><strong>Architecture Refactor & UI Wrapper (3)</strong></summary>

- **Service Layer & Custom Hook**: Extracted direct API calls into a dedicated `onboardingService.ts` and encapsulated all business logic into a cleanly separated `useOnboarding.ts` hook.
- **Smart Wrapper Component**: Introduced `OnboardingChecklistWrapper` (`index.tsx`) to compose the raw `ChecklistUI.tsx`. The wrapper completely isolates state resolution and visibility logic from the main application flow.
- **Page Cleanup**: Simplified the main `page.tsx` by removing over 150 lines of bloated mutation logic and inline checklist conditionals. Dropped deprecated API endpoints from the users and organizations modules.

</details>

<details>
<summary><strong>Graceful Fallbacks & State Precedence (3)</strong></summary>

- **Empty State Fallback**: Integrated the `HomeEmptyState` component into the main dashboard view. It safely renders when a user or organization has completely zero cohorts and zero devices AND the backend fails to supply an `onboarding_checklist` object. This prevents new organizations from landing on a broken or blank dashboard page.
- **State Precedence Fix**: Resolved a "state shadowing" bug in `useOnboarding.ts` where instant Redux state updates (`activeGroup`) were ignored in favor of stale React Query cache data (`groupDetails`), delaying UI updates.
- **Context Scope Fix**: Ensured the custom hook leverages the mapped `organisation` scope instead of treating the raw Redux `external-org` value as the scope, which previously broke the organization checklist fallback logic.

</details>

<details>
<summary><strong>UI & Security Enhancements (2)</strong></summary>

- **Cohort Scope Enforcement**: Added strict client-side array filtering to `CohortSelectionStep.tsx` to ensure that even if the backend ignores the `cohort_id` array parameter, the dropdown strictly only displays cohorts belonging to the user's specific external organization or personal scope, preventing cross-organization data leakage.
- **Smart Combobox Search**: Updated the generic `ComboBox` UI component (`combobox.tsx`) to intelligently hide its internal search bar when the list of options is completely empty. The search bar remains visible if the user is currently typing or if the component is loading data, ensuring a much cleaner empty-state UI without redundant inputs.

</details>

<details>
<summary><strong>Files Added/Modified (13)</strong></summary>

- `src/vertex/app/(authenticated)/home/page.tsx` [MODIFIED]
- `src/vertex/app/types/users.ts` [MODIFIED]
- `src/vertex/components/features/devices/import-steps/CohortSelectionStep.tsx` [MODIFIED]
- `src/vertex/components/onboarding-checklist/ChecklistUI.tsx` [RENAMED/MODIFIED]
- `src/vertex/components/onboarding-checklist/index.tsx` [ADDED]
- `src/vertex/components/ui/combobox.tsx` [MODIFIED]
- `src/vertex/core/apis/organizations.ts` [MODIFIED]
- `src/vertex/core/apis/users.ts` [MODIFIED]
- `src/vertex/core/hooks/useGroups.ts` [MODIFIED]
- `src/vertex/core/hooks/useOnboarding.ts` [ADDED]
- `src/vertex/core/hooks/useUsers.ts` [ADDED/MODIFIED]
- `src/vertex/core/services/onboardingService.ts` [ADDED]
- `src/vertex/core/utils/sessionManager.ts` [MODIFIED]

</details>


---

## Version 2.0.5
**Released:** June 12, 2026

### My Sites Page — Personal Context

Introduced a dedicated **My Sites** page for users operating in a Personal Context, mirroring the existing My Devices flow to ensure consistent behavior across personal assets.

<details>
<summary><strong>Changes (7)</strong></summary>

- **API**: Added `getMySites(userId, groupIds?, cohortIds?)` to the `sites` API object. Calls `GET /devices/sites/my-sites` with `user_id`, `group_ids` (comma-separated), `cohort_ids` (comma-separated), and `tenant=airqo` query params. Returns `SitesSummaryResponse`. Header `X-Auth-Type: JWT` included.
- **Adapter type**: Added `getMySites: typeof sites.getMySites` to the `VertexAdapter` interface so the method is correctly typed through the adapter layer.
- **Hook**: Added `useMySites(userId, organizationId?, options?)` to `useSites.ts`, mirroring `useMyDevices` exactly. Imports `usePersonalUserCohorts` to resolve personal cohort IDs; filters `userDetails.groups` to exclude the "airqo" group when building `groupIds`; falls back to `userDetails.cohort_ids` if no personal cohorts are found. Query key includes `userId`, `organizationId || activeGroup?._id`, `groupIds`, and `cohortIds`.
- **Route**: Added `MY_SITES: '/sites/my-sites'` to `ROUTE_LINKS` in `routes.ts`.
- **Sidebar**: Destructured `isPersonalContext` from `useUserContext()` in `secondary-sidebar.tsx`. Added a "My Sites" `NavItem` (icon: `AqMarkerPin01`) under the "Personal assets" section, rendered only when `isPersonalContext === true` (i.e. the user's active group is the `airqo` group). Remains hidden when the user has switched to an external organisation context.
- **Page**: Created `my-sites/page.tsx` matching the layout of `sites/overview/page.tsx` — simple title/description header with no action buttons, `ClientPaginatedSitesTable` with an `onSiteClick` handler that routes to `/sites/[id]` (the non-admin site details page). Removed `CreateSiteForm`, status filter badge, complex error card, and `useSearchParams` logic as they are not needed for the personal context use case.
- **Site row navigation**: Passing `onSiteClick` to `ClientPaginatedSitesTable` overrides the component's default `/admin/sites/[id]` routing so personal-context users land on `/sites/[id]` instead. Back navigation from the site details page uses the existing `router.back()` call, which correctly returns the user to `/sites/my-sites`.

</details>

<details>
<summary><strong>Files Updated (6)</strong></summary>

- `src/vertex/core/apis/sites.ts` [MODIFIED]
- `src/vertex/core/adapters/types.ts` [MODIFIED]
- `src/vertex/core/hooks/useSites.ts` [MODIFIED]
- `src/vertex/core/routes.ts` [MODIFIED]
- `src/vertex/components/layout/secondary-sidebar.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/sites/my-sites/page.tsx` [NEW]

</details>

---

## Version 2.0.4
**Released:** June 11, 2026

### hCaptcha Integration — Sensor Manufacturer Request Form

Added hCaptcha verification to the public-facing Sensor Manufacturer Request form (`NetworkRequestDialog`) to protect the unauthenticated `/api/devices/network-creation-requests` endpoint from automated abuse and spam submissions.

<details>
<summary><strong>Changes (4)</strong></summary>

- **Schema**: Added optional `captchaToken` field to `networkRequestSchema` to align the Zod schema with the POST body sent to the backend.
- **Dialog**: Wired `HCaptchaWidget` into the form with `onVerify`/`onExpire` handlers managing a `captchaToken` state variable. The Submit button is disabled until the CAPTCHA is verified. The token is included in the POST body alongside form data.
- **Reset on close**: `handleClose` now calls `captchaRef.current?.reset()` and clears `captchaToken` state so the widget is fully reset when the dialog is dismissed or cancelled.
- **Reset on error**: `onError` also resets the widget and clears `captchaToken` so the Submit button re-disables and the user must re-verify before retrying.

</details>

<details>
<summary><strong>Files Updated (2)</strong></summary>

- `src/vertex/components/features/networks/network-request-dialog.tsx` [MODIFIED]
- `src/vertex/components/features/networks/schema.ts` [MODIFIED]

</details>

---

## Version 2.0.3
**Released:** June 11, 2026

### Resilient API Routing & Social Auth Safety Fixes

This release aligns the Vertex application's social login and API routing behavior with the more robust patterns used in the platform project, creating a significant safety net around our authentication flow and API communication.

<details>
<summary><strong>Resilient API Routing (2)</strong></summary>

- **Multi-Fallback Routing**: Replaced single-variable URL concatenation (`getApiBaseUrl()`) with `resolveApiOrigin()` and `resolveVersionedApiPath()`. The app now automatically scans multiple environment variables (`API_BASE_URL`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_BASE_URL`) before failing.
- **Suffix Stripping**: Implemented automatic `/api/v2` suffix stripping to prevent duplicate path segments caused by slight CI/CD misconfigurations.

</details>

<details>
<summary><strong>Social Authentication Fixes (3)</strong></summary>

- **Sign-Out Safety Flag**: Added the `OAUTH_SIGNED_OUT_FLAG` pattern to prevent "phantom token" bootstrapping if a user signs out and uses the browser back button to navigate to an old OAuth callback URL. The flag is explicitly cleared on the next intentional login to prevent redirect loops.
- **Google Account Picker**: Explicitly injected `prompt=select_account` into the Google OAuth initialization query parameters to prevent Google from silently logging users back into their active browser session.
- **Fail-Open Render Guard**: Removed the silent render guard from the Social Auth component. The buttons will now always render and gracefully handle URL resolution errors by displaying a UI banner rather than mysteriously vanishing.

</details>

<details>
<summary><strong>Files Modified (7)</strong></summary>

- `lib/envConstants.ts` [MODIFIED]
- `lib/api-routing.ts` [MODIFIED]
- `vertex.config.ts` [MODIFIED]
- `components/features/auth/social-auth-section.tsx` [MODIFIED]
- `core/auth/oauth-session.ts` [MODIFIED]
- `core/auth/authProvider.tsx` [MODIFIED]
- `core/hooks/useLogout.ts` [MODIFIED]

</details>

---

## Version 2.0.3
**Released:** June 15, 2026

### Shipping Management Module — InfoBanner Migration

Migrated user-facing error feedback in the Shipping Label Print Modal from native browser `alert()` calls to the centralized `useBanner` system, and cleaned up a redundant success banner in the batch details page.

<details>
<summary><strong>Changes (4)</strong></summary>

- **Alert → Banner Migration**: Replaced two `alert()` calls in `ShippingLabelPrintModal` with `showBanner({ severity: 'error', scoped: true })` — one for blocked pop-ups and one for invalid QR code image URLs. Errors now appear inline inside the dialog instead of as browser-native alert dialogs, keeping feedback consistent with the rest of the platform.
- **Orphaned Window Cleanup**: Added `printWindow.close()` before the invalid-URL error banner so the blank print tab opened by `window.open()` is immediately closed when validation fails, preventing a stale empty browser tab.
- **Type-Safe URL Validation**: Tightened the `isValidDataUrl` helper from `(url: string)` to `(url: unknown): url is string`, adding an explicit `typeof url !== 'string'` guard. This prevents runtime exceptions if a label's `qr_code_image` field arrives as a non-string value (e.g. `null` or `undefined`).
- **Removed Redundant Success Banner**: Removed the `showBanner` success call from `useGenerateShippingLabels.onSuccess` in the batch details page. The label print modal opening immediately after generation is sufficient feedback; the banner was an unnecessary duplicate.

</details>

<details>
<summary><strong>Files Updated (2)</strong></summary>

- `src/vertex/components/features/shipping/ShippingLabelPrintModal.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/admin/shipping/[batchId]/page.tsx` [MODIFIED]

</details>

---

## Version 2.0.2
**Released:** June 10, 2026

### Site Management Banner Migration

Migrated all user-facing notifications in the Site Management module from `ReusableToast` and Sonner `toast` to the centralized `useBanner` / `useBannerWithDelay` / `useClipboard` system.

<details>
<summary><strong>Changes (4)</strong></summary>

- **Hooks Decoupled**: Removed `ReusableToast` from 4 mutation hooks in `useSites.ts` — `useApproximateCoordinates`, `useUpdateSiteDetails`, `useCreateSite`, `useRefreshSiteMetadata` — and replaced with optional `onSuccess`/`onError` callback interfaces. Cache invalidation logic stays in the hooks; notification responsibility is delegated to the UI layer.
- **Create & Edit Dialogs**: `create-site-form.tsx` wires `useCreateSite` and `useApproximateCoordinates` hook-level callbacks — errors use `scoped: true` (inline in dialog), site creation success uses `showBannerWithDelay` (`scoped: false`) after navigation fires. `edit-site-details-dialog.tsx` replaces 2 Sonner `toast.error` calls with `showBanner` (`scoped: true`) and routes mutation success/error through hook-level callbacks.
- **Site Detail Pages**: Both `admin/sites/[id]/page.tsx` and `sites/[id]/page.tsx` wire `useRefreshSiteMetadata` with severity-aware banners (`scoped: false`): `warning` for partial refresh, `info` for already-complete, `success` for full refresh. The duplicated banner logic has been extracted into a shared `useRefreshMetadataWithBanner` hook.
- **In-Page Copy Actions**: `site-information-card.tsx` and `site-measurements-api-card.tsx` replace clipboard `ReusableToast` calls with the shared `useClipboard` hook, adding async error handling for free.

</details>

<details>
<summary><strong>Files Updated (8)</strong></summary>

- `src/vertex/core/hooks/useSites.ts` [MODIFIED]
- `src/vertex/components/features/sites/create-site-form.tsx` [MODIFIED]
- `src/vertex/components/features/sites/edit-site-details-dialog.tsx` [MODIFIED]
- `src/vertex/components/features/sites/site-information-card.tsx` [MODIFIED]
- `src/vertex/components/features/sites/site-measurements-api-card.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/admin/sites/[id]/page.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/sites/[id]/page.tsx` [MODIFIED]
- `src/vertex/core/hooks/useRefreshMetadataWithBanner.ts` [ADDED]

</details>

---

## Version 2.0.1
**Released:** June 09, 2026

### Relative API Routing & OAuth Redirect Fixes

This release resolves critical build-time environment variable issues that caused API routing to fallback to localhost, and hardens the OAuth token handoff flow to eliminate redirect loops. 

<details>
<summary><strong>API Routing & Proxy Stabilization (3)</strong></summary>

- **Relative Client Routes**: Introduced `buildBrowserApiUrl` to strictly return relative paths (`/api/v2/...`) for browser-side requests. This entirely bypasses the localhost fallback bug caused by missing build-time `NEXT_PUBLIC_` environment variables.
- **Server Routes & Strict Env Checks**: Introduced `buildServerApiUrl` for server-side requests and tightened `envConstants.ts` to explicitly require `NEXT_PUBLIC_API_URL` during initialization to fail-fast.
- **Proxy V2 Duplication Fix**: Adjusted the proxy client's path handling to dynamically strip leading `v2/` segments, preventing double `/v2/v2/` URL paths when proxying to the backend.

</details>

<details>
<summary><strong>Authentication & Session Sync (3)</strong></summary>

- **Middleware Bypass**: `SocialAuthSection` now safely appends a `success=<provider>` query parameter to the `redirect_after` URL. This prevents the NextAuth middleware from forcefully intercepting the callback and generating its own localhost callback URL.
- **UI Blocking on Token Handoff**: Added a `useEffect` watcher in `TokenHandoffHandler` to keep the UI explicitly blocked until NextAuth fully broadcasts the `authenticated` state across the React context tree, preventing rogue client-side redirects to `/login`.
- **Resilient Profile Fetching**: Increased the OAuth profile fetch tolerance to 10 seconds, gracefully handled `AbortError`s to prevent noisy server logs, and normalized the OAuth access token to ensure `Authorization` headers are only appended when present.

</details>

<details>
<summary><strong>Files Modified (11)</strong></summary>

- `app/api/auth/[...nextauth]/options.ts` [MODIFIED]
- `app/changelog.md` [MODIFIED]
- `components/features/auth/social-auth-section.tsx` [MODIFIED]
- `core/apis/users.ts` [MODIFIED]
- `core/auth/authProvider.tsx` [MODIFIED]
- `core/auth/oauth-session.ts` [MODIFIED]
- `core/services/network-service.ts` [MODIFIED]
- `core/utils/proxyClient.ts` [MODIFIED]
- `lib/api-routing.ts` [NEW]
- `lib/envConstants.ts` [MODIFIED]
- `vertex.config.ts` [MODIFIED]

</details>

---
## Version 2.0.0
**Released:** June 07, 2026

### Vertex Platform Architecture Upgrade (Major Release)

This release transforms the application into a highly customizable, white-label device management platform. It abstracts away hardcoded backend dependencies, centralizes configuration, enables dynamic theming, and introduces a clean boilerplate template for bootstrapping new tenant applications.

<details>
<summary><strong>API Abstraction & Adapter Pattern (2)</strong></summary>

- **Unified API Adapter**: Abstracted all direct API calls behind a generic `VertexAdapter` interface, allowing the frontend to dynamically resolve its backend data source.
- **Mock & Production Adapters**: Implemented specific `airqo` (production) and `mock` (development/template) adapters. Refactored all data hooks (`useDevices`, `useCohorts`, `useSites`, etc.) to use the configured adapter seamlessly.

</details>

<details>
<summary><strong>Centralized Configuration & Feature Toggling (2)</strong></summary>

- **Vertex Config**: Introduced a robust, Zod-validated configuration system (`vertex.config.ts`) serving as the single source of truth for organization metadata and auth providers.
- **Feature Flags**: Added granular toggles to enable or disable major application features (`siteManagement`, `shipping`, `deviceMap`, etc.) based on tenant requirements.

</details>

<details>
<summary><strong>Dynamic Theming & Branding (2)</strong></summary>

- **Dynamic CSS Variables**: Replaced hardcoded color tokens across the entire application with a dynamic `--primary` CSS variable system driven by the active Vertex config.
- **Global Branding Alignment**: Organization logos, typography headers, and active UI states (tabs, buttons, checkboxes, nav items) now automatically inherit the configured brand identity.

</details>

<details>
<summary><strong>Vertex Template Extraction (2)</strong></summary>

- **Standalone Boilerplate**: Extracted a pristine `vertex-template` directory, completely scrubbed of legacy code, unneeded desktop configurations, and heavy documentation.
- **Ready to Clone**: Pre-configured with the `mock` adapter and an initialized v1.0.0 changelog, providing a safe, generic foundation for new applications.

</details>

---

## Version 1.23.61
**Released:** June 07, 2026

### Centralized Onboarding State & API Abstraction

Migrated the onboarding checklist state from local storage to a centralized backend API for the Organization context, solving cross-device synchronization issues for enterprise users. (Note: Personal context continues to use local storage pending backend API rollout).

<details>
<summary><strong>Onboarding API Integration (4)</strong></summary>

- **Backend Synchronization:** Deprecated `localStorage` as the single source of truth for the organization-level onboarding checklist (`add-device`, `assign-cohort`, `set-visibility`). State is now inherently bound to the `Group` document.
- **Dynamic State Resolution:** The frontend now relies on the API to dynamically evaluate resource availability (e.g., existing devices or cohorts) and pre-populate completed steps during `GET /users/groups/:groupId` requests.
- **JIT Patching & Race Condition Fix:** Implemented serialized `PATCH /api/v1/users/groups/:groupId/onboarding` requests for missing manual steps to prevent NextAuth session race conditions and unexpected lockouts.
- **API Hook Abstraction:** Refactored direct API proxy invocations into strongly-typed custom React Query hooks (`useGroupDetails` and `useUpdateGroupOnboarding`) to centralize query management and reduce Axios instantiation overhead.

</details>

<details>
<summary><strong>Files Modified (3)</strong></summary>

- `app/(authenticated)/home/page.tsx` [MODIFIED]
- `core/apis/organizations.ts` [MODIFIED]
- `core/hooks/useGroups.ts` [MODIFIED]

</details>

---

## Version 1.23.60
**Released:** June 04, 2026

### Multi-Provider Social Auth, API Proxy & Role Permissions

Introduced comprehensive multi-provider social authentication, updated API proxy routing, enhanced hCaptcha environment support, and fixed missing network view permissions for system administrators.

<details>
<summary><strong>Social Authentication & Routing (4)</strong></summary>

- **Multi-Provider Social Auth**: Replaced the standalone Google auth component with a unified `SocialAuthSection` that supports sign-ins via Google, GitHub, LinkedIn, and X (Twitter).
- **OAuth Session Management**: Extended `oauth-session` utilities to track the user's last-used provider via localStorage and intelligently resolve post-login redirect paths using `getLastActiveModule()`.
- **OAuth Handoff Improvements**: Refactored `TokenHandoffHandler` in `authProvider.tsx` to prevent login UI flashing during OAuth redirects, optimized the redirect logic to eliminate duplicate page reloads when the user is already on the destination route, and configured `middleware.ts` to intelligently bypass server-side routing for seamless token consumption.
- **API Proxy Routing**: Updated the Next.js API proxy destination from `staging-analytics.airqo.net` to `staging-vertex.airqo.net` across both `next.config.js` and `next.config.mjs`.
- **Legacy Route Redirects**: Added Next.js config redirects to automatically route legacy `/user/home` to `/home` and `/user/login` to `/login`. Updated `middleware.ts` to simplify the `authorized` callback.

</details>

<details>
<summary><strong>Security & Permissions (2)</strong></summary>

- **Admin Role Permissions Fix**: Restored access to the Sensor Manufacturers admin panel by explicitly including the `PERMISSIONS.NETWORK.VIEW` right in the static `AIRQO_ADMIN` role definition.
- **Dynamic hCaptcha Environments**: Upgraded `isHCaptchaEnabled` to conditionally support hCaptcha on production, staging, and local development environments solely based on the presence of a valid site key.

</details>

<details>
<summary><strong>Files Modified (11)</strong></summary>

- `.env.example` [MODIFIED]
- `app/login/page.tsx` [MODIFIED]
- `components/features/auth/social-auth-section.tsx` [ADDED]
- `components/features/auth/google-auth-section.tsx` [DELETED]
- `core/auth/authProvider.tsx` [MODIFIED]
- `core/auth/oauth-session.ts` [MODIFIED]
- `core/permissions/constants.ts` [MODIFIED]
- `lib/envConstants.ts` [MODIFIED]
- `middleware.ts` [MODIFIED]
- `next.config.mjs` [MODIFIED]
- `next.config.js` [MODIFIED]

</details>

---



## Version 1.23.59
**Released:** June 04, 2026

### Decouple useDevices Mutations from ReusableToast

Removed all hardcoded `ReusableToast` calls from mutation hooks in `useDevices.ts` and delegated notification responsibility to the calling UI layer via optional `onSuccess`/`onError` callback interfaces. Also migrated remaining device-related components still using `ReusableToast` directly, and extracted a shared `useClipboard` hook to eliminate the repeated clipboard copy pattern across the codebase.

<details>
<summary><strong>Changes (5)</strong></summary>

- **Hooks Decoupled**: Removed `ReusableToast` from 8 mutation hooks — `useClaimDevice`, `useBulkClaimDevices`, `useUnassignDeviceFromOrganization`, `useUpdateDeviceBulk`, `useUpdateDeviceGroup`, `usePrepareDeviceForShipping`, `usePrepareBulkDevicesForShipping`, `useGenerateShippingLabels` — and added optional `onSuccess`/`onError` callback interfaces so the UI layer controls notification scope.
- **Bulk Edit Modal**: Wired `useUpdateDeviceBulk` hook-level callbacks; error uses `scoped: true` inline in the dialog, success uses `showBannerWithDelay` (`scoped: false`) after the dialog closes.
- **Prepare Shipping Modal**: Replaced all 8 `ReusableToast` calls with `useBanner`; file/import validation errors use `scoped: true`, bulk preparation success uses `showBannerWithDelay` (`scoped: false`).
- **Remaining Device Components**: Migrated `device-measurements-api-card.tsx`, `device-activity-item.tsx`, and `orphaned-devices-alert.tsx` from `ReusableToast` to `useBanner`. Migrated `shipping/[batchId]/page.tsx` with hook-level callbacks and `showBanner` (`scoped: false`).
- **Shared `useClipboard` Hook**: Extracted a `useClipboard` hook (accepts optional `successMessage`, `errorMessage`, `scoped`) to replace the repeated `navigator.clipboard.writeText` + banner pattern duplicated across `cohort-measurements-api-card`, `grid-measurements-api-card`, `grid-details-card`, `admin-levels-modal`, and `device-activity-item`.

</details>

<details>
<summary><strong>Files Updated (12)</strong></summary>

- `src/vertex/core/hooks/useDevices.ts` [MODIFIED]
- `src/vertex/core/hooks/useClipboard.ts` [NEW]
- `src/vertex/components/features/devices/bulk-edit-device-details-modal.tsx` [MODIFIED]
- `src/vertex/components/features/devices/device-measurements-api-card.tsx` [MODIFIED]
- `src/vertex/components/features/devices/device-activity-item.tsx` [MODIFIED]
- `src/vertex/components/features/devices/orphaned-devices-alert.tsx` [MODIFIED]
- `src/vertex/components/features/shipping/PrepareShippingModal.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/admin/shipping/[batchId]/page.tsx` [MODIFIED]
- `src/vertex/components/features/cohorts/cohort-measurements-api-card.tsx` [MODIFIED]
- `src/vertex/components/features/grids/grid-measurements-api-card.tsx` [MODIFIED]
- `src/vertex/components/features/grids/grid-details-card.tsx` [MODIFIED]
- `src/vertex/components/features/grids/admin-levels-modal.tsx` [MODIFIED]

</details>

---

## Version 1.23.58
**Released:** June 03, 2026

### Personal Devices Claiming & Cohort Management Enhancements

Introduced comprehensive enhancements to personal device claiming workflows, onboarding experiences, and cohort management. This includes guided device claiming, bulk imports for cohorts, personal user cohorts, and UI refinements to improve the onboarding experience for personal users.

<details>
<summary><strong>Personal Device Claiming & Onboarding (5)</strong></summary>

- **Guided Claiming Modes**: Introduced guided and fast claim modes, refactoring the claim device modal into clear step-by-step processes for better usability.
- **Onboarding Checklist**: Added an interactive onboarding checklist to the Home page to guide new users, preserving completion statuses across sessions.
- **Device Choice Dialog**: Added a device choice dialog during onboarding to simplify the initial device setup and integration.
- **Read-Only Onboarding UI**: Polished the onboarding interface with read-only views where appropriate to prevent accidental edits during the setup phase.
- **UI Refinements**: Redesigned the organization picker with alphabetical sorting, added an Administrator pill tag to the topbar logo, removed obsolete organization setup banners, and removed the deprecated "Download for Windows" button from the admin sidebar.

</details>

<details>
<summary><strong>Cohort & Bulk Import Improvements (4)</strong></summary>

- **Personal User Cohorts & Refactor**: Added dedicated APIs, hooks, and UI support for personal cohorts to isolate and manage user-specific device groupings effectively. Refactored the `CohortOrganizationsCard` to use a cleaner layout, displaying a compact view of up to 3 organizations with a full searchable modal table for extended lists.
- **Cohort Imports**: Enabled importing capabilities directly for cohorts, setting cohort import as a primary option, and implemented robust validation to handle cohort verification errors gracefully.
- **Bulk Import Enhancements**: Fixed bulk import bugs and enhanced the bulk import flow to reliably display import results, providing detailed previews and success summaries.

</details>

<details>
<summary><strong>Claim Page Migration & UI Polish (6)</strong></summary>

- **Modal-Based Claim Flow**: Deleted the standalone `/devices/claim` route and completely migrated the device claiming workflow to the `ClaimDeviceModal`.
- **Global Modal Wiring**: Updated actions across My Devices, Organization Overview, Device Assignment, and the Deploy Device Wizard to trigger the claim modal dynamically in-place instead of navigating.
- **Routing & Navigation Cleanup**: Removed defunct `/devices/claim` references from context-aware routing, recent visits tracking, and the secondary sidebar configuration.
- **Read-Only Visibility UI**: Updated the Network Visibility card to render for users lacking edit permissions, keeping the current sharing state visible in read-only workspaces.
- **Dynamic Environment Links**: Updated fallback analytics links (e.g. Sign Up) to dynamically resolve to `staging-analytics` or production based on the environment.
- **Dynamic Import Loading Polish**: Optimized modal loading states by replacing large skeleton loaders with a refined spinner to reduce layout thrashing.

</details>

<details>
<summary><strong>Session Management & Onboarding (2)</strong></summary>

- **Idle Session Timeout**: Increased the inactivity auto-logout threshold from 30 minutes to 6 hours (`INACTIVITY_LIMIT`) in the frontend `authProvider` to accommodate longer-running operations and reduce login friction during daily use.
- **Cookie Banner Persistence**: Whitelisted the cookie consent flag (`vertex_cookies_accepted`) in the secure session manager so that the cookie banner preference survives user logouts, preventing it from repeatedly nagging users on the login screen.

</details>

<details>
<summary><strong>Files Added & Modified (47)</strong></summary>

**Files Deleted:**
- `src/vertex/app/(authenticated)/devices/claim/page.tsx` [DELETED]


**Files Added:**
- `src/vertex/components/features/claim/steps/BulkInputStep.tsx` [ADDED]
- `src/vertex/components/features/claim/steps/CohortAssignmentBanner.tsx` [ADDED]
- `src/vertex/components/features/claim/steps/CohortImportStep.tsx` [ADDED]
- `src/vertex/components/features/claim/steps/ConfirmationSteps.tsx` [ADDED]
- `src/vertex/components/features/claim/steps/ManualInputStep.tsx` [ADDED]
- `src/vertex/components/features/claim/steps/MethodSelectStep.tsx` [ADDED]
- `src/vertex/components/features/claim/steps/QRScanStep.tsx` [ADDED]
- `src/vertex/components/features/claim/steps/SuccessStep.tsx` [ADDED]
- `src/vertex/components/features/claim/utils.ts` [ADDED]
- `src/vertex/components/features/cohorts/cohort-organizations-card.tsx` [ADDED]
- `src/vertex/components/features/cohorts/unassign-cohort-from-group.tsx` [ADDED]
- `src/vertex/components/features/devices/import-steps/BulkImportForm.tsx` [ADDED]
- `src/vertex/components/features/devices/import-steps/BulkResultsStep.tsx` [ADDED]
- `src/vertex/components/features/devices/import-steps/CohortSelectionStep.tsx` [ADDED]
- `src/vertex/components/features/devices/import-steps/ConfirmationStep.tsx` [ADDED]
- `src/vertex/components/features/devices/import-steps/FieldMappingStep.tsx` [ADDED]
- `src/vertex/components/features/devices/import-steps/ImportMethodSelectStep.tsx` [ADDED]
- `src/vertex/components/features/devices/import-steps/ImportPreviewStep.tsx` [ADDED]
- `src/vertex/components/features/devices/import-steps/ImportSuccessStep.tsx` [ADDED]
- `src/vertex/components/features/devices/import-steps/SingleImportForm.tsx` [ADDED]
- `src/vertex/components/features/devices/import-steps/types.ts` [ADDED]
- `src/vertex/components/features/home/onboarding-checklist.tsx` [ADDED]

**Files Modified:**
- `src/vertex/app/(authenticated)/admin/cohorts/[id]/page.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/home/page.tsx` [MODIFIED]
- `src/vertex/components/features/auth/cookie-info-banner.tsx` [MODIFIED]
- `src/vertex/components/features/claim/claim-device-modal.tsx` [MODIFIED]
- `src/vertex/components/features/cohorts/assign-cohort-devices.tsx` [MODIFIED]
- `src/vertex/components/features/cohorts/create-cohort.tsx` [MODIFIED]
- `src/vertex/components/features/devices/deploy-device-component.tsx` [MODIFIED]
- `src/vertex/components/features/devices/device-assignment-modal.tsx` [MODIFIED]
- `src/vertex/components/features/devices/import-device-modal.tsx` [MODIFIED]
- `src/vertex/components/features/home/network-visibility-card.tsx` [MODIFIED]
- `src/vertex/components/features/org-picker/organization-picker.tsx` [MODIFIED]
- `src/vertex/components/layout/primary-sidebar.tsx` [MODIFIED]
- `src/vertex/components/layout/secondary-sidebar.tsx` [MODIFIED]
- `src/vertex/components/layout/topbar.tsx` [MODIFIED]
- `src/vertex/core/apis/cohorts.ts` [MODIFIED]
- `src/vertex/core/auth/authProvider.tsx` [MODIFIED]
- `src/vertex/core/hooks/useCohorts.ts` [MODIFIED]
- `src/vertex/core/hooks/useContextAwareRouting.ts` [MODIFIED]
- `src/vertex/core/hooks/useRecentlyVisited.ts` [MODIFIED]
- `src/vertex/core/routes.ts` [MODIFIED]
- `src/vertex/core/urls.tsx` [MODIFIED]
- `src/vertex/core/utils/sessionManager.ts` [MODIFIED]

</details>

---

## Version 1.23.57
**Released:** June 02, 2026

### Organization Picker Banner Migration

Replaced the `ReusableToast` error call in `OrganizationPicker` with the centralized `useBannerWithDelay` hook. The shimmer progress bar dispatch (`setOrganizationSwitching`) was also moved to just before navigation fires so it only appears when the switch is actually proceeding — errors that occur before navigation never trigger the shimmer.

<details>
<summary><strong>Changes (2)</strong></summary>

- **Error Feedback**: Replaced `ReusableToast` with `showBannerWithDelay` (`scoped: false`) for org switch failures. Using the delayed variant ensures the banner is not cleared by `ReusableDialog`'s `hideBanner` cleanup effect that fires when the modal closes.
- **Shimmer Timing Fix**: Moved `setOrganizationSwitching({ isSwitching: true })` inside the try block just before navigation so the progress bar only appears when switching is guaranteed to proceed. The catch block no longer needs to reset it.

</details>

<details>
<summary><strong>Files Updated (1)</strong></summary>

- `src/vertex/components/features/org-picker/organization-picker.tsx` [MODIFIED]

</details>

---

## Version 1.23.56
**Released:** May 29, 2026

### Banner Notifications for Network Management

Migrated user feedback in the network management feature from toast notifications to the banner system. This standardizes notifications across the networks admin area for a consistent feedback experience.

<details>
<summary><strong>Changes (5)</strong></summary>

- **Network Requests Actions**: Replaced toast notifications with page-level banners (`scoped: false`) for approve, deny, and review status updates in `NetworkRequestsClient`.
- **Copy ID Feedback**: Updated the "copy Sensor Manufacturer ID" action in the networks table to show success/error banners (`scoped: false`) instead of toasts.
- **Create Network Form**: Success feedback now uses `showBannerWithDelay` so the banner appears after the dialog closes (`scoped: false`); error feedback uses an in-dialog banner (`scoped: true`).
- **Network Request Dialog**: Submission success and errors both use `scoped: true` to render feedback inline inside the dialog via `BannerSlot`; success additionally uses `showBannerWithDelay` to time the display correctly.
- **Banner Text Alignment Fix**: Added `text-left` to the `Banner` component's root div so banner text is always left-aligned regardless of any ancestor container that sets `text-center` (e.g. shadcn `DialogHeader`).

</details>

<details>
<summary><strong>Files Updated (5)</strong></summary>

- `src/vertex/app/(authenticated)/admin/networks/requests/NetworkRequestsClient.tsx` [MODIFIED]
- `src/vertex/components/features/networks/client-paginated-networks-table.tsx` [MODIFIED]
- `src/vertex/components/features/networks/create-network-form.tsx` [MODIFIED]
- `src/vertex/components/features/networks/network-request-dialog.tsx` [MODIFIED]
- `src/vertex/components/ui/banner.tsx` [MODIFIED]

</details>

## Version 1.23.55
**Released:** May 28, 2026

### Bulk Edit & Multi-Select Actions for Devices

Added comprehensive bulk editing capabilities across device management tables, enabling users to efficiently update multiple devices at once. This includes multi-select functionality, a new bulk edit modal, and backend support for bulk updates.

<details>
<summary><strong>Changes (4)</strong></summary>

- **Bulk Edit Modal**: Implemented `BulkEditDevicesModal` allowing users to update fields like Category, Network, Visibility, Auth Required, and Tags across multiple selected devices in a two-step flow (field selection → confirmation).
- **Multi-Select Support**: Enhanced `ReusableTable`, `DevicesTable`, `ClientPaginatedDevicesTable`, and `NetworkDevicesTable` with multi-select functionality and bulk action handling.
- **Bulk Update Hook & API**: Refactored device update logic and added `useUpdateDeviceBulk` hook to support efficient bulk operations in a single API call with proper success/error notifications.
- **UI Integration**: Integrated bulk edit action into device list tables and improved action handling for better user experience.

</details>

<details>
<summary><strong>Files Updated (8)</strong></summary>

- `src/vertex/components/features/devices/bulk-edit-device-details-modal.tsx` [NEW]
- `src/vertex/components/features/devices/device-list-table.tsx` [MODIFIED]
- `src/vertex/core/hooks/useDevices.ts` [MODIFIED]
- `src/vertex/core/apis/devices.ts` [MODIFIED]
- `src/vertex/app/(authenticated)/devices/my-devices/page.tsx` [MODIFIED]
- `src/vertex/components/features/devices/client-paginated-devices-table.tsx` [MODIFIED]
- `src/vertex/components/shared/table/ReusableTable.tsx` [MODIFIED]
- `src/vertex/components/features/networks/network-device-list-table.tsx` [MODIFIED]

</details>


---

## Version 1.23.54
**Released:** May 28, 2026

### Device Details Modal — authRequired Field & Reset Bug Fix

Added `authRequired` as an editable field in the Device Details Modal and fixed a state reset bug where the field always reverted to `true` after a device data refresh.

<details>
<summary><strong>Changes (2)</strong></summary>

- **authRequired Field Added**: Exposed `authRequired` as an editable `ReusableSelectInput` in the Basic Information section of the Device Details Modal, wired to the zod schema and form dirty-fields logic so it is only included in the update payload when changed.
- **Reset Bug Fix**: Added `authRequired` to the `useEffect` form reset block that fires when the `device` prop changes. Previously the field was omitted from that reset, causing it to always revert to `true` after a successful update or device data refresh regardless of the stored value.

</details>

<details>
<summary><strong>Files Updated (1)</strong></summary>

- `src/vertex/components/features/devices/device-details-modal.tsx` [MODIFIED]

</details>

---

## Version 1.23.53
**Released:** May 28, 2026

### Import Device Modal — authRequired Field & Error Handling Refactor

Introduced `authRequired` as a first-class field in the bulk device import flow and migrated inline `setErrors` validation patterns to the centralized `showBanner` system inside `ImportDeviceModal`.

<details>
<summary><strong>Changes (2)</strong></summary>

- **authRequired Field Added**: Added `authRequired` to `EXPECTED_FIELDS` with auto-detection of CSV header aliases (`auth required`, `authrequired`, `requiresauth`, etc.) and intelligent string-to-boolean mapping for values like `yes/no`, `true/false`, `1/0`, `y/n`. Defaults to `true` when the field is unmapped. The field is also exposed as a UI select input in the single-device import form.
- **Error Handling Migration**: Replaced `setErrors({ general: ... })` patterns in mapping validation (missing required fields, duplicate column mappings, unsupported file types, empty CSV) with `showBanner({ severity: 'error', ..., scoped: true })` to keep error feedback consistent with the rest of the dialog system.

</details>

<details>
<summary><strong>Files Updated (2)</strong></summary>

- `src/vertex/components/features/devices/import-device-modal.tsx` [MODIFIED]
- `src/vertex/core/hooks/useDevices.ts` [MODIFIED]

</details>

---

## Version 1.23.52
**Released:** May 27, 2026

### Cohort Management Banner Migration & Banner Delay Standardization

Migrated toast-based cohort notifications and raw `setTimeout` banner patterns in device dialogs to the centralized `InfoBanner` system and the shared `useBannerWithDelay` hook. Errors inside dialogs use `scoped: true` to stay inline while the dialog remains open; post-dialog success feedback uses `scoped: false` so the delayed banner appears only after the dialog has fully unmounted.

<details>
<summary><strong>Banner Delay Standardization (7)</strong></summary>

- **Shared Delay Hook Rename**: Renamed the former `useDeferredBanner` hook to `useBannerWithDelay` across cohort, grid, and device consumers to make the hook name reflect the delayed display behavior.
- **Hook-Level Callback Pattern**: All mutation hooks in `useCohorts.ts` now accept optional `onSuccess`/`onError` callbacks at initialization rather than per-call `mutate()` arguments, aligning with the reliable pattern established in the grid module.
- **Dialog Error Feedback**: `create-cohort.tsx`, `edit-cohort-details-modal.tsx`, `device-name-parser.tsx`, and `assign/unassign-cohort-devices.tsx` use `scoped: true` so validation and mutation errors remain visible inside the active dialog without closing it.
- **Post-Dialog Success Feedback**: `create-cohort.tsx`, `assign-cohort-devices.tsx`, and `unassign-cohort-devices.tsx` use the shared `useBannerWithDelay` hook (`scoped: false`) to show global success banners only after the dialog has unmounted.
- **Device Banner Refactor**: Device modals and dialogs now use `useBannerWithDelay` instead of raw `setTimeout` timer patterns to display delayed success feedback after unmounting.
- **Detail Card & API Card Feedback**: `cohort-detail-card.tsx` and `cohort-measurements-api-card.tsx` replace toast calls with `useBanner` for copy feedback and action outcomes, keeping feedback in context.
- **Shared Utilities Adopted**: `useBannerWithDelay` hook and `AFTER_DIALOG_CLOSE_MS` constant (merged from the grid branch) are now consumed across the cohort module, removing all local `bannerTimerRef + setTimeout` patterns.

</details>

<details>
<summary><strong>Files Updated (19)</strong></summary>

- `src/vertex/core/hooks/useCohorts.ts` [MODIFIED]
- `src/vertex/components/features/cohorts/create-cohort.tsx` [MODIFIED]
- `src/vertex/components/features/cohorts/edit-cohort-details-modal.tsx` [MODIFIED]
- `src/vertex/components/features/cohorts/cohort-detail-card.tsx` [MODIFIED]
- `src/vertex/components/features/cohorts/cohort-measurements-api-card.tsx` [MODIFIED]
- `src/vertex/components/features/cohorts/device-name-parser.tsx` [MODIFIED]
- `src/vertex/components/features/cohorts/assign-cohort-devices.tsx` [MODIFIED]
- `src/vertex/components/features/cohorts/unassign-cohort-devices.tsx` [MODIFIED]
- `src/vertex/components/features/grids/create-admin-level.tsx` [MODIFIED]
- `src/vertex/components/features/grids/create-grid.tsx` [MODIFIED]
- `src/vertex/components/features/grids/edit-grid-details-dialog.tsx` [MODIFIED]
- `src/vertex/components/features/devices/add-maintenance-log-modal.tsx` [MODIFIED]
- `src/vertex/components/features/devices/create-device-modal.tsx` [MODIFIED]
- `src/vertex/components/features/devices/deploy-device-component.tsx` [MODIFIED]
- `src/vertex/components/features/devices/device-assignment-modal.tsx` [MODIFIED]
- `src/vertex/components/features/devices/import-device-modal.tsx` [MODIFIED]
- `src/vertex/components/features/devices/recall-device-dialog.tsx` [MODIFIED]
- `src/vertex/core/hooks/useBannerWithDelay.ts` [ADDED]
- `src/vertex/app/changelog.md` [MODIFIED]

</details>

---

## Version 1.23.51
**Released:** May 27, 2026

### Page Satisfaction Banner Layout Refinement

Refactored the page satisfaction banner into a floating, responsive card positioned at the bottom-right of the screen to eliminate overlaps with sidebars and improve desktop/mobile layout consistency.

<details>
<summary><strong>Banner Layout Migration (3)</strong></summary>

- **Floating Card Design**: Repositioned the satisfaction banner from static page layout to a floating `Card` component anchored at the bottom-right corner, preventing overlap with dynamic sidebar states and ensuring consistent visibility across viewports.
- **Responsive Sidebar Awareness**: Added `isSidebarCollapsed` prop to `PageSatisfactionBanner` to dynamically adjust the banner's left offset based on sidebar state (`lg:left-[88px]` for collapsed, `lg:left-[256px]` for expanded), maintaining proper spacing on desktop layouts.
- **Content Bottom Padding Adjustment**: Increased main content area bottom padding to `pb-32` to prevent the floating banner from obscuring page content in scroll-to-bottom scenarios.

</details>

<details>
<summary><strong>Code Quality & Formatting (2)</strong></summary>

- **Prettier Formatting**: Applied consistent indentation and spacing standardization throughout the feedback banner component for improved code maintainability.
- **Import Organization**: Reorganized component imports for clarity, adding the `Card` wrapper import to support the floating layout design.

</details>

<details>
<summary><strong>Files Modified (2)</strong></summary>

- `src/vertex/components/features/feedback/page-satisfaction-banner.tsx` [MODIFIED]
- `src/vertex/components/layout/layout.tsx` [MODIFIED]

</details>

---

## Version 1.23.50
**Released:** May 27, 2026

### Device Bulk Upload Feature

Introduced a comprehensive bulk upload and column mapping system for devices, enabling operators to import multiple devices simultaneously via CSV or JSON files. The feature features interactive column matching, live preview, data validation, and custom failure reports.

<details>
<summary><strong>Bulk Device Upload Flow (5)</strong></summary>

- **Interactive File Import**: Supports uploading `.csv` and `.json` files via the new `ReusableFileUpload` component integrated into the `ImportDeviceModal`.
- **Intelligent Field Auto-Mapping**: Automatically detects and maps file columns to expected device fields (like Device Name, Serial Number, Latitude, Longitude, API Code/Connection URL, Description, and Device Number) based on header names, with manual overrides.
- **Bulk Import Preview**: Displays a tabular preview of the first 5 parsed and transformed devices, allowing users to verify mapped values prior to final submission.
- **Import Results & Inline Banners**: Integrates with the context-aware `useBanner` system to show inline success, warning, or error alerts inside the modal. Provides a summary breakdown table and supports downloading a custom `failed_devices.csv` for any rejected rows.
- **Global Settings Application**: Allows operators to set a single Sensor Manufacturer (Network), Category, and optional tags to apply across all imported devices in a batch.

</details>

<details>
<summary><strong>Core Infrastructure & APIs (3)</strong></summary>

- **Bulk Device Import API Calls**: Added `importBulkDevicesCSV` and `importBulkDevicesJSON` methods under `devices` api client to submit imports through the `/devices/soft/bulk` API endpoint.
- **Bulk Import Hook**: Created `useBulkImportDevices` hook using `useMutation` to handle both CSV and JSON payloads, delegating feedback notifications to caller callbacks, and invalidating corresponding React Query lists.
- **Types Definition**: Added TypeScript interfaces `BulkImportDeviceResult` and `BulkImportDeviceResponse` in `app/types/devices.ts`.

</details>

<details>
<summary><strong>Shared Component Additions & Fixes (3)</strong></summary>

- **ReusableFileUpload Component**: Introduced `ReusableFileUpload.tsx` to provide a drag/click upload interface with validation states and styling.
- **Form Asterisk Standardization**: Standardized styling of required fields (`*`) to use `text-red-500` in `ReusableInputField` and `ReusableSelectInput` for visual alignment.
- **TypeScript Dependencies**: Updated `@types/papaparse` to version `^5.5.2` in `package.json` for stable parsing typing.

</details>

<details>
<summary><strong>Files Created/Modified (9)</strong></summary>

- `src/vertex/app/types/devices.ts` [MODIFIED]
- `src/vertex/components/features/devices/import-device-modal.tsx` [MODIFIED]
- `src/vertex/components/shared/fileupload/ReusableFileUpload.tsx` [ADDED]
- `src/vertex/components/shared/inputfield/ReusableInputField.tsx` [MODIFIED]
- `src/vertex/components/shared/select/ReusableSelectInput.tsx` [MODIFIED]
- `src/vertex/core/apis/devices.ts` [MODIFIED]
- `src/vertex/core/hooks/useDevices.ts` [MODIFIED]
- `src/vertex/package.json` [MODIFIED]
- `src/vertex/app/changelog.md` [MODIFIED]

</details>

---

## Version 1.23.49
**Released:** May 26, 2026

### Grid Management Banner Migration

Migrated all toast-based notifications in the Grid Management module to the centralized `InfoBanner` system powered by `useBanner`. Since most grid actions occur inside dialogs, banner scoping was applied to keep errors inline in the active dialog while deferring success banners until the dialog has closed.

<details>
<summary><strong>Grid Management Banner Migration (4)</strong></summary>

- **Dialog Error Feedback**: `create-grid.tsx`, `edit-grid-details-dialog.tsx`, and `admin-levels-modal.tsx` now use `scoped: true` so validation and action errors remain visible inside the active dialog without closing it.
- **Post-Dialog Success Feedback**: `create-grid.tsx` and `edit-grid-details-dialog.tsx` now use `scoped: false` with a `setTimeout(100ms)` to allow the dialog to unmount before showing the global success banner.
 - **Admin Level Error Feedback Migrated**: `create-admin-level.tsx` now routes existing error feedback through the centralized banner flow instead of the previous toast-based mechanism.
- **Copy Feedback Hardened**: `grid-details-card.tsx` and `grid-measurements-api-card.tsx` now use `scoped: false` and handle async copy failures with a fallback error message.

</details>

<details>
<summary><strong>Files Updated (7)</strong></summary>

- `src/vertex/components/features/grids/create-grid.tsx` [MODIFIED]
- `src/vertex/components/features/grids/edit-grid-details-dialog.tsx` [MODIFIED]
- `src/vertex/components/features/grids/admin-levels-modal.tsx` [MODIFIED]
- `src/vertex/components/features/grids/create-admin-level.tsx` [MODIFIED]
- `src/vertex/components/features/grids/grid-details-card.tsx` [MODIFIED]
- `src/vertex/components/features/grids/grid-measurements-api-card.tsx` [MODIFIED]
- `src/vertex/core/hooks/useGrids.ts` [MODIFIED]

</details>

---

## Version 1.23.48
**Released:** May 23, 2026

### Post-Login Feedback, Page Titles & Cookie Banner Refinements

Added a post-login satisfaction feedback flow and extracted its toast UI into a reusable feedback component that can be reused for future workflows such as site creation feedback. Also aligned authenticated page titles with the satisfaction banner and refreshed the unauthenticated cookie information banner styling to use shared button primitives.

<details>
<summary><strong>Post-Login Feedback Flow (5)</strong></summary>

- **Login Feedback Prompt**: Added `LoginFeedbackToast` on the authenticated home page to ask users how their login experience went shortly after sign-in.
- **Login Timing Metadata**: Captures login start time from the login flow and submits login duration metadata with feedback payloads.
- **Suppression Window**: Added local user preference helpers to avoid repeatedly prompting the same user after successful feedback submission.
- **Structured Negative Feedback**: Added radio-button reason options and an "Other" details field so users can explain poor login experiences without typing from scratch.
- **Auto-Dismiss Behavior**: Tuned delayed display and auto-dismiss timing so the toast appears after login but disappears if the user does not interact.

</details>

<details>
<summary><strong>Reusable Satisfaction Feedback Toast & API (5)</strong></summary>

- **Reusable Component Extraction**: Created `ReusableSatisfactionFeedbackToast` as a shared component for satisfaction-style feedback prompts.
- **Configurable Copy and Reasons**: Supports custom titles, subtitles, positive/negative labels, reason lists, thank-you copy, show delay, auto-dismiss delay, and submit handlers.
- **Generic Satisfaction Submission Helper**: Added `feedbackService.submitSatisfactionFeedback` so future feature prompts can submit consistent satisfaction feedback without adding a new API method per feature.
- **Shared Input Styling**: Uses `ReusableInputField` for the "Other" textarea field to stay aligned with the app's shared form styling.
- **Thank-You State Polish**: Restored the celebratory emoji in the thank-you state after feedback submission.

</details>

<details>
<summary><strong>Authenticated Page Title Alignment (5)</strong></summary>

- **Shared Page Title Context**: Added a `PageTitleProvider` and `usePageTitle` hook for authenticated pages so visible page headings, browser tab titles, and satisfaction prompts can use the same title source.
- **Route-Based Defaults**: Added sensible fallback titles for authenticated routes including Home, My Devices, Sites, Cohorts, Sensor Manufacturers, Grids, Shipping, and common detail pages.
- **Dynamic Entity Titles**: Added title overrides for detail pages so site, cohort, device, grid, sensor manufacturer, and shipping batch pages can display human-readable names instead of IDs.
- **Satisfaction Banner Alignment**: Updated `PageSatisfactionBanner` to read the shared page title instead of deriving labels from the URL path.
- **Title Reset Hardening**: Added document-head mutation handling so client-side page titles are restored if Next.js re-applies the root `AirQo Vertex` title after navigation.

</details>

<details>
<summary><strong>Cookie Info Banner Refinement (1)</strong></summary>

- **Shared Button Migration**: Refactored `CookieInfoBanner` to use `ReusableButton` and refreshed its styling for better consistency with the rest of the Vertex UI.

</details>

<details>
<summary><strong>Files Created/Modified (21)</strong></summary>

- `src/vertex/app/(authenticated)/admin/cohorts/[id]/page.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/admin/cohorts/page.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/admin/grids/[id]/page.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/admin/networks/[id]/page.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/admin/shipping/[batchId]/page.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/admin/sites/[id]/page.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/admin/sites/page.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/cohorts/[id]/page.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/home/page.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/layout.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/sites/[id]/page.tsx` [MODIFIED]
- `src/vertex/app/login/page.tsx` [MODIFIED]
- `src/vertex/components/features/devices/device-details-layout.tsx` [MODIFIED]
- `src/vertex/components/features/auth/cookie-info-banner.tsx` [MODIFIED]
- `src/vertex/components/features/feedback/page-satisfaction-banner.tsx` [MODIFIED]
- `src/vertex/components/features/feedback/login-feedback-toast.tsx` [ADDED/MODIFIED]
- `src/vertex/components/features/feedback/reusable-satisfaction-feedback-toast.tsx` [ADDED]
- `src/vertex/context/page-title-context.tsx` [ADDED]
- `src/vertex/core/apis/feedback.ts` [MODIFIED]
- `src/vertex/core/utils/sessionManager.ts` [MODIFIED]
- `src/vertex/core/utils/userPreferences.ts` [MODIFIED]

</details>

---

## Version 1.23.47
**Released:** May 21, 2026

### hCaptcha Integration on Login Page

Added hCaptcha human verification to the password step of the login form to protect against credential stuffing and brute-force attacks. The CAPTCHA widget appears above the Login button and must be completed before the button is enabled. The token is passed through NextAuth's `signIn` call and forwarded to the backend authentication endpoint, which already has CAPTCHA middleware wired in.

<details>
<summary><strong>Login — hCaptcha Integration (3)</strong></summary>

- **HCaptchaWidget component**: Created reusable `HCaptchaWidget` at `src/vertex/components/ui/hcaptcha-widget.tsx` wrapping `@hcaptcha/react-hcaptcha`. Reads `NEXT_PUBLIC_HCAPTCHA_SITE_KEY` from env and renders a warning message if the key is absent or empty.
- **Login page**: Added `captchaToken` state. Widget renders on the password step above the Login button. Login button is disabled until CAPTCHA is verified. Token is cleared on login failure (requiring re-verification) and when the user navigates back to the email step via "Change email".
- **NextAuth authorize callback**: Added `captchaToken` to the credentials definition and forwarded it to the backend `loginWithDetails` request body.

</details>

<details>
<summary><strong>Files Modified (7)</strong></summary>

- `src/vertex/app/changelog.md` [MODIFIED]
- `src/vertex/app/login/page.tsx` [MODIFIED]
- `src/vertex/app/api/auth/[...nextauth]/options.ts` [MODIFIED]
- `src/vertex/app/types/users.ts` [MODIFIED]
- `src/vertex/components/ui/hcaptcha-widget.tsx` [ADDED]
- `src/vertex/package.json` [MODIFIED]
- `src/vertex/package-lock.json` [MODIFIED]

</details>

---

## Version 1.23.46
**Released:** May 20, 2026

### Automated Feedback Screenshot Capture

Introduced automated screen capture for the feedback launcher, allowing users to automatically take and attach screenshots of their current view.

<details>
<summary><strong>New Features (1)</strong></summary>

- **Automated Feedback Screenshot Capture**: Adds screenshot upload functionality to the feedback submission system in the Vertex application, enabling users to attach visual context when reporting issues or suggesting improvements.

</details>

<details>
<summary><strong>Technical Details (3)</strong></summary>

- **On-Demand Viewport Capture**: Integrated `html2canvas` for dynamic, client-side screen rendering.
- **Intelligent Modal Hiding**: The feedback dialog and backdrop are temporarily hidden from the DOM layout during screen capture to ensure only the app viewport behind the modal is photographed.
- **JPEG Compression**: Automatically outputs captured canvases as lightweight JPEG blobs (`0.85` quality) to minimize network payload size and bypass size restrictions.

</details>

<details>
<summary><strong>Files Created/Modified (2)</strong></summary>

- `src/vertex/components/features/feedback/feedback-launcher.tsx` [MODIFIED]
- `src/vertex/package.json` [MODIFIED]

</details>

---

## Version 1.23.45
**Released:** May 19, 2026

### Cookie Info Banner & Responsive Styling Migration

Deploys the brand-new client-side Cookie Info Banner component to ensure standard compliance for cookie use and telemetry transparency. Refactored the entire component's styling from rigid inline rules to responsive Tailwind CSS classes and integrated it directly into the login page.

<details>
<summary><strong>New Features & UX Integration (2)</strong></summary>

- **Cookie Info Banner Component**: Created and deployed the `CookieInfoBanner` component to notify users of cookie usage and privacy terms ("AirQo uses cookies to deliver and enhance the quality of its services and to analyze traffic"). Resolves its cookie policy hyperlink dynamically via environment constants to support various environment routing configurations.
- **Login Page Integration**: Mounted the banner globally at the bottom of the main layout inside the `LoginPage` (`app/login/page.tsx`), ensuring immediate display for unauthenticated users before onboarding.

</details>

<details>
<summary><strong>Tailwind & Layout Optimization (3)</strong></summary>

- **Responsive Tailwind Migration**: Refactored the banner's inline styles into utility classes, converting absolute pixel positions and custom properties into clean, responsive Tailwind classes.
- **Bottom-Viewport Alignment**: Relocated the banner from the top of the viewport (`top: 0`) to the bottom (`bottom: 0`) with an elevated `z-[100]` stacking order. This resolves all visual overlapping, spacing, and layout collisions with the sticky site header and the Electron Desktop title bar.
- **Micro-Transitions and Hover States**: Added smooth transitions, hover scaling, and active color states for the banner's hyperlink ("Learn more") and dismiss button ("OK, got it") to align with premium platform aesthetics.

</details>

<details>
<summary><strong>Files Created/Modified (3)</strong></summary>

- `src/vertex/app/login/page.tsx` [MODIFIED]
- `src/vertex/components/features/auth/cookie-info-banner.tsx` [MODIFIED]
- `src/vertex/lib/envConstants.ts` [MODIFIED]

</details>

---

## Version 1.23.44
**Released:** May 19, 2026

### Device Management Scoped Banner Migration & Mutation Callback Cleanup

Migrated feedback notifications from global floating toasts (`ReusableToast`) to context-aware `InfoBanner` components (`useBanner`) inside device management modules to keep alerts inline and centered within their active modal or dialog containers. Refactored React Query hook callbacks to push feedback responsibility to the UI components.

<details>
<summary><strong>Device Management — Scoped Banner Migration (7)</strong></summary>

- **Create Device Modal**: Integrated `useBanner` for scoped validation and creation alerts. The `showBanner` utility replaces the old inline red error block for missing network errors.
- **Import Device Modal**: Integrated `useBanner` to surface a previously silent missing user ID warning and errors. Replaced old inline red error alerts and fixed a critical TypeScript compilation error where `importDevice.mutate()` was called with 3 arguments instead of 1-2 by merging the `onSuccess` and `onError` options into a single second argument. Added missing `getApiErrorMessage` import.
- **Add Maintenance Log Modal**: Replaced `ReusableToast` with scoped `showBanner` for validation errors to align modal design feedback.
- **Deploy Device Component**: Swapped 3 occurrences of `ReusableToast` with `showBanner` alerts.
- **Recall Device Dialog**: Added `useBanner` support and shifted all success and error UI notifications from raw hook callbacks directly to try/catch blocks within the component.
- **Device Details Modal**: Migrated all validation, detail update, and key decryption feedback from floating toasts to `showBanner`. Added local callback overrides to the `updateLocal` and `updateGlobal` mutate invocations.
- **Device Assignment Modal**: Added `useBanner` with `scoped: false` (since this dialog extends base Radix `Dialog` rather than `ReusableDialog`), keeping assignment feedback in the modal itself instead of hook side-effects.

</details>

<details>
<summary><strong>Custom Hook & Callback Separation (1)</strong></summary>

- **useDevices Hooks Overhaul**: Removed imperative `ReusableToast` side-effects from `useRecallDevice`, `useUpdateDeviceLocal`, `useUpdateDeviceGlobal`, `useAssignDeviceToOrganization`, and `useDecryptDeviceKeys`. Hooks are now clean, focused solely on API interactions and cache invalidation.

</details>

<details>
<summary><strong>Files Modified (8)</strong></summary>

- `src/vertex/app/changelog.md` [MODIFIED]
- `src/vertex/components/features/devices/create-device-modal.tsx` [MODIFIED]
- `src/vertex/components/features/devices/import-device-modal.tsx` [MODIFIED]
- `src/vertex/components/features/devices/add-maintenance-log-modal.tsx` [MODIFIED]
- `src/vertex/components/features/devices/deploy-device-component.tsx` [MODIFIED]
- `src/vertex/components/features/devices/recall-device-dialog.tsx` [MODIFIED]
- `src/vertex/components/features/devices/device-details-modal.tsx` [MODIFIED]
- `src/vertex/components/features/devices/device-assignment-modal.tsx` [MODIFIED]
- `src/vertex/core/hooks/useDevices.ts` [MODIFIED]

</details>

---

## Version 1.23.43
**Released:** May 17, 2026

### Page Satisfaction Feedback Banner & Global Banner Positioning

Implements a full-featured, page-satisfaction feedback banner for the Vertex platform (Issue #3480), and resolves several core layout and banner rendering issues to ensure perfect visual presentation on both desktop and mobile viewports.

<details>
<summary><strong>New Features (4)</strong></summary>

- **Page Satisfaction Feedback Banner**: Designed and deployed a new `PageSatisfactionBanner` component situated statically directly below the page footer for all authenticated sessions, encouraging quick, one-tap platform feedback.
- **Structured Feedback Modal Flow**: Integrated interactive positive/negative feedback modals (`FeedbackModal`) that prompt users for structured reasons and optional comments when voting.
- **Session & API Integration**: Automatically pre-fills the user's registered identity from the active user session context and forwards feedback payloads to the backend `feedbackService.submitFeedback` with rich client telemetry.
- **Dynamic Context Detection**: Automatically parses the active URL path to display the localized screen name (e.g. "Home", "Cohorts") in the satisfaction prompt.

</details>

<details>
<summary><strong>Layout & UI Bug Fixes (5)</strong></summary>

- **Mobile Viewport Bottom Spacing**: Fixed a 80px white space below the satisfaction banner on mobile and tablet screens. Relocated `pb-20 md:pb-0` padding classes from the outer scrolling `<main>` container to the inner `max-w-7xl` page content wrapper, ensuring the banner rests perfectly flush at the absolute bottom of the viewport.
- **Dialog Notification Hardening**: Hardened dialog error feedback by setting `scoped: true` on submission and authentication error banners. Error messages are now rendered beautifully inline at the top of the modal (`BannerSlot` inside `ReusableDialog`) instead of being hidden behind the backdrop.
- **Deferred Success Notification**: Deferred the global success banner schedule inside `FeedbackModal`'s `handleSubmit` via a 150ms timeout. This allows `ReusableDialog`'s unmount cleanup `hideBanner()` to complete before the persistent success banner is successfully scheduled on the main screen.
- **Overlapping Global Banners Resolved**: Moved `<GlobalBannerContainer />` from the root application tree (`providers.tsx`) to the `max-w-7xl` page content wrapper inside `<main>` (`layout.tsx`). The global banner now respects all layout boundaries and sidebars, avoiding any overlapping or clipping underneath the fixed `Topbar` and `Sidebar` layouts.
- **Global Banner Margins Refinement**: Removed the trailing `px-4` margin from the `GlobalBannerContainer` wrapper inside `context/banner-context.tsx` to fully leverage the parent responsive grid padding (`px-3 py-3 md:px-2 lg:py-6 lg:px-6`).

</details>

<details>
<summary><strong>Files Created/Modified (5)</strong></summary>

- `src/vertex/app/providers.tsx` [MODIFIED]
- `src/vertex/app/(authenticated)/layout.tsx` [MODIFIED]
- `src/vertex/components/features/feedback/page-satisfaction-banner.tsx` [NEW]
- `src/vertex/components/layout/layout.tsx` [MODIFIED]
- `src/vertex/context/banner-context.tsx` [MODIFIED]

</details>

---

## Version 1.23.42
**Released:** May 17, 2026

### Centralized Modal Banners & ReusableDialog Integration

Integrated the context-aware `<BannerSlot />` directly into the centralized `ReusableDialog` component, enabling automatic and standardized banner rendering inside modals throughout the application. Built auto-cleanup logic into the dialog transition state to prevent banner leakage.

<details>
<summary><strong>Shared UI Components (2)</strong></summary>

- **Centralized BannerSlot Integration**: Embedded `<BannerSlot />` from the `useBanner` system natively inside `ReusableDialog.tsx` immediately below the dialog header and above the scrollable content area. Feature modals now support inline, styled banner alerts without manual markup.
- **Auto-Cleanup on Dialog Close**: Integrated active cleanup logic inside `ReusableDialog.tsx` that calls `hideBanner()` when the dialog is closed, resetting notification state and preventing alerts from leaking between different dialog instances.
- **Gated Transition Guard**: Hardened the dialog cleanup logic by introducing `wasOpenRef` to track state transitions. This prevents mounted-but-closed dialogs from triggering `hideBanner()` on initial render, ensuring other active on-page or modal banners are not cleared prematurely.

</details>

<details>
<summary><strong>Files Modified (1)</strong></summary>

- `src/vertex/components/shared/dialog/ReusableDialog.tsx` [MODIFIED]

</details>

---

## Version 1.23.41
**Released:** May 16, 2026

### Scoped Banner System Migration, Login UX Fixes & Dead Code Cleanup

Migrated auth-flow feedback from imperative toast notifications to scoped `InfoBanner` components, hardened the banner-context state management to prevent silent message drops, fixed post-login banner render timing, and removed the defunct local forgot-password page.

<details>
<summary><strong>Auth UX — Scoped Banner Migration (3)</strong></summary>

- **Login Page Banners**: Replaced all `ReusableToast` calls in the login flow (`app/login/page.tsx`) with scoped `showBanner` / `BannerSlot` calls. Success, error, and validation feedback is now rendered inline within the login form card rather than as floating toasts, giving users precise contextual feedback without losing their place.
- **Google Auth Section Banners**: Migrated `components/features/auth/google-auth-section.tsx` to use scoped `InfoBanner` for OAuth error states, replacing previous inline alert elements and ensuring visual consistency across all sign-in paths.
- **Login Render Timing Fix**: Fixed a race condition where the success banner was not visible before the page redirected after a successful credential login. Resolved by removing an extraneous `setTimeout` that was interfering with React's paint cycle, ensuring the welcome banner renders correctly before navigation occurs.

</details>

<details>
<summary><strong>Banner Context Hardening (1)</strong></summary>

- **Full Props Stored in State**: Refactored `context/banner-context.tsx` to store the complete banner props object in state rather than individual fields. This prevents silent message drops that occurred when rapid successive `showBanner` calls partially overwrote state before the component re-rendered, resulting in blank or stale banners being displayed.

</details>

<details>
<summary><strong>Dead Code Removal (1)</strong></summary>

- **Forgot Password Page Deleted**: Removed the local `/forgot-password` Next.js route (`app/forgot-password/page.tsx`), which was a dead stub that only `console.log`ed submitted emails without calling any API. The "Forgot password?" link in the login page continues to redirect users directly to AirQo Analytics (`NEXT_PUBLIC_ANALYTICS_URL/user/forgotPwd`) where actual password reset is handled. Cleaned up the middleware route matcher and `authProvider` auth-routes list accordingly.

</details>

<details>
<summary><strong>Files Modified/Deleted (5)</strong></summary>

- `src/vertex/app/forgot-password/page.tsx` [DELETED]
- `src/vertex/app/login/page.tsx` [MODIFIED]
- `src/vertex/components/features/auth/google-auth-section.tsx` [MODIFIED]
- `src/vertex/context/banner-context.tsx` [MODIFIED]
- `src/vertex/core/auth/authProvider.tsx` [MODIFIED]
- `src/vertex/middleware.ts` [MODIFIED]

</details>

---

## Version 1.23.40
**Released:** May 16, 2026

### Graceful Handling of Canceled API Requests

Fixed a false-positive production error alert caused by React Query's `AbortSignal` cancellations being treated as genuine API failures in the Axios response interceptor.

<details>
<summary><strong>Bug Fixes (1)</strong></summary>

- **Canceled Request False-Positives**: Added an early-return guard using `axios.isCancel()` and `instanceof CanceledError` at the top of the `secureApiProxyClient` response error interceptor. Requests canceled by React Query's `AbortSignal` (e.g. on component unmount during navigation) are now silently passed through without triggering `logger.error`, token cache invalidation, or the `auth-token-expired` event — all of which were previously firing incorrectly for benign client-side aborts.

</details>

<details>
<summary><strong>Files Modified (1)</strong></summary>

- `src/vertex/core/utils/secureApiProxyClient.ts` [MODIFIED]

</details>

---

## Version 1.23.39
**Released:** May 07, 2026

### Device Tagging, Original Cohort Visibility, Map Stability & UI Refinements

Introduced a comprehensive device tagging system, added original cohort tracing for duplicates, overhauled the MiniMap for reliability and performance, and improved device status visualization.

<details>
<summary><strong>Device Tagging System (4)</strong></summary>

- **Custom & Default Tagging**: Integrated a new tagging system across all device creation and import flows (`create-device-modal`, `import-device-modal`). Users can select from standard tags (e.g., `lowcost`, `mobile`, `inlab`) or create their own custom labels.
- **Tags Column in Device Tables**: Added a "Tags" column to the device list table (`table-columns.tsx`), displaying tags as color-coded badges. Updated `Device` type in `app/types/devices.ts` to include the optional `tags` field.
- **In-Place Tag Management**: Updated the Device Details Card to display current tags as badges and allow operators to edit them via a dialog — without leaving the page.
- **API & Hook Updates**: Extended `createDevice` and `importDevice` in `core/apis/devices.ts` and `core/hooks/useDevices.ts` to accept and forward an optional `tags` array, omitting the field if empty.

</details>

<details>
<summary><strong>Cohort Improvements (1)</strong></summary>

- **Original Cohort Tracing**: Updated `cohort-detail-card.tsx` to display an `InfoBanner` linking to the original cohort when a duplicate is detected. Added `useOriginalCohort` hook and corresponding API (`core/apis/cohorts.ts`, `core/hooks/useCohorts.ts`) with `originalCohort` field added to `app/types/cohorts.ts`.

</details>

<details>
<summary><strong>Mapbox Stability & Speed (3)</strong></summary>

- **Reliable Map Loading**: Refactored `MiniMap` to use `useRef` for the map instance with an initialization guard, and deferred all controls/marker setup to inside the `map.on('load')` callback — fixing intermittent "blank map" issues in Dialogs and Tabs.
- **Auto-Resize Support**: Integrated a `ResizeObserver` that calls `map.resize()` whenever the container dimensions change, ensuring correct canvas sizing in dynamic layouts.
- **Next.js Preconnect Hints**: Added `<link rel="preconnect">` for `api.mapbox.com` and `events.mapbox.com` in `app/layout.tsx`, and upgraded the map style to `streets-v12`.

</details>

<details>
<summary><strong>UI/UX Improvements (2)</strong></summary>

- **Device Category Empty State**: Redesigned `device-category-card.tsx` to show a centered `AqPuzzlePiece02` icon with the message "Device not deployed. You will see deployment category here" when `deployment_category` is absent. The info tooltip and category hierarchy are hidden in this state.
- **Hardened MultiSelectCombobox**: Added default values for `options` and `value` props and a safety check for `value.length` to prevent runtime crashes from undefined prop values.

</details>

<details>
<summary><strong>Other Changes (2)</strong></summary>

- **Grid Success Message**: Updated the grid creation success message copy in `core/hooks/useGrids.ts`.
- **Temporarily Disabled Google Login**: Google sign-in was temporarily disabled in `app/login/page.tsx` while the feature is being stabilized.

</details>

<details>
<summary><strong>Files Modified (18)</strong></summary>

- `src/vertex/app/types/devices.ts` [MODIFIED]
- `src/vertex/app/types/cohorts.ts` [MODIFIED]
- `src/vertex/app/layout.tsx` [MODIFIED]
- `src/vertex/app/login/page.tsx` [MODIFIED]
- `src/vertex/core/constants/devices.ts` [MODIFIED]
- `src/vertex/core/apis/devices.ts` [MODIFIED]
- `src/vertex/core/apis/cohorts.ts` [MODIFIED]
- `src/vertex/core/hooks/useDevices.ts` [MODIFIED]
- `src/vertex/core/hooks/useCohorts.ts` [MODIFIED]
- `src/vertex/core/hooks/useGrids.ts` [MODIFIED]
- `src/vertex/components/features/devices/create-device-modal.tsx` [MODIFIED]
- `src/vertex/components/features/devices/import-device-modal.tsx` [MODIFIED]
- `src/vertex/components/features/devices/device-details-card.tsx` [MODIFIED]
- `src/vertex/components/features/devices/device-category-card.tsx` [MODIFIED]
- `src/vertex/components/features/devices/utils/table-columns.tsx` [MODIFIED]
- `src/vertex/components/features/cohorts/cohort-detail-card.tsx` [MODIFIED]
- `src/vertex/components/features/mini-map/mini-map.tsx` [MODIFIED]
- `src/vertex/components/ui/multi-select.tsx` [MODIFIED]

</details>

---

## Version 1.23.38
**Released:** May 05, 2026

### Google Login Integration & Multi-Step Authentication Refactor

Introduced seamless Google sign-in and a modernized two-step authentication flow to enhance both security and the user onboarding experience.

<details>
<summary><strong>New Features (3)</strong></summary>

- **Google Authentication Flow**: Integrated "Continue with Google" at the primary entry point of the login page, allowing users to sign in with one click via their Google workspace accounts.
- **Two-Step Email Login**: Refactored the manual login journey into a guided two-step experience (Email → Password). This improves focus and aligns with modern security standards by deferring password entry.
- **Branded Authentication Container**: Redesigned the login form layout with a primary-branded border, shadow-md depth, and smooth fade transitions using `framer-motion` for step navigation.

</details>

<details>
<summary><strong>Fixes & Enhancements (4)</strong></summary>

- **Help Icon Size Optimization**: Enhanced the visibility of the Help & Feedback button in the topbar by replacing the default icon with a larger, more accessible version (`h-7 w-7`) using new custom icon sizing support in `ReusableButton`.
- **Topbar Accessibility Hardening**: Added descriptive `title` and `aria-label` attributes to all persistent navigation elements (App Switcher, Help Button, Organization Picker, and User Avatar) for improved screen reader support and hover tooltips.
- **Social Login Layout Refinement**: Simplified the "OR" separator by removing horizontal lines, creating a cleaner visual hierarchy between social and manual login options.
- **Login UI Spacing**: Optimized vertical padding and spacing on the login screen to ensure the branded container remains perfectly centered across various desktop resolutions.

</details>

<details>
<summary><strong>Files Created/Modified (11)</strong></summary>

- `src/vertex/core/auth/oauth-session.ts` [NEW]
- `src/vertex/components/features/auth/google-auth-section.tsx` [NEW]
- `src/vertex/app/api/auth/[...nextauth]/options.ts` [MODIFIED]
- `src/vertex/core/auth/authProvider.tsx` [MODIFIED]
- `src/vertex/app/login/page.tsx` [MODIFIED]
- `src/vertex/components/layout/topbar.tsx` [MODIFIED]
- `src/vertex/components/shared/button/ReusableButton.tsx` [MODIFIED]
- `src/vertex/package.json` [MODIFIED]
- `src/vertex/components/features/org-picker/organization-picker.tsx` [MODIFIED]
- `src/vertex/components/layout/AppDropdown.tsx` [MODIFIED]
- `src/vertex/app/globals.css` [MODIFIED]

</details>

---

## Version 1.23.37
**Released:** May 04, 2026

### New Feature: Integrated Feedback & Issue Reporting System

Introduced a brand-new, native feedback submission module for Vertex, providing users with a structured way to report issues or suggest product improvements directly from the dashboard.

<details>
<summary><strong>New Features (4)</strong></summary>

- **Initial Launch of Feedback Launcher**: Deployed a persistent feedback trigger in the top navigation bar, enabling users to share thoughts from any page in the platform.
- **Structured Multi-Step Flow**: Implemented a guided experience where users first categorize their feedback ("Report an issue" vs "Suggest an idea") to ensure high-quality submissions.
- **Contextual Action Reporting**: When reporting issues, users can select from a predefined list of Vertex actions (e.g., Claiming Devices, Sharing Data) to provide immediate context for troubleshooting.
- **Automated Identity Attribution**: Integrated silent email retrieval from the user's active session context, eliminating the need for manual contact information entry.

</details>

<details>
<summary><strong>Technical Details (3)</strong></summary>

- **Core UI Foundation**: Built using Vertex's internal component library (`ReusableDialog`, `ReusableInputField`, `ReusableSelectInput`, and `ReusableToast`) to ensure a seamless and premium look and feel.
- **Dynamic Category Mapping**: Implemented an intelligent mapping layer that routes submissions to the correct backend categories (`bug` vs `feature_request`) while preserving contextual details in the subject line.
- **Branded Rating Component**: Integrated a customizable star-rating system that leverages the application's primary blue theme with custom outline/filled states.

</details>

<details>
<summary><strong>Files Created/Modified (5)</strong></summary>

- `src/vertex/components/features/feedback/feedback-launcher.tsx` [NEW]
- `src/vertex/components/features/feedback/feedback-dialog.ts` [NEW]
- `src/vertex/core/apis/feedback.ts` [NEW]
- `src/vertex/components/layout/topbar.tsx` [MODIFIED]
- `src/vertex/components/layout/layout.tsx` [MODIFIED]

</details>

---

## Version 1.23.36
**Released:** May 04, 2026

### Production Authentication Middleware Fix

Resolved a critical authentication redirect loop in production environments caused by a proxy protocol mismatch when reading session cookies.

<details>
<summary><strong>Authentication Fixes (1)</strong></summary>

- **NextAuth Middleware Refactor**: Rewrote `middleware.ts` to use NextAuth's `withAuth` wrapper. This explicitly passes the custom production session cookie name to the middleware, preventing `getToken` from defaulting to the HTTP cookie name when Next.js receives requests through a reverse proxy. Unauthenticated users are now correctly redirected to `/login`, and authenticated users correctly access protected routes like `/home`.
- **Backend JWT Expiry Sync**: Enhanced NextAuth options to actively check if the backend JWT has expired inside the NextAuth `session` callback. If the backend token expires, the NextAuth session is immediately invalidated, preventing users from lingering in a "logged in" state with a dead backend token.

</details>

<details>
<summary><strong>Logout Architecture Hardening (3)</strong></summary>

- **Logout Concurrency Lock**: Upgraded `useLogout` to use a module-level singleton Promise (`sharedLogoutPromise`). This guarantees that rapid double-clicks or simultaneous 401 triggers only execute the logout logic exactly once, preventing race conditions.
- **Robust Storage Clearing**: Refactored `clearSessionData` from an "Explicit Allow" approach to a "Default Deny" approach. It now iteratively scans `localStorage` and deletes everything except explicitly whitelisted cross-tab keys (like remembered accounts and NextAuth tokens), closing potential data leaks when new cached items are added.
- **Redux Persist Purging**: Switched from manually deleting `localStorage.removeItem("persist:user")` to correctly calling the official `await persistor.purge()` API for stable state clearance.

</details>

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `middleware.ts`
- `app/api/auth/[...nextauth]/options.ts`
- `core/hooks/useLogout.ts`
- `core/utils/sessionManager.ts`

</details>

---

## Version 1.23.35
**Released:** May 03, 2026

### Sites Management Overview & Contextual Navigation

Introduced a centralized Sites management module for standard users and organizations, bridging the gap between admin-only site management and organizational asset visibility.

<details>
<summary><strong>New Features (4)</strong></summary>

- **Sites Overview Page**: Created a new management dashboard (`/sites/overview`) featuring site statistics, searchable tables, and site creation workflows tailored for standard user contexts.
- **Contextual Site Details**: Implemented a user-facing site details page (`/sites/[id]`) that mirrors the rich administrative interface, allowing users to view metadata, app settings, and telemetry for their specific sites.
- **Granular Scoped Fetching**: Enhanced the sites data hook to automatically resolve cohort-based visibility, ensuring users only manage sites they own or have access to in their active context.
- **Dynamic Site Redirection**: Added contextual routing logic to device location cards that intelligently navigates to either the Admin or User sites view based on the current browsing context.

</details>

<details>
<summary><strong>Core Improvements (2)</strong></summary>

- **Reusable Management Components**: Refactored `SitesTable` and `CreateSiteForm` to support customizable base paths, enabling seamless reuse across administrative and organizational modules.
- **Unified Site ID Resolution**: Standardized site identification to use nested site objects instead of flat ID fields, ensuring robust navigation and data consistency.
- **Site ID Copy Feature**: Added a convenient copy-to-clipboard button for Site IDs in the site information card to match the Cohort management experience.
- **Sidebar Clarity**: Renamed "Assets" to "Devices" in the organization view to provide a clear distinction from the new "Sites" management section.

</details>

<details>
<summary><strong>Files Modified (9)</strong></summary>

- `app/(authenticated)/sites/overview/page.tsx`
- `app/(authenticated)/sites/[id]/page.tsx`
- `core/hooks/useSites.ts`
- `components/features/sites/sites-list-table.tsx`
- `components/features/sites/create-site-form.tsx`
- `components/features/devices/device-location-card.tsx`
- `core/hooks/useUserContext.ts`
- `components/layout/secondary-sidebar.tsx`
- `core/routes.ts`

</details>

---

## Version 1.23.34
**Released:** May 03, 2026

### Granular Network Visibility & Cohort Privacy Management

Introduced individual visibility controls for organization cohorts, allowing for granular privacy management. The update includes a redesigned visibility dashboard with support for mixed visibility states and guarded confirmation workflows.

<details>
<summary><strong>Privacy & Visibility (4)</strong></summary>

- **Individual Cohort Toggles**: Replaced the global organization visibility toggle with per-cohort switches, enabling fine-grained control over which device groups are public or private.
- **Custom Visibility Dashboard**: Introduced a "Custom Visibility Settings" state and description for organizations with mixed public/private cohorts, ensuring clear status communication.
- **Dynamic Status Indicators**: Added `Globe` (All Public), `Lock` (All Private), and `Shield` (Custom/Mixed) status icons with corresponding descriptions to provide clear context of the organization's privacy stance.
- **Guarded Visibility Updates**: Every visibility change is now protected by a confirmation dialog that identifies the specific cohort by name and explains the impact of the change.

</details>

<details>
<summary><strong>UI/UX Improvements (1)</strong></summary>

- **Enhanced Cohort List**: Refined the cohort list layout with status indicators, responsive grid support, and hover effects for better scannability and interaction.

</details>

<details>
<summary><strong>Files Modified (1)</strong></summary>

- `components/features/home/network-visibility-card.tsx`

</details>

---

## Version 1.23.33
**Released:** April 29, 2026

### Network Request Submission Fix, Azure Preview Auth Hardening & Error Handling

Fixed a critical staging-environment bug where submitting a new sensor manufacturer request produced a 404 due to a malformed URL, removed obsolete custom auth cookie handling after the SSO rollback, hardened Azure preview NextAuth configuration, and improved error propagation across the network request API route handlers.

<details>
<summary><strong>Bug Fixes (7)</strong></summary>

- **Network Request 404 in Staging**: Resolved a critical bug where clicking "Request New Sensor Manufacturer" in staging produced the malformed URL `/devices/undefineddevices/network-creation-requests`. Root cause: `NEXT_PUBLIC_API_URL` was not injected at build time, causing the client-side URL construction to silently embed `"undefined"`. Fixed by routing the POST through a new Next.js API route handler, removing the env-var dependency from the client entirely.
- **Route Handler Error Shape Mismatch**: Fixed the GET handler at `/api/devices/network-creation-requests` always returning a 500 status. The handler was reading `err.response?.data` and `err.response?.status`, but `networkService` throws errors with `err.data` and `err.status` attached directly. Actual error details from the backend were being silently dropped.
- **Consistent Error Shape on Action Route**: Applied the same error shape fix to the PUT handler at `/api/devices/network-creation-requests/[id]/[action]/route.ts` to ensure backend error payloads and status codes are correctly surfaced.
- **Malformed JSON Handling**: Updated the public POST handler at `/api/devices/network-creation-requests` to return `400` for invalid JSON payloads instead of falling through to the generic internal server error path.
- **Backend Validation Message Preservation**: Preserved backend error payloads from failed network request submissions and taught `getApiErrorMessage` to extract messages from both Axios-style `response.data` and fetch/custom `error.data` shapes.
- **Slack Logging Noise in Preview**: Updated `/api/log-to-slack` to skip cleanly when `SLACK_WEBHOOK_URL` is not configured, preventing logging failures from adding extra 500s to the browser console.
- **"undefined" in Requester Name Pre-fill**: Fixed an edge case where the `requester_name` field in the submission dialog could display `"undefined undefined"` if `firstName` or `lastName` was missing from the user's profile. Replaced the template literal with a `.filter().join()` approach that safely omits missing name parts.

</details>

<details>
<summary><strong>Refactors & Hardening (7)</strong></summary>

- **Server-Side URL Construction**: Added a `submitNetworkRequest` method to `networkService` that builds the backend URL server-side via `getApiBaseUrl()`, which always resolves correctly in a server context regardless of staging environment variable configuration.
- **New Public POST Route Handler**: Added a `POST` handler to `/api/devices/network-creation-requests/route.ts` that proxies public submission requests to the backend with no auth requirement, matching the public nature of the endpoint.
- **Collocated Mutation Logic**: Removed the intermediate `useSubmitNetworkRequest` hook and `submitNetworkRequestApi` client API method. The `useMutation` + `fetch` logic is now inlined directly in `NetworkRequestDialog`, removing unnecessary abstraction layers for a straightforward, single-use call.
- **Outbound Request Timeout**: Added an `AbortController` timeout to `networkService.submitNetworkRequest` so slow or unresponsive backend calls fail with a controlled `504` response instead of hanging the route handler.
- **NextAuth Cookie Defaults Restored**: Removed Vertex's custom session cookie override and matching middleware cookie-name lookup now that cross-subdomain SSO cookie sharing is no longer needed. NextAuth now manages session cookie naming and retrieval through its defaults.
- **Azure Preview NextAuth URL Hardening**: The Azure preview workflow now computes the per-PR Container Apps URL before build, writes `NEXTAUTH_URL`, `NEXTAUTH_URL_INTERNAL`, and `AUTH_TRUST_HOST=true` into the image `.env`, and also injects them at runtime.
- **Preview Auth Health Check**: Added a post-deploy check against `/api/auth/providers` so broken NextAuth preview deployments fail fast and print recent Container App logs instead of silently publishing an unusable preview.

</details>

<details>
<summary><strong>Files Modified (11)</strong></summary>

- `.github/workflows/deploy-frontend-azurepreview.yml`
- `app/api/devices/network-creation-requests/route.ts`
- `app/api/devices/network-creation-requests/[id]/[action]/route.ts`
- `app/api/auth/[...nextauth]/options.ts`
- `app/api/log-to-slack/route.ts`
- `middleware.ts`
- `core/services/network-service.ts`
- `core/apis/networks.ts`
- `core/hooks/useNetworks.ts`
- `core/utils/getApiErrorMessage.ts`
- `components/features/networks/network-request-dialog.tsx`

</details>

---

## Version 1.23.32

**Released:** April 27, 2026

### Cohort Performance Optimization & Request Stability

Optimized cohort-based data fetching by migrating to cached endpoints and implementing request cancellation and stability patterns to prevent timeouts and redundant network traffic.

<details>
<summary><strong>Performance Improvements (3)</strong></summary>

- **Cached Cohort Endpoints**: Migrated device and site fetching to the new `/cached-devices` and `/cached-sites` endpoints, significantly reducing response times for large organizations.
- **Request Stability with `useMemo`**: Memoized query parameters in the `useDevices` and `useSites` hooks and UI components to prevent redundant API calls triggered by object reference changes during re-renders.
- **Request Cancellation**: Integrated `AbortController` support into the API and hook layers, allowing the application to automatically cancel stale in-flight requests when filters or search terms change.

</details>
<summary><strong>Technical Changes (3)</strong></summary>

- **Type Safety**: Updated `DevicesSummaryResponse` and `SitesSummaryResponse` to support the new `cache_generated_at` timestamp.
- **Hook Optimization**: Updated `useDevices`, `useSites`, and `useCohorts` to pass the `AbortSignal` from React Query to the API client.
- **UI Refinement**: Memoized the options object in `DevicesTable` to ensure stable query triggers.

</details>

<details>
<summary><strong>Files Modified (8)</strong></summary>

- `core/apis/devices.ts`
- `core/apis/sites.ts`
- `core/apis/cohorts.ts`
- `core/hooks/useDevices.ts`
- `core/hooks/useSites.ts`
- `core/hooks/useCohorts.ts`
- `app/types/devices.ts`
- `components/features/devices/device-list-table.tsx`

</details>

---

## Version 1.23.31
**Released:** April 27, 2026

### Site Metadata Refresh & Grid Admin Level Management

Introduced on-demand site metadata enrichment and comprehensive administrative level management for grids, along with critical UI refinements for device status and maintenance tracking.

<details>
<summary><strong>Site & Grid Management (3)</strong></summary>

- **On-Demand Site Refresh**: Added a "Refresh Metadata" action to site details, allowing operators to trigger a full re-enrichment of site data (Google Maps, TAHMO, Grids) with intelligent feedback for partial success states.
- **Admin Level CRUD**: Implemented a complete management workflow for grid administrative levels, including creation, listing with copiable IDs, and inline editing via a new centralized management modal.
- **Dropdown Management Interface**: Integrated a new management dropdown on the Grids page to provide quick access to administrative level controls without cluttering the main workspace.
</details>

<details>

<summary><strong>Device UI & Logic Refinements (2)</strong></summary>

- **Missed Maintenance Indicators**: Overhauled the `MaintenanceStatusCard` to explicitly highlight missed maintenance tasks (past dates) using red status bars, secondary warning icons, and "Missed" badges for immediate operator awareness.
- **Robust Telemetry Fallbacks**: Updated the `RunDeviceTestCard` to intelligently fall back to `timestamp` data when `created_at` metadata is missing, preventing "unknown" states during device diagnostics.

</details>

<details>

<summary><strong>Technical Improvements (4)</strong></summary>

- **Intelligent Cache Invalidation**: Optimized the `useRefreshSiteMetadata` hook to perform immediate cache updates followed by targeted invalidation, ensuring site data is consistently fresh across the application.
- **Standardized Management Modals**: Leveraged `ReusableDialog` for administrative level management to maintain design consistency and support complex nested interactions.
- **Enhanced Toast Feedback**: Refined notification logic to distinguish between successful, partial, and redundant (already complete) metadata enrichment cycles.
- **Telemetry Parameter Filtering**: Cleaned up the technical parameters display in device tests to exclude redundant timing metadata, focusing on actionable device data.

</details>

<details>

<summary><strong>Files Modified (10)</strong></summary>

- `app/(authenticated)/admin/sites/[id]/page.tsx`
- `app/(authenticated)/admin/grids/page.tsx`
- `components/features/devices/maintenance-status-card.tsx`
- `components/features/devices/run-device-test-card.tsx`
- `components/features/grids/create-admin-level.tsx`
- `components/features/grids/admin-levels-modal.tsx`
- `core/apis/sites.ts`
- `core/apis/grids.ts`
- `core/hooks/useSites.ts`
- `core/hooks/useGrids.ts`

</details>

---

## Version 1.23.30
**Released:** April 27, 2026

### Device Deployment Enhancements

Introduced a robust device deployment component with support for deploying to both new and previous locations, along with associated API payload fixes.

<details>
<summary><strong>Device Deployment (3)</strong></summary>

- **Device Deployment Component Updates**: Updated the existing device deployment component and associated API definitions to support registering device installations to previous locations.
- **Deploy to Previous Location**: Added the ability to seamlessly deploy devices to previously used locations, auto-filling coordinates and site details.
- **Deployment API Payload Fixes**: Resolved an issue where `site_name` was stripped from the deployment API payload when a previous `site_id` was provided.

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `components/features/devices/deploy-device-component.tsx`
- `core/apis/devices.ts`
- `core/hooks/useDevices.ts`
- `app/changelog.md`

</details>

## Version 1.23.29
**Released:** April 22, 2026

### Device Exports & Recall History Site Details

Improved table export controls (including extra export fields) and enhanced device recall activity entries to show previous deployment site details.

<details>
<summary><strong>Table Export (4)</strong></summary>

- **Extra Export Fields in Modal**: Additional export fields now appear in the export column selector (grouped under “Extra fields”).
- **Reliable Site ID Export**: `site_id` export now resolves from either `device.site_id` or `device.site._id`.
- **Current-Page Export Only**: Export is limited to the current table page, with a short banner explaining what will be downloaded.
- **Consistent Banner Copy**: Normalized apostrophes and messaging for a consistent export experience.

<summary><strong>Device Activity (3)</strong></summary>

- **Previous Site on Recalls**: Recall entries can show a “Previous site” section.
- **Collapsible Details + Copy**: Clicking the site name expands to show the Site ID with a copy button (with proper clipboard error handling).
- **Safer Site Inference**: Tightened activity matching and prevented site inference across recall boundaries.

<summary><strong>Types (1)</strong></summary>

- **`previous_sites` Shape**: Updated typing to support object entries (with backward-compatible string support).

<summary><strong>Files Modified (9)</strong></summary>

- `app/types/devices.ts`
- `components/features/devices/device-activity-item.tsx`
- `components/features/devices/device-details-layout.tsx`
- `components/features/devices/device-history-card.tsx`
- `components/features/devices/device-list-table.tsx`
- `components/features/devices/utils/table-columns.tsx`
- `components/shared/table/ReusableTable.tsx`
- `components/shared/table/TableExportModal.tsx`
- `app/changelog.md`

</details>

---

## Version 1.23.28
**Released:** April 18, 2026

### Mandatory Org Setup, Navigation Shimmer, and Performance Optimization

Introduced a forced organization setup flow for new workspaces, enhanced navigation feedback with global shimmer transitions, and optimized core switching performance.

<details>
<summary><strong>Mandatory Organization Setup (3)</strong></summary>

- **Forced Setup Flow**: Implemented a non-dismissible organization setup workflow for external organizations that haven't created any cohorts yet, ensuring a consistent onboarding experience.
- **Introductory Experience**: Added a new "Intro" view to the `OrganizationSetupDialog` to guide users through the benefits of workspace configuration.
- **Dialog Persistence**: Enhanced `ReusableDialog` with `preventDismiss` support to enforce critical workflows by disabling backdrop and Escape-key closures.

</details>

<details>
<summary><strong>Navigation & Performance (4)</strong></summary>

- **Instant Organization Switching**: Overhauled the organization picker to provide instantaneous UI feedback, moving heavy cache management and navigation to the background.
- **Global Navigation Shimmer**: Integrated a top-aligned shimmer bar that provides immediate visual feedback during all route transitions and module switches.
- **Smooth Page Transitions**: Leveraged `framer-motion` to implement global fade-in transitions between pages, improving the perceived quality of navigation.
- **Optimistic Module Switching**: Improved the responsiveness of the module switcher (Devices vs. Admin) by updating UI state immediately upon selection.

</details>

<details>
<summary><strong>UI Stability & Infrastructure (3)</strong></summary>

- **Z-Index Harmonization**: Resolved stacking context issues between `OrganizationModal` and `ReusableDialog` to ensure overlays always render correctly over navigation elements.
- **Preview Authentication Fix**: Resolved persistent login failures in `vertex` previews by stripping static `NEXTAUTH_URL` values, enabling `AUTH_TRUST_HOST=true`. Added a dynamic host inference wrapper in the auth route to handle Azure Container Apps dynamic URLs.
- **Layout Robustness**: Refined the root layout structure to isolate the `OrganizationSetupBanner` from the main scroll container, preventing layout shifts during onboarding.

</details>

<details>
<summary><strong>Files Modified (8+)</strong></summary>

- `src/vertex/components/features/cohorts/organization-setup-dialog.tsx`
- `src/vertex/components/features/org-picker/organization-picker.tsx`
- `src/vertex/components/layout/layout.tsx`
- `src/vertex/components/layout/organization-setup-banner.tsx`
- `src/vertex/components/shared/dialog/ReusableDialog.tsx`
- `.github/workflows/deploy-frontend-pr-previews.yml`
- `src/vertex/components/features/org-picker/organization-modal.tsx`

</details>

---

## Version 1.23.27
**Released:** April 16, 2026

### Native Sensor Manufacturer Requests & Dashboard Overhaul

Replaced the legacy Google Form workflow with a native, standalone administrative dashboard for managing new sensor manufacturer requests, featuring a tabbed navigation system and centralized review controls.

<details>
<summary><strong>Admin Request Dashboard (5)</strong></summary>

- **Status-Tabbed Layout**: Introduced a new standalone dashboard at `/admin/networks/requests` with tabs for `Pending`, `In Review`, `Approved`, `Denied`, and `All`.
- **Real-time Status Counts**: Dynamic count badges integrated into each status tab for immediate visibility of the requests queue.
- **Centralized Admin Control**: Approval and denial workflows (including reviewer notes) are now managed globally at the page level for improved data integrity.
- **Streamlined UI**: Removed redundant navigation elements (back buttons, search bars) to create a focused, high-density management interface.
- **UI System Standardization**: Refined the `Tabs` component styling to mirror `ReusableButton` behavior (Filled for active states, Outlined for inactive).
- **Optimized Actions**: Standardized the use of `ReusableButton` for administrative actions like refreshing the request queue.

</details>

<details>
<summary><strong>Navigation & Integration (3)</strong></summary>

- **Multi-Sidebar Integration**: Added dedicated entry points for "Manufacturer Requests" in both the Primary and Secondary sidebars.
- **Icon Set Expansion**: Integrated `AqFileQuestion02` for requests and updated Sensor Manufacturers to use `AqCpuChip01` for better visual distinction.
- **Strict Route Highlighting**: Implemented precise pathname matching in sidebars to ensure clear visual feedback when navigating between management modules.

</details>

<details>
<summary><strong>UI/UX Improvements (4)</strong></summary>

- **Instant Organization Switching**: Optimized the organization picker to close instantly and handle cache management in the background, providing a seamless transition experience.
- **Search System Fix**: Resolved a critical synchronization glitch in the `ReusableTable` component that caused characters to be erased or reverted during rapid typing and backspacing.
- **UI System Standardization**: Refined the `Tabs` component styling to mirror `ReusableButton` behavior (Filled for active states, Outlined for inactive).
- **Docusaurus Config Optimization**: Streamlined the documentation site configuration by cleaning up unused plugins and refining navigation headers.

</details>

<details>
<summary><strong>Codebase Maintenance (3)</strong></summary>

- **Map-Readings Cleanup**: Removed the legacy Map-Readings types, API definitions, hooks, and utilities to reduce technical debt.
- **Type Safety Hardening**: Resolved over a dozen TypeScript and linting errors, focusing on unused imports and removing unnecessary `any` types.
- **API Response Refinement**: Updated Cohort API typing to better reflect backend response structures and ensure reliable data handling.

</details>

<details>
<summary><strong>Files Modified (16+)</strong></summary>

- `app/(authenticated)/admin/networks/page.tsx`
- `app/(authenticated)/admin/networks/requests/page.tsx`
- `app/api/network/requests/route.ts`
- `app/api/network/requests/[id]/[action]/route.ts`
- `components/features/networks/network-request-dialog.tsx`
- `components/features/networks/request-table.tsx`
- `components/layout/primary-sidebar.tsx`
- `components/layout/secondary-sidebar.tsx`
- `core/apis/networks.ts`
- `core/hooks/useNetworks.ts`
- `core/routes.ts`
- `app/changelog.md`

</details>

---

## Version 1.23.26
**Released:** April 09, 2026

### Login Copy Refresh, Windows-Only Downloads, and Info Banner Component

Refined the login messaging, limited desktop downloads to Windows, and introduced a reusable Info Banner to standardize contextual messaging.

<details>
<summary><strong>Login Experience (3)</strong></summary>

- **Updated Hero Copy**: Refreshed the login title and subtitle messaging to emphasize device deployment and data sharing.
- **Two-Line Title Layout**: Split the login title across two lines for clearer visual hierarchy.
- **Windows-Only Download**: Limited the login download button to Windows devices only.

</details>

<details>
<summary><strong>Navigation & Sidebar (3)</strong></summary>

- **Sidebar Download Restriction**: Secondary sidebar download button now appears only on Windows.
- **macOS Logic Removal**: Removed macOS detection/architecture logic tied to download visibility.
- **Centralized Download Link**: Desktop download URL now comes from a shared constant to keep sidebar and login in sync.

</details>

<details>
<summary><strong>UI Components (3)</strong></summary>

- **Info Banner Component**: Added a reusable banner component (matching Platform) to Vertex UI.
- **Context Header Upgrade**: Updated the home context header to use the new Info Banner.
- **Severity-Aware Live Regions**: Non-error banners now announce politely to reduce screen reader noise.

</details>

<details>
<summary><strong>Files Modified (6)</strong></summary>

- `app/login/page.tsx`
- `components/layout/secondary-sidebar.tsx`
- `components/ui/banner.tsx`
- `components/features/home/context-header.tsx`
- `core/constants/app-downloads.ts`
- `app/changelog.md`

</details>

---

## Version 1.23.25
**Released:** April 09, 2026

### Desktop Title Bar Branding & Visual Alignment

Improved the desktop title bar to better match the main app styling and official branding.

<details>
<summary><strong>Desktop UI Enhancements (4)</strong></summary>

- **AirQo Logo in Title Bar**: Title bar now renders the packaged AirQo icon (with web fallback) instead of a placeholder mark.
- **Background Match**: Title bar background now follows the app background color token for light/dark consistency.
- **Cleaner Edge**: Removed the bottom border from the desktop title bar for a seamless blend into the app canvas.
- **Native Window Controls Alignment**: Title bar reserves space for native window controls while keeping app controls interactive.

</details>

<details>
<summary><strong>Desktop Shell Integration (2)</strong></summary>

- **Root Layout Injection**: Desktop title bar now mounts from the root client layout to persist across page transitions.
- **Stable Header Hook**: Added `data-vertex-topbar` to the login header for desktop layout alignment.

</details>

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `app/client-layout.tsx`
- `app/login/page.tsx`
- `components/layout/desktop-titlebar.tsx`
- `types/vertex-desktop.d.ts`

</details>

---

 ## Version 1.23.24
 **Released:** April 07, 2026
 
 ### Login Page Revamp & Context Header Redesign
 
 Redesigned the login experience for better branding and added a personalized, permanent context header to the dashboard to improve user orientation.
 
 <details>
 <summary><strong>Login Experience (5)</strong></summary>
 
 - **Sticky Topbar**: Introduced a compact, sticky `h-12` topbar to keep branding consistently visible while scrolling.
 - **Platform-Aware Download Link**: Moved the desktop app download link to the topbar; it now automatically detects the user's OS and provides the appropriate `.exe` or `.dmg`.
 - **Dynamic Brand Icons**: Added high-fidelity OS-specific icons (Apple logo for Mac, Windows squares for Win) to the download button for immediate visual feedback.
 - **Adaptive Labels**: The button label now explicitly reflects the user's platform (e.g., "Download for macOS" vs "Download for Windows").
 - **Mobile-Safe Interface**: The desktop download button is intelligently hidden on mobile browsers to reduce clutter on non-desktop platforms. 
 
 </details>
 
 <details>
 <summary><strong>Dashboard UX (6)</strong></summary>
 
 - **Personalized Greeting**: Introduced a "Hi, {Name} 👋" greeting in the dashboard header using Redux-backed user details.
 - **Permanent Context Header**: Redesigned the `ContextHeader` into a non-dismissible, light blue alert component that explicitly clarifies which organizational or personal workspace is active.
 - **Robust Context Guarding**: Implemented strict property guarding for `activeGroup` to prevent "undefined workspace" during initial load or context switches.
 - **Integrated Description**: Merged the workspace title and description into a unified information box with a clean `Info` icon and consistent blue styling.
 - **Sidebar Download Access**: Added a "Download for {OS}" button to the secondary sidebar footer (expanded view) for quick access to the desktop version.
 - **Adaptive Environment Check**: Implemented Electron and macOS architecture detection (ARM64 vs Intel) to hide the download button for Intel Mac and desktop app users.
 
 </details>
 
 <details>
 <summary><strong>Home Empty State (2)</strong></summary>
 
 - **Header Integration**: Added the `ContextHeader` to the `HomeEmptyState` component so users maintain context even when their device list is empty.
 - **Layout Refinement**: Optimized the empty state vertical padding and ensured the header remains pinned to the top while the call-to-action remains centered.
 
 </details>
 
 <details>
 <summary><strong>Files Modified (7)</strong></summary>
 
 - `app/login/page.tsx`
 - `components/features/home/context-header.tsx`
 - `components/features/home/HomeEmptyState.tsx`
 - `components/layout/secondary-sidebar.tsx`
 - `core/utils/platform.ts`
 - `app/globals.css`
 - `app/changelog.md`
 
 </details>
 
 ---

## Version 1.23.23
**Released:** March 19, 2026

### Cohort Naming Workflow, Tag-Driven Forms, and Auth Stability

<details>
<summary><strong>Improvements (6)</strong></summary>

- **Cohort Name Composition**: Organizational cohorts now build names from `city_project_funder` with sanitized input and live preview.
- **Tag-Driven Inputs**: Tag selection is now first, and only the `organizational` tag requires city/project/funder inputs.
- **Edit Cohort Behavior**: Organizational cohorts use the new naming endpoint with update reason; non‑organizational cohorts update via the original name edit path.
- **Input Guardrails**: Special characters (including spaces) are ignored as users type, with a lightweight tooltip.
- **Responsive Layout**: Cohort naming inputs render 3-up on desktop, 2-up on tablet, and 1-up on mobile.
- **Device Assignment Search**: Added device search to the assign‑devices modal with server-side filtering.

</details>

<details>
<summary><strong>Technical Changes (4)</strong></summary>

- **New Cohort Name Utilities**: Added shared helpers for building and parsing cohort names.
- **New Rename Hook**: Added `useUpdateCohortName` and API binding to the cohort naming endpoint.
- **Auth Cookie Isolation**: Switched dev session cookie name and aligned middleware token parsing.
- **Env Template Update**: Added NextAuth environment variables to the vertex example env file.

</details>

## Version 1.23.22
**Released:** February 25, 2026

### Cohort Import Confirmation & Personal Assignment Flow

Refined the "Import from Cohort" flow to add an explicit confirmation step and align personal imports with cohort assignment, plus fixed a React render loop in cohort details.

<details>
<summary><strong>Improvements (3)</strong></summary>

- **Cohort Import Confirmation**: Added a dedicated confirmation step after verifying Cohort ID, displaying the cohort name before assignment.
- **Personal Import Assignment**: Personal-scope imports now assign the cohort to the user (no claim-token entry), matching the intended assignment flow.
- **Reliable User Cohort Refresh**: Assignment to user now invalidates the `userDetails` query and `myDevices` to refresh cohort-aware views.

</details>

<details>
<summary><strong>Fixes (1)</strong></summary>

- **Cohort Details Render Loop**: Removed a default array prop that caused a `Maximum update depth exceeded` error on the cohort details page.

</details>

<details>
<summary><strong>Files Modified (3)</strong></summary>

- `components/features/cohorts/cohort-detail-card.tsx`
- `components/features/claim/claim-device-modal.tsx`
- `core/hooks/useCohorts.ts`

</details>

## Version 1.23.21
**Released:** February 20, 2026

### Managed Cohorts Tag Defaults & Admin Tags Visibility

Updated cohort tag behavior to improve Managed Cohorts filtering and make cohort tags visible directly in the admin cohorts table.

<details>
<summary><strong>Improvements (3)</strong></summary>

- **Managed Cohorts Default Filter**: Clicking the **Managed Cohorts** tab now defaults to the `organizational` tag instead of `All`, so users immediately see organizational cohorts.
- **Tag Rename to Misc**: Replaced the previous `external device` cohort tag option with `misc` (both value and label) for cleaner categorization.
- **Admin Table Tag Visibility**: Added a **Tags** column to the admin cohorts table to display each cohort's tags as badges.

</details>

<details>
<summary><strong>Files Modified (2)</strong></summary>

- `app/(authenticated)/admin/cohorts/page.tsx`
- `core/constants/devices.ts`

</details>

## Version 1.23.20
**Released:** February 20, 2026

### Device Details Runtime Stability Fix

Fixed a production runtime crash on the admin device details route caused by non-string values being passed into string/date parsing paths.

<details>
<summary><strong>Fixes (2)</strong></summary>

- **Crash Prevention in Date Parsing**: Added strict runtime type guards before calling `parseISO(...)` in device detail cards to avoid `TypeError: e.split is not a function` when API fields are not strings.
- **Safe Organization Name Formatting**: Hardened organization/group name rendering in device table columns to avoid calling `.split("_")` on non-string values.

</details>

<details>
<summary><strong>Technical Changes (2)</strong></summary>

- Introduced guarded date parsing paths in maintenance, activity, and device-status feed components.
- Added resilient fallback formatting for non-string group values in device table column rendering.

</details>

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `components/features/devices/maintenance-status-card.tsx`
- `components/features/devices/device-activity-item.tsx`
- `components/features/devices/run-device-test-card.tsx`
- `components/features/devices/utils/table-columns.tsx`

</details>

## Version 1.23.19
**Released:** February 18, 2026

### Cohort Tag Management & Managed View

Refactored Cohort Tags to use a restricted multi-select system and overhauled the Managed Cohorts view with tag-based filtering and URL synchronization.

<details>
<summary><strong>Managed Cohorts View (3)</strong></summary>

- **Renamed View**: The "Organization Cohorts" view has been renamed to **"Managed Cohorts"** to better reflect its purpose.
- **Tag Filtering**: Introduced a tabbed filter bar for Managed Cohorts, allowing users to filter cohorts by category (e.g., "Organizational", "Individual").
- **URL Synchronization**: Selected tags are now synced with the URL query parameter (`?tags=...`). The first available tag is selected by default if no parameter is present, ensuring a predictable initial state.

</details>

<details>
<summary><strong>Cohort Tags Refactor (2)</strong></summary>

- **Restricted Multi-Select**: Transitioned all cohort tag inputs (Create, Edit, Create from Selection) to a **Restricted Multi-Select** model. Users can select multiple tags but are restricted to the predefined list, preventing the creation of arbitrary tags.
- **Array-Based Schema**: Updated form validation and API payloads to correctly handle tags as an array of strings, ensuring data consistency.

</details>

<details>
<summary><strong>Improvements (1)</strong></summary>

- **Device Deployment Feedback**: Enhanced the `useDeployDevice` hook to capture and display detailed error messages from the backend when deployments fail, improving troubleshooting visibility.

</details>

<details>
<summary><strong>Files Modified (9)</strong></summary>

- `app/(authenticated)/admin/cohorts/page.tsx`
- `components/features/cohorts/create-cohort.tsx`
- `components/features/cohorts/cohort-detail-card.tsx`
- `components/features/cohorts/create-cohort-from-cohorts.tsx`
- `core/hooks/useCohorts.ts`
- `core/hooks/useDevices.ts`
- `components/ui/multi-select.tsx`
- `core/apis/cohorts.ts`
- `core/constants/devices.ts`

</details>

## Version 1.23.18
**Released:** February 17, 2026

### Startup UX, Offline Resilience, Account Re-Login, and SSO Foundation

Reduced blank/slow startup perception, improved offline behavior, introduced remembered-account login flow, and added cross-subdomain SSO session groundwork.

<details>
<summary><strong>Startup & Performance (3)</strong></summary>

- **No Blank Rehydration Screen**: Updated Redux persist gate to render `SessionLoadingState` during initialization instead of `null`.
- **Clearer Loading Feedback**: Enhanced session loader with explicit "Loading workspace..." text for better perceived progress.
- **Faster Dev Boot Defaults**: Changed default dev script to non-inspect mode and added a dedicated `dev:inspect` script.

</details>

<details>
<summary><strong>Offline Resilience (3)</strong></summary>

- **Network Error Normalization**: Standardized no-response API failures to predictable `status: 0` responses for safer downstream handling.
- **Connectivity Events**: Added `vertex-network-degraded` and `vertex-network-recovered` events to reflect API-level connectivity state.
- **Offline-First Query Tuning**: Improved React Query defaults and bootstrap query retry policy to reduce startup stalls during poor connectivity.

</details>

<details>
<summary><strong>Authentication UX (2)</strong></summary>

- **Remembered Accounts**: Added secure remembered-account list (email/display info only, no password storage) on login page.
- **Quick Account Switching**: Added "Recently used accounts" selection, remove-account action, and "Use a different account" flow.

</details>

<details>
<summary><strong>Cross-Subdomain SSO Session Foundation (3)</strong></summary>
### Cross-Subdomain SSO Session Foundation

Added Vertex-side configuration for shared NextAuth sessions across AirQo subdomains to support seamless login reuse between products.

<details>
<summary><strong>Authentication Updates (3)</strong></summary>

- **Shared Cookie Domain Support**: Added optional `NEXTAUTH_COOKIE_DOMAIN` handling so the NextAuth session cookie can be set on a parent domain (for example, `.airqo.net`) and reused by sibling apps.
- **Explicit Secret Configuration**: Added `NEXTAUTH_SECRET` binding in auth options to ensure consistent token signing/decryption across apps participating in SSO.
- **Secure Cookie Behavior**: Enabled production-aware secure cookie behavior (`__Secure-next-auth.session-token` in production, standard cookie name in development).

</details>

<details>
<summary><strong>Documentation (1)</strong></summary>

- **Environment Variable Guide**: Added SSO-focused auth environment variable documentation for `NEXTAUTH_SECRET` and `NEXTAUTH_COOKIE_DOMAIN`.

</details>

<details>
<summary><strong>Desktop Layout Contract (1)</strong></summary>

- **Stable Layout Hooks**: Added `data-vertex-*` attributes on topbar/sidebars/main to provide a stable desktop wrapper integration contract.

</details>

<details>
<summary><strong>Desktop Application (5)</strong></summary>

- **Electron Wrapper Project**: Introduced the dedicated desktop project at `src/vertex-desktop` with isolated runtime/build configuration.
- **Desktop Runtime Architecture**: Added main-process modules for window lifecycle, updater integration, deep-link support, and permission handling.
- **Preload Bridge APIs**: Added typed desktop bridge APIs (for example, app version/retry actions) exposed via preload for safe renderer access.
- **Title Bar Overlay UX**: Added desktop title bar controls and overlay behavior tailored for wrapped Vertex navigation.
- **Windows Packaging & Installer**: Added Windows installer/package configuration and release workflow support for updater-ready artifacts.

</details>

<details>
<summary><strong>Desktop Release Notes (1)</strong></summary>

- **Detailed Desktop Changelog**: Desktop-specific release history is tracked in `src/vertex-desktop/CHANGELOG.md`.

</details>

<details>
<summary><strong>Files Modified (16)</strong></summary>

- `package.json`
- `app/providers.tsx`
- `app/login/page.tsx`
- `app/api/auth/[...nextauth]/options.ts`
- `core/auth/authProvider.tsx`
- `core/apis/axiosConfig.ts`
- `core/utils/secureApiProxyClient.ts`
- `core/hooks/useLogout.ts`
- `core/utils/rememberedAccounts.ts`
- `components/features/network-status-banner/index.tsx`
- `components/layout/loading/session-loading.tsx`
- `components/layout/topbar.tsx`
- `components/layout/primary-sidebar.tsx`
- `components/layout/secondary-sidebar.tsx`
- `components/layout/layout.tsx`
<summary><strong>Files Modified (2)</strong></summary>

- `app/api/auth/[...nextauth]/options.ts`
- `README.md`

</details>

---

## Version 1.23.17
**Released:** January 25, 2026

### Cohort Import Security & Accessibility Improvements

Restricted cohort imports ('airqo') and improved UI accessibility and validation logic across the platform.

<details>
<summary><strong>Security & Validation (2)</strong></summary>

- **Restricted Cohort Import**: Implemented validation to prevent users from importing the reserved "airqo" cohort. The system now checks the cohort name and blocks the import with a clear error message if it matches.
- **Strict ID Validation**: Enhanced the Cohort ID input validation to strictly enforce a 24-character alphanumeric format, preventing invalid inputs (e.g., URLs) and ensuring data integrity.

</details>

<details>
<summary><strong>Device Management Enhancements (3)</strong></summary>

- **Add Device Flow**: Refactored the monolithic Add Device modal into distinct, modular steps (guided vs. fast mode), simplifying the overall onboarding experience for new hardware setups.
- **Smart Device Updating**: Consolidated device update actions into a single smart "Save" button in the device details modal that automatically routes to local or global (ThingSpeak) saving based on the device's sensor manufacturer.
- **Improved Validation**: Strengthened form validation and error handling across device creation and editing workflows.

</details>

<details>
<summary><strong>UI/UX Enhancements (2)</strong></summary>

- **Static Device Icons**: Fixed an issue where "Static Devices" were incorrectly displaying a car icon. The logic now prioritizes the explicit deployment category ("static") to ensure the correct Map Pin icon is shown.
- **Accessibility Labels**: Added `aria-label` attributes to icon-only buttons (e.g., Cohort Edit Button) to improve screen reader support and overall accessibility compliance.

</details>

<details>
<summary><strong>Files Modified (5)</strong></summary>

- `core/apis/cohorts.ts`
- `components/features/claim/claim-device-modal.tsx`
- `components/features/devices/device-category-card.tsx`
- `components/features/cohorts/cohort-detail-card.tsx`
- `components/features/cohorts/edit-cohort-details-modal.tsx`

</details>

---

## Version 1.23.16
**Released:** January 06, 2026

### Theme & Cohort UI Improvements

Standardized the application to default to Light Mode upon entry and refined the Cohort management UI for a cleaner editing experience.

<details>
<summary><strong>Theme Updates (2)</strong></summary>

- **Light Mode Default**: Updated the application configuration to default to **Light Mode** for all users, overriding system preferences to ensure a consistent initial experience.
- **Smart Theme Toggle**: Fixed the topbar theme toggle logic to correctly identify the active theme. Even when using system defaults, the toggle now intelligently displays the option to switch to the *alternative* mode (e.g., "Switch to Light Mode" if system is Dark).

</details>

<details>
<summary><strong>Cohort Management (2)</strong></summary>

- **Streamlined Editing**: Removed the redundant "Edit details" button from the Cohort Details card. Users can now edit cohort details by clicking a new **Edit Pen** icon located directly next to the cohort name.
- **Simplified Modal**: Refined the "Edit Cohort" modal to focus solely on renaming the cohort. Removed the "Visibility" field from this view to simplify the user workflow.

</details>

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `app/providers.tsx`
- `components/layout/topbar.tsx`
- `components/features/cohorts/cohort-detail-card.tsx`
- `components/features/cohorts/edit-cohort-details-modal.tsx`

</details>

---

## Version 1.23.15
**Released:** January 04, 2026

### Dark Mode & Type Safety Refinements

Polished the application's comprehensive dark mode experience and introduced
**cohort-level visibility controls**, alongside critical type safety improvements.

<details>
<summary><strong>Feature Updates (1)</strong></summary>

- **Cohort Visibility Toggle**: Moved the visibility management (Public vs
  Private) directly onto the **Cohort Details Card**. Users can now toggle a
  cohort's visibility with a switch, complete with a confirmation dialog
  explaining the privacy implications.

</details>

<details>
<summary><strong>UI Enhancements (3)</strong></summary>

- **Dark Mode Styling**:
  - **Sidebar**: Standardized active state navigation to use a branded dark blue
    theme (`dark:bg-blue-900/20`, `dark:text-blue-500`) across both Primary and
    Secondary sidebars, ensuring high contrast and consistency.
  - **Topbar**: Aligned the menu button hover state with the
    `OrganizationPicker` styling (`dark:hover:bg-primary/10`) for a unified
    look.
  - **Organization Modal**: Updated list items to use proper dark mode active
    states (`dark:bg-blue-900/20`) and text colors, preventing visibility
    issues on dark backgrounds.
  - **Network Visibility**: Refined the **Network Visibility Card** and Home
    Accordion styling to ensure borders and separators render correctly in dark
    mode (`dark:border-gray-600`).
  - **General UI**: Applied consistent dark mode border styling to various
    components including `Card`, `SiteInformationCard`, `CohortDetailCard`, and
    `SiteMobileAppCard`.
- **Toggle Refinement**: Updated the secondary sidebar collapse toggle to
  support dark mode with appropriate background and border colors
  (`dark:bg-zinc-950`, `dark:border-gray-700`).

</details>

<details>
<summary><strong>Fixes (2)</strong></summary>

- **Site Type Compatibility**:
  - **Mobile App Card**: Updated the `SiteMobileAppCard` local interface to
    accept optional properties (`search_name`, `location_name`, etc.), resolving
    a TypeScript assignment error with the global `Site` type.
  - **Robust Status Logic**: Updated `site-information-card.tsx` and
    `sites-list-table.tsx` to safely handle optional `isOnline` and
    `rawOnlineStatus` fields. preserved `undefined` values for
    `rawOnlineStatus` to respect semantic meaning (unknown status) rather than
    coercing to `false`.
  - **Edit Site Validation**: Added a safety check in
    `edit-site-details-dialog.tsx` to ensure `siteId` is present before
    submission, preventing type errors.
  - **Theme Provider Import**: Fixed the import path for `ThemeProviderProps` in
    `theme-provider.tsx` to resolve a module resolution error.
- **Lint Resolution**: Resolved an explicit `any` type in
  `client-paginated-sites-table.tsx` by correctly casting to the `Site`
  interface.

</details>

<details>
<summary><strong>Files Modified (13)</strong></summary>

- `components/layout/primary-sidebar.tsx`
- `components/layout/secondary-sidebar.tsx`
- `components/layout/NavItem.tsx`
- `components/layout/topbar.tsx`
- `components/features/org-picker/organization-modal.tsx`
- `components/features/sites/site-mobile-app-card.tsx`
- `components/features/sites/client-paginated-sites-table.tsx`
- `components/features/sites/edit-site-details-dialog.tsx`
- `components/features/home/network-visibility-card.tsx`
- `app/(authenticated)/home/page.tsx`
- `components/ui/card.tsx`
- `components/features/sites/site-information-card.tsx`
- `components/features/cohorts/cohort-detail-card.tsx`

</details>

---



## Version 1.23.14
**Released:** January 03, 2026

### Cohort Management Toggle & Performance

Optimized large-scale cohort device assignment performance and introduced a dedicated toggle for managing User vs Organization cohorts with decoupled counts.

<details>
<summary><strong>Feature Updates (1)</strong></summary>

- **Scope-Aware Cohort View**: Introduced a toggle on the Cohorts page (`/admin/cohorts`) allowing admins to switch between "Organization Cohorts" and "User Cohorts". Each view now displays an independent real-time count, styled with a distinct active/inactive design for clarity.

</details>

<details>
<summary><strong>Performance Improvements (2)</strong></summary>

- **Optimized Filtering**: Replaced O(n) array lookups with O(1) Set lookups in `assign-cohort-devices.tsx`, significantly improving filter performance when cross-referencing thousands of cohorts against organization permissions.
- **Stable UI Counts**: Decoupled the data fetching logic for User/Org cohort counts from the main table data. This ensures that the counts on the toggle buttons remain stable and do not flicker or reload when searching or paginating the table.

</details>

<details>
<summary><strong>Fixes (2)</strong></summary>

- **Loading States**: Fixed an issue where the cohort assignment modal would display incomplete filtered results while background permissions were still loading. The UI now properly accounts for all loading states.
- **Cache Consistency**: Implemented comprehensive cache invalidation for `['user-cohorts']` across all mutation hooks (create, update, assign/unassign), ensuring that the User Cohorts count is always accurate after any action.

</details>

<details>
<summary><strong>UI Enhancements (2)</strong></summary>

- **Refined Button Styles**: Updated the cohort toggle buttons to use a "Solid vs Outlined" style pattern (Blue background for active, transparent with border for inactive) for clearer state indication.
- **Loading Skeletons**: Added inline skeleton loaders to button counts to provide visual feedback during data fetching.

</details>

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `components/features/cohorts/assign-cohort-devices.tsx`
- `app/(authenticated)/admin/cohorts/page.tsx`
- `core/hooks/useCohorts.ts`
- `core/apis/cohorts.ts`

</details>

---



## Version 1.23.13
**Released:** December 22, 2025

### External Organization Permissions & Cohort Search Enhancements

Implemented strict permission controls for external organizations and enhanced the cohort selection experience with server-side search, debouncing, and loading states.

<details>
<summary><strong>Feature Updates (3)</strong></summary>

- **Organization-Scoped Cohorts**: External organization users now only see cohorts that belong to their organization when adding devices to cohorts. The system fetches organization cohort IDs and filters results client-side to ensure data isolation.
- **Server-Side Cohort Search**: Implemented debounced server-side search (300ms delay) in the cohort selection ComboBox, allowing users to search across all cohorts while maintaining organization-level filtering for external users.
- **Search Loading States**: Added 3 animated skeleton items to the cohort ComboBox during search, providing visual feedback while API requests are in progress.

</details>

<details>
<summary><strong>Permission Restrictions (1)</strong></summary>

- **Cohort Management Restrictions**: External organization users can now only **add devices to cohorts**, but cannot **remove devices from cohorts**. The "Remove from Cohort" action is hidden from device list table actions for external org contexts.

</details>

<details>
<summary><strong>UI/UX Improvements (2)</strong></summary>

- **Smart Empty State Handling**: The cohort ComboBox now correctly shows/hides the "No cohorts found" message based on search results, preventing it from appearing alongside actual results.
- **Smooth Search Experience**: Search now matches the polished experience of the cohorts table page with proper debouncing, preventing excessive API calls while maintaining responsive feedback.

</details>

<details>
<summary><strong>Technical Changes (5)</strong></summary>

- **ComboBox Enhancement**: Updated `combobox.tsx` to support server-side search via new `onSearchChange` and `isLoading` props, with `shouldFilter={false}` to disable internal Command filtering.
- **Debounced Search**: Implemented proper debounce pattern using separate state for `cohortSearch` and `debouncedCohortSearch` with 300ms timeout.
- **Organization Filtering**: Added `useGroupCohorts` hook integration to fetch organization-specific cohort IDs, then filter search results client-side using `useMemo`.
- **Search Optimization**: Removed `cohort_id` parameter from search API calls to allow searching across all cohorts before client-side filtering for external orgs.
- **Skeleton Component**: Integrated the `Skeleton` component to display loading placeholders during cohort data fetching.

</details>

<details>
<summary><strong>Files Modified (3)</strong></summary>

- `components/features/devices/device-list-table.tsx`
- `components/features/cohorts/assign-cohort-devices.tsx`
- `components/ui/combobox.tsx`

</details>

---

## Version 1.23.12
**Released:** December 20, 2025

### Site Statistics Optimization & Permission Enhancements

Optimized site statistics implementation to use a dedicated summary endpoint and enhanced permission handling for shipping access with fallback permissions.

<details>
<summary><strong>Performance Improvements (1)</strong></summary>

- **Efficient Stats Fetching**: Refactored site statistics to use the new `/devices/sites/summary/count` endpoint, replacing multiple parallel API calls with a single request. This significantly improves page load performance and reduces server load.

</details>

<details>
<summary><strong>Feature Updates (1)</strong></summary>

- **Flexible Shipping Access**: Added fallback permission logic for shipping access. Users with either `SHIPPING.VIEW` or `NETWORK.VIEW` permissions can now access the Shipping Management page, providing more flexible access control.

</details>

<details>
<summary><strong>UI/UX Improvements (1)</strong></summary>

- **Organization Modal Redesign**: Completely refactored the Organization Switcher modal to use the standardized `ReusableDialog` component with improved visuals matching the design system, including dynamic subtitle showing available organizations count and proper vertical scrolling for long lists.

</details>

<details>
<summary><strong>Technical Changes (4)</strong></summary>

- **API Update**: Added `getSitesSummaryCount` to `sites.ts` with corresponding `SitesSummaryCountResponse` interface.
- **Hook Optimization**: Simplified `useSiteStatistics` to use a single query instead of multiple parallel queries.
- **Permission System**: Enhanced `RouteGuard` to support multiple permissions via new `permissions` prop using OR logic.
- **Component Refactor**: Migrated `organization-modal.tsx` from custom dialog implementation to `ReusableDialog` with proper flex layout for scrolling.

</details>

<details>
<summary><strong>Files Modified (7)</strong></summary>

- `core/apis/sites.ts`
- `core/hooks/useSites.ts`
- `components/features/sites/site-stats-cards.tsx`
- `components/layout/accessConfig/route-guard.tsx`
- `app/(authenticated)/admin/shipping/page.tsx`
- `components/layout/primary-sidebar.tsx`
- `components/features/org-picker/organization-modal.tsx`

</details>

---

## Version 1.23.11
**Released:** December 19, 2025

### Robust Site Statistics

Fixed a critical regression in the Site Statistics component where missing metadata in API responses could cause the entire Sites page to crash.

<details>
<summary><strong>Fixes (1)</strong></summary>

- **Crash Prevention**: Refactored the `SiteStatsCards` component to implement robust data handling similar to `NetworkStatsCards`. The UI now safely calculates metrics from raw API data using `useMemo`, ensuring that unexpected API responses (missing metadata) default to zero instead of unwrapping `undefined` values.

</details>

<details>
<summary><strong>Files Modified (2)</strong></summary>

- `core/hooks/useSites.ts`
- `components/features/sites/site-stats-cards.tsx`

</details>

---

## Version 1.23.10
**Released:** December 19, 2025
### Cohort Import Refinements & Navigation Updates

Streamlined the cohort assignment flow for external organizations and improved navigation for device claiming.

<details>
<summary><strong>Feature Updates (2)</strong></summary>

- **Direct Cohort Assignment**: External Organizations now experience a seamless flow where verifying a Cohort ID directly triggers the assignment process, skipping the unnecessary bulk claim review step.
- **Navigation Update**: The "Claim Device" button on the Device Overview page now directs users to the dedicated Claim page (`/devices/claim`) for a unified experience.

</details>

<details>
<summary><strong>Improvements (3)</strong></summary>

- **Transition UX**: Added a 3-second simulated delay to the cohort assignment success state to prevent UI flashing and provide reassuring feedback.
- **Copy Refinement**: Updated button text from "Verify & Import" to "Import" on the Claim page for clarity.
- **Success Feedback**: Enhanced the success message for cohort assignments to clearly indicate completion and offer a direct link to view devices.

</details>

<details>
<summary><strong>Fixes (1)</strong></summary>

- **Modal Stability**: Resolved a regression where the `ClaimDeviceModal` would reset to the initial step mid-flow due to unintended re-renders.

</details>


<details>
<summary><strong>Files Modified (7)</strong></summary>

- `app/(authenticated)/devices/claim/page.tsx`
- `app/(authenticated)/devices/overview/page.tsx`
- `app/(authenticated)/home/page.tsx`
- `components/features/claim/claim-device-modal.tsx`
- `components/features/cohorts/cohorts-empty-state.tsx`
- `components/features/home/HomeEmptyState.tsx`
- `core/hooks/useCohorts.ts`

</details>

---

## Version 1.23.9
**Released:** December 19, 2025

### Intelligent Device Import & UX Refinements

Refined the **Import Device** workflow with intelligent module-aware caching, streamlined cohort assignment for external organizations, and simplified import logic for personal users. Also improved accessibility for new network requests and updated navigation.

<details>
<summary><strong>Feature Updates (5)</strong></summary>

- **Module-Aware Refresh**: The import process now intelligently detects the user's active module (`/admin` vs `/devices`) and refreshes the appropriate device list (`Network Devices` vs `My Devices`), eliminating the need for manual page reloads.
- **Smart Cohort Assignment**: Simplified the default cohort logic to only auto-assign imports to a group cohort for **External Organizations**. Personal users (including AirQo staff) now import devices directly to their personal list without forced cohort association.
- **Simplified Personal Import**: Individual users in the Personal scope now omit the `cohort_id` entirely during import, allowing the backend to automatically handle assignment to their personal cohort. This removes client-side complexity and ensures reliable assignment.
- **Smart Cache Invalidation**: The application now intelligently invalidates both `['myDevices']` and `['devices']` caches for personal users after import, ensuring the UI always reflects the latest device list immediately.
- **Network Request Flow**: Added a direct link ("Can't find your network?") to the import modal, allowing users to easily request new network additions via a dedicated form. This link is automatically hidden in administrative contexts.

</details>

<details>
<summary><strong>Fixes (2)</strong></summary>

- **Nested Validation Errors**: Fixed a parsing issue in `getApiErrorMessage.ts` that was ignoring simple string errors (e.g., `"serial_number": "must be unique"`), ensuring users see specific validation feedback instead of generic error messages.
- **Navigation Reset**: Fixed an issue where the `import-device-modal` could retain old network selections by ensuring state is fully reset when the modal closes.

</details>

<details>
<summary><strong>Improvements (2)</strong></summary>

- **Enhanced My Devices**: Added the **"Import Existing Device"** button directly to the `My Devices` page header and error states, ensuring feature parity with the main Overview page.
- **Clean Filtering**: Updated the "Network" dropdown in the import modal to filter out "AirQo" as a selectable network option to prevent redundant selection.

</details>

<details>
<summary><strong>Technical Changes (5)</strong></summary>

- **Hook Update**: Refactored `useImportDevice` to utilize `usePathname` for module detection and invalidate multiple query keys (including `['deviceCount']`) to ensure dashboard stats update instantly.
- **Modal Logic**: Updated `import-device-modal.tsx` to conditionally fetch cohorts only for external organization contexts and strictly return `undefined` for personal cohort IDs.
- **Component Reuse**: Implemented `ReusableButton` for the new network request link to ensure consistent styling and primary color inheritance.
- **Utility Fix**: Enhanced `getApiErrorMessage` to handle `string` values within the `errors` object.

</details>

<details>
<summary><strong>Files Modified (5)</strong></summary>

- `core/hooks/useDevices.ts`
- `components/features/devices/import-device-modal.tsx`
- `core/utils/getApiErrorMessage.ts`
- `app/(authenticated)/devices/my-devices/page.tsx`
- `app/(authenticated)/devices/overview/page.tsx`

</details>


## Version 1.23.8
**Released:** December 19, 2025

### Site Stats & Filtering

Introduced interactive statistics cards to the Sites Admin page, allowing users to visualize and filter sites based on their operational status (Operational, Transmitting, Not Transmitting, Data Available).

<details>
<summary><strong>Feature Updates (2)</strong></summary>

- **Site Stats Cards**: Added a new stats component to the Sites page (`/admin/sites`) displaying real-time counts for Total, Operational, Transmitting, Not Transmitting, and Data Available sites.
- **Status Filtering**: Clicking on a stat card now filters the Sites table by that specific status, persisting the selection in the URL for shareability.

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- **New API Endpoint**: Added `getSitesByStatusApi` to `sites.ts` to support fetching filtered site lists via the `/devices/sites/status/:status` endpoints.
- **Parallel Stats Fetching**: Implemented `useSiteStatistics` hook using `useQueries` to fetch counts for all statuses in parallel.
- **Hook Update**: Updated `useSites` to accept a `status` parameter and route requests to the appropriate tailored endpoint.

</details>

<details>
<summary><strong>Files Modified (5)</strong></summary>

- `app/(authenticated)/admin/sites/page.tsx`
- `components/features/sites/site-stats-cards.tsx` (New)
- `components/features/sites/sites-list-table.tsx`
- `core/apis/sites.ts`
- `core/hooks/useSites.ts`

</details>

## Version 1.23.7
**Released:** December 16, 2025

### Network Stats & UI Refinements

Enhanced the Network Details page with interactive statistics cards and refined the overall user experience with improved navigation and filtering logic.

<details>
<summary><strong>Feature Updates (3)</strong></summary>

- **Network Stats Cards**: Added dedicated stats cards to the Network Details page (`/admin/networks/[id]`), offering a quick overview of device health specific to that network.
- **Interactive Filtering**: Clicking on network stats cards (e.g., "Operational", "Transmitting") now automatically filters the device list below.
- **Enhanced Table Filtering**: Added a robust "Filter" dropdown to device tables with support for clearing filters and visual indicators for active states.

</details>

<details>
<summary><strong>Improvements (4)</strong></summary>

- **Navigation Refinement**: Updated the "Back" button on the Network Details page to reliably redirect to the Networks list (`/admin/networks`) instead of relying on browser history.
- **Reusable Stats Component**: Refactored `StatCard` into a fully reusable component with support for multiple sizes (`sm`, `md`, `lg`) and loading states.
- **Loading State UX**: Disabled interactive elements (cursor, hover effects) on stats cards while they are loading to prevent confusion.
- **Tooltips**: Added informative tooltips to Network Stats Cards to explain status definitions, mirroring the dashboard experience.

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- **API Optimization**: Updated `getDeviceCountApi` and related hooks to support network-specific filtering on the server side.
- **Code Cleanup**: Standardized status parameters to kebab-case and removed unused variables across multiple components.
- **Performance**: Optimized `AssignCohortDevicesDialog` and `DeployDeviceComponent` to prevent duplicate API calls during interactions.

</details>

<details>
<summary><strong>Files Modified (9)</strong></summary>

- `app/(authenticated)/admin/networks/[id]/page.tsx`
- `components/features/networks/NetworkStatsCards.tsx` (New)
- `components/features/dashboard/StatCard.tsx` (Refactored)
- `components/features/dashboard/stats-cards.tsx`
- `components/features/devices/device-list-table.tsx`
- `components/features/networks/network-device-list-table.tsx`
- `core/apis/devices.ts`
- `core/hooks/useDevices.ts`
- `core/hooks/useNetworks.ts`

</details>

## Version 1.23.6
**Released:** December 16, 2025

### Device Stats & Data Available Status

Updated the Device Count API integration to support a modernized response structure and added support for the "Data Available" device status across the dashboard and device lists.

<details>
<summary><strong>Feature Updates (2)</strong></summary>

- **Data Available Status**: 
  - Added a new **"Data Available"** status to the Dashboard Stats Cards (Yellow icon).
  - Updated Device List filtering to support filtering by `?status=data_available`.
- **Personal Scope Stats**: 
  - The stats cards now use the API to fetch counts for the Personal scope (instead of client-side calculation), ensuring consistency with the Organization scope.
  - Optimized logic to gracefully handle users with no cohorts (defaults to 0 without API calls).

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- **API Update**: Updated `devices.ts` and `useDevices.ts` to consume the new `total_monitors`, `operational`, `transmitting`, `not_transmitting`, `data_available` fields from the API.
- **Hook Optimization**: Refactored `useDeviceCount` to support optional cohort IDs for personal scope and return `isLoading: false` immediately if no cohorts are provided.
- **Component Update**: Updated `stats-cards.tsx` to handle the new API response structure and explicitly manage loading states for safer UI rendering.

</details>

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `core/apis/devices.ts`
- `core/hooks/useDevices.ts`
- `components/features/dashboard/stats-cards.tsx`
- `components/features/devices/device-list-table.tsx`

</details>
## Version 1.23.5
**Released:** December 15, 2025

### Dashboard UX & Status Alignment

Overhauled the Home dashboard to improve usability and implemented strict logic alignment for device statuses across the platform.

<details>
<summary><strong>Feature Updates (3)</strong></summary>

- **Dashboard Redesign**: 
    - Moved primary actions ("Add AirQo Device", "Import Device") to a dedicated header bar for visibility.
    - Added a **"Device Health"** accordion containing Refactored Stats Cards.
    - Added a dismissable "Welcome" context header to save screen space.
    - Removed the bottom "Quick Access" section.
- **Global Claim Modal**: The "Add AirQo Device" button now opens the claim modal directly on the dashboard instead of redirecting to a separate page.
- **Network Visibility**: Dedicated **Visibility Card** (External Orgs) with clear "Public" vs "Private" toggle states and safety confirmation.

</details>

<details>
<summary><strong>Improvements (3)</strong></summary>

- **Stats Logic Alignment**: 
    - Updated Dashboard Stats Cards to strictly match documentation: **Operational** (Green), **Transmitting** (Blue), **Not Transmitting** (Gray).
    - Removed ambiguous "Needs Attention" categories.
    - Status colors are now applied to **icons** instead of card backgrounds for a cleaner look.
- **Site Status Consistency**: 
    - Updated Sites to use the same 4-state logic (`Operational`, `Transmitting`, `Data Available`, `Not Transmitting`) as Devices.
    - Added tooltips to explain statuses in Site details.
- **Filtering**: 
    - Updated device list filtering to support new status query parameters (`?status=transmitting`, etc.).

</details>

<details>
<summary><strong>Files Modified (6)</strong></summary>

- `app/(authenticated)/home/page.tsx`
- `components/features/dashboard/stats-cards.tsx`
- `components/features/home/context-header.tsx`
- `components/features/home/network-visibility-card.tsx`
- `components/features/devices/device-list-table.tsx`
- `core/utils/status.ts`

</details>

---

## Version 1.23.4
**Released:** December 13, 2025

### Device Connection URL & Enhanced Cohort Creation

Added a new "Device Connection URL" field to support external device integrations, and upgraded the Cohort Creation flow with confirmation and success steps.

<details>
<summary><strong>Features Added (1)</strong></summary>

- **Device Connection URL**: Added a new input field (`api_code`) to the **Import Device** modal and **Device Details** (Edit Mode), allowing users to link devices to their external data source URLs (e.g., IQAir).

</details>

<details>
<summary><strong>Improvements (1)</strong></summary>

- **Cohort Creation Flow**: Added dedicated **Confirmation** and **Success** steps to the Create Cohort dialog, providing a safer and more polished user experience.

</details>

<details>
<summary><strong>Files Modified (5)</strong></summary>

- `core/apis/devices.ts`
- `core/hooks/useDevices.ts`
- `components/features/devices/import-device-modal.tsx`
- `components/features/devices/device-details-modal.tsx`
- `components/features/cohorts/create-cohort.tsx`

</details>

---
## Version 1.23.3
**Released:** December 13, 2025

### User-Specific Admin Module Redirection

Implemented intelligent login redirection that remembers each user's last active module (Device Management or Administrative Panel) and redirects them accordingly, with strict user isolation to prevent state leakage on shared devices.

<details>
<summary><strong>Features Added (1)</strong></summary>

- **Smart Login Redirection**: Users are now automatically redirected to their last active module upon login. If a user was last viewing the Administrative Panel before logout, they'll return directly to `/admin/networks`. Otherwise, they'll go to the default Home page. This preference is strictly isolated per user email, ensuring no cross-contamination when multiple users share the same browser.

</details>

<details>
<summary><strong>Improvements (3)</strong></summary>

- **UI Flash Prevention**: Optimized the layout initialization to prevent visual "flashing" between modules during login by reading the pathname immediately on mount.
- **Logout State Capture**: Enhanced logout flow to explicitly save the user's current module before session cleanup, ensuring preferences are always preserved.
- **Pre-Authentication Check**: Login now reads the user's preference before authentication completes, eliminating timing gaps that caused brief navigation flashes.

</details>

<details>
<summary><strong>Technical Changes (4)</strong></summary>

- **New Utility**: Created `core/utils/userPreferences.ts` with `getLastActiveModule` and `setLastActiveModule` functions that use user-specific localStorage keys (`lastActiveModule_${email}`).
- **Layout Optimization**: Modified `layout.tsx` to initialize `activeModule` state based on the current pathname and only update state when the module actually changes, preventing unnecessary re-renders.
- **Logout Enhancement**: Updated `useLogout.ts` to save the current module preference before clearing session data.
- **Login Refactor**: Modified login flow to read preference before authentication and removed prefetch logic that contributed to visual flashing.

</details>

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `core/utils/userPreferences.ts` (New)
- `core/hooks/useLogout.ts`
- `components/layout/layout.tsx`
- `app/login/page.tsx`

</details>

---
## Version 1.23.2
**Released:** December 13, 2025

### Table UX & Upload Enhancements

Improved table user experience by removing intrusive autoscroll behavior and fixing sticky layout shifts, alongside robustness improvements for file uploads.

<details>
<summary><strong>Improvements (3)</strong></summary>

- **Removed Autoscroll**: Removed the forced "scroll to top" behavior on table page changes, allowing users to maintain their scroll position.
- **Stable Sticky Header**: Fixed a layout shift issue where the sticky header would disappear during loading, causing visual jumping.
- **Robust Uploads**: Refactored Cloudinary upload utility to support custom folders, tags, and better error handling.

</details>

<details>
<summary><strong>Technical Changes (2)</strong></summary>

- **Refactored `ReusableTable`**: Updated to keep sticky header visible during loading and removed redundant header from `TableSkeleton` to prevent layout shifts.
- **Cleaned Up `useEffect`**: Removed `tableRef.current.scrollIntoView` calls across multiple pages.

</details>

<details>
<summary><strong>Files Modified (8)</strong></summary>

- `core/apis/cloudinary.ts`
- `components/shared/table/ReusableTable.tsx`
- `components/features/devices/device-list-table.tsx`
- `components/features/networks/network-device-list-table.tsx`
- `components/features/sites/sites-list-table.tsx`
- `app/(authenticated)/cohorts/page.tsx`
- `app/(authenticated)/admin/cohorts/page.tsx`
- `components/features/grids/grids-list-table.tsx`

</details>

---
## Version 1.23.1
**Released:** December 12, 2025

### Legacy Architecture Cleanup

Removed deprecated navigation modules to strictly align with the new Access Control Architecture.

<details>
<summary><strong>Fixes (3)</strong></summary>

- **Removed `org-devices`**: Deleted the legacy "Organization Devices" module that duplicated functionality now handled by the standard Device module in Personal/Organization scopes.
- **Removed `network-mgmt`**: Deleted the legacy "Network Management" module that was replaced by the consolidated "Administrative Panel".
- **Strict Layout Logic**: Updated `layout.tsx` to stop forcing the `org-devices` view, ensuring the application consistently uses the unified `devices` module.

</details>

<details>
<summary><strong>Files Modified (2)</strong></summary>

- `components/layout/secondary-sidebar.tsx`
- `components/layout/layout.tsx`

</details>

---

## Version 1.23.0
**Released:** December 12, 2025

### Cohort Management & UI Polish

Launched the full **Cohort Management** interface, enabling users to view and manage device groups with scope-aware context (Personal vs Organization). Also polished the UI with robust empty states and smarter table controls.

<details>
<summary><strong>Features & Improvements (4)</strong></summary>

- **Cohort List View**: specialized page (`/cohorts`) displaying all cohorts with real-time device counts and creation dates.
- **Scope-Aware Fetching**: Automatically switches between Personal and Organizational cohort data based on the user's active view.
- **Smart Empty States**: Implemented `CohortsEmptyState` to guide users when no cohorts exist, matching the design of the Home dashboard.
- **Smarter Tables**: Updated `ReusableTable` to automatically disable the Export button when there is no data to export, improving UX.

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- **New Route**: Added `app/(authenticated)/cohorts/page.tsx` with optimized loading states and error handling.
- **Sidebar Update**: Added "Cohorts" under the "Data Access & Visibility" section in the secondary sidebar.
- **Refactored Hook**: Enhanced `useCohorts` to strictly respect the `userScope` (Personal/Organization) for data fetching.

</details>

<details>
<summary><strong>Files Modified (5)</strong></summary>

- `app/(authenticated)/cohorts/page.tsx` (New)
- `components/features/cohorts/CohortsEmptyState.tsx` (New)
- `components/layout/secondary-sidebar.tsx`
- `components/shared/table/ReusableTable.tsx`
- `core/hooks/useCohorts.ts`

</details>

---

## Version 1.22.0
**Released:** December 12, 2025

### Cohort Import & Enhanced Claim Flow

Introduced a powerful "Import from Cohort" feature for bulk device claiming, refined the claim user experience with confirmation steps and tooltips, and expanded administrative capabilities for Site Device management.

<details>
<summary><strong>Features Added (2)</strong></summary>

- **Import from Cohort**: Users can now import devices directly by entering a Cohort ID. The system verifies the cohort and prefills the bulk claim form with all associated devices, requiring only claim tokens to proceed.
- **Admin Site Device Details**: Added a dedicated device details page for the Admin Site context (`/admin/sites/[siteId]/devices/[deviceId]`), ensuring navigation remains within the admin scope.

</details>

<details>
<summary><strong>Improvements (4)</strong></summary>

- **Claim Confirmation**: Added a mandatory confirmation step for both single and bulk claims, displaying a clear warning about potential device recalls if devices are already deployed.
- **Enhanced Tooltips**: Added interactive tooltips to "deployed" and "recalled" terms in the confirmation warning to clarify their definitions.
- **Compact UI**: Refactored the claim method selection screen to use compact horizontal rows, ensuring all 3 options (Single, Bulk, Cohort) are visible without scrolling.
- **Simplified Workflow**: Removed redundant device lists from the confirmation step in favor of concise summary strings (e.g., "You are about to claim 5 devices").

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- **New Hook**: Added `useVerifyCohort` and `verifyCohortIdApi` to validate cohort IDs before import.
- **Type Definitions**: Updated `Cohort` and `Device` types to support the new import flow.
- **Lint Fixes**: Resolved unused variables and `any` type usage in `claim-device-modal.tsx`.

</details>

<details>
<summary><strong>Files Modified (6)</strong></summary>

- `components/features/claim/claim-device-modal.tsx`
- `core/apis/cohorts.ts`
- `core/hooks/useCohorts.ts`
- `app/(authenticated)/admin/sites/[id]/devices/[deviceId]/page.tsx` (New)
- `app/(authenticated)/admin/sites/[id]/page.tsx`
- `app/types/cohorts.ts`

</details>

---

## Version 1.21.3
**Released:** December 12, 2025

### Session Stability & Critical Security Fix

Resolved a critical issue causing "Multiple 401s" errors and forced logout loops by fixing how session tokens are validated and cached.

<details>
<summary><strong>Critical Fixes (3)</strong></summary>

- **Proxy Cache Removed**: Removed an unsafe global session cache in the API proxy (`proxyClient.ts`) that was serving stale/expired tokens for up to 5 minutes, causing 401 errors even when the user's browser session was valid.
- **Token Expiry Enforcement**: Updated NextAuth configuration to strictly validate the JWT `exp` (expiration) timestamp. Sessions now automatically invalidate the moment the token expires, ensuring a clean redirect to login instead of API failure loops.
- **Status Logic Robustness**: Enhanced `getDeviceStatus` and `getSimpleStatus` to safely handle invalid dates without crashing or misreporting status.

</details>

<details>
<summary><strong>Technical Changes (4)</strong></summary>

- **Removed Cache**: Deleted `SessionCache` class from `core/utils/proxyClient.ts` to ensure every API request gets a fresh session.
- **Auth Options**: Updated `app/api/auth/[...nextauth]/options.ts` to include `exp` claim and return `user: null` on expiry.
- **Type Definitions**: Augmented `types/next-auth.d.ts` and `app/types/users.ts` to include `exp` property.
- **Status Utils**: Updated `core/utils/status.ts` with generic `isError` checks.

</details>

<details>
<summary><strong>Files Modified (5)</strong></summary>

- `core/utils/proxyClient.ts`
- `app/api/auth/[...nextauth]/options.ts`
- `core/utils/status.ts`
- `types/next-auth.d.ts`
- `app/types/users.ts`

</details>

---

## Version 1.21.2
**Released:** December 12, 2025

### Contextual Site Editing

Improved the Site Details page by splitting the generic "Edit Site" action into context-specific buttons for "Site Details" and "Mobile App Details".

<details>
<summary><strong>Improvements (3)</strong></summary>

- **Contextual Actions**: Added dedicated "Edit" buttons to the footer of both the Site Details and Mobile App Details cards.
- **Focused Dialogs**: Enhanced the edit dialog to show only the relevant fields for the selected section (General vs Mobile).
- **Cleaner UI**: Removed the global "Edit Site" button to reduce ambiguity.

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- **Component Refactor**: Updated `EditSiteDetailsDialog` to support a `section` prop.
- **UI Update**: Updated `SiteInformationCard` and `SiteMobileAppCard` to render footer actions.
- **Page Logic**: Refactored `admin/sites/[id]/page.tsx` to handle section state.

</details>

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `components/features/sites/edit-site-details-dialog.tsx`
- `components/features/sites/site-information-card.tsx`
- `components/features/sites/site-mobile-app-card.tsx`
- `app/(authenticated)/admin/sites/[id]/page.tsx`

</details>

---

## Version 1.21.1
**Released:** December 12, 2025

### Centralized Online Status Logic

Refactored and unified the online status determination logic across the entire application, ensuring consistent visual indicators and definitions for Sites and Devices.

<details>
<summary><strong>Improvements (3)</strong></summary>

- **Unified Status Logic**: Devices and Sites now share the same "Operational", "Transmitting", "Data Available", and "Not Transmitting" status definitions.
- **Consistent Visuals**: Standardized badge colors and icons across the Sites List, Devices List, and Status Cards.
- **Helpful Tooltips**: Added informative tooltips to status chips in the Site Information Card, explaining what each status means (same as Device Status Card).

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- **Shared Utility**: Created `src/vertex/core/utils/status.ts` to house `getDeviceStatus`, `getSimpleStatus`, `formatDisplayDate`, and status explanations.
- **Refactored Components**: Updated `sites-list-table.tsx`, `table-columns.tsx`, `site-information-card.tsx`, and `online-status-card.tsx` to use the shared utility.
- **Code Cleanup**: Removed duplicate status logic and date formatting functions from individual component files.

</details>

<details>
<summary><strong>Files Modified (5)</strong></summary>

- `core/utils/status.ts` (New)
- `components/features/sites/sites-list-table.tsx`
- `components/features/devices/utils/table-columns.tsx`
- `components/features/sites/site-information-card.tsx`
- `components/features/devices/online-status-card.tsx`

</details>

---


## Version 1.21.0
**Released:** December 12, 2025

### Instant Home Page & Session Optimization

Achieved an "Instant Load" experience for the Home Page by implementing Server-Side Session fetching and removing blocking UI checks. The dashboard now renders immediately upon login without any loading spinners.

<details>
<summary><strong>Improvements (6)</strong></summary>

- **Instant Dashboard**: The Home Page now loads immediately after login, eliminating the ~3s "Session Loading" delay.
- **Server-Side Session**: Implemented `getServerSession` to hydrate authentication state on the server, ensuring the client knows the user is logged in before the first render.
- **Non-Blocking Layout**: Removed restrictive blocking checks in the main Layout, allowing the App Shell (Sidebar/Topbar) to render instantly while user details update in the background.
- **Optimized Sidebar**: Refactored the Secondary Sidebar to default to the "Personal View" immediately, removing flickering skeleton loaders.
- **Refined Loaders**: Updated Home Page skeletons to match design system colors and removed placeholder text for a cleaner loading state.
- **Zero-State Fix**: Resolved an issue where the dashboard briefly displayed zero stats before showing the empty state.

</details>

<details>
<summary><strong>Technical Changes (6)</strong></summary>

- **SSR Implementation**: Updated `app/layout.tsx` to fetch session server-side and pass it to providers.
- **Hard Login Redirect**: Changed login navigation to use `window.location.href` to force a server-side session refresh, guaranteeing instant state on the next page load.
- **Removed Blocking Logic**: Deleted the `!userDetails` check in `components/layout/layout.tsx`.
- **Parallel Data Fetching**: Updated `Home` page to use the session ID for immediate device fetching, running in parallel with user profile updates.
- **Sidebar Defaulting**: Updated `secondary-sidebar.tsx` to fallback to the Personal view structure instead of showing skeletons when context is loading.
- **Lighthouse CI**: Updated `lighthouserc.json` to test the public `/login` route instead of protected `/home` and relaxed assertions for auth-related performance metrics.

</details>

<details>
<summary><strong>Files Modified (7)</strong></summary>

- `app/layout.tsx`
- `app/login/page.tsx`
- `app/(authenticated)/home/page.tsx`
- `components/layout/layout.tsx`
- `components/layout/secondary-sidebar.tsx`
- `middleware.ts`
- `lighthouserc.json`

</details>

## Version 1.20.1
**Released:** December 11, 2025

### Fixed Logout Redirection

Resolved a race condition where users were briefly redirected to the home page during the logout process.

<details>
<summary><strong>Fixes (1)</strong></summary>

- **Logout Stability**: The application now strictly redirects to the login page after the session is successfully cleared, eliminating the "bounce" to the home page.

</details>

<details>
<summary><strong>Technical Changes (1)</strong></summary>

- Updated `useLogout` hook to strictly redirect to `/login` after session invalidation, ignoring callback URLs.

</details>

<details>
<summary><strong>Files Modified (1)</strong></summary>

- `core/hooks/useLogout.ts`

</details>

---

## Version 1.20.0
**Released:** December 11, 2025

### Strict Admin Panel Restriction

Restricted visibility of the "Administrative Panel" to strictly enforce role-based access. The permission-based override has been removed to ensure only specific AirQo administrative roles can access this sensitive area.

<details>
<summary><strong>Improvements (1)</strong></summary>

- **Strict Role Enforcement**: Removed the lenient `NETWORK_VIEW` permission check. Access is now exclusively granted to users with `AIRQO_SUPER_ADMIN`, `AIRQO_ADMIN`, or `AIRQO_NETWORK_ADMIN` roles.

</details>

<details>
<summary><strong>Technical Changes (1)</strong></summary>

- Modified `primary-sidebar.tsx` to remove the `permissions.canViewNetworks` condition from the `canViewAdminPanel` logic.

</details>

<details>
<summary><strong>Files Modified (1)</strong></summary>

- `components/layout/primary-sidebar.tsx`

</details>

---

## Version 1.19.0
**Released:** December 09, 2025

### Administrative Access Refactor & Shipping Controls

Refined access control for the administrative panel and introduced granular permissions for shipping operations, ensuring a secure and streamlined management experience.

<details>
<summary><strong>Improvements (4)</strong></summary>

- **Sidebar Access**: "Administrative Panel" is now visible to all key admin roles (`AIRQO_SUPER_ADMIN`, `AIRQO_ADMIN`, `AIRQO_NETWORK_ADMIN`) regardless of network view permissions.
- **Smart Dropdowns**: Sidebar items are now context-aware. If a user lacks permission for a specific section (e.g. Shipping), the item is disabled and shows a helpful tooltip explaining the missing permission.
- **Shipping Security**: Introduced explicit `SHIPPING` permissions (`VIEW`, `CREATE`, `EDIT`, `DELETE`) to granularly control access to device logistics.
- **Route Protection**: The Shipping Management page is now strictly protected by a `RouteGuard`, redirecting unauthorized users.

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- Added `SHIPPING` permission constants and assigned them to admin roles.
- Refactored `primary-sidebar.tsx` with a reusable `AdminDropdownItem` component for consistent behavior and tooltip logic.
- Updated `useUserContext` to expose `canViewShipping`.

</details>

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `core/permissions/constants.ts`
- `core/hooks/useUserContext.ts`
- `components/layout/primary-sidebar.tsx`
- `app/(authenticated)/admin/shipping/page.tsx`

</details>

---

## Version 1.18.0
**Released:** December 09, 2025

### Unified Forbidden Access UI

Standardized the "Access Denied" experience across the application by introducing a reusable `ForbiddenError` component, ensuring consistent UI for both full-page and inline error states.

<details>
<summary><strong>Improvements (3)</strong></summary>

- **Reusable Forbidden UI**: Extracted the "Oops! Access Denied" UI into a standalone `ForbiddenError` component for use anywhere in the app.
- **Consistent styling**: `RouteGuard` now renders the exact same friendly error UI as the full page version instead of a basic card.
- **UI Enhancement**: Upgraded the "Go back" button to use the standardized `ReusableButton` component.

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- Created `src/vertex/components/ui/forbidden-error.tsx`.
- Refactored `src/vertex/components/ui/forbidden-page.tsx` to wrap the new reusable component.
- Updated `src/vertex/components/layout/accessConfig/route-guard.tsx` to render `ForbiddenError` centered in a container.

</details>

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `components/ui/forbidden-error.tsx` (New)
- `components/ui/forbidden-page.tsx`
- `components/layout/accessConfig/route-guard.tsx`
- `app/changelog.md`

</details>

---

## Version 1.17.0
**Released:** December 09, 2025

### Network Details & Admin Device Views

Introduced a dedicated **Network Details Page** for comprehensive network management and established a unified **Admin Device Details** view, streamlining navigation and device operations within the admin panel.

<details>
<summary><strong>Improvements (6)</strong></summary>

- **Network Details Page**: New route `/admin/networks/[id]` displaying network info and a dedicated device list.
- **Recently Visited**: Added a smart "Recently Visited" sidebar item that tracks user navigation history (persisted locally) and aggregates deep links (e.g. Network Details) up to their parent module for efficient backtracking.
- **Unified Device Layout**: Extracted device details logic into `DeviceDetailsLayout`, creating a consistent experience across Standard and Admin views.
- **Correct Navigation**: Admin table now routes to `/admin/networks/[id]/devices/[deviceId]`, preserving admin context.
- **Bulk Actions**: Added "Assign to Cohort" and "Remove from Cohort" bulk actions to the network device list.
- **Quick Actions**: Added "Add AirQo Device" and "Import Device" buttons with pre-filled network context.

</details>

<details>
<summary><strong>Technical Changes (6)</strong></summary>

- Created `src/vertex/app/(authenticated)/admin/networks/[id]/page.tsx`
- Created `src/vertex/app/(authenticated)/admin/networks/[id]/devices/[deviceId]/page.tsx`
- Created `src/vertex/core/hooks/useRecentlyVisited.ts`
- Created `src/vertex/components/features/devices/device-details-layout.tsx`
- Created `src/vertex/components/features/networks/network-device-list-table.tsx`
- Added `useNetworkDevices` hook to `useNetworks.ts`.

</details>

<details>
<summary><strong>Files Modified (8)</strong></summary>

- `app/(authenticated)/admin/networks/[id]/page.tsx` (New)
- `app/(authenticated)/admin/networks/[id]/devices/[deviceId]/page.tsx` (New)
- `components/features/devices/device-details-layout.tsx` (New)
- `components/features/networks/network-device-list-table.tsx` (New)
- `core/hooks/useRecentlyVisited.ts` (New)
- `components/layout/primary-sidebar.tsx`
- `core/hooks/useNetworks.ts`
- `app/(authenticated)/devices/overview/[id]/page.tsx`

</details>

---

## Version 1.16.0
**Released:** December 09, 2025

### Route Centralization & Admin Panel Consolidation

Centralized application route definitions and consolidated administrative navigation to improve maintainability and user experience.

<details>
<summary><strong>Improvements (4)</strong></summary>

- **Centralized Route Constants**: Introduced `ROUTE_LINKS` constant to manage all application paths from a single source of truth, eliminating hardcoded strings.
- **Consolidated Admin Panel**: Created a unified "Administrative Panel" dropdown in the primary sidebar, decluttering the navigation and grouping related admin tasks (Networks, Cohorts, Sites, Grids, Shipping).
- **File Migration**: Successfully migrated `cohorts`, `sites`, and `grids` pages to the `/admin` directory, ensuring clearer project structure and route organization.
- **Enhanced Context Routing**: Updated `useContextAwareRouting` and `useUserContext` to robustly handle the new consolidated admin structure and ensure correct visibility based on user roles and permissions.

</details>

<details>
<summary><strong>Technical Changes (4)</strong></summary>

- Created `src/vertex/core/routes.ts` for centralized route management.
- Refactored `primary-sidebar.tsx` and `secondary-sidebar.tsx` to utilize `ROUTE_LINKS`.
- Updated `useContextAwareRouting.ts` to map new `ROUTE_LINKS` to sidebar configuration keys.
- Extended `useUserContext` state to track `showNetworks` and `showShipping` visibility.

</details>

<details>
<summary><strong>Files Modified (5)</strong></summary>

- `core/routes.ts` (New)
- `components/layout/primary-sidebar.tsx`
- `components/layout/secondary-sidebar.tsx`
- `core/hooks/useContextAwareRouting.ts`
- `core/hooks/useUserContext.ts`

</details>

---

## Version 1.15.0
**Released:** December 09, 2025

### Network Management Role & Scoped Navigation

Refined application scoping to enforce strict personal view for AirQo staff and introduced a dedicated `AIRQO_NETWORK_ADMIN` role for granular control over network management features.

<details>
<summary><strong>Improvements (4)</strong></summary>

- **Context vs Scope Architecture**: Shifted application logic from relying on raw contexts (e.g. `airqo-internal`) to abstract scopes (`personal` vs `organization`). This decoupling ensures that internal staff now operate within a standard "Personal" scope, fixing inconsistencies where staff were treated as organization admins in their own private workspace.
- **Strict Scope Enforcement**: `organization` scope is now exclusive to external organizations. AirQo internal users default to `personal` scope for a consistent "My Workspace" experience.
- **Granular Access Control**: Replaced generic admin checks with specific `NETWORK` permissions (VIEW, CREATE, EDIT, DELETE).
- **Dedicated Role**: Introduced `AIRQO_NETWORK_ADMIN` role for specialized network managers, decoupling this power from general system admins.
- **Legacy Compatibility**: Automatically maps old `CREATE_UPDATE_AND_DELETE_NETWORKS` permissions to the new granular system.

</details>

<details>
<summary><strong>Features Added (2)</strong></summary>

- **New Role**: `AIRQO_NETWORK_ADMIN` with full network management capabilities.
- **Permission Categories**: Added `NETWORK` category to permission service with clear UI descriptions.

</details>

<details>
<summary><strong>Technical Changes (5)</strong></summary>

- Refactored `useUserContext` to enforce `personal` scope for `airqo-internal` context.
- Updated `constants.ts` with new permissions and role definitions.
- Enhanced `permissionService.ts` to recognize and describe network permissions.
- Fixed sidebar visibility logic to rely purely on permission checks rather than scope state.
- Removed redundant `isAirQoStaff` flag and logic, enabling context switching for all multi-organization users.

</details>

<details>
<summary><strong>Files Modified (5)</strong></summary>

- `core/hooks/useUserContext.ts`
- `core/permissions/constants.ts`
- `core/permissions/permissionService.ts`
- `components/layout/primary-sidebar.tsx`
- `app/(authenticated)/admin/layout.tsx`

</details>

---

## Version 1.14.0
**Released:** December 06, 2025

### 🚀 Performance Optimizations - Major Overhaul

Achieved dramatic performance improvements reducing initial page load from 18s to <500ms and bundle size from 2.5MB to ~1.0MB through systematic optimization.

<details>
<summary><strong>Session Loading & Authentication (-17s)</strong></summary>

- **Instant Page Loads**: Optimized from ~18s to <1s by fixing redux-persist and removing blocking authentication checks
- **SSR Compatibility**: Implemented conditional storage for redux-persist to work correctly in both client and server environments
- **Smart Hydration**: Added REHYDRATE handler for instant optimistic rendering from cached authentication state
- **Reduced Logging**: Disabled NextAuth debug mode to eliminate overhead

**Files Modified**:
- `core/redux/store.ts`
- `core/redux/slices/userSlice.ts`
- `core/hooks/useUserContext.ts`
- `components/layout/layout.tsx`
- `app/api/auth/[...nextauth]/options.ts`

</details>

<details>
<summary><strong>Router Prefetching</strong></summary>

- **Instant Transitions**: Added route prefetching for seamless login-to-home navigation
- **Preloaded Assets**: Dashboard code chunks load during login form interaction

**Files Modified**: `app/login/page.tsx`

</details>

<details>
<summary><strong>Dependency Cleanup (-1.27MB)</strong></summary>

Removed 7 unused packages:
- ❌ `apexcharts` (~400KB)
- ❌ `react-apexcharts` (~50KB)
- ❌ `html-to-image` (~30KB)
- ❌ `jspdf` (~200KB)
- ❌ `react-multi-select-component` (~40KB)
- ❌ `react-timezone-select` (~80KB)
- ❌ `moment` (~470KB)

**Total Savings**: -1.27MB

</details>

<details>
<summary><strong>Date Library Migration (-470KB)</strong></summary>

- **Modern Alternative**: Migrated from moment.js to date-fns for better tree-shaking
- **Consistent Formatting**: Standardized all dates to `"MMM d yyyy, h:mm a"` format
- **7 Files Updated**: Replaced all moment usage across codebase

**Files Modified**:
- `app/(authenticated)/cohorts/page.tsx`
- `components/features/grids/grids-list-table.tsx`
- `components/features/devices/maintenance-status-card.tsx`
- `components/features/devices/online-status-card.tsx`
- `components/features/devices/run-device-test-card.tsx`
- `components/features/devices/utils/table-columns.tsx`
- `lib/utils.ts`

</details>

<details>
<summary><strong>Lazy Loading Implementation (-650KB)</strong></summary>

- **On-Demand Maps**: MiniMap component now loads only when dialogs open using Next.js dynamic imports
- **Loading States**: Added smooth loading skeletons for better UX
- **No SSR**: Maps disabled during server-side rendering for optimal performance

**Files Modified**:
- `components/features/sites/create-site-form.tsx`
- `components/features/grids/create-grid.tsx`

</details>

<details>
<summary><strong>Home Page & State Hydration (Critical Fix)</strong></summary>

- **Instant Dashboard**: Fixed a race condition where the app waited for API responses despite having cached data (-2.4s delay removed)
- **PersistGate**: Implemented correct Redux persistence integration to ensure state is ready before render
- **Lazy Loaded Claim Workflow**: Removed heavy QR code scanner libraries from the initial dashboard bundle
- **Deep Clean**: 2,579 modules -> ~1,000 modules for the home page

**Files Modified**:
- `app/providers.tsx`
- `components/features/home/HomeEmptyState.tsx`

</details>

<details>
<summary><strong>Automated Guardrails (CI/CD)</strong></summary>

- **Bundle Size Enforcement**: Integrated `size-limit` to strictly enforce a 200KB budget for the main bundle. Refuses to build if exceeded.
- **Lighthouse Guidelines**: Configured `lighthouserc.json` to benchmark Core Web Vitals with a target score of 0.9.
- **Static Analysis**: Optimized `check-size` script to run in <50ms using purely static analysis (removed execution-time dependencies).
- **Split Testing Strategy**: Implemented "Strict Error" policy for quality regressions (console errors) and "Warning Baseline" for performance scores (0.6) to ensure passing builds while tracking progress.

**Files Modified**:
- `package.json` (Added `check-size` script & dependencies)
- `lighthouserc.json` (New configuration with split thresholds)
- `.github/workflows/vertex-performance.yml` (New CI workflow)

</details>

<details>
<summary><strong>Bug Fixes & Stability (Sidebar 404)</strong></summary>

- **Fixed 404 Error**: Resolved a persistent 404 error caused by a broken link (`/profile`) in the secondary sidebar. This was triggering console errors and negatively analyzing "Best Practices" scores.
- **Console Cleanliness**: Verified zero console errors on the Home page after fix, ensuring a clean baseline for automation.

**Files Modified**:
- `components/layout/secondary-sidebar.tsx`

</details>

<details>
<summary><strong>Performance Metrics</strong></summary>

| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| **Bundle Size** | 2.5MB | ~1.0MB | **-60%** |
| **Initial Load** | 18s | <500ms | **-97%** |
| **Login Transition** | 2s | <100ms | **-95%** |
| **Total Savings** | - | ~1.92MB | - |

</details>

---



## Version 1.13.0
**Released:** December 02, 2025

### Conditional Device Fetching & Bug Fixes

Optimized device fetching logic to respect user context and fixed a potential crash in the bulk claim modal.

<details>
<summary><strong>Improvements (2)</strong></summary>

- **Optimized Data Fetching**: `My Devices` page now intelligently switches between `useMyDevices` (Personal) and `useDevices` (External Org) to prevent redundant API calls.
- **Stability**: Fixed a potential crash in the bulk claim results view when API response data is incomplete.

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- Updated `useDevices` hook to support an `enabled` option for conditional execution.
- Refactored `MyDevicesPage` to use `useUserContext` for robust context detection.
- Added optional chaining to `bulkClaimData` access in `claim-device-modal.tsx`.

</details>

<details>
<summary><strong>Files Modified (3)</strong></summary>

- `app/(authenticated)/devices/my-devices/page.tsx`
- `core/hooks/useDevices.ts`
- `components/features/claim/claim-device-modal.tsx`

</details>

## Version 1.12.0
**Released:** December 02, 2025

### Organization Setup Guide Banner

Introduced a persistent, dismissible banner for users in new or incomplete organizations to guide them through essential setup steps like creating cohorts and adding devices.

<details>
<summary><strong>Improvements (4)</strong></summary>

- **Guided Onboarding**: Helps new organizational users understand the next steps.
- **Context-Aware**: Banner only appears for users in an organization that has no cohorts or devices.
- **Dismissible**: Users can hide the banner.
- **Action-Oriented**: Includes direct links to "Create a Cohort" and "Add a Device".

</details>

<details>
<summary><strong>Features Added (1)</strong></summary>

- **OrgSetupBanner Component**: A new component that displays setup guidance for organizations.

</details>

<details>
<summary><strong>Technical Changes (2)</strong></summary>

- Added `OrgSetupBanner.tsx` component with logic to check if an organization has cohorts or devices.
- Integrated the banner into the main authenticated layout.

</details>

---

## Version 1.11.0
**Released:** December 02, 2025

### Cohort-Based Device Claiming

Implemented automatic cohort assignment during device claiming for external organizations and AirQo internal contexts, with clear user confirmation messages.

<details>
<summary><strong>Improvements (3)</strong></summary>

- **Automatic Cohort Assignment**: Devices are automatically assigned to the first cohort in the organization
- **Context-Aware Claiming**: Different behavior for personal, external org, and AirQo internal contexts
- **User Confirmation**: Clear messages inform users where devices will be added before claiming

</details>

<details>
<summary><strong>Features Added (2)</strong></summary>

- **Cohort Integration**: Device claiming now includes `cohort_id` for organizational contexts
- **Confirmation Banners**: Blue info banners show cohort and organization details during claim process

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- Added `cohort_id` field to `DeviceClaimRequest` and `BulkDeviceClaimRequest` types
- Integrated `useUserContext` and `useCohorts` hooks in claim modal
- Automatic cohort determination using first cohort from organization's cohort list

</details>

<details>
<summary><strong>Behavior by Context</strong></summary>

- **Personal Context**: No cohort assignment (unchanged behavior)
- **External Organization**: Automatically assigns to first cohort with org name confirmation
- **AirQo Internal**: Automatically assigns to first AirQo cohort with confirmation
- **Error Handling**: Prevents claiming if no cohorts exist for the organization

</details>

<details>
<summary><strong>Files Modified (2)</strong></summary>

- `app/types/devices.ts`
- `components/features/claim/claim-device-modal.tsx`

</details>

---

## Version 1.10.0
**Released:** December 02, 2025

### ReusableTable Export Feature

Added comprehensive CSV export functionality to all tables using the `ReusableTable` component, with intelligent handling of client-side and server-side pagination.

<details>
<summary><strong>Improvements (4)</strong></summary>

- **Universal Export**: All tables now have built-in export capability
- **Column Selection**: Users can choose which columns to export
- **Pagination-Aware**: Automatically adapts to client-side vs server-side pagination
- **Exact Data Match**: Exported values match exactly what's displayed in the table

</details>

<details>
<summary><strong>Features Added (2)</strong></summary>

- **TableExportModal**: Configuration modal for selecting columns and export scope
- **Export Button**: New "Export" button in table headers with download icon

</details>

<details>
<summary><strong>Technical Changes (4)</strong></summary>

- Added `exportable` prop to `ReusableTable` (default `true`)
- Implemented CSV generation using `papaparse` with dynamic import
- Export uses column `render` functions to extract displayed text values
- Server-side pagination tables restricted to current page export only

</details>

<details>
<summary><strong>Files Created (1)</strong></summary>

- `components/shared/table/TableExportModal.tsx`

</details>

<details>
<summary><strong>Files Modified (1)</strong></summary>

- `components/shared/table/ReusableTable.tsx`

</details>

---

## Version 1.9.0
**Released:** December 02, 2025

### Bulk Device Claiming & Batch Export

Introduced a streamlined bulk device claiming workflow with file upload support and added batch device export functionality.

<details>
<summary><strong>Improvements (5)</strong></summary>

- **Streamlined Claim Flow**: New card-based selection for Single vs Bulk claiming
- **Direct QR Access**: Single device claim now goes directly to QR scan
- **Bulk File Upload**: Dedicated dropzone for CSV/XLSX upload in bulk claim
- **Batch Export**: Export batch device lists to CSV or XLSX
- **Client-Side Summaries**: Improved performance for bulk claim results

</details>

<details>
<summary><strong>Features Added (3)</strong></summary>

- **Bulk Claiming**: Support for claiming multiple devices via file upload or manual entry
- **ExportFormatModal**: Modal for choosing export format
- **FileUploadParser**: Reusable component for parsing device files with dropzone support

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- Refactored `claim-device-modal.tsx` navigation state
- Updated `useBulkClaimDevices` to handle new API response structure
- Implemented `papaparse` and `xlsx` for file handling

</details>

<details>
<summary><strong>Files Modified (5)</strong></summary>

- `components/features/claim/claim-device-modal.tsx`
- `components/features/claim/FileUploadParser.tsx`
- `app/(authenticated)/admin/shipping/[batchId]/page.tsx`
- `core/hooks/useDevices.ts`
- `app/types/devices.ts`

</details>

---

## Version 1.8.0
**Released:** November 30, 2025

### Enhanced App Launcher & Shipping Improvements

Created a comprehensive app dropdown component with QR code modal for mobile app downloads and fixed shipping label generation to respect claim status rules.

<details>
<summary><strong>Improvements (6)</strong></summary>

- **Unified App Launcher**: Single dropdown component for accessing all AirQo platforms and services
- **QR Code Integration**: Dedicated modal view for mobile app download with QR code scanning
- **Environment Awareness**: Automatically adjusts URLs for staging vs production environments
- **Consistent Business Rules**: Shipping label generation now excludes claimed devices in both bulk and per-row operations
- **Better User Feedback**: Improved error messages when no unclaimed devices are available
- **Professional Footer**: Added application footer with automatic year and platform branding

</details>

<details>
<summary><strong>Features Added (3)</strong></summary>

- **AppDropdown Component**: Standalone component with grid layout showing 7 apps (Analytics, Calibrate, Website, Vertex, API Docs, Mobile App, AI Platform)
- **Mobile App QR Modal**: Toggle view with QR code, app store buttons, and back navigation
- **Footer Component**: Reusable footer with dynamic copyright year and platform name

</details>

<details>
<summary><strong>Technical Changes (5)</strong></summary>

- Created `AppDropdown.tsx` with environment-aware URL generation
- Integrated `AppDropdown` into `topbar.tsx` replacing inline implementation
- Added claim status filter to `handleGenerateAllLabels` in batch details page
- Updated error message to reflect unclaimed device requirement
- Created and integrated `Footer.tsx` component into main layout

</details>

<details>
<summary><strong>Files Created (2)</strong></summary>

- `components/layout/AppDropdown.tsx`
- `components/layout/Footer.tsx`

</details>

<details>
<summary><strong>Files Modified (3)</strong></summary>

- `components/layout/topbar.tsx`
- `components/layout/layout.tsx`
- `app/(authenticated)/admin/shipping/[batchId]/page.tsx`

</details>

---

## Version 1.7.0
**Released:** November 30, 2025

### Auto-Logout on Inactivity

Implemented automatic user logout after 30 minutes of inactivity to enhance security and protect user sessions.

<details>
<summary><strong>Improvements (3)</strong></summary>

- **Enhanced Security**: Automatically logs out idle users to prevent unauthorized session access
- **Activity Tracking**: Monitors mouse movements, keyboard input, clicks, scrolling, and touch events
- **Performance Optimized**: Throttled event listeners (1-second intervals) to minimize CPU usage

</details>

<details>
<summary><strong>Features Added (1)</strong></summary>

- **AutoLogoutHandler Component**: Standalone component that tracks user activity and triggers logout after 30 minutes of inactivity

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- Created `AutoLogoutHandler` function component in `authProvider.tsx`
- Implemented interval-based inactivity check (every 60 seconds)
- Integrated handler into `AuthWrapper` via `UserDataFetcher`

</details>

<details>
<summary><strong>Files Modified (1)</strong></summary>

- `core/auth/authProvider.tsx`

</details>

---

## Version 1.6.0
**Released:** November 30, 2025

### Batch Details & Label Printing Enhancements

Enhanced the Batch Details page with bulk actions and optimized the shipping label print layout for perfect 4x6 inch output.

<details>
<summary><strong>Improvements (5)</strong></summary>

- **Bulk Label Generation**: Added "Generate Labels" button to batch header to process all devices at once
- **Multi-Select Actions**: Enabled selecting specific devices in the batch table to generate labels
- **Print Layout Optimization**: Aggressively tuned styles (padding, fonts, QR size) to fit 4x6" labels without overflow
- **Clean Instructions**: Fixed double numbering issue in setup instructions
- **Global Print Styles**: Added dedicated `@media print` styles to isolate labels and hide UI elements

</details>

<details>
<summary><strong>Technical Changes (4)</strong></summary>

- **API Payload Fix**: Mapped device IDs to names in `BatchDetailsPage` before calling `generateLabels`
- **New Component**: Created `ShippingLabelPrint` for consistent label rendering
- **CSS Reset**: Added `list-none` to instruction lists to prevent browser default numbering conflict
- **Print Isolation**: Implemented global print styles in `globals.css` to ensure only labels are printed

</details>

<details>
<summary><strong>Files Modified (4)</strong></summary>

- `app/(authenticated)/admin/shipping/[batchId]/page.tsx`
- `components/features/shipping/ShippingLabelPrint.tsx`
- `components/features/shipping/ShippingLabelPrintModal.tsx`
- `app/globals.css`

</details>

---

## Version 1.5.0
**Released:** November 29, 2025

### AirQo Group Permissions in Private Context

Implemented a fallback mechanism to use AirQo group permissions when users are in the personal context, enabling staff to access permission-gated features without switching contexts.

<details>
<summary><strong>Improvements (5)</strong></summary>

- **Consistent Permission Model**: Same RBAC system works across all contexts
- **Flexibility**: Users can have different permissions in their AirQo group that apply to personal context
- **No Hardcoding**: Permissions are data-driven, not hardcoded in the UI
- **Backward Compatible**: Doesn't break existing behavior for organizational contexts
- **Fine-Grained Control**: Admins can control what users can do in personal context via AirQo group roles

</details>

<details>
<summary><strong>Features Added (1)</strong></summary>

- **AirQo Group Fallback**: Automatically checks AirQo group permissions when in personal context

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- Added `getAirQoGroup` method to `permissionService`
- Updated `usePermission` hook to use AirQo group as fallback organization
- Updated `useUserContext` to use actual permission checks instead of hardcoded values

</details>

<details>
<summary><strong>Files Modified (3)</strong></summary>

- `core/permissions/permissionService.ts`
- `core/hooks/usePermissions.ts`
- `core/hooks/useUserContext.ts`

</details>

<details>
<summary><strong>Files Created (1)</strong></summary>

- `AIRQO-GROUP-PERMISSIONS-IN-PRIVATE-CONTEXT.md`

</details>

---

## Version 1.4.0
**Released:** November 29, 2025

### RouteGuard - Role-Based Access Control

Enhanced the `RouteGuard` component to support both permission-based and role-based access control, providing more flexible route protection options.

<details>
<summary><strong>Improvements (5)</strong></summary>

- **Flexibility**: Can now protect routes by permission, role, or both
- **Backwards Compatible**: Existing permission-based usage still works
- **Better UX**: Clear error messages showing what role/permission is needed
- **Type-Safe**: Full TypeScript support with autocomplete
- **Consistent API**: Same pattern for both permissions and roles

</details>

<details>
<summary><strong>Features Added (4)</strong></summary>

- **Role-based checking**: Verifies if user has a specific role or one of multiple roles
- **Flexible OR logic**: User gains access if they have EITHER the required permission OR the required role
- **New HOC**: `withRouteRole` for wrapping components with role-based protection
- **Validation**: Throws error if no access control method is specified

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- Updated `RouteGuardProps` interface to include `role` and `roles` props
- Enhanced access control logic to support `hasAccess = hasValidContext AND (hasPermissionAccess OR hasRoleAccess)`
- Improved error display to show required role(s) when access is denied

</details>

---

## Version 1.3.0
**Released:** November 29, 2025

### Shipping Label Print - New Tab Implementation

Print functionality now opens labels in a separate browser tab for better performance and user experience.

<details>
<summary><strong>Improvements (4)</strong></summary>

- **UI Thread Isolation**: Print rendering happens in separate tab, main application remains fully responsive
- **Better User Control**: Preview labels in dedicated tab, keep open for reference, can close modal immediately
- **Improved Workflow**: Open multiple label batches in separate tabs, process next batch immediately
- **Professional Print View**: Clean standalone HTML document with grid layout (2+ labels per row)

</details>

<details>
<summary><strong>Technical Changes (3)</strong></summary>

- Updated `handlePrint()` to generate standalone HTML document and open in new tab
- Auto-trigger print dialog after images load (250ms delay)
- Pop-up blocker detection with user-friendly error message

</details>

<details>
<summary><strong>Files Modified (2)</strong></summary>

- `components/features/shipping/ShippingLabelPrintModal.tsx`
- `components/features/shipping/PRINT_TAB_IMPLEMENTATION.md`

</details>

---

## Version 1.2.0
**Released:** November 29, 2025

### Shipping Labels - Grid Layout

Labels now display in a grid/row format instead of single column for easier viewing and comparison.

<details>
<summary><strong>Improvements (3)</strong></summary>

- **Better Overview**: See multiple labels at once in grid layout
- **Less Scrolling**: View 2+ labels per row on larger screens
- **Easier Comparison**: Compare labels side-by-side, responsive design adapts to screen size

</details>

<details>
<summary><strong>Technical Changes (2)</strong></summary>

- Implemented CSS Grid layout: `grid-template-columns: repeat(auto-fill, minmax(4in, 1fr))`
- Added responsive breakpoint for screens <1200px (single column fallback)

</details>

---

## Version 1.1.0
**Released:** November 29, 2025

### ShippingLabelPrintModal - ReusableDialog Integration

Refactored shipping label modal to use standard `ReusableDialog` component for UI consistency.

<details>
<summary><strong>Improvements (5)</strong></summary>

- **UI Consistency**: Matches all other modals in the application
- **Enhanced Accessibility**: ESC key support, focus trapping, focus restoration, full ARIA labels
- **Better Animations**: Framer Motion with smooth entry/exit animations and spring physics
- **Code Quality**: 27% reduction in code (179 to 130 lines), removed boilerplate
- **Built-in Features**: Automatic body scroll lock, click-outside-to-close, keyboard navigation

</details>

<details>
<summary><strong>Technical Changes (4)</strong></summary>

- Replaced custom modal implementation with `ReusableDialog`
- Added Printer icon with blue badge background
- Configured dialog size to `6xl` for optimal label preview
- Removed manual scroll lock and ESC key handling (now automatic)

</details>

<details>
<summary><strong>Files Modified (2)</strong></summary>

- `components/features/shipping/ShippingLabelPrintModal.tsx`
- `components/features/shipping/MODAL_REFACTORING.md`

</details>

---

## Version 1.0.0
**Released:** November 29, 2025

### Shipping Management - Complete Overhaul

Major UX improvements to shipping label workflow with modal-based approach and intelligent device selection.

<details>
<summary><strong>Improvements (8)</strong></summary>

- **Modal-Based Labels**: Labels open in modal overlay, keeping table in background (no page reload)
- **Auto Data Refresh**: React Query invalidation refreshes table after modal close
- **Auto Selection Clear**: Clears selection automatically for next batch
- **Smart Checkbox Logic**: Prevents selecting claimed devices with disabled checkboxes
- **Visual Feedback**: Info banner explains selection restrictions, success toasts confirm actions
- **Rich Summary Cards**: Shows total, prepared, claimed, and deployed device counts
- **Dark Mode Support**: Complete dark theme compatibility across all components
- **Workflow Efficiency**: 60% reduction in steps for batch processing (7 steps → 4 steps)

</details>

<details>
<summary><strong>Features Added (6)</strong></summary>

- `ShippingLabelPrintModal` component with full-screen modal
- `isRowSelectable` prop in `ReusableTable` for conditional checkbox enabling
- Info banner showing claimed device count and restrictions
- Success toast notifications with label count
- Automatic shipping status refresh on modal close
- Enhanced status badges with capitalization and dark mode support

</details>

<details>
<summary><strong>Technical Changes (5)</strong></summary>

- Enhanced `ReusableTable` with `isRowSelectable?: (item: T) => boolean` prop
- Updated selection logic to filter non-selectable items
- Modified checkbox rendering to show disabled state with tooltip
- Implemented smart "Select All" that respects selectability rules
- Created comprehensive state management with `useCallback` optimization

</details>

<details>
<summary><strong>Files Created (6)</strong></summary>

- `components/features/shipping/ShippingLabelPrintModal.tsx`
- `app/(authenticated)/admin/shipping/CHECKBOX_LOGIC.md`
- `app/(authenticated)/admin/shipping/UX_IMPROVEMENTS.md`
- `app/(authenticated)/admin/shipping/IMPLEMENTATION_SUMMARY.md`
- `app/(authenticated)/admin/shipping/ARCHITECTURE.md`
- `app/(authenticated)/admin/shipping/README.md`

</details>

<details>
<summary><strong>Files Modified (2)</strong></summary>

- `components/shared/table/ReusableTable.tsx`
- `app/(authenticated)/admin/shipping/page.tsx`

</details>

---

## Version 0.9.0
**Released:** November 28, 2025

### Admin Layout - Centralized Access Control

Created centralized admin layout with `RouteGuard` to enforce access control for all admin pages.

<details>
<summary><strong>Improvements (3)</strong></summary>

- **Centralized Security**: Single source of truth for admin access control
- **Reduced Redundancy**: Removed duplicate `RouteGuard` from individual admin pages
- **Maintainability**: Easier to update access control logic in one place

</details>

<details>
<summary><strong>Features Added (1)</strong></summary>

- Admin layout with `RouteGuard` restricting access to `AIRQO_SUPER_ADMIN` in `airqo-internal` context

</details>

<details>
<summary><strong>Technical Changes (2)</strong></summary>

- Created `app/(authenticated)/admin/layout.tsx` with centralized `RouteGuard`
- Removed redundant `RouteGuard` from individual admin pages (e.g., `networks/page.tsx`)

</details>

<details>
<summary><strong>Files Created (2)</strong></summary>

- `app/(authenticated)/admin/layout.tsx`
- `app/(authenticated)/admin/LAYOUT_HIERARCHY.md`

</details>

---

## Documentation Index

All detailed documentation is now consolidated in this changelog. Original documentation files are preserved for reference:

### Access Control
- **Private Context Permissions**: See Version 1.5.0
- **RouteGuard Guide**: See Version 1.4.0
- **Layout Hierarchy**: See Version 0.9.0

### Shipping Management
- **Architecture**: See Version 1.0.0 - Technical Changes
- **Checkbox Logic**: See Version 1.0.0 - Smart Checkbox Logic
- **UX Improvements**: See Versions 1.0.0, 1.1.0, 1.2.0, 1.3.0
- **Modal Refactoring**: See Version 1.1.0
- **Print Implementation**: See Version 1.3.0

---

## Summary Statistics

### Total Improvements: **33**
- UI/UX Enhancements: 20
- Performance Optimizations: 4
- Accessibility Features: 4
- Logic/Architecture: 5

### Total Features: **12**
- New Components: 2
- Enhanced Components: 6
- New HOCs: 1
- New Logic: 3

### Total Files Created: **13**
### Total Files Modified: **8**

### Code Quality Metrics
- **Code Reduction**: 27% in `ShippingLabelPrintModal` (refactoring to `ReusableDialog`)
- **Workflow Efficiency**: 60% reduction in steps for shipping management


---

## Breaking Changes

**None** - All changes are backward compatible with additive enhancements only.

---

## Migration Guide

No migration required. All new features work seamlessly with existing code.

---

## Contributors

- AirQo Development Team
- Last Updated: December 12, 2025

---

## Support

For questions or issues:
1. Check this changelog for recent changes
2. Review component documentation in source files
3. Contact the development team

---

**Legend**:
- 🎯 **Improvements**: User-facing enhancements
- 🔧 **Technical Changes**: Code-level modifications
- 📁 **Files**: Created or modified files
- ✨ **Features**: New capabilities added
