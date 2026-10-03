---
sidebar_position: 3
---

# Reports

**Reports** produces a PDF of your fleet's health — the artefact you send a funder, file for a review, or attach to a quarterly update.

## Prerequisites

An active organization workspace.

## Building a Report

1. Set the filters for the cohorts, grids, or devices the report should cover. These are the same controls as [Performance Analysis](./performance-analysis.md).
2. Under **Report Components**, tick the sections to include.
3. Generate the preview.
4. Review it in the **Live Preview** area.
5. Click **Export to PDF**.

## Report Components

| Component | What it adds |
|---|---|
| **Map Location Image** | A map of the monitors covered |
| **Singular Heatmaps** | Per-device reporting heatmaps |
| **Device Hourly Heatmaps** | Hour-by-hour reporting patterns |
| **Data Frequency** | How often readings arrived |
| **Sensor Health (Correlation, Error)** | Data quality — correlation and error margin |

Components are independent, so you can build quite different documents from the same data.

## Choosing Components for the Audience

The temptation is to tick everything. Resist it — a report that includes every section is harder to act on than one that makes a single point.

| Audience | Suggested components |
|---|---|
| **Funder or partner** | Map Location Image, Data Frequency — shows coverage and that it's working |
| **Technical review** | Sensor Health, Device Hourly Heatmaps — shows data quality and failure patterns |
| **Field planning** | Singular Heatmaps, Data Frequency — identifies which units need a visit |

:::tip
Always check the **Live Preview** before exporting. It renders the real content, so an empty section — usually a date range with no data behind it — is visible before you send the PDF rather than after.
:::

## Troubleshooting

### The preview is empty

**Problem**: You generated a report and nothing appears.

**Solution**: The filter matched no data. Widen the date range, and confirm the selected cohorts contain deployed monitors that were reporting during the period.

### A section is blank in the PDF

**Problem**: The export has an empty section.

**Solution**: That component had no data for the selection — for example Sensor Health where monitors don't report the underlying values. Untick the component, or widen the selection to include monitors that do.

### The export is taking a long time

**Problem**: Export seems stuck.

**Solution**: Heatmap components are the expensive ones, and rendering scales with the number of devices and the length of the period. For a large fleet over a long window, narrow to one cohort at a time.

## What's Next

- [**Performance Analysis**](./performance-analysis.md) — Explore before you export.
- [**Device Data Analysis**](../monitoring/data-analysis.md) — Export raw data instead of a PDF.
- [**Health Metrics Explained**](../reference/health-metrics.md) — What the figures in your report mean.
