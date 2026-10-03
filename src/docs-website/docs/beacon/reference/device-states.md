---
sidebar_position: 1
---

# Device States

Beacon describes a monitor's condition in several independent ways, and they answer different questions. A monitor can be deployed but offline, or transmitting but stale. This page explains each.

## Transmission States

Every deployed monitor is classified into exactly one of four states at each network check. The classification comes from two separate signals — whether the device's **feed is fresh**, and whether it is **actively transmitting**.

| State | Fresh feed | Transmitting | What it means |
|---|---|---|---|
| **Operational** | Yes | Yes | Healthy. Online with a fresh feed, actively sending data |
| **Transmitting** | No | Yes | Sending data, but the feed timestamp is stale |
| **Data available** | Yes | No | Feed is fresh, but no active transmission |
| **Not transmitting** | No | No | Fully offline — stale feed, no transmission |

The two middle states are the ones worth understanding. They aren't healthy, but they aren't dead either: something in the path between sensor and platform is partly working. A monitor sitting in **Transmitting** or **Data available** for days is usually a plumbing problem — an integration, a timestamp, a stale cache — rather than a hardware failure, and it often won't be fixed by a field visit.

:::note
Only **Not transmitting** counts against your fleet's health figures. Monitors in the other three states are all treated as contributing to the network.
:::

## Deployment State

Separate from transmission, and shown in its own column in the device list.

* **Deployed** — the monitor has been assigned to a site or grid in Vertex, with a location on record.
* **Not deployed** — registered, but with no location.

An undeployed monitor can still transmit, but its readings have no location attached, so it won't appear on maps and can't be analysed spatially. Deployment is done in Vertex — see [Deploy a Device to a Site](/vertex/device-deployment/deploy-to-site).

## The Online Indicator

The dot beside a monitor's name in the device list is a quick read on whether data is arriving. Hover it for the **last updated** timestamp, which is the more useful number — it tells you *when* things stopped, and that usually points at the cause.

## Firmware State

The device list shows each monitor's firmware status, comparing current firmware against target firmware and any download state. Hover the badge for detail. Firmware itself is managed by AirQo.

## Category

How the monitor is classified as an instrument, set when it's registered in Vertex:

| Category | Meaning |
|---|---|
| **Low Cost** | A low-cost sensor |
| **Reference Monitor** | A reference-grade instrument |
| **Gas** | A gas sensor |

Category matters when comparing monitors. Holding a low-cost sensor to reference-grade error margins will make healthy hardware look broken.

## Reading States Together

| What you see | Likely meaning |
|---|---|
| Deployed + Operational | Working as intended |
| Deployed + Not transmitting | Power, connectivity, or hardware failure — worth a visit |
| Deployed + Transmitting (stale feed) | Integration or timestamp problem — usually not a field issue |
| Not deployed + transmitting | Registered and alive, but missing its location in Vertex |
| Deployed + Operational, poor sensor health | Reporting reliably, but the data shouldn't be trusted |

That last row is the one most often missed. It never appears in an offline list, yet it's producing bad data.

## What's Next

- [**Health Metrics Explained**](./health-metrics.md) — How uptime and online rate are calculated.
- [**Device Details**](../monitoring/device-details.md) — Inspect a single monitor.
