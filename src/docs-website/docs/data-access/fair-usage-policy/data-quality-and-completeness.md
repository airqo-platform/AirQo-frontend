---
sidebar_position: 6
sidebar_label: 6. Data Quality & Completeness
---

# 6. Data Quality and Completeness

When assembling multi-year datasets from batch downloads, researchers should apply the following quality control practices recommended by AirQo:

### 6.1 Data Completeness Threshold

AirQo recommends using only data from monitors that provide **≥50% of expected measurements** for any given analysis period.

- **Hourly analysis** — A monitor providing fewer than 12 readings in a 24-hour period should be flagged for that day.
- **Daily averages** — Fewer than 72 measurements out of 144 expected means the daily average may not be representative.

### 6.2 Missing Data

- AirQo does not interpolate or backfill missing values. Missing readings remain null/empty.
- This is intentional — air quality can change rapidly, making interpolated values unreliable for exposure assessment.
- When combining quarterly files, verify that your analysis software handles null values correctly and does not silently treat them as zeroes.

### 6.3 Coordinate Approximation

- Monitor coordinates are offset by approximately 0.5 km from actual physical locations for privacy reasons.
- This applies across all data access methods.
- For research requiring exact coordinates, contact [support@airqo.net](mailto:support@airqo.net).
