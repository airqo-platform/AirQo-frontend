---
sidebar_position: 2
---

# Monitor Your Fleet

Once your monitors are registered in Vertex and you can [sign in to Beacon](./access-beacon.md), this page orients you around the day-to-day work. Each area has a fuller guide linked from here.

Everything works the same whether your monitors are AirQo hardware or come from another manufacturer.

## The Short Version

| You want to | Go to |
|---|---|
| Check whether the fleet is healthy | [The Fleet Dashboard](../monitoring/fleet-dashboard.md) |
| Find out what's wrong with one monitor | [Device Details](../monitoring/device-details.md) |
| See what's been flagged recently | [Alerts](../monitoring/alerts.md) |
| Chart the raw sensor data | [Device Data Analysis](../monitoring/data-analysis.md) |
| Compare cohorts or regions over time | [Performance Analysis](../analysis/performance-analysis.md) |
| Plan a repair trip | [Maintenance](../analysis/maintenance.md) |
| Produce a PDF for a funder | [Reports](../analysis/reports.md) |

## A First Week

If Beacon is new to you, this order builds understanding fastest.

**Day one — establish the baseline.** Open the [dashboard](../monitoring/fleet-dashboard.md) and note your **Average Online Rate** with no filters applied. That single number is what you'll compare everything against later. Then set the **Fleet Filter** to each of your cohorts in turn and note theirs. Differences between cohorts are usually the first real finding.

**Then — find your worst performers.** Switch to the comparison view and look at **Needs Attention** and the **Uptime Range (Min–Max)**. The range matters more than the average: a cohort at 90% could be uniformly mediocre or mostly excellent with one dead monitor, and those need completely different responses.

**Then — diagnose two or three.** Open your worst monitors and read their [Performance tab](../monitoring/device-details.md#performance). Look at Daily Uptime, Data Frequency, Sensor Health, and Battery Voltage together rather than separately — the combination is what identifies a cause. [Health Metrics Explained](../reference/health-metrics.md#diagnosing-by-combination) has a table of common patterns.

**Then — plan a visit.** Take what you found to the [maintenance map](../analysis/maintenance.md) and see whether the problem monitors cluster geographically. If they do, one trip may fix several.

**Finally — set a rhythm.** Check [Alerts](../monitoring/alerts.md) filtered to **Critical** and **Today** as a routine, and widen to **Warning** over 30 days weekly to catch slow degradation while it's still cheap to fix.

## What Beacon Doesn't Do

Beacon is a monitoring surface. Registering, deploying, grouping, and recalling monitors, and choosing who can see your data, all happen in [Vertex](/vertex/intro). If something about a monitor's identity, location, or grouping is wrong, fix it in Vertex and the change follows through.

Team members and roles are managed on AirQo Nexus, not in either product.

## What's Next

- [**The Fleet Dashboard**](../monitoring/fleet-dashboard.md) — Start here.
- [**Health Metrics Explained**](../reference/health-metrics.md) — What the numbers mean.
- [**Device States**](../reference/device-states.md) — What each status means.
