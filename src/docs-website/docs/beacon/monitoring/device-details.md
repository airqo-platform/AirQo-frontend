---
sidebar_position: 2
---

# Device Details

When the dashboard tells you a monitor is struggling, this is where you find out why.

## Finding a Monitor

Open **Devices** for the list of your fleet. In the AirQo personal context this is split into **My Devices** and **Devices**; in an organization workspace there's a single **Devices** list, because monitors belong to the organization rather than to individuals.

Search by **device name, ID, location, city, or country**.

Each row shows:

| Column | Notes |
|---|---|
| **Device Name** | With an online indicator — hover it for the last-updated timestamp |
| **Deployment** | Whether the monitor is deployed |
| **Category** | Low Cost, Reference Monitor, or Gas |
| **Channel ID** | The data channel identifier |
| **Network ID** | The sensor manufacturer |
| **Firmware** | Current firmware state — hover for detail |
| **Location** | Where it's installed |

Click any row to open the monitor.

:::tip
The online indicator and the **Deployment** column answer different questions. A monitor can be deployed but offline (installed, not reporting) or online but not deployed (reporting, no location recorded). See [Device States](../reference/device-states.md).
:::

## The Device Tabs

### Device Details

The default tab, in three sections:

* **Device Info** — identity and identifiers.
* **Location** — where the monitor is installed.
* **System & Status** — its current operating state.

### Metadata

**Device Metadata** covers the contextual record — site, network, and category information. This is the tab to check when a monitor's readings are fine but it's showing under the wrong group or location.

### Config

**Configuration History** shows how the monitor has been configured over time. When behaviour changes on a specific date with no field visit to explain it, a configuration change is a good first suspect.

### Performance

**Device Performance** is the diagnostic heart of the page, with four metrics:

| Metric | What it tells you |
|---|---|
| **Daily Uptime** | Reporting consistency, day by day |
| **Data Frequency** | How often readings arrive |
| **Sensor Health** | Whether the sensor itself is reading sensibly |
| **Battery Voltage** | Power status |

Reading these together is what separates causes. Battery voltage sagging before uptime drops points at power. Uptime steady while sensor health degrades points at the sensor. Data frequency falling while everything else holds points at connectivity.

### Remote Shell

A terminal workbench for supported hardware, for operations that need direct access to the device.

### Files

Files associated with the monitor.

:::note
A **Diagnostics** tab also exists. It belongs to AirQo's internal hardware triage toolset and isn't shown to beneficiary organizations — see [Fleet Triage](../administration/fleet-triage.md) if you're AirQo staff.
:::

## Editing a Monitor

An **Edit** button sits beside the tabs for updating the monitor's record.

:::important
Beacon is a monitoring surface. Registering, deploying, grouping, and recalling monitors happen in Vertex — see [Deploy a Device to a Site](/vertex/device-deployment/deploy-to-site). If a monitor's location or cohort is wrong, fix it in Vertex and it will follow through to Beacon.
:::

## Troubleshooting

### The monitor is offline but I know it has power

**Problem**: The device is running in the field but Beacon reports it offline.

**Solution**: Offline means data isn't arriving, not that the monitor is dead. Open **Performance** to see exactly when reporting stopped — that timestamp usually identifies the cause. For a third-party monitor, check the **Device Connection URL** and **Read Key** in Vertex; a rotated API key is a common culprit. For an AirQo monitor, check network coverage at the site.

### Readings look implausible

**Problem**: The monitor is online but the numbers are wrong.

**Solution**: Check **Sensor Health** on the Performance tab. Persistent sensor error usually means the unit needs collocation against a reference monitor, or physical attention. Raise it with AirQo via [integrations@airqo.net](mailto:integrations@airqo.net).

### The location or cohort is wrong

**Problem**: A monitor shows the wrong site or group.

**Solution**: Fix it in Vertex, not Beacon. Beacon reads the registry that Vertex maintains.

## What's Next

- [**Alerts**](./alerts.md) — Fleet-wide incidents rather than one monitor.
- [**Device Data Analysis**](./data-analysis.md) — Chart raw telemetry.
- [**Device States**](../reference/device-states.md) — What each status actually means.
