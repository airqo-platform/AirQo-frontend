---
sidebar_position: 4
sidebar_label: Air Quality Analysis
---

# Air Quality Analysis

The Air Quality Analysis page lets you monitor current conditions, trends, and forecasts for your configured locations. Build custom charts to track pollution over time, or compare readings across multiple sites side by side.

---

## Accessing the Page

1. Log in to [AirQo Nexus](https://nexus.airqo.net/).
2. Select **Air Quality Analysis** in the sidebar.
3. Direct link: `https://nexus.airqo.net/user/air-quality/analytics`

:::note
Air Quality Analysis is part of the **individual** workflow sidebar. The organization dashboard does not include an Analysis page — organization members can monitor their network from the organization **Dashboard** and **Air Quality Map**.
:::

---

## Chart Controls

Controls live on each chart card, not in a page-level bar. Each card on the **Trends** tab provides:

- **Pollutant** dropdown — switch the pollutant displayed (PM₂.₅, PM₁₀, …).
- **Date range** picker — pick a start and end date, or choose a preset.
- **Quick chart-type switch** — toggle between **Line**, **Area**, and **Bar** without opening a dialog.

The **Comparison** tab has its own controls (location picker and AQI legend) and is independent of the Trends settings.

---

## Trends Tab

The Trends tab is the default view. It displays your charts as a set of cards that you can arrange in **List** or **Grid** layout.

![Trends tab with a PM₂.₅ line chart for two sites and a WHO guideline overlay](/img/nexus/analysis-trends.png)

### Chart Cards

Each chart card shows a time-series chart and supports:

- **Inline title and subtitle editing** — select the title or subtitle to edit it directly on the card.
- **Quick chart-type switch** — toggle between **Line**, **Area**, and **Bar** without opening a dialog.
- **More (⋮) menu** — a full set of actions for the chart (see below).

### More Menu

Select the **⋮** button on a chart card to open its menu:

![Chart More menu showing Edit chart, Duplicate, Delete, Export as PDF/PNG, Air Quality Standards, and Reference Lines](/img/nexus/analysis-chart-menu.png)

| Action                    | Description                              |
| ------------------------- | ---------------------------------------- |
| **Edit chart**            | Open the full chart configuration dialog |
| **Duplicate**             | Create a copy of the chart               |
| **Delete chart**          | Remove the chart                         |
| **Edit title & subtitle** | Rename the chart inline                  |
| **Refresh Data**          | Reload the chart's data                  |
| **Export as PDF**         | Download the chart as a PDF              |
| **Export as PNG**         | Download the chart as a PNG              |
| **Air Quality Standards** | Toggle the WHO guideline overlay         |
| **Reference Lines**       | Turn reference lines on or off           |

### WHO Guideline Overlay

Charts can display a **WHO guideline** reference line so you can see at a glance where readings exceed the World Health Organization's recommended limits. Enable it from the chart's More menu under **Air Quality Standards**.

### Weekly Forecast

A **weekly forecast card** can be shown alongside your charts to give you a forward-looking view of air quality at your locations.

### No-Data Warning

If some locations have no data for the selected time period, a banner warns: **"Some locations have no data for the selected time period."** Narrow the date range or choose different locations to resolve this.

---

## Adding a Chart

1. Select **New chart** above the chart grid.
2. The **Add chart** dialog opens.

![Add chart dialog with title, subtitle, chart type, pollutant, frequency, date range, and location fields](/img/nexus/analysis-new-chart.png)

| Field                  | Description                                                   |
| ---------------------- | ------------------------------------------------------------- |
| **Chart title**        | Name for the chart                                            |
| **Subtitle**           | Optional short description                                    |
| **Chart type**         | Line, Area, or Bar                                            |
| **Pollutant**          | PM₂.₅ or PM₁₀                                                 |
| **Frequency**          | Hourly, Daily, Weekly, or Monthly                             |
| **Date range**         | Start and end dates                                           |
| **Locations**          | Multi-select from a searchable sites table                    |
| **Per-location color** | Choose a color for each site's series                         |
| **Toggles**            | Show legend, Show grid, Show tooltips, Use theme color shades |

3. Select **Add chart** to create it, or **Cancel** to dismiss.

:::note
The **Locations** field uses a searchable table of monitoring sites. Select one or more sites to include in the chart.
:::

---

## Comparison Tab

The Comparison tab lets you compare the latest readings across two or more sites in a single table.

![Comparison tab showing three sites with AQI badges and PM₂.₅/PM₁₀ columns](/img/nexus/analysis-comparison.png)

### Comparing Locations

1. Select the **Compare locations** picker and choose two or more sites.
2. A table shows each site's latest reading, including:
   - An **AQI badge** indicating the overall air quality level
   - **PM₂.₅** and **PM₁₀** columns (plus other available pollutants)

### AQI Legend

An **AQI legend** appears at the bottom of the tab. Switch between the **PM₂.₅** and **PM₁₀** tabs to see the concentration ranges for each air quality category. For the full scale, see [Air Quality Levels](../monitoring-air-quality/air-quality-levels.md).

### Saving a Comparison

- Select **Save selection** to keep a named comparison (for example, "My comparison").
- Once saved, a **"Saved · [name]"** indicator appears so you can return to the same set of sites later.

---

## Exporting Chart Data

Each chart card's **More (⋮)** menu offers two export options:

- **Export as PDF** — download a PDF image of the chart.
- **Export as PNG** — download a PNG image of the chart.

These exports capture the chart visualization only. To download the underlying measurement data, use [Export Air Quality Data](../exporting-data/data-export.md).

---

## Related Guides

- [Interactive Map](../monitoring-air-quality/interactive-map.md) — explore sites on a map
- [Export Air Quality Data](../exporting-data/data-export.md) — download datasets for offline analysis
- [Air Quality Levels](../monitoring-air-quality/air-quality-levels.md) — understand the color scale and ranges
