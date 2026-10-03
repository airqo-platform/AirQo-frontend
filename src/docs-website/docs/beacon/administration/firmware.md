---
sidebar_position: 7
---

# Firmware Management

:::warning AirQo staff only
Firmware is only available when the selected workspace is **airqo**. See [Administrative Panel](./overview.md).
:::

**Firmware Management** covers device firmware versions and flashing devices directly.

## Library

The catalogue of firmware versions available to deploy. **Upload Firmware** adds a new build, in either of two formats:

* **HEX File Upload**
* **Binary File Upload**

## Device Workbench

Where firmware meets hardware — flashing devices directly.

## Firmware State in the Device List

Every monitor's row in the [device list](../monitoring/device-details.md#finding-a-monitor) carries a firmware badge comparing **current firmware** against **target firmware**, along with any download state. Hover it for detail.

That comparison is the practical view of a rollout: a device whose current version has been behind its target for a long time either isn't receiving updates or is failing to apply them, and both are worth investigating.

## Rollouts and Fleet Health

Firmware changes are one of the few things that can affect many devices at once, which makes them a prime suspect when fleet-wide numbers move. After a rollout, watch:

* **New Issues** in [Fleet Diagnostics](./fleet-triage.md) for the following days.
* **Average Online Rate** on the [fleet dashboard](../monitoring/fleet-dashboard.md).
* **Data Frequency** on affected devices, which can change without uptime changing at all.

A fleet-wide shift that begins the day after a rollout is a rollout problem until proven otherwise.

:::tip
Roll out to a small cohort first and give it a few days of diagnostics before going wider. A staged rollout turns a fleet-wide incident into a contained one.
:::

## Troubleshooting

### A device won't take an update

**Problem**: Current firmware stays behind target.

**Solution**: Check the download state on the firmware badge — a device that never starts the download has a connectivity problem, while one that downloads but doesn't apply has a device-side problem. Confirm the device is reporting at all on its [Performance tab](../monitoring/device-details.md#performance); an offline device can't update.

### Devices went offline after a rollout

**Problem**: Uptime dropped following a firmware change.

**Solution**: Treat it as caused by the rollout until shown otherwise. Compare affected devices against ones still on the previous version — if only updated devices are affected, that's the answer.

## What's Next

- [**Fleet Diagnostics**](./fleet-triage.md) — Watch for post-rollout effects.
- [**Device Details**](../monitoring/device-details.md) — Per-device firmware state.
- [**Stock & Inventory**](./stock.md) — The hardware side of operations.
