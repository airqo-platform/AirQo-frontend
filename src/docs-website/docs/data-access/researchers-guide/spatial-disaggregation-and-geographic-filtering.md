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

:::info Accessing exact coordinates
For research requiring precise monitor locations, contact [support@airqo.net](mailto:support@airqo.net) to discuss exact coordinate access, data sharing agreements, and collaboration opportunities.
:::

### 3.2 Selecting Monitors by Geographic Area

AirQo provides three methods for spatial data selection:

- **Method 1 – Analytics Platform (Bulk Export)**: Select specific cities or regions, choose individual monitoring sites, define custom date ranges, and export in CSV format.
- **Method 2 – Grid API**: Query data by geographic coordinates or administrative boundaries (districts, divisions, parishes). See the [AirQo API documentation](../../api/intro.md).
- **Method 3 – Manual Monitor Selection**: Use the Analytics Platform interactive map to identify and select individual monitors within your study region.

### 3.3 Geographic Coverage

Visit our [network coverage page](https://airqo.net/solutions/network-coverage) for monitor locations, or contact [support@airqo.net](mailto:support@airqo.net) for specific coverage in your study area.
