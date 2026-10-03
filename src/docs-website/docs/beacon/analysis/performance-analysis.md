---
sidebar_position: 1
---

# Performance Analysis

**Performance Analysis** answers questions that span more than one monitor and more than today — how a cohort performed last quarter, whether one region is worse than another, which devices are dragging an average down.

## Prerequisites

An active workspace, plus either membership of a non-AirQo organization or the `ANALYTICS_VIEW` / `DATA_VIEW` permission. If the section isn't in your sidebar, see [Access Beacon](../getting-started/access-beacon.md#troubleshooting).

## Running an Analysis

1. Under **Filter By**, choose what you're analysing:
   * **Cohorts** — the groups you created in Vertex
   * **Grids** — spatial areas
   * **Devices** — specific monitors
2. Select the items you want. The list is searchable, and your selection is remembered per filter type, so switching between Cohorts and Devices doesn't lose your work.
3. Set a **Date Range**.
4. Optionally set a **Time Range** to narrow to particular hours of the day.
5. Run the analysis.

:::tip
The time range is the most underused control here. A solar-powered monitor that reports cleanly through the afternoon but drops out before dawn is telling you about its power budget, not its sensors — and you'll only see that by isolating the hours.
:::

## The Three Views

### Cohort Analysis

Performance across your device groups. Because cohorts usually map onto something real — a project, a city, a funder's deployment — this is the view that answers "how is *that* programme doing?"

### Grid Analysis

Spatial metrics and performance by area. Use this when the question is geographic rather than organizational: whether coverage in one region is holding up.

### Device Data Analysis

Raw telemetry charting, covered in full under [Device Data Analysis](../monitoring/data-analysis.md).

## Choosing a Date Range

Ranges aren't neutral — the window you pick shapes the conclusion:

* **A recently deployed monitor** looks bad over a long window, because the period before installation counts as not reporting. Narrow the range to since deployment.
* **A seasonal comparison** needs matching windows. Comparing a dry-season month with a wet-season month conflates weather with hardware.
* **Reporting to a funder** usually wants the grant period, which rarely aligns with a convenient preset.

## Troubleshooting

### A newly deployed monitor shows poor uptime

**Problem**: A monitor you just installed reports low uptime.

**Solution**: Uptime is calculated across the whole window, including time before installation. Narrow the date range to the period since deployment.

### A cohort has fewer devices than expected

**Problem**: The device count doesn't match your records.

**Solution**: Cohort membership is maintained in Vertex. Open the cohort there and confirm its devices — see [Device Cohorts](/vertex/device-deployment/device-cohorts). A monitor registered but never assigned to a cohort won't appear in any cohort analysis.

### Results are empty for a period I know had data

**Problem**: An analysis returns nothing.

**Solution**: Check whether a **Time Range** is still applied from an earlier run — a narrow hours-of-day filter combined with a short date range can legitimately match nothing.

## What's Next

- [**Maintenance**](./maintenance.md) — Turn findings into a field visit.
- [**Reports**](./reports.md) — Export the analysis as a PDF.
- [**Health Metrics Explained**](../reference/health-metrics.md) — What these figures measure.
