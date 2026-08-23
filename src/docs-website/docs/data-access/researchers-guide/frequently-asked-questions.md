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
Yes. The Analytics Platform provides pre-aggregated hourly/daily data. The API can provide 10-minute resolution.

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

### Data Access Questions

**I need data urgently for a deadline.**
Data is immediately available through the Analytics Platform and API. For large custom requests, plan ahead and allow additional time.

**My download failed or seems incomplete.**
Contact [support@airqo.net](mailto:support@airqo.net) with the time and date of your download attempt, monitors and date range requested, platform used, and any error messages.

**Can I share AirQo data with collaborators?**
Yes, data is open access. However, we encourage collaborators to access data directly from AirQo platforms to ensure they have the most up-to-date versions.

**Why is my download limited to three months?**
This is an intentional, permanent system design to ensure equitable access for all users. Please download data in quarterly batches. See the [Fair Usage Policy](../fair-usage-policy/index.md) for full guidance.
