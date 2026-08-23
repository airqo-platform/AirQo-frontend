---
sidebar_position: 5
sidebar_label: 4. Location Approximation
---

# 4. Location Approximation for Monitor Coordinates

:::caution Privacy and security disclosure
For privacy and security reasons, all monitoring station coordinates provided through AirQo's data platforms are intentionally approximated. This policy protects the privacy of institutions, businesses, and property owners hosting AirQo monitoring equipment.
:::

| | |
|---|---|
| **Offset Range** | Approximately 0.5 kilometres from actual physical locations |
| **Consistency** | Approximated coordinates remain consistent across all queries |
| **Affected Platforms** | All data access methods: Analytics Platform, API, mobile app |

## Implications for Research

The coordinate approximation is still valid for: area-based and neighbourhood-level analysis, regional air quality modelling, trend identification and temporal patterns, zone-level exposure assessment, and city-wide spatial analysis.

It requires adjustment for: highly localised point-source correlation studies, proximity analysis requiring exact locations, and fine-scale spatial modelling below 1 km resolution.

## Best Practices for Research Using Approximated Coordinates

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
