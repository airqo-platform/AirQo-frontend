---
sidebar_position: 2
---
# Device Data Status

A device's data status shows whether it's currently sending data and whether that data is ready to use. This is separate from its deployment status and from its [public visibility](./public-visibility.md) — a Deployed, Private device can still show as Not Transmitting if it stops sending data.

## The Four Statuses

| Status | Meaning |
|---|---|
| **Operational** | The device is sending raw data, and its calibrated data is ready to use. |
| **Transmitting** | The device is sending new raw data, but the calibrated version is still processing. |
| **Data Available** | The device isn't currently sending new data, but recently calibrated data is still available. |
| **Not Transmitting** | No new raw data, and no recent calibrated data. The device appears to be offline. |

> [!NOTE]
> Statuses are updated hourly and may not reflect the device's most recent state.

## Where to See It

* **Per device** — On a device's Device Details page, the **Online Status** card shows its current status alongside the timestamp of its last received data.
* **Across your fleet** — On the **Home** dashboard, the **Device Health** section breaks down your devices by status count. Click a count to jump to a device list filtered by that status.
* **Live raw readings** — On a device's Device Details page, the **Run Device Test** card shows how long ago the device last pushed data, along with the actual field values from that last reading. Click the refresh icon to re-check in real time. This is more granular than the four statuses above — useful for confirming a device is truly reporting, not just checking its hourly-updated status.

## What's Next

- [**Public Visibility**](./public-visibility.md) — Control whether a device's data is publicly visible, separate from whether it's currently available.
- [**Import Devices**](../third-party-sensors/import-devices.md) — Add a sensor from a different manufacturer to monitor alongside your AirQo devices.
