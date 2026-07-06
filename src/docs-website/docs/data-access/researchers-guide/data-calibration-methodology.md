---
sidebar_position: 2
sidebar_label: 1. Data Calibration Methodology
---

# 1. Data Calibration Methodology

### How Calibration is Performed

AirQo monitors undergo rigorous calibration protocols to ensure data accuracy and reliability. Our calibration approach includes:

- **Co-location with Reference-Grade Monitors** — AirQo low-cost sensors are periodically co-located with BAM (Beta Attenuation Monitor) and other reference-grade instruments to establish calibration relationships.
- **Localised Calibration Models** — We deploy city-specific calibration models using reference monitors in individual urban areas. This approach accounts for local atmospheric conditions and pollution characteristics.
- **Machine Learning Calibration** — Advanced algorithms are applied to sensor data to correct for environmental factors (temperature, humidity) and sensor drift over time.
- **Continuous Quality Assurance** — Regular validation studies ensure our data maintains correlation with high-end reference-grade monitors.

### Understanding Raw vs. Calibrated Data

On the AirQo platform, you will find two data streams:

- **Raw Data** — Unprocessed sensor readings directly from the monitors.
- **Calibrated Data** — Processed data that has undergone our calibration pipeline.

:::tip Recommendation
For research purposes, always use calibrated data. It provides the most accurate representation of ambient air quality conditions.
:::

### Technical Reference

For detailed methodology on our calibration approach, refer to our published research:

- **AirQo Calibration Methodology Paper**: https://onlinelibrary.wiley.com/doi/full/10.1002/ail2.76

This peer-reviewed publication provides comprehensive technical details on our sensor calibration, validation protocols, and performance evaluation.
