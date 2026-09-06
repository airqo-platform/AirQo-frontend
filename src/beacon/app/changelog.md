# AirQo Beacon - Changelog

> **Note**: This changelog consolidates all recent improvements, features, and fixes to the AirQo Beacon frontend.

## Version 2.1.1
**Released:** September 6, 2026

### Feature: Interactive Subsystem Topology Flow, Production Diagnostics API & AirQo RBAC Gating

Enhanced the Beacon hardware diagnostics platform with interactive ReactFlow subsystem topology mapping, production-grade API service integration with mock removal, multi-stage diagnostic template authoring, and organization-scoped access control.

<details>
<summary><strong>Subsystem Topology Flow & Visual Hardware Architecture</strong></summary>

- **Created `components/diagnostics/SubsystemTopologyFlow.tsx`**:
  - Interactive drag-and-drop node graph canvas built on ReactFlow visualizing device hardware subsystems and their power/data topologies.
  - Subsystem nodes categorized with distinct iconography, status colors, and criticality badges for Battery, Power, Sensors, Cellular Modems, Compute, Cooling, and Actuators.
  - Directed edge connections representing system dependency relationships: `POWERS`, `CONNECTS_TO`, `MONITORS`, `CONTROLS`, `FEEDS`, and `COOLS`.
  - Live metric and slot summaries directly visible on node cards.

</details>

<details>
<summary><strong>Device Profile Workspace & Completeness Validation</strong></summary>

- **Created Dedicated Profile Editor** (`app/dashboard/settings/device-profiles/[id]/page.tsx`):
  - Comprehensive hardware profile workspace supporting slot mappings across telemetry, device configuration, and metadata fields.
  - Component metric configuration modal (`MetricModal.tsx`) with expected operating ranges (min/max), measurement units, and telemetry flags.
  - Subsystem modal (`SubsystemModal.tsx`) and relationship modal (`RelationshipModal.tsx`) for granular hardware configuration.
  - Profile header modal (`EditHeaderModal.tsx`) with category, vendor selection, and firmware version constraints.
- **Refactored Catalog View** (`app/dashboard/settings/device-profiles/page.tsx`):
  - Added real-time profile search, category filtering, and status filtering.
  - Implemented `getProfileCompleteness` algorithm in `types/diagnostics.ts` scoring profile completion based on slot mappings, defined subsystems, and topology relationships.
  - Added lightweight profile registration modal (`RegisterProfileModal.tsx`) to quickly bootstrap new hardware models.

</details>

<details>
<summary><strong>Diagnostic Templates 3-Layer Authoring Suite</strong></summary>

- **Upgraded Template Authoring** (`app/dashboard/settings/diagnostic-templates/page.tsx`):
  - Implemented a 3-layer guided wizard for configuring fault detection templates:
    1. **Metadata & Scope**: Target component types (battery, sensor, connectivity, etc.) and versioning.
    2. **Symptoms**: Evidential symptom definitions with severity classification (LOW, MEDIUM, HIGH, CRITICAL) and threshold rules.
    3. **Causes & Hypothesis Rules**: Root-cause failure definitions with directional hypothesis evidence weights (supporting vs. refuting) and mandatory criteria flags.
  - Added raw JSON template inspector with copy-to-clipboard functionality.
  - Added template seeding utility allowing technicians to reset to standard AirQo sensor rule baselines.

</details>

<details>
<summary><strong>Production Diagnostics API Integration (Mock Removal)</strong></summary>

- **Overhauled `services/diagnosticsService.ts`**:
  - Completely removed hardcoded seed data and client-side mock simulation fallbacks (`isMockMode`).
  - Switched to strict production endpoints for fleet triage (`getFleetTriage`), diagnostic templates (`getTemplates`, `saveTemplate`, `deleteTemplate`, `seedTemplates`), device profiles (`getProfiles`, `getProfileById`, `saveProfile`, `deleteProfile`), live evaluations (`getEvaluationResult`), and technician feedback (`submitFeedback`).
  - Standardized authorization header injection (`getAuthHeaders`) and structured error handling reporting explicit HTTP status codes.
- **Updated `types/diagnostics.ts`**:
  - Expanded data contracts for `HypothesisRule`, `TemplateSymptom`, `TemplateCause`, `DeviceVendor`, and `ComponentRelationship`.
  - Added relationship resolving utility (`getRelationshipDetails`) and vendor normalization helper (`getVendorName`).

</details>

<details>
<summary><strong>AirQo Group RBAC Gating & Admin Navigation</strong></summary>

- **Organization-Level Access Restriction**:
  - Restricted Fleet Diagnostics Triage (`/dashboard/diagnostics`), Bench Simulator (`/dashboard/diagnostics/simulator`), Device Diagnostics Tab, Device Diagnostics Inspector (`/dashboard/devices/[id]/diagnostics`), Device Profiles, and Diagnostic Templates to the **AirQo** active organization (`isAirqoGroup`).
  - Rendered informative `Restricted Organization Section` shield banner when accessing diagnostics under external partner organizations.
  - Moved IoT Diagnostics navigation from general fleet sidebar (`components/dashboard/sidebar.tsx`) to `components/dashboard/global-admin-sidebar.tsx`.

</details>

<details>
<summary><strong>UI Layering, Cartography & Heatmap Optimization</strong></summary>

- **Elevated Overlay Z-Index (`z-[10001]`)**:
  - Updated Radix UI dropdown menus (`components/ui/dropdown-menu.tsx`), popovers (`popover.tsx`), selects (`select.tsx`), and tooltips (`tooltip.tsx`) to render with high z-index, preventing occlusion by Leaflet map overlays and modal dialogs.
- **Cartography Tile Updates** (`components/maintenance/map/map-style-dialog.tsx`):
  - Set OpenStreetMap (`osm`) as the primary default basemap tile layer.
- **Analytics Heatmap Optimization** (`components/analytics/device-heatmap.tsx`):
  - Memoized `device.hourly_data` points array with `useMemo` to eliminate unnecessary canvas re-renders during tab switches.
- **Branding & Layout**:
  - Updated application title to "AirQo Beacon" in `app/layout.tsx`.
  - Polished login hero copy in `app/login/page.tsx`.

</details>

**Files changed:**
- `components/diagnostics/SubsystemTopologyFlow.tsx` [NEW] — Interactive ReactFlow subsystem hardware topology diagram
- `app/dashboard/settings/device-profiles/[id]/page.tsx` [NEW] — Full device profile editor and slot mapping studio
- `components/diagnostics/DeviceProfileModal.tsx` [NEW] — Profile creation and edit dialog
- `components/diagnostics/EditHeaderModal.tsx` [NEW] — Profile header metadata dialog
- `components/diagnostics/MetricModal.tsx` [NEW] — Component metric definition dialog
- `components/diagnostics/RegisterProfileModal.tsx` [NEW] — Initial profile registration dialog
- `components/diagnostics/RelationshipModal.tsx` [NEW] — Hardware subsystem relationship dialog
- `components/diagnostics/SlotMappingModal.tsx` [NEW] — Hardware slot mapping dialog
- `components/diagnostics/SubsystemModal.tsx` [NEW] — Subsystem configuration dialog
- `app/dashboard/settings/device-profiles/page.tsx` — Profile catalog with search, filters, and completeness validation
- `app/dashboard/settings/diagnostic-templates/page.tsx` — 3-step diagnostic template authoring wizard
- `services/diagnosticsService.ts` — Production API client refactoring and mock removal
- `types/diagnostics.ts` — Extended diagnostics models, relationships, and completeness contracts
- `app/dashboard/diagnostics/page.tsx` — AirQo organization gating and API error handling
- `app/dashboard/diagnostics/simulator/page.tsx` — AirQo organization gating
- `app/dashboard/devices/[id]/page.tsx` — Conditional diagnostics tab based on active group
- `app/dashboard/devices/[id]/diagnostics/page.tsx` — AirQo organization gating
- `app/dashboard/devices/[id]/diagnostics-tab.tsx` — Dependency array stabilization
- `components/dashboard/global-admin-sidebar.tsx` — IoT Diagnostics navigation entry
- `components/dashboard/sidebar.tsx` — Removed diagnostics from standard fleet sidebar
- `components/maintenance/map/map-style-dialog.tsx` — OpenStreetMap default tile style
- `components/analytics/device-heatmap.tsx` — Hourly data point memoization
- `components/ui/dropdown-menu.tsx` — Elevated z-index to z-[10001]
- `components/ui/popover.tsx` — Elevated z-index to z-[10001]
- `components/ui/select.tsx` — Elevated z-index to z-[10001]
- `components/ui/tooltip.tsx` — Elevated z-index to z-[10001]
- `app/layout.tsx` — Title update to AirQo Beacon
- `app/login/page.tsx` — Login hero copy update
- `app/changelog.md` — Changelog update for Version 2.1.1

---

## Version 2.1.0
**Released:** September 4, 2026

### Feature: Comprehensive Device Diagnostics Engine & Subsystem Telemetry Architecture

Implemented an enterprise-grade hardware diagnostics engine in Beacon. The system provides deep health scoring across hardware subsystems (Power, Telemetry, Sensor, and Connectivity), configurable device profiles with slot mappings, fault simulation for automated root-cause analysis, and a real-time technician feedback loop.

<details>
<summary><strong>Subsystem Scoring, Health Gauges & Evidence Fact Evaluation</strong></summary>

- **Created Diagnostics Visual Components**:
  - `components/diagnostics/HealthScoreGauge.tsx`: SVG-rendered semi-circular health gauge visualizing aggregate device health scores (0–100), categorized dynamically into Critical (<40), Degraded (40–74), and Healthy (75–100) states with animated needle transitions and trend badges.
  - `components/diagnostics/SubsystemScoreCard.tsx`: Granular subsystem cards displaying subsystem-level health scores, active evidence facts, and confidence ratings for Power (battery/solar), Telemetry (transmission rates, packet drop), Sensor (dual PM2.5/PM10 correlation, out-of-range sensor values), and Connectivity (cellular RSSI, SIM state).
  - `components/diagnostics/EvidenceFactBadge.tsx`: Visual chips indicating individual evaluated telemetry evidence facts with severity coding (info, warning, error, critical) and rule condition tooltips.
  - `components/diagnostics/DiagnosisCard.tsx`: Root-cause diagnosis card detailing identified hardware/software defects, estimated probability percentage, affected components, and prescribed technician remediation actions.
  - `components/diagnostics/TechnicianFeedbackModal.tsx`: Interactive dialog enabling field technicians to confirm, refute, or adjust diagnostic conclusions, record verified root causes, and submit field observations back to the platform.
  - `components/diagnostics/TelemetryDiagnosticChart.tsx`: High-resolution multi-channel telemetry time-series visualization with dynamic thresholds, baseline overlays, and zoom/pan capabilities.

</details>

<details>
<summary><strong>Device Profiles, Slot Mappings & Diagnostic Templates</strong></summary>

- **Created Device Profile Management** (`app/dashboard/settings/device-profiles/page.tsx` & `[id]/page.tsx`):
  - Added full CRUD administration for device hardware profiles defining hardware configurations, sensor slot counts, and bus architectures.
  - Created modal suite: `DeviceProfileModal.tsx`, `EditHeaderModal.tsx`, `MetricModal.tsx`, `RegisterProfileModal.tsx`, `RelationshipModal.tsx`, `SlotMappingModal.tsx`, and `SubsystemModal.tsx`.
  - Enables mapping physical sensor slots (e.g., Slot 1: Plantower PMS5003, Slot 2: Sensirion SHT31) to diagnostic metric schemas and telemetry channels.
- **Created Diagnostic Templates** (`app/dashboard/settings/diagnostic-templates/page.tsx`):
  - Configurable threshold templates defining normal operational bounds, warning limits, and critical trigger points for voltage, temperature, humidity, particulate matter drift, and cellular signal parameters.

</details>

<details>
<summary><strong>Fault Simulator, Diagnostics Tab & Typed Service Layer</strong></summary>

- **Created Interactive Diagnostics Simulator** (`app/dashboard/diagnostics/simulator/page.tsx`):
  - Interactive testbench for hardware engineers to simulate sensor failures, power anomalies, and network packet corruption to evaluate diagnostic rule accuracy.
- **Created Device Detail Diagnostics Integration** (`app/dashboard/devices/[id]/diagnostics-tab.tsx` & `[id]/diagnostics/page.tsx`):
  - Embedded live diagnostics evaluation directly inside the device overview dashboard.
- **Created Typed Service & Data Contracts** (`services/diagnosticsService.ts` & `types/diagnostics.ts`):
  - Implemented 1,300+ line diagnostics service with complete REST endpoints, client-side caching, mock fallback storage, and comprehensive TypeScript types for all telemetry rules and subsystem models.

</details>

### Feature: Unified Theme Architecture & Multi-Tenant Synchronization Parity

Implemented the unified cross-app theme system in Beacon, establishing full visual and functional parity with Nexus and Vertex. Supports dynamic primary color computation, zero-flicker pre-hydration head scripts, platform API theme persistence, and real-time cross-tab synchronization.

<details>
<summary><strong>Dynamic Primary Color Math & Head Script Injection</strong></summary>

- **Created `lib/theme-utils.ts`**:
  - Implemented hex-to-RGB conversion (`hexToRgb`) and RGB lighten/darken algorithms (`lightenRgb`, `darkenRgb`) that automatically compute `--primary-50`, `--primary-100`, `--primary-700`, `--primary-800`, and `--primary-900` CSS variables from any custom primary color.
  - Implemented `applyThemeImmediately` to synchronously apply CSS custom properties on `document.documentElement.style` and toggle the `.dark` class.
  - Added `getThemeScript()` executed inside the HTML `<head>` before React hydration, inspecting Redux persist state (`persist:user`) or localStorage to apply the correct theme with zero visual flash.
  - Added group-scoped theme storage (`theme_group_<id>`) with fallback to general `theme`.
- **Created `services/theme-service.ts`**:
  - Implemented `fetchUserTheme(groupId, userId, token)` querying priority endpoints:
    1. `/users/preferences/theme/user/:userId/group/:groupId`
    2. `/users/theme`
    3. `/users/preferences/theme/organization/group/:groupId`
  - Implemented `updateUserTheme(themeData, groupId, token)` to persist theme modifications back to the backend.
- **Updated `components/theme-provider.tsx`**:
  - Window `storage` event listener enabling real-time cross-tab and cross-app live theme synchronization between Nexus, Vertex, and Beacon.
  - Exports unified `useTheme()` hook providing `{ theme, themeData, resolvedTheme, setTheme, setPrimaryColor, updateTheme }`.
- **Updated `tailwind.config.js`**: Extended `colors.primary` to map `50`, `100`, `700`, `800`, and `900` shades to `rgb(var(--primary-*) / <alpha-value>)`.

</details>

### Feature: Global Admin Shell & Maintenance Map Modularization

<details>
<summary><strong>Navigation & App Shell Redesign</strong></summary>

- **Updated `components/dashboard/top-nav.tsx`**: Integrated quick organization switcher, live notifications, network indicator, and direct profile navigation.
- **Created `components/dashboard/global-admin-sidebar.tsx` & Updated `sidebar.tsx`**: Enhanced sidebar supporting group-scoped roles, admin tools, and collapsing states.
- **Created `components/dashboard/summary-card.tsx`**: Standardized metric summary cards with trend indicators and status colors.
- **Created Loading Indicators**: `components/ui/loading-overlay.tsx`, `components/ui/loading-spinner.tsx`, `components/ui/loading-state.tsx`.

</details>

<details>
<summary><strong>Maintenance Map Modular Refactoring</strong></summary>

- Decomposed the monolithic 2,000+ line maintenance map into dedicated, reusable sub-components:
  - `components/maintenance/map/device-details-panel.tsx`: Slide-over panel displaying real-time sensor status, telemetry metrics, and maintenance history.
  - `components/maintenance/map/device-location-card.tsx`: Quick-view card showing geo-coordinates, site name, and deployment metadata.
  - `components/maintenance/map/map-controls.tsx`: Layer toggle, zoom controls, and fullscreen handlers.
  - `components/maintenance/map/map-header.tsx`: Map title bar with quick action buttons and device counts.
  - `components/maintenance/map/map-legend.tsx`: Dynamic status legend reflecting device health thresholds.
  - `components/maintenance/map/map-sidebar.tsx`: Collapsible device list sidebar with instant search and filtering.
  - `components/maintenance/map/map-style-dialog.tsx`: Basemap style selector (streets, satellite, outdoors, dark).
  - `components/maintenance/map/map-top-filters.tsx`: Multi-parameter filter bar for networks, cohorts, and operational status.
  - `components/maintenance/map/polygon-area-panel.tsx`: Geospatial polygon area calculation and geofencing management panel.

</details>

**Files changed:**
- `app/dashboard/diagnostics/page.tsx` [NEW] — Main diagnostics dashboard
- `app/dashboard/diagnostics/simulator/page.tsx` [NEW] — Interactive hardware fault simulator
- `app/dashboard/devices/[id]/diagnostics-tab.tsx` [NEW] — Device diagnostics tab view
- `app/dashboard/devices/[id]/diagnostics/page.tsx` [NEW] — Dedicated device diagnostics page
- `app/dashboard/settings/device-profiles/page.tsx` [NEW] — Device profile listing and configuration
- `app/dashboard/settings/device-profiles/[id]/page.tsx` [NEW] — Device profile editor
- `app/dashboard/settings/diagnostic-templates/page.tsx` [NEW] — Diagnostic threshold template manager
- `components/diagnostics/DiagnosisCard.tsx` [NEW] — Diagnosis summary card
- `components/diagnostics/EvidenceFactBadge.tsx` [NEW] — Evidence fact badge
- `components/diagnostics/HealthScoreGauge.tsx` [NEW] — Health score SVG gauge
- `components/diagnostics/SubsystemScoreCard.tsx` [NEW] — Subsystem score breakdown
- `components/diagnostics/TechnicianFeedbackModal.tsx` [NEW] — Technician field feedback dialog
- `components/diagnostics/TelemetryDiagnosticChart.tsx` [NEW] — Telemetry chart with threshold overlays
- `components/diagnostics/DeviceProfileModal.tsx` [NEW] — Profile creation and edit modal
- `components/diagnostics/EditHeaderModal.tsx` [NEW] — Profile header configuration modal
- `components/diagnostics/MetricModal.tsx` [NEW] — Metric definition modal
- `components/diagnostics/RegisterProfileModal.tsx` [NEW] — Profile registration wizard modal
- `components/diagnostics/RelationshipModal.tsx` [NEW] — Component relationship modal
- `components/diagnostics/SlotMappingModal.tsx` [NEW] — Hardware slot mapping modal
- `components/diagnostics/SubsystemModal.tsx` [NEW] — Subsystem configuration modal
- `components/maintenance/map/device-details-panel.tsx` [NEW] — Modular device details slide-over
- `components/maintenance/map/device-location-card.tsx` [NEW] — Geo-location summary card
- `components/maintenance/map/map-controls.tsx` [NEW] — Map control buttons
- `components/maintenance/map/map-header.tsx` [NEW] — Map header bar
- `components/maintenance/map/map-legend.tsx` [NEW] — Map legend
- `components/maintenance/map/map-sidebar.tsx` [NEW] — Map device list sidebar
- `components/maintenance/map/map-style-dialog.tsx` [NEW] — Basemap style selector modal
- `components/maintenance/map/map-top-filters.tsx` [NEW] — Map filter bar
- `components/maintenance/map/polygon-area-panel.tsx` [NEW] — Polygon geofencing panel
- `components/dashboard/global-admin-sidebar.tsx` [NEW] — Global admin navigation sidebar
- `components/dashboard/summary-card.tsx` [NEW] — Metric summary card
- `components/ui/loading-overlay.tsx` [NEW] — Fullscreen loading overlay
- `components/ui/loading-spinner.tsx` [NEW] — Loading spinner component
- `components/ui/loading-state.tsx` [NEW] — Inline loading state card
- `lib/theme-utils.ts` [NEW] — Theme calculations, primary shade generator, head script
- `services/theme-service.ts` [NEW] — Platform API theme sync service
- `services/diagnosticsService.ts` [NEW] — Diagnostics API client and fallback store
- `types/diagnostics.ts` [NEW] — TypeScript interfaces for diagnostics models
- `components/theme-provider.tsx` — Cross-app and cross-tab theme provider
- `components/dashboard/top-nav.tsx` — Top navigation redesign
- `components/dashboard/sidebar.tsx` — Primary sidebar redesign
- `components/maintenance/maintenance-map.tsx` — Refactored to compose modular map panels
- `tailwind.config.js` — Extended primary color shades (50, 100, 700, 800, 900)
- `app/globals.css` — Modernized CSS variables and animations

---

## Version 2.0.9
**Released:** August 23, 2026

### Feature: LoRaWAN Device & Gateway Infrastructure

Introduced comprehensive LoRaWAN gateway and device health telemetry monitoring, allowing operators to oversee long-range, low-power air quality sensor networks across Africa.

<details>
<summary><strong>Gateway Diagnostics, Signal Analytics & Map Export</strong></summary>

- **Created `components/maintenance/lorawan-gateway-dialog.tsx`**:
  - Full-featured gateway modal providing real-time packet forwarder monitoring, connected device counts, downlink/uplink packet counters, and gateway uptime.
  - Live signal quality analytics visualizing Received Signal Strength Indication (RSSI) and Signal-to-Noise Ratio (SNR) distributions across network nodes.
  - Channel utilization charts and frequency plan validation (EU868 / US915 / AS923).
- **Created `components/maintenance/map-export-dialog.tsx`**:
  - Export dialog allowing operators to generate high-resolution PNG, JPEG, and PDF snapshots of active maintenance maps including active geofences, filtered device layers, and health metrics.
- **Created `utils/lorawan-utils.ts` & `types/lorawan.types.ts`**:
  - Added SNR-to-quality rating algorithms, RSSI path-loss estimators, and packet error rate (PER) calculation helpers.
- **Updated Hardware Adapters**:
  - Enhanced `services/iot/adapters/ArduinoAdapter.ts` and `ESPAdapter.ts` with LoRaWAN payload parsing and binary frame decoding.
- **Updated Reliability & Continental Map Views**:
  - `app/dashboard/devices/device-reliability-analysis.tsx`: Mean Time Between Failures (MTBF) and Mean Time To Repair (MTTR) calculation enhancements for battery-operated LoRaWAN nodes.
  - `app/dashboard/devices/africa-map.tsx`: Added LoRaWAN gateway coverage radius overlays.

</details>

**Files changed:**
- `components/maintenance/lorawan-gateway-dialog.tsx` [NEW] — LoRaWAN gateway telemetry and configuration modal
- `components/maintenance/map-export-dialog.tsx` [NEW] — Map and telemetry report export dialog
- `utils/lorawan-utils.ts` [NEW] — LoRaWAN RF calculation utilities and frame decoders
- `types/lorawan.types.ts` [NEW] — Type definitions for gateways, radio packets, and signal metrics
- `app/dashboard/maintenance/page.tsx` — Integration of LoRaWAN gateway inspection actions
- `components/maintenance/maintenance-map.tsx` — Gateway location markers and RF coverage circles
- `services/iot/adapters/ArduinoAdapter.ts` — LoRaWAN frame parsing
- `services/iot/adapters/ESPAdapter.ts` — LoRaWAN frame parsing
- `app/dashboard/devices/africa-map.tsx` — Continental gateway density visualization
- `app/dashboard/devices/device-reliability-analysis.tsx` — Reliability metrics for low-power nodes

---

## Version 2.0.8
**Released:** August 21, 2026

### Feature: Visualise Telemetry Analysis Workspace & Multi-Format Data Parser

Built a dedicated visual analytics workspace in Beacon (`/dashboard/visualise`) enabling engineers to upload, parse, map, and visualize external device telemetry alongside native AirQo sensor data.

<details>
<summary><strong>Universal File Ingestion & Automatic Schema Mapping</strong></summary>

- **Created `components/visualise/data-uploader.tsx`**:
  - Drag-and-drop file uploader supporting CSV, Excel (.xlsx/.xls), and JSON sensor logs with client-side chunked parsing.
- **Created `components/visualise/column-mapping-dialog.tsx` & `lib/visualise/column-mapper.ts`**:
  - Fuzzy header matching algorithm identifying timestamp columns (ISO, Unix, UTC), sensor pollutants (PM2.5, PM10, NO2, O3, CO), weather parameters (temperature, relative humidity, pressure), and device serial identifiers.
  - Visual column mapping modal allowing technicians to override detected headers and verify schema alignment with live preview tables (`data-table-preview.tsx`).
- **Created `lib/visualise/data-parser.ts`**:
  - Robust parser supporting automatic date normalization, numerical conversion, null/NaN sanitization, outlier filtering, and anomaly detection.
- **Created `lib/visualise/sample-datasets.ts`**:
  - Pre-bundled sample datasets (urban roadside, rural reference, in-lab calibration) for immediate offline inspection and testing.

</details>

<details>
<summary><strong>Multi-View Analytical System</strong></summary>

- **Created High-Performance Analytical Views**:
  - `components/visualise/system-graphs/cohort-summary-view.tsx`: Cohort-level statistical summaries including median, interquartile ranges, and variance distribution across sensor groups.
  - `components/visualise/system-graphs/geospatial-map-view.tsx`: Spatial rendering of uploaded device records with pollutant-concentration color coding and coordinate verification.
  - `components/visualise/system-graphs/heatmap-analytics-view.tsx`: Hour-of-day vs. day-of-week diurnal heatmaps exposing temporal air quality spikes and sensor drift.
  - `components/visualise/system-graphs/sensor-health-view.tsx`: Sensor operational uptime, transmission consistency, and diagnostic battery degradation curves.
  - `components/visualise/system-graphs/sensor-telemetry-view.tsx`: Synchronized multi-metric line and bar time-series with dual Y-axes.
- **Created Visualization Controls**:
  - `components/visualise/chart-canvas.tsx`: SVG/Canvas rendering engine with export to image/SVG.
  - `components/visualise/chart-controls.tsx`: Metric selection, aggregation interval (raw, 15m, 1h, 24h), and smoothing curve toggles.
  - `components/visualise/date-range-filter-bar.tsx`: Date picker with predefined ranges (Last 24 Hours, Last 7 Days, Last 30 Days, Custom Range).
  - `components/visualise/kpi-summary.tsx`: Quick statistics cards summarizing total data points, mean concentrations, data completeness percentage, and anomaly count.

</details>

**Files changed:**
- `app/dashboard/visualise/page.tsx` [NEW] — Main visual analytics page
- `app/dashboard/visualize/page.tsx` [NEW] — Redirect route alias
- `components/visualise/chart-canvas.tsx` [NEW] — Dynamic chart rendering canvas
- `components/visualise/chart-controls.tsx` [NEW] — Chart configuration toolbar
- `components/visualise/column-mapping-dialog.tsx` [NEW] — Column mapping dialog
- `components/visualise/data-table-preview.tsx` [NEW] — Telemetry data table preview
- `components/visualise/data-uploader.tsx` [NEW] — Drag-and-drop file uploader
- `components/visualise/date-range-filter-bar.tsx` [NEW] — Date range filter component
- `components/visualise/kpi-summary.tsx` [NEW] — Telemetry KPI summary cards
- `components/visualise/system-graphs/cohort-summary-view.tsx` [NEW] — Cohort summary view
- `components/visualise/system-graphs/geospatial-map-view.tsx` [NEW] — Geospatial map view
- `components/visualise/system-graphs/heatmap-analytics-view.tsx` [NEW] — Heatmap view
- `components/visualise/system-graphs/sensor-health-view.tsx` [NEW] — Sensor health view
- `components/visualise/system-graphs/sensor-telemetry-view.tsx` [NEW] — Sensor telemetry view
- `lib/visualise/column-mapper.ts` [NEW] — Automatic column mapping algorithm
- `lib/visualise/data-parser.ts` [NEW] — Multi-format file parsing engine
- `lib/visualise/sample-datasets.ts` [NEW] — Bundled sample telemetry datasets
- `components/dashboard/sidebar.tsx` — Visualise navigation item added

---

## Version 2.0.7
**Released:** August 19, 2026

### Chore: Next.js Standalone Docker Deployment & Production Hardening

Optimized the Beacon Docker container architecture for production deployments on staging and production clusters.

<details>
<summary><strong>Standalone Output Mode & Security Improvements</strong></summary>

- **Updated `Dockerfile`**:
  - Migrated to Next.js `output: 'standalone'` mode, copying only production artifacts and necessary server files.
  - Drastically reduced final Docker image size from ~1.4GB down to under 200MB.
  - Implemented multi-stage build: `deps` -> `builder` -> `runner`.
  - Configured non-root system user (`nextjs:nodejs`, UID 1001) for strict runtime security compliance.
  - Added dumb-init process supervision for clean signal forwarding (`SIGTERM`/`SIGINT`).
- **Resolved Pull Request Security Findings**:
  - Addressed container vulnerability advisories regarding base image dependencies and pinned security packages.

</details>

**Files changed:**
- `Dockerfile` — Multi-stage standalone output Docker configuration
- `next.config.mjs` — Standalone output flag configuration

---

## Version 2.0.6
**Released:** August 18, 2026

### Fix: Authentication Flow & Access Control Hardening

Overhauled authentication screens, resolved unauthenticated redirect loops, and polished login state persistence.

<details>
<summary><strong>Login Component Modularization & Route Protection</strong></summary>

- **Modularized Login UI**:
  - `components/auth/auth-layout.tsx`: Centered responsive authentication shell with AirQo branding and environmental artwork.
  - `components/auth/selected-email-card.tsx`: Display card indicating the active account during re-authentication or SSO callback.
  - `components/auth/social-auth-section.tsx`: Google and social OAuth triggers with standardized button states.
- **Fixed Redirect Loops**:
  - Updated `app/login/page.tsx` and middleware to cleanly handle session expiration, preserving the `returnUrl` query parameter without causing recursive redirection.

</details>

**Files changed:**
- `app/login/page.tsx` — Login page layout and session handling
- `components/auth/auth-layout.tsx` [NEW] — Auth layout wrapper
- `components/auth/selected-email-card.tsx` [NEW] — Account selection card
- `components/auth/social-auth-section.tsx` — Social auth trigger buttons

---

## Version 2.0.5
**Released:** August 4, 2026

### Fix: Single Sign-On (SSO) & Social Login Fallback Handling

Stabilized SSO authentication across Beacon, resolving issues where users authenticated via Google OAuth or AirQo SSO experienced session dropouts or blank screens.

<details>
<summary><strong>SSO Token Rehydration & Session Recovery</strong></summary>

- **SSO Fallback Resolution**:
  - Handled token exchange failures when returning from the AirQo central auth server by introducing graceful fallback retry logic.
  - Synchronized NextAuth session state with user localStorage tokens to maintain session continuity across page reloads.
  - Handled edge cases where users authenticating through social providers lacked explicit group memberships by defaulting to their default assigned organization.

</details>

**Files changed:**
- `app/login/page.tsx` — SSO callback handling and fallback redirects
- `components/providers/auth-provider.tsx` — Session rehydration logic

---

## Version 2.0.4
**Released:** July 30, 2026

### Feature: Role-Based Access Control (RBAC) & Group Context

Introduced fine-grained role-based access control and multi-tenant organization context switching throughout the Beacon dashboard.

<details>
<summary><strong>Role Key-Based Permissions & Group Filtering</strong></summary>

- **Group Context & Selector**:
  - `lib/group-context.tsx`: React Context providing active organization group data, available groups, and group-switching handlers.
  - `components/dashboard/group-selector.tsx`: Top-bar dropdown enabling users to switch between AirQo and partner organization workspaces.
- **Role Key-Based Authorization**:
  - Applied granular permission checks for sensitive operations (device editing, firmware uploading, cohort assignment, and diagnostic configuration).
  - Gated navigation links and action buttons based on user permissions (`roles-permissions-beacon`).
- **Global 401 Unauthorized Interceptor**:
  - Configured global Axios interceptor to catch 401 responses, clear stale session tokens, and redirect to login with notification toast.

</details>

**Files changed:**
- `lib/group-context.tsx` — Group selection context and provider
- `components/dashboard/group-selector.tsx` — Group switching dropdown
- `components/dashboard/sidebar.tsx` — Permission-gated navigation items
- `app/dashboard/layout.tsx` — Context provider wrapping

---

## Version 2.0.3
**Released:** July 13, 2026

### Feature: Two-Way Web Serial Hardware Interface

Integrated the browser Web Serial API directly into Beacon, allowing hardware technicians to connect physical air quality sensors directly to their laptop via USB for bench testing and configuration.

<details>
<summary><strong>Browser-to-Hardware Serial Communication</strong></summary>

- **Two-Way Serial Communication**:
  - Implemented serial port negotiation supporting standard baud rates (9600, 115200, 57600).
  - Added bidirectional ASCII and binary data streaming: real-time sensor terminal monitoring and command transmission (`AT`, status queries, sensor resets).
  - Added automatic line buffering and stream decoding with automatic disconnect detection.
- **Dynamic Environment Loading**:
  - Configured dynamic runtime environment variable injection for production deployments (`env loaded dynamically`).

</details>

**Files changed:**
- `components/devices/web-serial-terminal.tsx` — Web Serial terminal interface
- `services/iot/webSerialService.ts` — Web Serial API port manager
- `app/dashboard/devices/[id]/page.tsx` — Web Serial action integration

---

## Version 2.0.2
**Released:** June 4, 2026

### Feature: Secure Firmware Management & Co-location Analytics

<details>
<summary><strong>HTTPS Firmware Uploads & Co-location Pipelines</strong></summary>

- **Secure Firmware Uploads**:
  - Enforced HTTPS protocols across firmware binary distribution endpoints, resolving mixed-content browser blocking on staging and production domains.
- **Co-location Testing Pipelines**:
  - `app/dashboard/collocation/inlab/[id]/page.tsx`: In-lab sensor co-location testing interface comparing candidate sensors against reference instruments.
  - `app/dashboard/collocation/site/[id]/page.tsx`: Field site co-location dashboard calculating inter-sensor correlation ($R^2$), Pearson coefficients, and offset drift.
- **Grid Sync & Toolbar**:
  - `components/common/SyncToolbar.tsx`: Reusable synchronization toolbar with loading state indicators.
  - `hooks/useSyncActions.ts`: Hook for triggering on-demand grid data synchronizations.
- **Telemetry Response Caching**:
  - Added client-side request caching for frequently queried device status and AirQloud endpoints.

</details>

**Files changed:**
- `app/dashboard/collocation/inlab/[id]/page.tsx` — In-lab co-location dashboard
- `app/dashboard/collocation/site/[id]/page.tsx` — Site co-location dashboard
- `components/common/SyncToolbar.tsx` [NEW] — Reusable sync toolbar
- `hooks/useSyncActions.ts` [NEW] — Sync action hook

---

## Version 2.0.1
**Released:** May 8, 2026

### Feature: African Geospatial Sensor Network & Maintenance Automation

<details>
<summary><strong>Continental Map & Maintenance Workflows</strong></summary>

- **Pan-African Sensor Deployment Map**:
  - `app/dashboard/devices/africa-map.tsx`: Interactive SVG and Leaflet map visualizing sensor coverage across Uganda, Kenya, Nigeria, Ghana, Cameroon, Rwanda, and Burundi.
  - Clustered marker rendering based on device status (Online, Offline, Maintenance Needed).
- **Maintenance Lifecycle Management**:
  - `app/dashboard/maintenance/page.tsx`: Centralized maintenance log tracking device repairs, battery replacements, sensor cleanings, and field visits.
  - Automated calculation of reliability metrics: Mean Time To Repair (MTTR) and Mean Time Between Failures (MTBF).
- **AirQloud Network Performance**:
  - Added urban network monitoring and regional pollutant aggregation for defined airqloud boundaries.

</details>

**Files changed:**
- `app/dashboard/devices/africa-map.tsx` — Africa continent device map
- `app/dashboard/maintenance/page.tsx` — Maintenance management page
- `app/dashboard/analytics/[id]/page.tsx` — AirQloud performance tabs

---

## Version 2.0.0
**Released:** January 20, 2026

### Milestone: Beacon 2.0 Next.js App Router Architecture

Major architectural rewrite transitioning Beacon from legacy pages to the modern Next.js App Router framework, establishing the foundation for AirQo's device health monitoring microservice.

<details>
<summary><strong>Next.js App Router, Tailwind CSS & State Architecture</strong></summary>

- **Framework & Foundation**:
  - Migrated to Next.js App Router (`app/` directory structure) with React 18 Server and Client Components.
  - Integrated Tailwind CSS with customized color palette, CSS custom properties, and dark mode support via `next-themes`.
  - Built modern UI component library on top of Radix UI primitives (`@radix-ui/react-*`) and Lucide icons.
- **Data Fetching & State Management**:
  - Integrated `@tanstack/react-query` for server state caching, background refetching, and optimistic updates.
  - Implemented Zustand stores for lightweight client-side UI state.
- **Service Layer & API Architecture**:
  - Centralized Axios client with automatic exponential backoff retry logic, request timeouts, and error normalization.
  - Structured TypeScript definitions across devices, measurements, alerts, sites, and user permissions.
  - Health check endpoints (`/api/health`, `/api/metrics`, `/api/info`) for container orchestration and uptime monitoring.

</details>

**Files changed:**
- `app/layout.tsx` — Root application layout and providers
- `app/page.tsx` — Entry route redirecting to dashboard
- `app/dashboard/layout.tsx` — Dashboard layout shell
- `app/dashboard/page.tsx` — Main device overview dashboard
- `app/dashboard/devices/page.tsx` — Device management table
- `app/dashboard/maintenance/page.tsx` — Maintenance scheduling dashboard
- `app/dashboard/alerts/page.tsx` — Device alerts and notifications
- `tailwind.config.js` — Tailwind CSS configuration
- `package.json` — Modernized dependency tree
- `README.md` — Microservice architecture documentation
