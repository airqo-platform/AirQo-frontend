---
sidebar_position: 3
sidebar_label: 3. How to Download Large Datasets
---

# 3. How to Download Large Historical Datasets

Obtaining multi-year datasets is entirely possible. It simply requires breaking up your requests into manageable batches, which is standard practice in data-intensive research and reflects good data management hygiene.

### 3.1 Recommended Approach: Batch Downloads via the Analytics Platform

For most academic and public health researchers, the Analytics Platform is the simplest and most accessible option. Follow this workflow:

1. Navigate to the AirQo Analytics Platform: https://airqo.africa/products/analytics
2. Select your study area (e.g., Kampala) and the monitors of interest.
3. Choose a data frequency (hourly is recommended for seasonal analysis).
4. Set your date range to a three-month window (e.g., January – March 2019).
5. Export the data as a CSV file and save it with a clearly named file (e.g., `Kampala_hourly_2019_Q1.csv`).
6. Repeat for each subsequent quarter until you have covered your full study period.
7. Combine your quarterly files in your analysis software (Excel, R, Python, Stata, etc.).

:::tip
For a six-year study period (2019–2024), this means approximately 24 separate downloads — one per quarter per year. Each download takes only a few minutes to complete.
:::

### 3.2 Suggested Quarterly Download Schedule

| Quarter | Date Range | Suggested Filename |
|---------|------------|--------------------|
| Q1 | Jan 1 – Mar 31 | `Kampala_hourly_YYYY_Q1.csv` |
| Q2 | Apr 1 – Jun 30 | `Kampala_hourly_YYYY_Q2.csv` |
| Q3 | Jul 1 – Sep 30 | `Kampala_hourly_YYYY_Q3.csv` |
| Q4 | Oct 1 – Dec 31 | `Kampala_hourly_YYYY_Q4.csv` |

Repeat the above for each year in your study period (2019, 2020, 2021, 2022, 2023, 2024).

### 3.3 Advanced Option: Programmatic Access via the AirQo API

For users comfortable with programming (Python, R, or similar), the [AirQo API](../../api/intro.md) provides a more efficient and automated pathway for downloading large datasets.

| | |
|---|---|
| **API Documentation** | [AirQo API →](../../api/intro.md) |
| **Free Tier** | Suitable for standard academic research — $0/month |
| **Registration Required** | Yes — to obtain an API key for authentication |
| **Rate Limits** | Applied per tier to ensure equitable access across all API users |
| **Support** | [support@airqo.net](mailto:support@airqo.net) for guidance on large-scale API use |

Using the API, researchers can write scripts that automatically loop through date ranges, paginate through results, and save data incrementally. This is the recommended approach for very large datasets or when integrating AirQo data into automated analysis pipelines.

:::info Note on API rate limits
Even the API is subject to rate limiting. This is standard practice across all major data APIs (Google, OpenStreetMap, NOAA, EPA, etc.) and is not unique to AirQo. Rate limits protect infrastructure integrity and ensure no single user monopolises shared compute resources.
:::
