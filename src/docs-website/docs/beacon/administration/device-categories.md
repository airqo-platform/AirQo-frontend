---
sidebar_position: 8
---

# Device Categories

:::warning AirQo staff only
Requires the AirQo workspace and device-maintenance rights. See [Administrative Panel](./overview.md).
:::

**Device Categories** manages the functional categories used to organise IoT devices, each with a name and description.

## Categories Versus Cohorts

These are easy to confuse, and they aren't interchangeable:

| | Category | [Cohort](/vertex/device-deployment/device-cohorts) |
|---|---|---|
| **Describes** | What kind of instrument a device is | Which group of devices you manage together |
| **Managed in** | Beacon (AirQo staff) | Vertex (any workspace) |
| **Example** | Reference Monitor | "Kampala Schools Project" |
| **Per device** | One | Many possible |

A device's category is intrinsic — it doesn't change because the device moved project. Its cohort is organisational and can change freely.

## Why Category Matters for Monitoring

Category is what makes fair comparison possible. Low-cost sensors and reference-grade instruments have genuinely different expected error margins, so judging one by the other's standard produces false conclusions in both directions — healthy low-cost units look broken, and drifting reference units look fine.

Category appears in the [device list](../monitoring/device-details.md#finding-a-monitor) and is set when a device is registered in Vertex, where the choices are **Low Cost**, **Reference Monitor**, and **Gas**.

## Troubleshooting

### A device is in the wrong category

**Problem**: A monitor's category is incorrect.

**Solution**: Category is set on the device record when it's registered in Vertex. Correcting it there is what changes the device; this page manages the set of categories themselves, not which device belongs to which.

## What's Next

- [**Device States**](../reference/device-states.md) — How category interacts with other device attributes.
- [**Stock & Inventory**](./stock.md) — Hardware inventory.
