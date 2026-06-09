---
sidebar_position: 2
sidebar_label: Fair Usage Policy
---

# Air Quality Data Fair Usage Policy

Guidelines for Responsible and Equitable Access to Air Quality Data

:::info Document version
Version 1.0 — January 2026
:::

---

## 1. Why This Policy Exists

AirQo is a non-commercial air quality monitoring initiative operated by Makerere University, funded by research grants and development partners. All data is provided free of charge in line with our commitment to open access and advancing air quality science across Africa.

Our data infrastructure (servers, databases, compute nodes, and network bandwidth) is shared across all users simultaneously: researchers, students, government agencies, NGOs, partner organisations, and the general public. These resources are finite and not infinitely scalable.

When any single user or process requests very large volumes of data at once, it creates a disproportionate computational burden that can:

- Slow down or interrupt access for all other users on the platform
- Cause system instability or outright service downtime
- Degrade the performance of real-time data pipelines that inform public health decisions
- Exhaust database query capacity, causing timeouts for everyone

:::caution
This is not a technical limitation we intend to remove. Download batching is an intentional design decision to ensure fair, stable, and equitable access for all users of a shared, free resource.
:::

---

## 2. How the Platform Works

### 2.1 Data Volume and Sampling Frequency

To appreciate why large downloads are resource-intensive, consider the raw data volumes involved:

| Period | Readings Per Monitor | Readings (50 Monitors) |
|--------|---------------------|------------------------|
| 1 Hour | 6 | 300 |
| 1 Day | 144 | 7,200 |
| 1 Month | ~4,320 | ~216,000 |
| 1 Year | ~52,560 | ~2,628,000 |
| 6 Years (2019–2024) | ~315,360 | ~15,768,000 |

Note: Kampala alone has over 50 active monitors. A single query for six years of hourly data across all Kampala monitors would request tens of millions of database rows, requiring significant compute time, memory, and bandwidth.

### 2.2 The Batch Download Limit

To protect system stability and ensure equitable access for all users, the AirQo Analytics Platform intentionally limits single downloads to approximately **three months of data per query**.

:::warning This limit is intentional and permanent
This limit is displayed clearly via tooltips in the platform interface. It applies universally to all users regardless of institutional affiliation, seniority, or research scope.
:::

---

## 3. How to Download Large Historical Datasets

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

For users comfortable with programming (Python, R, or similar), the [AirQo API](../api/intro.md) provides a more efficient and automated pathway for downloading large datasets.

| | |
|---|---|
| **API Documentation** | [AirQo API →](../api/intro.md) |
| **Free Tier** | Suitable for standard academic research — $0/month |
| **Registration Required** | Yes — to obtain an API key for authentication |
| **Rate Limits** | Applied per tier to ensure equitable access across all API users |
| **Support** | [info@airqo.net](mailto:info@airqo.net) for guidance on large-scale API use |

Using the API, researchers can write scripts that automatically loop through date ranges, paginate through results, and save data incrementally. This is the recommended approach for very large datasets or when integrating AirQo data into automated analysis pipelines.

:::info Note on API rate limits
Even the API is subject to rate limiting. This is standard practice across all major data APIs (Google, OpenStreetMap, NOAA, EPA, etc.) and is not unique to AirQo. Rate limits protect infrastructure integrity and ensure no single user monopolises shared compute resources.
:::

---

## 4. Fair Usage Principles

All users — regardless of seniority, institutional affiliation, or urgency of need — are expected to adhere to the following principles when accessing AirQo data:

| Principle | What It Means in Practice |
|-----------|--------------------------|
| **Batch Your Downloads** | Break multi-year data requests into quarterly or monthly chunks. Do not attempt to circumvent batch limits through workarounds. |
| **Use the Right Tool** | Use the Analytics Platform for exploratory and moderate-sized downloads. Use the API for automated, large-scale, or programmatic access. |
| **Use Calibrated Data** | Always download calibrated (not raw) data for research. This reduces the need for repeated re-downloads to apply corrections. |
| **Download Once, Store Locally** | Save your downloaded files. Do not re-download the same data multiple times. Maintain a local archive for your study period. |
| **Apply Quality Control Locally** | AirQo recommends a ≥50% data completeness threshold. Apply QC filters after downloading, not by requesting new downloads. |
| **Plan Ahead** | Account for download time in your research timeline. If your deadline is imminent, you should have planned data access earlier. |
| **Respect Rate Limits** | Do not write automated scripts that hammer the API without appropriate delays (back-off intervals) between requests. |

---

## 5. What Not To Do

:::danger
- Do not request bulk exports of more than three months in a single query on the Analytics Platform.
- Do not send repeated automated API requests without rate-limiting your own scripts.
- Do not request that AirQo staff manually extract and send multi-year bulk datasets on your behalf as a workaround to platform limits.
- Do not share API credentials or export scripts with unlimited loop behaviour in public code repositories.
- Do not assume that because data is free, the infrastructure costs of delivering it are also zero.
:::

---

## 6. Data Quality and Completeness

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
- For research requiring exact coordinates, contact [info@airqo.net](mailto:info@airqo.net).

---

## 7. Quick Reference Summary

| Topic | Summary |
|-------|---------|
| **Download Limit** | ~3 months per single query on Analytics Platform |
| **Reason** | Shared infrastructure; intentional and permanent design decision |
| **6-Year Dataset** | ~24 quarterly downloads via Analytics Platform, or scripted API access |
| **API Documentation** | [AirQo API →](../api/intro.md) |
| **Analytics Platform** | https://airqo.africa/products/analytics |
| **Recommended Data Type** | Calibrated data (not raw) |
| **Recommended Frequency** | Hourly data for seasonal/temporal analysis |
| **Completeness Threshold** | ≥50% of expected readings per monitor per period |
| **Support & Inquiries** | [info@airqo.net](mailto:info@airqo.net) |

---

## 8. Contact and Support

AirQo is committed to supporting researchers and will gladly provide guidance on data access, methodology, and collaboration opportunities.

| | |
|---|---|
| **General Enquiries & Support** | [info@airqo.net](mailto:info@airqo.net) |
| **Website** | https://airqo.africa |
| **API Documentation** | [AirQo API →](../api/intro.md) |
| **Analytics Platform** | https://airqo.africa/products/analytics |
| **Network Coverage** | https://airqo.net/solutions/network-coverage |
| **Response Time** | 3–5 business days (mark urgent requests in the subject line) |

:::tip Research collaboration
AirQo welcomes research collaboration. If your project is large-scale, cross-institutional, or policy-relevant, please reach out to discuss partnership arrangements, including data access support tailored to your research needs.
:::

---

*This document is prepared by AirQo, Makerere University, Kampala, Uganda. For the latest version, contact [support@airqo.net](mailto:support@airqo.net)*
