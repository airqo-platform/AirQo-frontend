---
sidebar_position: 10
sidebar_label: 9. Data Quality & Accuracy
---

# 9. Data Quality and Accuracy

### Accuracy of AirQo Monitors

- Periodic calibration against reference-grade monitors (BAM, TEOM, FEM).
- Localised calibration models for individual cities.
- Automated filtering of invalid readings before data is published (see [Data Filtering Rules](#data-filtering-rules)).
- **Performance**: Strong correlation with reference monitors (R² typically >0.8); meets research-grade data quality standards for epidemiological studies.

### Timestamps and Averaging

- **Timezone** — All timestamps are in UTC. Exported timestamps end in `Z`.
- **Hourly values** — Each hourly value is labelled with the **start** of its averaging hour. A record stamped 10:00 is the mean of readings taken from 10:00:00 up to, but not including, 11:00:00 UTC.
- **Averaging method** — An hourly value is the arithmetic mean of all valid readings in that hour. No minimum number of readings is required, so an hour with few readings still produces a value.
- **Daily values** — Daily values follow the same start-of-interval convention, on UTC days.

**Worked example: converting to local time**

| | Hourly record stamped 10:00 UTC | Daily record stamped 15 March (UTC) |
|---|---|---|
| **Covers (UTC)** | 10:00 up to, but not including, 11:00 | 00:00 on 15 March up to, but not including, 00:00 on 16 March |
| **Lagos (UTC+1)** | 11:00 up to, but not including, 12:00 | 01:00 on 15 March up to, but not including, 01:00 on 16 March |
| **Kampala (UTC+3)** | 13:00 up to, but not including, 14:00 | 03:00 on 15 March up to, but not including, 03:00 on 16 March |

:::info Comparing cities
Data is not converted to local time on export. If you are comparing cities, or analysing patterns by local hour or local day, convert from UTC yourself.
:::

### Data Filtering Rules

The following rules are applied before data is published:

| Rule | What is checked | Outcome |
|------|-----------------|---------|
| **Valid range** | PM2.5 and PM10 values must be between 0 and 1000 μg/m³ inclusive. The check applies to each of the monitor's two particulate sensors and to the calibrated values. | Values outside the range are removed |
| **No particulate reading** | Records with no particulate reading from either sensor. | Record discarded |
| **Duplicates** | Records with the same monitor and the same timestamp. | First record kept; the others discarded |
| **Unassigned monitors** | Records from monitors not assigned to a deployment site. | Record discarded |

:::warning What is not done
- There is **no rejection rule based on disagreement between the two sensors**. The difference between them is used as an input to calibration instead.
- There is **no minimum data-completeness threshold** for hourly or daily means.
:::

We recommend that you apply your own completeness criteria (for example, a minimum share of valid hours per day) and report them in your methods.

### Data Quality Flags

- **No per-observation flag** — There is no quality flag on individual observations. Readings that fail the [filtering rules](#data-filtering-rules) are removed, so they appear as missing values or gaps in the time series, not as flagged rows.
- **AQCSV exports** — AQCSV exports include `qc` and `data_status` columns. These describe the export type, not individual readings:

| Column | Value | Meaning |
|--------|-------|---------|
| `qc` | 2 | Averaged (hourly/daily) data |
| `qc` | 4 | Raw data |
| `data_status` | 1 | Calibrated values |
| `data_status` | 0 | Raw values |

Treat gaps as missing data, and do not interpolate without stating so.

### Measurement Parameters

Currently available: **PM2.5** (Particulate Matter ≤2.5 μm) and **PM10** (Particulate Matter ≤10 μm). These are the most health-relevant pollutants in African cities, associated with cardiovascular disease, respiratory illness, premature mortality, adverse birth outcomes, and cognitive impacts.

Gaseous parameters (NO₂, O₃, CO, SO₂, TVOC) are not currently available, and data download offers PM2.5 and PM10 only. AirQo is actively developing expanded capabilities to include gaseous parameters. Contact us for updates on parameter availability.

### Limitations and Appropriate Use

**AirQo monitors are designed for:** ambient outdoor air quality monitoring, spatial mapping of urban pollution, long-term trend analysis, exposure assessment, policy evaluation, and public health investigations.

**AirQo monitors are not designed for:** stack emission measurements, indoor air quality as a primary use case, extremely high concentration environments, or real-time personal wearable exposure monitoring.

:::info Meteorological data
AirQo monitors include temperature and humidity sensors for calibration purposes only. Meteorological data is not provided through our platforms. For weather data, use national meteorological agencies, reanalysis datasets (ERA5, MERRA-2), or weather station networks.
:::
