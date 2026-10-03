---
sidebar_position: 1
---

# The Fleet Dashboard

The dashboard is Beacon's landing page. It exists to answer one question quickly — **is my fleet reporting?** — and then to help you find the monitors that aren't.

## The Fleet Filter

Everything on the dashboard responds to the **Fleet Filter** at the top. Set it once and every figure, chart, and table below reflects your choice.

| Option | What it scopes to |
|---|---|
| **All Fleets (Combined)** | Every monitor you have access to |
| **Manufacturers** | One sensor manufacturer's devices |
| **Cohorts** | One of the groups you created in Vertex |

A badge appears next to the filter whenever one is active, so you always know the numbers are scoped.

:::tip
Filtering by manufacturer is the fastest way to answer whether one vendor's hardware is performing differently from the rest of your fleet — useful when you're deciding what to buy next.
:::

## Headline Figures

Four cards sit across the top.

| Card | What it tells you |
|---|---|
| **Current Status** | The fleet's status right now |
| **Average Online Rate** | The share of devices transmitting, as a percentage |
| **Incidents (14d)** | Warning and critical incidents raised in the last two weeks |
| **Active Fleet Count** | How many monitors are currently operational |

Each card's title names the fleet it's reporting on — `(Combined)` when unfiltered, or the manufacturer's name when filtered — so a screenshot of the dashboard is never ambiguous about scope.

## Uptime Trend

Below the cards, the **Uptime Trend** chart plots performance over time so you can tell a one-off outage from a slow decline. A fleet that has been drifting down for a fortnight needs a different response from one that dropped off a cliff yesterday.

Alongside it, a per-device breakdown lists each monitor's online percentage, colour-coded so the poor performers stand out without reading numbers.

## Uptime Detail Table

A table gives the same picture in precise terms, with a row per fleet showing:

* **Online % (Offline %)**
* **Total Devices**

Use this when you need exact figures to quote rather than a visual impression.

## Comparing Fleets

Switch to the comparison view to rank fleets against each other. A toggle chooses what you're comparing:

* **Manufacturer Breakdown** — compare sensor manufacturers.
* **Cohort Breakdown** — compare your own groups.

The comparison surfaces:

| Panel | What it shows |
|---|---|
| **Total Deployed** | How many monitors are in each fleet |
| **Best Performing** | The fleet with the strongest uptime |
| **Needs Attention** | The fleet with the weakest |
| **Offline Rate Comparison** | Offline rates side by side |
| **Uptime Range (Min–Max)** | The spread within each fleet |

The **Uptime Range** column is worth dwelling on. A fleet averaging 90% might be ten monitors all at 90%, or nine at 99% and one dead. The range tells you which, and that distinction changes what you do next.

## Troubleshooting

### The numbers look wrong

**Problem**: Device counts or percentages don't match what you expect.

**Solution**: Check the **Fleet Filter** first — a filter left in place from an earlier session scopes everything on the page. Then confirm in Vertex that recently added monitors were assigned to a cohort, because an ungrouped monitor won't appear under any cohort filter.

### A fleet shows "No data available"

**Problem**: You picked a manufacturer or cohort and the dashboard is empty.

**Solution**: That fleet has no monitors reporting in the selected window. Confirm in Vertex that the cohort actually contains devices and that they've been deployed — a registered but undeployed monitor has no site and produces no readings.

## What's Next

- [**Device Details**](./device-details.md) — Open a single monitor and inspect it.
- [**Alerts**](./alerts.md) — Work through what the dashboard flagged.
- [**Health Metrics Explained**](../reference/health-metrics.md) — What uptime, online rate, and incidents actually measure.
