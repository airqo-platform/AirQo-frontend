---
sidebar_position: 4
sidebar_label: 3. Spatial Disaggregation & Filtering
---

# 3. Spatial Disaggregation and Geographic Filtering

### 3.1 Location Approximation for Monitor Coordinates

:::caution Privacy and security disclosure
For privacy and security reasons, all monitoring station coordinates provided through AirQo's data platforms are intentionally approximated. This policy protects the privacy of institutions, businesses, and property owners hosting AirQo monitoring equipment.
:::

| | |
|---|---|
| **Offset Range** | Approximately 0.5 kilometres from actual physical locations |
| **Consistency** | Approximated coordinates remain consistent across all queries |
| **Affected Platforms** | All data access methods: Analytics Platform, API, mobile app |

**Implications for research:**

The coordinate approximation is still valid for: area-based and neighbourhood-level analysis, regional air quality modelling, trend identification and temporal patterns, zone-level exposure assessment, and city-wide spatial analysis.

It requires adjustment for: highly localised point-source correlation studies, proximity analysis requiring exact locations, and fine-scale spatial modelling below 1 km resolution.

**Best practices for research using approximated coordinates:**

1. **Adjust your analysis radius** — for any proximity analysis, use a radius at least 0.5 km larger than your target area to account for the potential offset.
2. **Take an area-based approach** — focus on neighbourhood or zone-level analysis rather than highly localised point-source correlations.
3. **Use statistical methods that account for spatial uncertainty** in your modelling.
4. **Triangulate with other data sources** where possible, to validate spatial relationships found in the approximated data.

This approximation policy balances the need for open data access with privacy considerations, providing researchers with valuable location context while respecting the privacy of site hosts.

:::info Accessing exact coordinates
For research requiring precise monitor locations, contact [support@airqo.net](mailto:support@airqo.net) to discuss exact coordinate access, data sharing agreements, and collaboration opportunities.
:::

:::tip Querying approximated coordinates via the API
The `approximate_latitude` and `approximate_longitude` fields are returned by the public [Grid summary endpoint](../../api/reference/metadata.md#grid-summary-with-site-details) — no authentication required. That reference page also covers proximity-analysis code examples in JavaScript and Python.
:::

### 3.2 Selecting Monitors by Geographic Area

AirQo provides three methods for spatial data selection:

- **Method 1 – Analytics Platform (Bulk Export)**: Select specific cities or regions, choose individual monitoring sites, define custom date ranges, and export in CSV format.
- **Method 2 – Grid API**: Query data by geographic coordinates or administrative boundaries (districts, divisions, parishes). See the [AirQo API documentation](../../api/intro.md).
- **Method 3 – Manual Monitor Selection**: Use the Analytics Platform interactive map to identify and select individual monitors within your study region.

### 3.3 Geographic Coverage

Visit our [network coverage page](https://airqo.net/solutions/network-coverage) for monitor locations, or contact [support@airqo.net](mailto:support@airqo.net) for specific coverage in your study area.
