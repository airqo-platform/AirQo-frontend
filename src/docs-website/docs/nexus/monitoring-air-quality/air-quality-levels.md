---
sidebar_position: 1
sidebar_label: Air Quality Levels
---

# Air Quality Levels

AirQo Nexus uses color-coded air-quality categories to make pollutant readings easier to interpret. The categories appear on Home, the map, charts, rankings, forecasts, and site details.

## Categories

| Category | Typical color | General interpretation |
| --- | --- | --- |
| **Good** | Green | Air quality is satisfactory for most people. |
| **Moderate** | Yellow or amber | Air quality is generally acceptable, with greater concern for unusually sensitive people. |
| **Unhealthy for Sensitive Groups** | Orange | Sensitive people may need to reduce prolonged or strenuous outdoor activity. |
| **Unhealthy** | Red | More people may experience health effects; consider reducing prolonged outdoor exertion. |
| **Very Unhealthy** | Purple | Health warnings are more likely; avoid prolonged outdoor exertion when possible. |
| **Hazardous** | Magenta or pink | Health alert; avoid outdoor exposure and follow local health guidance. |

The exact threshold depends on the pollutant selected, such as PM2.5 or PM10. Nexus loads the active AQI configuration centrally, so the values shown in the map legend and comparison legend are the authoritative values for the current application.

:::caution
Do not copy a threshold from an old screenshot or report and assume it is still current. Always use the legend displayed in Nexus for the pollutant and view you are interpreting.
:::

## Where levels appear

- **Home:** AQI values and category labels in updates from your places.
- **Interactive Map:** Marker colors, icons, tooltips, and the map legend.
- **Air Quality Analysis:** AQI values in comparisons and the PM2.5/PM10 legend.
- **Air Quality Rankings:** Category and AQI columns for live rankings.
- **Site Details:** Current reading, forecasts, and health guidance.
- **Organization Dashboard:** Air-quality scale and report values for the selected cohort.

## How to use the categories responsibly

AQI categories are useful for communication and quick situational awareness. They are not a substitute for a study design, exposure assessment, or local public-health instruction. For research or policy work, use the underlying measurements and document your pollutant, time period, aggregation method, and data coverage.

## Related guides

- [Nexus Dashboard](./nexus-dashboard.md)
- [Interactive Map](./interactive-map.md)
- [Air Quality Analysis](./air-quality-analysis.md)
- [Air Quality Rankings](./air-quality-rankings.md)
- [Dataset Visualizer](../visualizing-data/dataset-visualizer.md)
