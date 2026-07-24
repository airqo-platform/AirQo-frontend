# Exposure Route API Ideation Notes

This note captures the route-based air quality documentation shared in screenshots and connects it to the current mobile Exposure feature for future design and implementation work.

## Why This Matters

The current Exposure tab in mobile is place-based:

- Users declare places like `Home`, `Work`, or `School`
- The app fetches hourly PM2.5 for those saved places
- Exposure is summarized by time windows and simple `Low` / `Moderate` / `High` levels
- `My Trips` is still a placeholder in the current UI

The route API documented below gives us a realistic path toward a trip-based exposure experience.

## Documented API Concept

The screenshots describe a two-step route workflow:

1. Find monitoring locations near a travel route
2. Use the returned site IDs to fetch actual air quality measurements

This enables route-aware exposure instead of only place-aware exposure.

## Step 1: Find Nearest Locations

Endpoint:

```text
POST /api/v2/devices/metadata/routes/nearest-locations
```

Purpose:

- Identify air quality monitoring locations within a configurable distance from a route polyline

Request body:

| Parameter | Type | Required | Notes |
| --- | --- | --- | --- |
| `polyline` | `Array<Object>` | Yes | Route coordinates; must contain at least 2 points |
| `radius` | `number` | Yes | Search radius in kilometers; valid range `0.1 - 50` |

Polyline object structure:

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `lat` | `number` | Yes | Latitude, valid range `-90 to 90` |
| `lng` | `number` | Yes | Longitude, valid range `-180 to 180` |

Important note from the docs:

- Polyline coordinates are expected to come from a mapping provider after decoding an encoded route polyline

## Step 2: Obtain the Route Polyline

Before calling the route endpoint, a client app must generate a route polyline from a mapping service.

Recommended sources from the screenshots:

- Google Maps Directions API
- Mapbox Directions API
- OpenRouteService

Expected process:

1. Request a route between origin and destination
2. Extract the encoded polyline from the response
3. Decode it into `[{ lat, lng }]`

Polyline decoding libraries mentioned:

- JavaScript/TypeScript: `@googlemaps/polyline-codec`, `polyline-encoded`
- Flutter/Dart: `flutter_polyline_points`
- Python: `polyline`

## Step 3: Retrieve Air Quality Measurements

Once nearby monitoring locations are found, the docs show a second fetch for actual measurements.

Example pattern:

```text
/api/v2/devices/measurements?site_id=<comma-separated-site-ids>&recent=yes
```

Purpose:

- Convert route-adjacent site IDs into actual air quality data that the app can rank, display, or summarize

## End-to-End Workflow

From the screenshots, the complete route flow is:

1. Get route polyline from a mapping service
2. Call `POST /api/v2/devices/metadata/routes/nearest-locations`
3. Extract returned nearby site IDs
4. Fetch measurements for those site IDs
5. Display route-aware air quality in the UI

## Common Use Cases From the Docs

- Mobile navigation apps
  - Show route air quality to help users make informed travel decisions
- Fleet management
  - Monitor route exposure for vehicles and optimize routes for driver health
- Urban planning
  - Identify weak monitoring coverage along road networks
- Health applications
  - Recommend cleaner routes for people with respiratory conditions

## Best Practices From the Docs

1. Optimize polyline density
   - Too many points may hurt performance
   - Too few points may miss relevant nearby locations
2. Choose search radius by context
   - Urban: `0.5 - 2 km`
   - Suburban: `2 - 5 km`
   - Rural: `5 - 20 km`
3. Handle empty results safely
4. Cache results for common or repeated routes
5. Add robust network and API error handling
6. Be mindful of rate limiting for frequent live route checks

## What This Could Mean For The Current Mobile Exposure Feature

The current codebase already supports:

- Place-based exposure
- Hourly readings by saved site
- A `My Trips` tab placeholder

This route API suggests a clean `Exposure v2` direction:

### Product direction

- Turn `My Trips` into a real trip exposure workflow
- Let users compare two routes by air quality
- Show cleaner commute options, not just destination air quality
- Surface “high exposure segments” along a trip

### Data flow direction

Possible mobile flow:

1. User chooses origin and destination
2. App requests route polyline from mapping provider
3. App calls route-nearest-locations endpoint
4. App fetches measurements for returned site IDs
5. App computes route summary metrics
6. App renders:
   - cleanest route
   - average route exposure
   - highest-risk segment
   - time-of-day recommendations

## Strong Feature Ideas For Ideation

### 1. My Trips becomes real

- Saved commute routes
- Typical departure windows
- Daily trip exposure summary

### 2. Cleaner route recommendations

- “Fastest route” vs “cleaner route”
- Simple tradeoff messaging like:
  - `+8 mins, lower PM2.5`

### 3. Route segment insights

- Highlight dirty segments along the route
- Show where readings spike

### 4. Exposure-aware alerts

- Warn if a frequently used route is unusually polluted today
- Suggest alternate route or delayed departure

### 5. Research and health use cases

- Repeated route exposure logging
- Exposure trends across commutes
- Symptom survey prompts after high-exposure trips

## Implementation Notes For Flutter Mobile

Likely building blocks in the current app:

- Exposure tab shell:
  - `src/mobile/lib/src/app/exposure/pages/exposure_dashboard_view.dart`
- Current exposure models:
  - `src/mobile/lib/src/app/exposure/models/declared_place.dart`
- Current readings fetch pattern:
  - `src/mobile/lib/src/app/exposure/repository/hourly_readings_repository_impl.dart`

Probable new pieces:

- Route selection model
- Mapping provider integration
- Polyline decoding utility
- Route-nearby-locations repository
- Route measurement aggregation service
- `My Trips` production UI

## Open Questions

- What does the nearest-locations response schema look like exactly?
- Does it return sites only, or also devices, cohorts, and grids in separate collections?
- How should route exposure be summarized:
  - average PM2.5
  - weighted segment score
  - worst-segment score
  - time-weighted cumulative exposure
- Should route results be cached per origin/destination pair?
- Do we want single-route display first, or route comparison first?

## Suggested Next Steps

1. Confirm the exact response schema for `nearest-locations`
2. Define a route exposure scoring model for mobile
3. Decide whether `My Trips` starts with:
   - saved commute routes
   - one-off route checks
   - route comparison
4. Prototype a minimal flow using one route and one summary card
5. Add product copy for route recommendations and exposure messaging
