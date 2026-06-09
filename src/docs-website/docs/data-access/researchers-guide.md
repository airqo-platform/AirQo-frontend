---
sidebar_position: 1
sidebar_label: Data Access Guide for Researchers
---

# Data Access Guide for Researchers

Comprehensive guidance on accessing, interpreting, and responsibly using AirQo air quality monitoring data for academic and scientific research across Africa.

:::info Document version
Version 1.0.3 — April 2026
:::

---

## Introduction

Thank you for your interest in utilising AirQo's air quality monitoring data for your research. This document provides comprehensive guidance on accessing and interpreting air quality data from our monitoring network across Africa.

AirQo operates a high-density air quality monitoring network across the continent, with significant coverage in major urban centres. Our mission is to advance responsible open-access data sharing to support research, policy development, and public health initiatives.

---

## Open Data, Shared Infrastructure

All AirQo air quality data is provided free of charge. This is a deliberate policy rooted in our commitment to open science and the belief that clean air data should be a public good — accessible to researchers, policymakers, students, and communities alike.

However, free access does not mean unlimited access without consideration. AirQo is a non-commercial initiative operated by Makerere University and funded through research grants and development partnerships. Our data infrastructure (servers, databases, and compute resources) is shared simultaneously by all users across Africa and beyond. These resources are finite.

Equitable access means every user — from a PhD student in Kampala to a government analyst in Nairobi — receives a reliably fast and stable experience. To protect this, we have implemented intentional, permanent design measures that distribute system load fairly across all users.

---

## How Equitable Access Works in Practice

The most visible manifestation of our fair usage policy is the download batch limit on the Analytics Platform: single data exports are capped at approximately three months of data per query. This is not a bug, a temporary limitation, or something that will be removed upon request. It is an intentional engineering decision.

The rationale is straightforward: a single query for six years of hourly data across 50+ monitors could request tens of millions of database rows, consuming significant server memory, CPU time, and bandwidth. If this were permitted without restriction, it would degrade service for every other concurrent user.

| Scenario | Estimated Data Rows | System Impact |
|----------|---------------------|---------------|
| 1 monitor, 3 months, hourly | ~2,160 rows | Minimal |
| 50 monitors, 1 year, hourly | ~2,628,000 rows | Significant |
| 50 monitors, 6 years, hourly | ~15,768,000 rows | Severe — blocks others |

Downloading data in batches (e.g., quarterly) costs you only a few extra minutes of preparation time, while preserving a stable, fast experience for all users. For researchers who require automated large-scale access, the [AirQo API](../api/intro.md) (which also applies rate limiting) is the appropriate channel.

:::info See also
For detailed guidance on batch download workflows, API access, and fair usage expectations, see the companion document: [AirQo Fair Usage Policy](./fair-usage-policy.md).
:::

---

## 1. Data Calibration Methodology

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

---

## 2. Data Frequency and Temporal Aggregation

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

---

## 3. Spatial Disaggregation and Geographic Filtering

### 3.1 Location Approximation for Monitor Coordinates

:::caution Privacy and security disclosure
For privacy and security reasons, all monitoring station coordinates provided through AirQo's data platforms are intentionally approximated. This policy protects the privacy of institutions, businesses, and property owners hosting AirQo monitoring equipment.
:::

| | |
|---|---|
| **Offset Range** | Approximately 0.5 kilometres from actual physical locations |
| **Consistency** | Approximated coordinates remain consistent across all queries |
| **Affected Platforms** | All data access methods: Analytics Platform, API, mobile app |

**Implications for research:**

The coordinate approximation is still valid for: area-based and neighbourhood-level analysis, regional air quality modelling, trend identification and temporal patterns, zone-level exposure assessment, and city-wide spatial analysis.

It requires adjustment for: highly localised point-source correlation studies, proximity analysis requiring exact locations, and fine-scale spatial modelling below 1 km resolution.

:::info Accessing exact coordinates
For research requiring precise monitor locations, contact [support@airqo.net](mailto:support@airqo.net) to discuss exact coordinate access, data sharing agreements, and collaboration opportunities.
:::

### 3.2 Selecting Monitors by Geographic Area

AirQo provides three methods for spatial data selection:

- **Method 1 – Analytics Platform (Bulk Export)**: Select specific cities or regions, choose individual monitoring sites, define custom date ranges, and export in CSV format.
- **Method 2 – Grid API**: Query data by geographic coordinates or administrative boundaries (districts, divisions, parishes). See the [AirQo API documentation](../api/intro.md).
- **Method 3 – Manual Monitor Selection**: Use the Analytics Platform interactive map to identify and select individual monitors within your study region.

### 3.3 Geographic Coverage

Visit our [network coverage page](https://airqo.net/solutions/network-coverage) for monitor locations, or contact [support@airqo.net](mailto:support@airqo.net) for specific coverage in your study area.

---

## 4. City-Wide Air Quality Aggregation Methodology

### The Challenge of City-Level Averages

A single air quality measurement or simple average for an entire city is often not a good indicator of air pollution exposure. Air pollution levels vary significantly across different neighbourhoods within the same city due to traffic patterns, industrial activities, human behaviour (cooking, burning, transport), geographic features, meteorological conditions, and land use characteristics.

### Recommended Methodological Approaches

**Approach 1: Spatial Heterogeneity Analysis (Preferred)**

Maintain spatial granularity in your analysis rather than collapsing to a single city average. Analyse air quality patterns by district, division, or neighbourhood. Identify pollution hotspots and clean areas. Relate air quality levels to land use, traffic density, and population exposure.

**Approach 2: Background Site Averaging**

If a city-level indicator is necessary: identify monitors in background sites with minimal local emission sources, calculate their mean for the period, and also report the highest reading from any monitor to represent worst-case exposure.

**Approach 3: Population-Weighted Average**

For exposure assessment studies, weight monitor readings by the population residing within each monitor's representative area. This provides a better estimate of average population exposure than simple arithmetic means.

:::danger What NOT to do
- Simple arithmetic mean of all monitors — can misrepresent exposure by over-representing densely monitored areas.
- Ignoring spatial variation — treating a city as having uniform air quality.
- Using near-source monitors (roads, industries) to represent the whole city.
:::

---

## 5. Monitor Coverage Area and Representativeness

### Spatial Representativeness

There is no universally defined distance covered by a single air quality monitor, as representativeness depends on local emission sources, meteorological conditions, topography, and urban morphology.

- **General guideline** — A monitor at a typical background location can provide data representative of approximately a 5 km radius.
- **Near-source monitors** — Monitors near major roads or industrial facilities represent more localised conditions (< 500 metres).
- **Temporal factors** — Rush-hour traffic can alter the spatial extent of a monitor's representativeness.

### Network Density Requirements

| | |
|---|---|
| **AirQo Recommendation** | At least one monitor per 10,000 people for high-resolution monitoring |
| **City-Wide Patterns** | Minimum 10–15 monitors recommended |
| **Neighbourhood Studies** | Higher density may be required |
| **Strategic Placement** | Background, traffic, and residential sites are as important as total number |

---

## 6. Monitoring Network Information

### Network Size and Coverage

| | |
|---|---|
| **Geographic Reach** | Tracks air pollution affecting more than 70 million people across 16 cities in Africa |
| **Network Type** | High-density low-cost sensor network |
| **Monitor Types** | Background, traffic-influenced, and near-source monitors |
| **Parameters Measured** | PM2.5 and PM10 (primary); gaseous parameters in development |
| **Network Uptime** | Average >85% (20+ hours of data collection per day) |
| **Monitor Lifespan** | 3 years with basic maintenance |

### Data Partnerships and Accessibility

The AirQo monitoring network includes devices owned and operated by multiple stakeholders: AirQo (Makerere University) as primary operator, municipal governments, research institutions, and international development partners. Most partner-owned monitors are publicly accessible through the AirQo platform.

---

## 7. Data Access Channels

### Overview of Access Methods

| Channel | Best For | Link |
|---------|----------|------|
| Mobile App (iOS/Android) | Field work, real-time monitoring | https://airqo.africa/products/mobile-app |
| Analytics Platform | Researchers, visualisation, historical analysis, CSV export | https://airqo.africa/products/analytics |
| API (RESTful) | Programmatic, large-scale, automated pipelines | https://airqo.africa/products/api |

### Downloading Large Historical Datasets

:::warning Batch download limit
The Analytics Platform limits single exports to approximately three months of data. This is an intentional, permanent design decision to ensure equitable system performance for all users. For multi-year datasets, download data in quarterly batches and combine the files in your analysis software.
:::

For automated or large-scale data access, use the [AirQo API](../api/intro.md) with appropriate rate-limiting in your scripts. Full guidance on batch workflows and API access is provided in the [companion fair usage document](./fair-usage-policy.md).

### API Pricing Tiers

| Tier | Cost | Suitable For |
|------|------|--------------|
| Free | $0/month | Small-scale academic research |
| Standard | $50/month | Larger research projects |
| Premium | $150/month | High-volume commercial or institutional use |

Academic researchers requiring higher API access than the free tier provides are encouraged to contact [support@airqo.net](mailto:support@airqo.net). We support academic research and can often accommodate reasonable requests.

### Data Access Costs

Data access is free of charge across the mobile app and Analytics Platform, consistent with our open-access philosophy. API subscription packages help subsidise computing infrastructure costs while maintaining free access for standard research use.

---

## 8. Data Quality and Accuracy

### Accuracy of AirQo Monitors

- Periodic calibration against reference-grade monitors (BAM, TEOM, FEM).
- Localised calibration models for individual cities.
- Continuous quality control algorithms and outlier detection.
- **Performance**: Strong correlation with reference monitors (R² typically >0.8); meets research-grade data quality standards for epidemiological studies.

### Measurement Parameters

Currently available: **PM2.5** (Particulate Matter ≤2.5 μm) and **PM10** (Particulate Matter ≤10 μm). These are the most health-relevant pollutants in African cities, associated with cardiovascular disease, respiratory illness, premature mortality, adverse birth outcomes, and cognitive impacts.

AirQo is actively developing expanded capabilities to include gaseous parameters (NO₂, O₃, CO, SO₂). Contact us for updates on parameter availability.

### Limitations and Appropriate Use

**AirQo monitors are designed for:** ambient outdoor air quality monitoring, spatial mapping of urban pollution, long-term trend analysis, exposure assessment, policy evaluation, and public health investigations.

**AirQo monitors are not designed for:** stack emission measurements, indoor air quality as a primary use case, extremely high concentration environments, or real-time personal wearable exposure monitoring.

:::info Meteorological data
AirQo monitors include temperature and humidity sensors for calibration purposes only. Meteorological data is not provided through our platforms. For weather data, use national meteorological agencies, reanalysis datasets (ERA5, MERRA-2), or weather station networks.
:::

---

## 9. Network Technical Specifications

### AirQo Binos Monitor Specifications

| | |
|---|---|
| **Sampling Frequency** | Every 10 minutes (6 readings/hour, 144 readings/day) |
| **Power Source** | Solar-powered with battery backup |
| **Connectivity** | IoT-enabled (cellular/WiFi) for real-time data transmission |
| **Deployment** | Outdoor ambient air monitoring |
| **Lifespan** | 3 years with basic maintenance (extendable with component replacement) |
| **Sensor Technology** | Optical particle counters for PM measurements |

### Network Performance Metrics

| | |
|---|---|
| **Uptime Target** | >85% (20+ hours of data daily) |
| **Expected Readings/Day** | 144 per monitor |
| **Good Performance** | >75% completeness (>108 readings/day) |
| **Minimum for Analysis** | 50% completeness (>72 readings/day) |

### Maintenance Requirements

- **Routine Maintenance** — Minimum every 6 months. Clean solar panels and clear sensor inlets of dust/debris using a clean cloth and hand blower.
- **Laser Sensor Lifetime** — Approximately 2 years. Smart power management extends operational life.
- **Component Replacement** — Monitors can be recalled for component upgrades and refurbishment.

---

## 10. Field Deployment and Calibration Guidance

This section addresses practical calibration and deployment questions commonly raised by research teams integrating AirQo low-cost sensors with reference-grade instruments in field-based monitoring projects.

### 10.1 Calibration Frequency

In challenging field environments characterised by high humidity, heavy dust loading, or significant biomass burning influence, AirQo recommends the following calibration intervals:

- **Initial co-location period** — A minimum of 4–6 weeks of co-location alongside a reference-grade monitor before network deployment is strongly recommended. This allows sufficient data to build a robust, site-specific calibration model across varying atmospheric conditions.
- **Recalibration interval** — A 2–3 month recalibration interval is generally sufficient for most African urban environments. However, in areas with extreme seasonal shifts (e.g., pronounced dry-season dust or heavy wet-season humidity), quarterly recalibration (every 3 months) is strongly recommended to account for sensor drift and changing pollution composition.
- **Continuous quality monitoring** — AirQo applies machine learning-based calibration corrections continuously to account for environmental drift between formal recalibration events. Researchers should document the calibration model version applied to their dataset.

### 10.2 Calibration Approach: Co-location vs. Remote Methods

Physical co-location with a reference-grade monitor remains the gold standard for calibrating low-cost sensors. It is necessary, particularly at the start of a project and at each formal recalibration event.

- **Duration** — A minimum of 4 weeks of co-location is recommended per calibration event. Longer periods (6–8 weeks) yield more robust models, especially where pollution sources are highly variable across seasons.
- **Frequency over a 12-month period** — We recommend at least 2–3 formal co-location events over a 12-month monitoring period: one at project start, one mid-year, and one toward the end of the study period. This captures seasonal variation in calibration relationships.
- **Remote and model-based correction** — Between formal co-location events, AirQo applies machine learning-based remote calibration corrections using environmental variables (temperature, humidity) and cross-sensor network consistency checks. These methods reduce but do not eliminate the need for periodic physical co-location, which remains essential for model validation.

### 10.3 Sensor Movement During Calibration and Maintenance

Temporary relocation of sensors to a co-location site is standard and acceptable practice. Key operational considerations:

- Document all sensor relocations with timestamps in your metadata. Data collected during transit or at the calibration site should be clearly flagged and excluded from your primary analysis dataset.
- Where backup sensors are available (see [Section 10.4](#104-use-of-backup-sensors)), rotate a spare into the network while the primary sensor undergoes calibration. This preserves spatial data coverage and minimises gaps in your time series.
- Where physical relocation is not feasible, model-based correction using network-wide consistency checks can serve as an interim measure; however, this should not be the primary long-term strategy.

### 10.4 Use of Backup Sensors

Including at least one spare sensor per network is strongly recommended, particularly for research-grade monitoring projects where data continuity is essential. AirQo's experience across African city deployments confirms that spare sensors are critical for:

- Maintaining continuous data coverage during calibration rotation events.
- Replacing failed sensors without waiting for procurement lead times, which can be 4–8 weeks in many African contexts.
- Enabling cross-sensor validation by comparing a spare unit against deployed sensors over time.

For a network of 10 sensors, we recommend budgeting for 1–2 spare units (10–20% of network size). This is considered best practice in AirQo's operational networks and is strongly recommended for policy-grade data generation projects.

### 10.5 Reference-Grade Monitor Requirements

For a network of approximately 10 low-cost sensors, AirQo recommends the following approach to reference-grade instrumentation:

- **Minimum viable setup – 1 reference monitor**: One reference-grade monitor is sufficient for sequential calibration of all low-cost sensors, provided the sensors are rotated through the co-location site in batches. This works well for networks where the monitoring environment is relatively homogeneous.
- **Preferred setup – 2 reference monitors**: For a city with distinct micro-environments (e.g., coastal areas vs. inland hillside communities), two reference monitors placed in contrasting environments are preferable. This supports the development of environment-specific calibration models and significantly improves data reliability across the network.
- **Acceptable reference instruments**: BAM (Beta Attenuation Monitor), TEOM (Tapered Element Oscillating Microbalance), or FEM (Federal Equivalent Method) instruments. Ensure the instrument is maintained by a certified operator and serviced per manufacturer specifications throughout the project period.

:::info Sourcing reference-grade equipment
AirQo does not supply reference-grade air quality monitoring equipment. For projects requiring such instruments, we recommend Met One Instruments as a reputable provider. AirQo systems support remote data collection from the BAM 1022, which is widely deployed for regulatory-grade PM measurements: https://metone.com/products/bam-1022/

For research projects seeking to integrate AirQo sensors within a larger hybrid monitoring system, contact [support@airqo.net](mailto:support@airqo.net) to discuss partnership arrangements, including technical training support, API integration, and data hosting on the AirQo platform.
:::

---

## 11. Best Practices for Researchers

### Data Download and Processing Workflow

1. **Define your study period and geographic region.** Identify monitor boundaries and consider seasonal data availability.
2. **Use calibrated (not raw) data.** Always download calibrated data for research analysis and document the calibration version.
3. **Download data in quarterly batches** via the Analytics Platform or use the API for automated access. Save raw downloaded files as backup.
4. **Assess data quality.** Calculate completeness for each monitor and time period. Flag monitors with consistent low uptime.
5. **Apply quality control filters.** Implement the 50% completeness threshold (or justify an alternative). Remove obvious outliers with documentation.
6. **Document everything.** Record all data processing steps, inclusion/exclusion criteria, and maintain metadata on monitor locations and characteristics.

### Spatial Analysis Recommendations

- Create a GIS database of monitor coordinates. Assign administrative units (districts, wards) and document land use characteristics.
- Classify monitor types: background sites, traffic-influenced sites, industrial-influenced sites, and mixed urban sites.
- Use appropriate spatial statistics (kriging, IDW, spatial autocorrelation). Report uncertainty in spatial estimates.
- Avoid over-aggregation. Maintain geographic detail where possible and use population-weighted averages for exposure assessment.

### Temporal Analysis Recommendations

- **Account for seasonality.** Many African cities have distinct wet and dry seasons, with significant air quality variation between them.
- **Consider long-term trends.** Use appropriate time-series methods (ARIMA, GAMs, mixed models) for autocorrelated data.
- **Control for known events.** Document major events affecting air quality (lockdowns, policy changes) and consider intervention analysis methods.

### Reporting and Publication

**Methods section should include:**

- Data source and version: *"AirQo air quality monitoring network, accessed [date]"*
- Study period and geographic coverage.
- Number of monitors used (before and after quality control).
- Data completeness criteria applied and calibration approach.
- Statistical methods for handling spatial and temporal correlation.

**Citation and acknowledgment:**

Suggested citation format:
> AirQo. Air Quality Monitoring Data [City/Region], [Year Range]. Accessed via [platform] on [date]. https://airqo.africa

Suggested acknowledgment text:
> We acknowledge AirQo (Makerere University) for providing access to air quality monitoring data used in this study.

Please share copies of published papers, technical reports, dissertations, and conference presentations with AirQo at [support@airqo.net](mailto:support@airqo.net). This helps us track research impact and demonstrate the value of open data to our funders and partners.

---

## 12. WHO Air Quality Guidelines Reference

| Pollutant | Averaging Period | WHO 2021 Guideline Level |
|-----------|-----------------|--------------------------|
| PM2.5 | Annual Mean | 5 μg/m³ |
| PM2.5 | 24-hour Mean | 15 μg/m³ |
| PM10 | Annual Mean | 15 μg/m³ |
| PM10 | 24-hour Mean | 45 μg/m³ |

Most African cities substantially exceed WHO guidelines, with annual PM2.5 often 5–10 times the guideline level. WHO also provides interim targets (IT1–IT4) for countries working progressively toward guideline levels. Evidence shows health effects occur at concentrations below these guidelines, with no apparent safe threshold.

---

## 13. Frequently Asked Questions

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

### Data Access Questions

**I need data urgently for a deadline.**
Data is immediately available through the Analytics Platform and API. For large custom requests, plan ahead and allow additional time.

**My download failed or seems incomplete.**
Contact [support@airqo.net](mailto:support@airqo.net) with the time and date of your download attempt, monitors and date range requested, platform used, and any error messages.

**Can I share AirQo data with collaborators?**
Yes, data is open access. However, we encourage collaborators to access data directly from AirQo platforms to ensure they have the most up-to-date versions.

**Why is my download limited to three months?**
This is an intentional, permanent system design to ensure equitable access for all users. Please download data in quarterly batches. See the [Fair Usage Policy](./fair-usage-policy.md) for full guidance.

---

## 14. Research Collaboration Opportunities

AirQo welcomes research collaborations that advance air quality science and public health in Africa. We are particularly interested in: epidemiological studies linking air quality to health outcomes, exposure assessment, source apportionment, policy evaluation, air quality forecasting, sensor validation, machine learning applications, and environmental justice research.

We support graduate students with thesis and dissertation projects, independent research, and internship opportunities at AirQo.

:::tip Get involved
Contact [support@airqo.net](mailto:support@airqo.net) to discuss collaboration opportunities, including co-authorship, joint grant applications, shared conference presentations, and policy briefs.
:::

---

## 15. Support and Contact Information

| | |
|---|---|
| **Primary Contact** | [support@airqo.net](mailto:support@airqo.net) |
| **Website** | https://airqo.africa |
| **Analytics Platform** | https://airqo.africa/products/analytics |
| **API Documentation** | [AirQo API →](../api/intro.md) |
| **Network Coverage** | https://airqo.net/solutions/network-coverage |
| **Response Time** | 3–5 business days (mark urgent requests in subject line) |

---

## 16. Additional Resources

- **Research Repository** — AirQo maintains a repository of peer-reviewed publications using our data. Visit https://airqo.africa or request a bibliography from [support@airqo.net](mailto:support@airqo.net).
- **Educational Materials** — Resources on air quality fundamentals, health effects, data visualisation techniques, and policy frameworks.
- **Training and Capacity Building** — AirQo occasionally offers data analysis workshops, air quality monitoring training, and student mentorship programmes.
- **Fair Usage Policy** — For full guidance on batch downloads, API rate limits, and equitable access principles, see the [AirQo Data Access Fair Usage Policy](./fair-usage-policy.md).

---

## 17. Terms of Use

### Data Use Agreement

By accessing and using AirQo data, you agree to: use data responsibly and ethically; not misrepresent data, findings, or AirQo's work; cite AirQo appropriately in all publications; apply appropriate quality control and analytical methods; document data processing and analytical decisions; and share research outputs with AirQo when possible.

### Prohibited Uses

Data may not be used for: commercial purposes without explicit agreement; misleading or fraudulent claims; purposes that harm individuals or communities; or activities that misrepresent air quality conditions.

### Liability

AirQo strives to provide accurate, high-quality data but cannot guarantee error-free data. Researchers are responsible for appropriate interpretation and use. AirQo is not liable for decisions or actions taken based on data use.

---

## Appendix: Quick Reference Checklist for Researchers

### Before Starting Your Research

- [ ] Review AirQo calibration methodology paper.
- [ ] Identify monitors in your study area using the Analytics Platform map.
- [ ] Check data availability for your study period.
- [ ] Plan your download batches (quarterly recommended for multi-year studies).
- [ ] Determine appropriate data access method (Analytics Platform vs. API).
- [ ] Register for API access if needed.
- [ ] Review WHO guidelines for your pollutants of interest.

### During Data Download and Processing

- [ ] Download calibrated (not raw) data.
- [ ] Download in quarterly batches and save each file before proceeding.
- [ ] Document all monitors included in analysis.
- [ ] Calculate data completeness for each monitor.
- [ ] Apply 50% completeness threshold (or justify alternative).
- [ ] Remove obvious anomalies with documentation.
- [ ] Create a metadata file with monitor characteristics.

### During Analysis

- [ ] Account for spatial correlation between monitors.
- [ ] Consider temporal autocorrelation in time-series.
- [ ] Stratify analysis geographically where appropriate.
- [ ] Calculate and report uncertainty estimates.
- [ ] Compare findings with WHO guidelines.
- [ ] Validate results against published literature.

### When Writing and Publishing

- [ ] Include detailed methods section on data access and quality control.
- [ ] Cite AirQo as data source with access date.
- [ ] Acknowledge AirQo in the acknowledgments section.
- [ ] Report data completeness statistics.
- [ ] Discuss limitations related to monitor coverage.
- [ ] Include a data availability statement.
- [ ] Share preprint/publication with AirQo at [support@airqo.net](mailto:support@airqo.net).

### After Publication

- [ ] Send final publication to [support@airqo.net](mailto:support@airqo.net).
- [ ] Consider sharing processed datasets (with documentation).
- [ ] Engage with AirQo for dissemination and collaboration opportunities.

---

*This document is prepared by AirQo, Makerere University. For the latest information: https://airqo.africa | Contact: [support@airqo.net](mailto:support@airqo.net)*
