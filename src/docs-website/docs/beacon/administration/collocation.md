---
sidebar_position: 6
---

# Collocation

:::warning AirQo staff only
Requires the AirQo workspace and device-maintenance rights. See [Administrative Panel](./overview.md).
:::

Collocation is how sensor accuracy is assessed: run monitors side by side and compare what they report. Two monitors measuring the same air should agree, so disagreement measures error.

Beacon covers two kinds.

## In-Lab Collocation

Batch testing under controlled conditions, before deployment. Devices are registered as batches and assessed together.

| Figure | What it reports |
|---|---|
| **Total Batches** | All registered batches |
| **Average Inlab Uptime** | Mean uptime across the current page |
| **Average Inlab Error Margin** | Mean error margin across the current page |

:::note
The uptime and error-margin averages are calculated over the **current page** of results, not the entire history. Paging changes them — don't quote them as fleet-wide figures.
:::

In-lab testing catches units that should never reach a site. A device failing here is cheap to deal with; the same device failing after installation costs a field visit.

## Site Collocation

Field calibration, where a monitor is assessed against a reference at a real site under real conditions.

| Figure | What it reports |
|---|---|
| **Total Sites** | Collocation sites, split into low-cost and reference (BAM) |
| **Uptime Performance** | Uptime, with history over time |
| **Error Margin** | Error margin, with history over time |

The history is the valuable part. A single error-margin reading tells you how a monitor is doing today; the trend tells you whether it's drifting — and drift is what determines when a unit needs recalibration rather than replacement.

## In-Lab Versus Site

They answer different questions, and neither substitutes for the other:

* **In-lab** asks: *is this unit fit to deploy?* Controlled conditions, so the result isolates the hardware.
* **Site** asks: *is this unit still accurate where it actually is?* Real conditions, so the result includes everything the environment does to it.

A unit can pass in the lab and drift badly in the field — heat, humidity, and dust are why.

## Relationship to Fleet Health

Collocation measures a different axis from uptime. A monitor can report with perfect reliability and be wrong. Sensor health and error margin on the [fleet dashboard](../monitoring/fleet-dashboard.md) are the day-to-day surface of what collocation establishes rigorously.

## Troubleshooting

### A batch's error margin looks implausibly high

**Problem**: An in-lab batch reports poor accuracy across the board.

**Solution**: Before concluding the batch is faulty, confirm the reference instrument was working and the units were genuinely co-located for the test window. A reference problem presents as every unit in the batch failing together, which is rarely what a real hardware fault looks like.

### Site collocation shows drift on one unit only

**Problem**: One monitor at a site diverges while others hold.

**Solution**: That's the pattern collocation exists to catch — an individual sensor drifting. Check the error margin history to see whether it's gradual (drift, so recalibration) or a step change (a fault, so a field visit).

## What's Next

- [**Health Metrics Explained**](../reference/health-metrics.md) — How error margin appears elsewhere in Beacon.
- [**Fleet Diagnostics**](./fleet-triage.md) — Daily triage across the fleet.
