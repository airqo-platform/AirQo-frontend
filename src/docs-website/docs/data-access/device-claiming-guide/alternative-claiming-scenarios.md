---
sidebar_position: 3
sidebar_label: 2. Alternative Claiming Scenarios
---

# 2. Alternative Claiming Scenarios

Not every device follows the [standard flow](./main-claiming-flow.md). The table below covers common variations.

| Scenario | What happens |
|----------|--------------|
| **Your device has no claim token at all** (it was never formally "shipped" through AirQo's process — e.g. a device set up directly by AirQo staff) | You can still claim it with just the exact **Device Name** and your account — leave the claim token field blank. |
| **Claiming several devices at once** | Use the bulk-claim option: add each device name (and token, if it has one) as a row, or upload a spreadsheet/CSV. You'll get a per-device result — some may succeed while others fail, so check the results list. |
| **The device was previously deployed elsewhere** (e.g. a returned or reassigned unit) | Claiming it automatically "recalls" it from its old deployment first — its previous location history is preserved, but it comes to you as freshly claimed, not still attached to somewhere else. |
| **You already claimed a device, but it doesn't show up under any group** | This is called an "orphaned" device — check your My Devices page for a "Complete Device Setup" prompt, which lets you finish attaching it to a group with one click. |
| **You want to put the device in a specific existing group** | During claiming (or via "import cohort"), enter that group's ID — you can use either the internal ID or, for newer groups, a human-readable slug (e.g. `wri-nairobi-2026`). |

:::info Recalling deployed devices
See [Recall a Device](../../vertex/device-deployment/recall-device.md) for more on how deployment history is preserved when a device changes hands.
:::
