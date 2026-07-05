---
sidebar_position: 11
sidebar_label: 10. Field Deployment & Calibration
---

# 10. Field Deployment and Calibration Guidance

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
