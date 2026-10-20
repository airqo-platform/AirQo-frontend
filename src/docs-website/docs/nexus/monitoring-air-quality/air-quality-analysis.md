---
sidebar_position: 4
sidebar_label: Air Quality Analysis
---

# Air Quality Analysis

Air Quality Analysis helps you study monitored locations over time and compare their latest readings. It has two views:

- **Trends:** Build, save, and export charts for selected sites.
- **Comparison:** Review the latest readings for several sites side by side and save the selection.

The page is available in individual and organization workspaces. Organization users see data scoped to their current organization.

## Open Air Quality Analysis

1. Sign in to [AirQo Nexus](https://nexus.airqo.net/).
2. Select **Air Quality Analysis** in the workspace sidebar.
3. Choose **Trends** or **Comparison** at the top of the page.

Individual URL: `https://nexus.airqo.net/user/air-quality/analytics`

## Trends

The Trends view displays saved charts in either **List** or **Grid** layout. Select **New chart** to create a chart.

![Trends tab with a PM2.5 line chart for two sites](/img/nexus/analysis-trends.png)

### Create a chart

1. Select **New chart**.
2. Enter a required **Chart title** and an optional **Subtitle**.
3. Choose a **Pollutant**: PM2.5 or PM10.
4. Choose a **Frequency**: Raw Data, Hourly, Daily, Weekly, Monthly, or Yearly. Availability depends on the selected data and service response.
5. Choose a chart type: **Line**, **Area**, **Bar**, or **Pie**.
6. Set the date range and select one or more monitoring sites.
7. Optionally set a color for each location and enable or disable the legend, grid, tooltips, and theme color shades.
8. Select **Add chart**.

![Add chart dialog with title, subtitle, chart type, pollutant, frequency, date range, and location fields](/img/nexus/analysis-new-chart.png)

### Manage saved charts

Chart cards support:

- Inline title and subtitle edits.
- A quick chart-type change where supported.
- Refreshing the chart data.
- A forecast toggle for supported PM2.5 chart configurations. Forecast lines extend observed data with available daily forecasts; they are not additional observations.
- **Edit chart**, **Duplicate**, **Delete chart**, **Export as PDF**, and **Export as PNG** from the More menu.
- **Air Quality Standards** and **Reference Lines** when available in the chart controls.

![Chart More menu showing chart management and export actions](/img/nexus/analysis-chart-menu.png)

If one or more selected sites have no readings for the selected period and frequency, Nexus shows a warning and omits those series. Try another date range or frequency.

:::note
The **Raw Data** chart option is separate from the **Raw** data type on the export page. If you need a downloadable sub-hourly or minute-level dataset, use the direct API workflow described in [Raw Sensor Data](../../api/analytics-api/raw-data.md).
:::

## Comparison

The Comparison view is designed for a current snapshot rather than a time-series chart.

![Comparison tab showing sites with AQI, PM2.5, and PM10 values](/img/nexus/analysis-comparison.png)

1. Use **Compare locations** to select the sites you want to review.
2. Review the latest readings in the table. Rows can include AQI, PM2.5, PM10, other available pollutants, last reading, and freshness.
3. Use the table controls to sort the rows. A site with no current reading remains visible as **No reading**.
4. Select a site to view its details, or select **View insights** for a site or selected group.
5. Select **Export** to download the comparison table as CSV.

### Save and load a comparison

- Select **Save selection** and give the comparison a name.
- Use **Saved comparisons** to load, update, or delete a saved selection.
- The most recently used comparison can be restored for the current workspace.

### AQI legend

The legend below the comparison table can be switched between PM2.5 and PM10. It uses the current Nexus air-quality configuration. See [Air Quality Levels](./air-quality-levels.md) for guidance on categories and thresholds.

## Exporting chart images

Use a chart card's More menu to export the visualization as **PDF** or **PNG**. These files contain the chart image, not the underlying measurement dataset. For data files, use [Export Air Quality Data](../exporting-data/data-export.md).

## Related guides

- [Interactive Map](./interactive-map.md) - inspect a location's current reading, forecast, and health guidance
- [Air Quality Rankings](./air-quality-rankings.md) - compare African countries and cities
- [Export Air Quality Data](../exporting-data/data-export.md) - download measurement data
- [Air Quality Levels](./air-quality-levels.md) - understand categories and colors
