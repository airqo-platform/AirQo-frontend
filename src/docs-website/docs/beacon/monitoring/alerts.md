---
sidebar_position: 3
---

# Alerts

**System Alerts** is the running log of what Beacon has flagged across your fleet. Where the dashboard shows you the current state, alerts show you the events that got you there.

## Prerequisites

Alerts carry the same visibility as Maintenance. If the section isn't in your sidebar, see [Access Beacon](../getting-started/access-beacon.md#troubleshooting).

## Filtering the Log

Four controls narrow the list.

**Alert Type**

| Type | Meaning |
|---|---|
| **All Types** | No filter |
| **Critical** | Needs attention now |
| **Warning** | Degraded, not yet failed |
| **Resolved** | Cleared, kept for the record |

**Time window** — Today, Last 3 days, Last 7 days, Last 30 days, or All time.

**Search** — free text across the alerts.

**Sort** — Newest first or Oldest first.

## Working Through Alerts

A practical order:

1. Set **Critical** and **Today** to see what needs action now.
2. Widen to **All time** and keep **Critical** — anything still open after a week is either genuinely stuck or needs escalating.
3. Switch to **Warning** over **Last 30 days** to catch monitors degrading slowly. These are the cheapest problems to fix, because you can plan for them rather than react.
4. Use **Resolved** when you need to show what was fixed and when.

:::tip
Sorting **Oldest first** with **Critical** selected surfaces the longest-standing unresolved problems — the ones most likely to have been quietly forgotten.
:::

## Alerts and Field Visits

Alerts tell you what's wrong; the [maintenance map](../analysis/maintenance.md) tells you where. Reviewing critical alerts and then opening the map with the same monitors in mind is the usual way to plan a repair trip that's worth the fuel.

## Troubleshooting

### An alert I fixed is still listed

**Problem**: You repaired a monitor but its alert is still showing.

**Solution**: Check whether the type filter includes **Resolved** — fixed alerts remain in the log by design, so there's a record. If it's still marked Critical, confirm the monitor has actually resumed reporting on its [Performance tab](./device-details.md#performance); an alert clears on real recovery, not on a completed repair.

### There are no alerts at all

**Problem**: The list is empty.

**Solution**: Widen the time window — the default may be narrower than the period you're interested in. If **All time** with no other filters is still empty, check the workspace switcher; you may be in a workspace that doesn't hold your monitors. If the workspace is right, your fleet simply hasn't raised any alerts in the 90 days that alert records are kept.

## What's Next

- [**Maintenance**](../analysis/maintenance.md) — Turn alerts into a field route.
- [**The Fleet Dashboard**](./fleet-dashboard.md) — The current-state view.
- [**Health Metrics Explained**](../reference/health-metrics.md) — What triggers a warning versus a critical.
