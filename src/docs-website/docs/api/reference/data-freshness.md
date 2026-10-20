---
sidebar_position: 1.5
sidebar_label: Data Freshness
description: What "real-time" and "recent" mean for AirQo API data, and how to tell how current a reading is.
---

# What "Real-Time" Means

When AirQo describes data as **real-time** or **near-real-time**, it means the most recent data the network has processed. It does not mean a reading taken in the last few minutes.

The finest resolution for calibrated measurements is **one hour**. Each calibrated value is an average over an hour of readings, so the newest one is always for an hour that has already ended. It cannot reflect what happened in the last few minutes.

---

## How Current Each Data Type Is

| Data type | Resolution | What "latest" means |
|-----------|-----------|---------------------|
| [Recent measurements](../for-cities/recent-measurements.md) (calibrated) | Hourly | The most recent hourly average that has been calibrated |
| [Raw sensor data](../analytics-api/raw-data.md) | Per device transmission | The last reading the device sent, uncalibrated. Devices on current firmware transmit about 6 times an hour. See [Data Reporting Frequency](../../data-access/device-performance-guide/data-reporting-frequency.md). |
| [Forecasts](../forecasts/overview.md) | Hourly and daily | Predicted values for upcoming hours or days, not measurements |

For dashboards, public displays and alerts, use the hourly calibrated measurements. Use raw data only when you need readings between hourly averages and can work with uncalibrated values.

---

## Checking How Current a Reading Is

Every recent-measurements record shows how current it is. See [Response Structure](./response-structure.md) for the full field list.

| Field | What it tells you |
|-------|-------------------|
| `time` | The hour this calibrated value represents |
| `deviceDetails.lastActive` | The device's most recent calibrated reading |
| `deviceDetails.lastRawData` | The last time the device sent a raw reading |
| `isCache` | Whether the response came from cache |

Compare these timestamps with the current time (they are in UTC). If `lastRawData` is recent but `lastActive` is older, the device is still reporting and its next hourly value has not been published yet. If both are old, the device may be offline.

---

## Polling Guidance

- **Poll at most every 15 to 30 minutes.** Calibrated values change once an hour, so polling more often returns the same data and counts against your [rate limit](../getting-started/pricing-tiers.md#rate-limits).
- **Show the timestamp to your users.** Label displayed values with their hour, for example "PM2.5 at 14:00", rather than calling them "live" or "now". Convert the time from UTC to the viewer's local time.
- **Don't treat a missing latest hour as an outage.** Check `lastRawData` first: the device is usually still reporting, and the hourly value just hasn't been published yet.
