---
sidebar_position: 15
sidebar_label: 14. Frequently Asked Questions
---

# 14. Frequently Asked Questions

### General Questions

**How much historical data is available?**
AirQo has been collecting data since approximately 2015, with network expansion over time. Data availability varies by city and location. Contact [support@airqo.net](mailto:support@airqo.net) for specifics.

**Can I get real-time data?**
Yes, through the API for near-real-time data. For research, archived data that has undergone full quality control is preferable.

**Can I request monitor deployments for my research?**
AirQo offers network packages for research partnerships. Contact [support@airqo.net](mailto:support@airqo.net).

**How do I handle multi-city comparative studies?**
Ensure consistent QC criteria across cities, account for differences in monitor density, and use appropriate methods for multi-level or clustered data.

### Technical Questions

**What coordinate system is used?**
Monitor coordinates are provided in WGS84 (latitude/longitude). Verify in the metadata when downloading.

**Can I access raw 10-minute data?**
Yes. The AirQo Nexus provides pre-aggregated hourly/daily data. The API can provide 10-minute resolution.

**How do I handle outliers?**
Investigate extreme values before removal. Check for sensor malfunction periods, genuine extreme pollution events, and data transmission errors. Document your approach transparently.

**Is AirQo data suitable for health impact assessment?**
Yes, for epidemiological studies and exposure assessment. Use appropriate exposure assignment methods and account for measurement error.

**Why doesn't my monitor appear in its exact location on the map?**
Coordinates are intentionally offset by up to ~0.5km to protect the privacy of the institutions hosting monitors. See [Location Approximation](./location-approximation.md) for the full policy and how to adjust proximity analysis for it.

### Device Ownership Questions

**How do I claim a device that was shipped to me?**
See the [Main Claiming Flow](../device-claiming-guide/main-claiming-flow.md) — scan the QR code or enter the Device Name and Claim Token from the printed label.

**What uptime and data availability should I expect from my device?**
See [Device Uptime Targets](../device-performance-guide/device-uptime-targets.md) and [Data Availability Targets](../device-performance-guide/data-availability-targets.md) — both depend on power source and firmware version.

**Who is responsible for maintaining my device, and what does it cost?**
AirQo covers the device and its software; you're responsible for your AirQloud's reliability. See [Maintenance Cost Options](../device-performance-guide/maintenance-and-support.md#maintenance-cost-options) for the knowledge-transfer vs. on-site maintenance choices.

### Device Visibility Questions

**How long does it take for a newly deployed device to appear on the map?**
Once a device is deployed, it typically appears on the AirQo Nexus map within **1–6 hours of starting to transmit data**. There's no manual step on our end — the pipeline is fully automated — but it runs on scheduled cycles rather than instantly, so some wait is normal. Here's where that time goes:

| Stage | Typical time added |
|---|---|
| Device recorded as deployed | Immediate |
| Device starts transmitting (hardware/network-dependent) | Varies — happens before the 1–6 hour window begins |
| Pipeline recognises the new device | Up to ~3 hours |
| Readings collected, calibrated, and processed | Up to ~1–2 hours |
| Processed readings made queryable | Up to ~1 hour |
| Map displays the device | Near-instant; refresh the map if a view was already open |

**Why isn't my new device showing up yet?**
The most common causes, roughly in order of likelihood:
- **Cycle timing** — the pipeline runs on periodic (hourly/multi-hourly) cycles, not continuously. A device deployed just after a cycle has run waits almost a full cycle for the next one. This is the most common cause, and isn't a fault.
- **Not transmitting yet** — power, SIM/connectivity, or wiring issues at the deployment site mean there's no data yet to process. This is a field/hardware issue, not a pipeline delay — see [Factors Affecting Performance](../device-performance-guide/factors-affecting-performance.md).
- **Missing or incorrect site coordinates** — the map only shows devices whose site has valid location data. Data can be flowing correctly and still never appear on the map until the site's coordinates are corrected.
- **Browser/map caching** — if the map was already open, it may be showing a snapshot from a few minutes earlier. Refresh before assuming a backend delay.
- **Recalled or deactivated devices** — stop appearing on the map within the same processing cycles above; this is expected behaviour, not a fault.

**When should I escalate a device that hasn't appeared on the map?**
If the device has been confirmed to be actively transmitting for more than **6 hours** and its site's location data is verified correct, it's reasonable to contact [support@airqo.net](mailto:support@airqo.net) rather than continue waiting.

### Data Access Questions

**I need data urgently for a deadline.**
Data is immediately available through the AirQo Nexus and API. For large custom requests, plan ahead and allow additional time.

**My download failed or seems incomplete.**
Contact [support@airqo.net](mailto:support@airqo.net) with the time and date of your download attempt, monitors and date range requested, platform used, and any error messages.

**Can I share AirQo data with collaborators?**
Yes, data is open access. However, we encourage collaborators to access data directly from AirQo platforms to ensure they have the most up-to-date versions.

**Why is my download limited to three months?**
This is an intentional, permanent system design to ensure equitable access for all users. Please download data in quarterly batches. See the [Fair Usage Policy](../fair-usage-policy/index.md) for full guidance.
