---
sidebar_position: 4
---

# Device Profiles

:::warning AirQo staff only
Requires the AirQo workspace and device-maintenance rights. See [Administrative Panel](./overview.md).
:::

**Device Profiles & Hardware Topologies** holds declarative hardware specifications — what a given model of monitor is made of, and how its data maps into the platform.

Profiles are the foundation the rest of the diagnostic system stands on. The engine can't reason about a subsystem a profile doesn't declare, and the [bench simulator](./bench-simulator.md) generates its telemetry from a profile's own metric limits. A thin profile produces thin diagnostics.

## What Makes a Complete Profile

A profile is complete when it has all three of:

* **Ingestion Slot Mappings** — how incoming data maps onto the profile's expected fields.
* **Subsystems** — the hardware components the device is built from.
* **Topological Relationships** — how those components relate to each other.

Relationships are what let the engine distinguish a failing component from one that merely *looks* wrong because something upstream failed. Without them, a single root cause presents as several unrelated symptoms.

## Profile Identity

Each profile carries:

| Field | Notes |
|---|---|
| **Profile Name** | Required |
| **Category** | Required |
| **Vendor / Manufacturer** | The hardware vendor |
| **Description** | Free text |

Because profiles are per-vendor, third-party hardware needs its own profile before it can be diagnosed in the same depth as AirQo hardware.

## Editing a Profile

The profile editor is organised into:

* **Components** — subsystems the device comprises.
* **Mappings** — ingestion slot mappings.
* **Relationships** — topological relationships between components.
* **Metadata** — descriptive fields.

## Working Practice

Profiles are shared infrastructure — changing one changes how every device of that model is diagnosed. A safe order of work:

1. Make the change.
2. Open the [Bench Simulator](./bench-simulator.md), select the profile, and generate telemetry.
3. Inject faults relevant to the part you changed.
4. Confirm the engine still diagnoses correctly before the profile meets real data.

:::tip
If generated telemetry from a profile looks unrealistic, the profile's metric limits are wrong — and those same limits are shaping real diagnoses. Treat unrealistic simulator output as a profile bug, not a simulator quirk.
:::

## Troubleshooting

### Diagnostics for a device model are shallow

**Problem**: Devices of one model consistently produce vague or few diagnoses.

**Solution**: Check the profile has all three required parts. A profile with mappings but no subsystems or relationships gives the engine nothing to localise a fault to.

### A new vendor's devices aren't diagnosed properly

**Problem**: Third-party hardware doesn't behave like AirQo hardware in diagnostics.

**Solution**: It needs its own profile. Registering the device in Vertex under its Sensor Manufacturer makes it *monitorable*; a device profile is what makes it *diagnosable*.

## What's Next

- [**Diagnostic Templates**](./diagnostic-templates.md) — The reasoning layer above profiles.
- [**Bench Simulator**](./bench-simulator.md) — Validate a profile change.
