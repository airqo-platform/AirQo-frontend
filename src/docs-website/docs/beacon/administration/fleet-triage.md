---
sidebar_position: 2
---

# Fleet Diagnostics

:::warning AirQo staff only
Requires the AirQo workspace and device-maintenance rights. See [Administrative Panel](./overview.md).
:::

**Fleet Diagnostics** is the daily triage view: device health across the fleet, showing lifecycle states, the most common issues, persistent faults, and the devices that need attention.

Where the [fleet dashboard](../monitoring/fleet-dashboard.md) reports whether devices are *reporting*, this reports what the diagnostic engine thinks is *wrong with them*.

## Choosing a Day

Diagnostics are produced per day. Pick a date to load that day's run.

## The Summary Figures

| Figure | What it counts |
|---|---|
| **Devices Diagnosed** | How many devices the run covered |
| **With Issues** | How many came back with at least one issue |
| **Average Score** | Mean health score across the run |
| **New Issues** | Issues appearing that weren't there before |
| **Resolved Issues** | Issues that have cleared |

**New** and **Resolved** are the two to watch day to day. Totals drift slowly, but a spike in new issues usually has a specific cause — a firmware rollout, a network event, weather — and catching it on the day it appears is much cheaper than finding it in a weekly total.

## The Panels

### Lifecycle States & Severity

How the fleet distributes across lifecycle states and severity bands — the shape of the fleet's health, rather than individual faults.

### Most Common Issues

Issues ranked by frequency. This is the panel that justifies engineering work: a fault on three devices is a maintenance task, the same fault on three hundred is a design or firmware problem.

### Devices Needing Attention

The triage list — devices whose combination of issues and severity puts them at the front of the queue.

### Issue Search

Search across issues, for when you're tracing a specific fault rather than browsing.

## A Practical Triage Routine

1. Load today's date and compare **New Issues** with recent days.
2. If new issues are up, check **Most Common Issues** to see whether they share a cause.
3. Work **Devices Needing Attention** for anything field-actionable.
4. Feed the field-actionable ones into the [maintenance map](../analysis/maintenance.md) to build a route.
5. Use **Issue Search** to confirm whether a fault you fixed has stopped recurring.

## Troubleshooting

### A day has no diagnostics

**Problem**: The selected date returns nothing.

**Solution**: Diagnostics are generated per day; a date before the engine ran, or a day the run didn't complete, has no record. Try an adjacent date to confirm the page is working.

### A device I know is broken isn't flagged

**Problem**: A faulty device shows no issues.

**Solution**: The engine reasons from [diagnostic templates](./diagnostic-templates.md) against a device's [profile](./device-profiles.md). A fault with no matching symptom rule won't be detected. If the device has no complete profile, or the template lacks that symptom, extend the template and test it in the [Bench Simulator](./bench-simulator.md) before relying on it.

## What's Next

- [**Bench Simulator**](./bench-simulator.md) — Test the engine against a synthetic fault.
- [**Diagnostic Templates**](./diagnostic-templates.md) — The rules behind these results.
- [**Maintenance**](../analysis/maintenance.md) — Turn triage into a field route.
