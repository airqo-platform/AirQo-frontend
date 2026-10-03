---
sidebar_position: 1
---

# Administrative Panel

:::warning AirQo staff only
This section documents Beacon's internal operations tooling. It is not available to beneficiary organizations, and nothing here is needed to run your own fleet. If you're an AirQo beneficiary, start at [The Beneficiary Journey](../beneficiary-journey.md) instead.
:::

The Administrative Panel is the toolset AirQo uses to keep the wider sensor network running — hardware triage, calibration, firmware, and inventory. It's entered from the primary (hamburger) drawer rather than the main sidebar.

## Who Can Open It

Two conditions must both hold:

1. Your active workspace is the **AirQo** group.
2. You can maintain devices — the `DEVICE_MAINTAIN` permission, or administrator rights on that group.

Members of any other organization never see the panel, and its routes are closed to them even by direct URL. Individual pages restate the rule when you land on them without access; Firmware, for example, says it is *"only available when the selected group is airqo."*

## What's in It

| Area | Purpose |
|---|---|
| [**Fleet Diagnostics**](./fleet-triage.md) | Daily health triage across the whole fleet |
| [**Bench Simulator**](./bench-simulator.md) | Test the diagnostic engine against synthetic faults |
| [**Device Profiles**](./device-profiles.md) | Declarative hardware specifications |
| [**Diagnostic Templates**](./diagnostic-templates.md) | The symptom and root-cause rules engine |
| [**Collocation**](./collocation.md) | In-lab and field calibration testing |
| [**Firmware Management**](./firmware.md) | Firmware library and device flashing |
| [**Device Categories**](./device-categories.md) | Functional categories for devices |
| [**Stock & Inventory**](./stock.md) | Hardware parts and stock levels |
| [**User Management**](./users.md) | Platform user accounts |

## How the Diagnostic Pieces Fit Together

Four of these are one system, and they're much easier to understand in order:

1. A [**Device Profile**](./device-profiles.md) declares what a given piece of hardware *is* — its subsystems, how its data maps into ingestion slots, and what its metrics should look like.
2. A [**Diagnostic Template**](./diagnostic-templates.md) declares how to reason about that hardware — symptoms, candidate root causes, and the evidence weighting that chooses between them.
3. The [**Bench Simulator**](./bench-simulator.md) lets you test that reasoning against injected faults before it meets real devices.
4. [**Fleet Diagnostics**](./fleet-triage.md) is the engine's output across the real fleet.

Changing a template without simulating it first means finding out on live data whether the rules work.

## What's Next

- [**Fleet Diagnostics**](./fleet-triage.md) — The daily triage view.
- [**Health Metrics Explained**](../reference/health-metrics.md) — Shared definitions, useful for staff too.
