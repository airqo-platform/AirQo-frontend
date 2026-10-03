---
sidebar_position: 2
---

# Maintenance

The **Maintenance** page puts your fleet on a map so a repair trip can be planned around where the problems actually are. A list tells you twelve monitors need attention; a map tells you that nine of them are on one road.

## Prerequisites

An active workspace. Maintenance carries the same visibility as [Alerts](../monitoring/alerts.md) — if it's missing from your sidebar, see [Access Beacon](../getting-started/access-beacon.md#troubleshooting).

## Finding the Monitors That Need a Visit

Filter the map down to the monitors worth driving to:

| Filter | Options |
|---|---|
| **Reporting window** | How many days of history to assess (14 by default) |
| **Uptime** | All, Good, Moderate, Critical, or Offline |
| **Sensor error margin** | All, Good, Moderate, or Critical |
| **Days offline** | Monitors silent for at least this long |
| **Cohort** | One of your Vertex groups — searchable |
| **Grid** | A spatial area — searchable |
| **Tags** | Device tags applied in Vertex |

You can work in **map** or **list** view, and collapse the sidebar for a larger canvas.

:::tip
Filter on **sensor error margin** as well as uptime. A monitor reporting reliably but with a critical error margin won't show up in any offline list, yet it's producing data you shouldn't trust — and it needs a visit just as much as a dead one.
:::

## Planning a Route

Once the map shows the right monitors, build an itinerary. Beacon orders the stops and calculates road routes between them, showing distance and duration for each leg, so a day's work can be sequenced before anyone leaves.

Routing starts from a home location — AirQo's default is its Kampala head office — and can use your current position instead.

A practical sequence:

1. Filter to **Critical** uptime over the last 14 days.
2. Add a **cohort** or **grid** filter to keep the trip within one area.
3. Build the route and check the total distance against what a day allows.
4. Tighten the filters if it's too long — **Days offline** is the usual lever, since longest-silent monitors are the highest priority.

## Exporting the Map

Export for a field team that won't have Beacon open:

| Format | Use |
|---|---|
| **Enriched CSV** | A spreadsheet of the filtered monitors with their health data |
| **GeoJSON GIS Layer** | For GIS tools, or a phone mapping app |

**Include Active Maintenance Route** adds the planned itinerary to the export.

## LoRaWAN Gateway Coverage

The page includes a tool for modelling LoRaWAN gateway coverage against your monitors, which estimates signal attenuation by distance and reports coverage statistics. You can filter monitors by whether they fall inside gateway coverage.

:::warning
Gateway definitions are stored in **your browser only**. They are not saved to your account, not shared with colleagues, and will be lost if you clear site data or switch machine. On first use the tool pre-populates a set of sample Kampala gateways, which are illustrative rather than a record of real infrastructure — replace them before drawing conclusions.
:::

Treat this as a planning aid for reasoning about coverage, not as an inventory of your gateways.

## Troubleshooting

### The map is empty

**Problem**: No monitors appear.

**Solution**: The filters are almost certainly too narrow — combining a short reporting window with a strict uptime band and a days-offline threshold can exclude everything. Reset to **All** and reapply one filter at a time. Also confirm your monitors have been deployed in Vertex: an undeployed monitor has no coordinates and cannot be placed on a map.

### A monitor is in the wrong place

**Problem**: A pin is at the wrong location.

**Solution**: Coordinates come from the monitor's deployment record in Vertex. Correct it there — see [Deploy a Device to a Site](/vertex/device-deployment/deploy-to-site).

### Route distances look implausible

**Problem**: The calculated route seems wrong.

**Solution**: Check the home location the route starts from. Road routing also depends on an external routing service; if it's unavailable, distances may fall back to straight-line estimates, which will read short in hilly or poorly connected terrain.

### My gateways disappeared

**Problem**: Gateways you entered are gone.

**Solution**: They were in browser storage, which is cleared by clearing site data, using a private window, or switching browser or machine. This is a limitation of the tool, not a fault — keep your authoritative gateway list elsewhere.

## What's Next

- [**Alerts**](../monitoring/alerts.md) — What's flagged, and when.
- [**Reports**](./reports.md) — Produce a PDF record.
- [**Device Details**](../monitoring/device-details.md) — Diagnose before you drive.
