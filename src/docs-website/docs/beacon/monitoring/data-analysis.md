---
sidebar_position: 4
---

# Device Data Analysis

**Device Data Analysis** is where you work with the underlying telemetry rather than the summarised health figures. Reach it from **Performance Analysis → Device Data Analysis** in the sidebar.

This is the tool for questions the dashboard can't answer — whether two monitors agree, what time of day a problem happens, how a reading behaved across a specific fortnight.

## Prerequisites

Any signed-in user with an active workspace can open this section.

## Choosing Your Data

Pick the devices or groups you want to work with, and the period. The dataset you've selected is named at the top right of the tab strip, so you can always see what you're looking at.

## The Tabs

### Telemetry Timeseries

Raw sensor readings plotted over time. The starting point for most investigations — gaps, spikes, and flatlines are all visible at a glance, and a flatline reading that never varies is usually a failed sensor rather than unusually stable air.

### Sensor QA & Correlation

Data quality rather than the values themselves: how well readings correlate, and how large the error is. Two monitors at the same site should track each other closely. When they don't, one of them is wrong, and this tab is where that shows up.

### Uptime Heatmaps

Reporting consistency as a grid rather than a line. Heatmaps expose *patterns* that a timeseries hides — a monitor that fails every night, or only on hot afternoons, produces a visible stripe. That pattern is usually diagnostic: a nightly gap on a solar unit is a power budget problem, not a sensor problem.

### Geospatial Map

Your selected monitors on a map, so you can see whether a problem is clustered geographically. Several monitors failing in one area points at something environmental or network-related rather than at the hardware.

### Fleet Health & Ranking

Monitors ranked against each other on health and performance — the quickest way to identify your best and worst performers within a selection.

### Data Table & Export

The underlying numbers as a table, with export, for when you need the data in a spreadsheet or another tool.

## Choosing the Right View

| Question | Tab |
|---|---|
| What did this monitor actually read? | Telemetry Timeseries |
| Do these two monitors agree? | Sensor QA & Correlation |
| When does this monitor fail? | Uptime Heatmaps |
| Is this problem geographic? | Geospatial Map |
| Which of my monitors is worst? | Fleet Health & Ranking |
| I need this in a spreadsheet | Data Table & Export |

## Troubleshooting

### The charts are empty

**Problem**: You selected devices but nothing plots.

**Solution**: Widen the date range. A monitor that was offline for the selected window has nothing to plot, which looks identical to a loading failure. Confirm on the monitor's [Performance tab](./device-details.md#performance) that it was reporting during that period.

### Two monitors at the same site disagree

**Problem**: Co-located monitors report different values.

**Solution**: Expected up to a point — that difference is the error margin. **Sensor QA & Correlation** quantifies it. A large, growing divergence means one unit needs calibration; AirQo assesses this through collocation testing, so raise it at [integrations@airqo.net](mailto:integrations@airqo.net).

## What's Next

- [**Performance Analysis**](../analysis/performance-analysis.md) — Aggregate analysis across cohorts and grids.
- [**Reports**](../analysis/reports.md) — Turn analysis into a shareable PDF.
- [**Health Metrics Explained**](../reference/health-metrics.md) — Definitions behind these charts.
