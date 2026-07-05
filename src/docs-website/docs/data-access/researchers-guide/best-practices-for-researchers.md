---
sidebar_position: 12
sidebar_label: 11. Best Practices for Researchers
---

# 11. Best Practices for Researchers

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
