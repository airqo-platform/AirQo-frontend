---
sidebar_position: 3
sidebar_label: 2. Data Frequency & Aggregation
---

# 2. Data Frequency and Temporal Aggregation

### Sampling Frequency

| Metric | Value |
|--------|-------|
| Raw Sampling Rate | Every 10 minutes |
| Data Points per Hour | 6 measurements |
| Daily Data Points | ~144 measurements per 24-hour period |

### Pre-Aggregated Data on Platform

The AirQo Analytics platform provides pre-computed temporal averages: hourly, daily, weekly, and monthly. These aggregations are calculated from the raw 10-minute measurements to facilitate analysis.

### Handling Missing Data

**Our approach to data gaps:**

- **No interpolation** — We do not perform backfilling, forward filling, or imputation of missing values. When a monitor fails to capture data during a specific period, the value remains null/empty in the dataset.
- **Rationale** — Air pollution levels can change rapidly due to traffic, weather, and local emissions, making interpolated values unreliable for exposure assessments.

### Data Completeness Threshold

For robust analysis, we recommend applying a data completeness criterion:

- **Recommended threshold** — Use only data from monitors that provide ≥50% of expected measurements for your analysis period.
- **Hourly analysis** — If a monitor has fewer than 12 readings in a 24-hour period, consider excluding that day.
- **Daily averages** — If fewer than 72 measurements (50% of 144 expected) are available, the daily average may not be representative.

### Recommended Analytical Workflow

For time-series analysis:

1. Download hourly (or raw 10-minute) data from the platform in quarterly batches.
2. Check data completeness for each monitor and time period.
3. Apply your completeness threshold (we recommend 50% minimum).
4. Compute daily averages from hourly data where applicable.
5. Aggregate to weekly or monthly levels as needed.
6. Document and report your data quality control steps.
