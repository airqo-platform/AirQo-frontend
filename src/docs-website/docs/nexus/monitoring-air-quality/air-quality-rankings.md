---
sidebar_position: 5
sidebar_label: Air Quality Rankings
description: How AirQo Nexus ranks African countries and cities by PM2.5, including the data used, the calculation steps, and how to interpret the results.
---

# Air Quality Rankings

The Air Quality Rankings page compares African countries and cities by their fine particulate matter (PM₂.₅) levels. This guide explains how to use the page and, in detail, [how the rankings are calculated](#methodology).

---

## Accessing the Page

1. Log in to [AirQo Nexus](https://nexus.airqo.net/).
2. Select the menu button at the top-left of the header to open the global sidebar.
3. Select **Air Quality Rankings**.
4. Direct link: `https://nexus.airqo.net/user/air-quality/rankings`

Organization members open the organization version of the same page from the same menu.

---

## What the Page Shows

![Air Quality Rankings page showing the Live rankings and Historical comparison tabs, the air quality legend, and the Country, City, sort order, and Top 20 controls](/img/nexus/rankings-overview.png)

The page has two tabs:

| Tab | What it answers | Based on |
| --- | --- | --- |
| **Live rankings** | Where is the air cleanest or most polluted right now? | The most recent reading from each monitoring site |
| **Historical comparison** | How have locations compared year by year? | All readings recorded during each calendar year |

The air quality legend at the top of the page applies to both tabs. See [Air Quality Levels](./air-quality-levels.md) for the full scale.

### Live Rankings

Use the controls above the table to change the view:

- **Country / City** — rank whole countries, or rank individual cities.
- **Cleanest first / Most polluted first** — choose the direction of the ranking. Cleanest first is the default.
- **Top 10 / 20 / 50 / 100** — choose how many locations to list.
- **Country filter** — when ranking cities, limit the list to one country.

Summary cards highlight the **Cleanest air** and **Most polluted** locations for the current selection. The table lists each location with:

| Column | Meaning |
| --- | --- |
| **Rank** | Position in the list for the selected direction |
| **Location** | The country or city being ranked |
| **PM2.5** | Average PM₂.₅ concentration in µg/m³ |
| **AQI** | Air Quality Index value (0–500) calculated from the average PM₂.₅ |
| **Category** | The air quality level for the average PM₂.₅ |
| **Sites** | Number of monitoring sites that contributed to the average |

### Historical Comparison

Choose **Country** or **City**, then a **Start year** and **End year** (up to five years at a time). When comparing cities you can also filter by country.

- The **PM2.5 trends by year** chart plots the annual average for up to ten locations.
- The **Year-by-year comparison** table lists each location with its annual average for each selected year.

A dash (—) means there is no data for that location in that year. It does not mean the air was clean.

---

## How Rankings Are Calculated {#methodology}

Rankings are based on a single pollutant, **PM₂.₅**, measured in micrograms per cubic metre (µg/m³). A lower PM₂.₅ average means cleaner air and a better position in the ranking.

### Live Rankings {#live-methodology}

Each time the live rankings are loaded, they are calculated as follows.

**1. Select eligible monitoring sites**

A monitoring site is included when:

- it is located in an African country, and
- it has reported a valid PM₂.₅ reading within the **last 3 days**.

Sites that have not reported in the last 3 days are left out, so that offline monitors do not influence the current picture.

**2. Take the latest reading from each site**

Only the single most recent PM₂.₅ reading from each eligible site is used. These are the same readings shown on the Nexus dashboard and map, and they are refreshed hourly.

**3. Group sites by location**

Sites are grouped by the country or city recorded for the site, depending on the level you selected. Differences in capitalization or spacing in a place name are ignored, so one city is never split into two entries. Cities with the same name in different countries are ranked separately.

**4. Average the readings**

The PM₂.₅ value for a location is the arithmetic mean of the latest readings from its sites:

```
Location PM2.5 = (sum of the latest PM2.5 reading from each site) ÷ (number of sites)
```

Every site carries equal weight. The result is rounded to two decimal places, and the number of sites used is shown in the **Sites** column.

**5. Order and rank**

Locations are sorted by their average PM₂.₅:

- **Cleanest first** — lowest average first.
- **Most polluted first** — highest average first.

Rank 1 is the first location in the chosen direction. If two locations have exactly the same average, they are ordered alphabetically.

**6. Assign the AQI and category**

The **AQI** value is calculated from the location's average PM₂.₅ using the US EPA Air Quality Index formula (2024 PM₂.₅ breakpoints). The **Category** is the air quality level that the average falls into, using the ranges in [Air Quality Levels](./air-quality-levels.md).

#### Worked Example

Suppose a city has three eligible monitoring sites whose latest readings are 12.4, 18.9, and 31.3 µg/m³.

| Step | Result |
| --- | --- |
| Average PM₂.₅ | (12.4 + 18.9 + 31.3) ÷ 3 = **20.87 µg/m³** |
| Category | **Moderate** |
| AQI | **73** |
| Sites | **3** |

The city is then placed in the list according to how 20.87 µg/m³ compares with every other city's average.

### Historical Comparison {#history-methodology}

Annual figures are calculated differently from live rankings, because they summarize a whole year rather than a single moment.

- **Annual average** — for each location and calendar year, all valid PM₂.₅ readings from all of its monitoring sites are added together and divided by the number of readings:

  ```
  Annual PM2.5 = (sum of all PM2.5 readings in the year) ÷ (number of readings in the year)
  ```

  Every reading carries equal weight, so a site that reported for the whole year contributes more than a site that reported for part of it.

- **Sites** — the number of distinct monitoring sites that contributed at least one reading during the year. The table shows the count for the most recent year that has data.
- **Category** — the air quality level for the annual average, using the same ranges as the live rankings.
- **Calendar years** follow Coordinated Universal Time (UTC).
- **The current year** is a year-to-date figure and continues to change until the year ends.

Annual figures are built up day by day from the point at which AirQo began recording them. Years before that point, and years in which a location had no monitoring, appear as a dash rather than a value. For some countries, city-level history begins later than country-level history; the page tells you when this applies to your selection.

### Live Rankings and Historical Comparison Side by Side

| | Live rankings | Historical comparison |
| --- | --- | --- |
| **Time period** | Latest reading per site, from the last 3 days | A full calendar year |
| **Average of** | One reading per site | Every reading in the year |
| **Equal weight given to** | Each site | Each reading |
| **Changes** | Whenever sites report new readings | Daily, for the current year |

---

## Interpreting the Rankings {#interpreting}

The rankings are designed to be simple and transparent. Keep the following in mind when using or sharing them.

- **Rankings describe monitored locations.** A country or city appears only if it has active monitoring sites on the AirQo platform. A place that is missing from the list is unmonitored, not clean.
- **Coverage varies.** Some locations are represented by many sites and others by one or two. A country-level figure reflects the areas where its monitors are, which may not be the whole country. Check the **Sites** column to see how much data is behind each figure.
- **Live rankings are a snapshot.** They reflect the most recent readings, which change with time of day, weather, and season. Positions can shift noticeably within hours. Use the historical comparison for longer-term patterns.
- **Averages are not weighted.** Sites are not weighted by population or by the area they represent, and all site types are included. A location with many monitors near busy roads may rank differently from one whose monitors are in residential areas.
- **Small differences are not meaningful.** Two locations whose averages differ by a fraction of a µg/m³ should be treated as comparable.
- **AQI is indicative.** The US EPA AQI is defined for 24-hour average concentrations. Here it is applied to the ranking average as a familiar reference point.

:::note
The rankings are intended for awareness and comparison. For research, policy analysis, or exposure assessment, work from the underlying measurements and choose an aggregation method suited to your question. See [City-Wide Aggregation Methodology](../../data-access/researchers-guide/city-wide-aggregation-methodology.md) and [Monitor Coverage and Representativeness](../../data-access/researchers-guide/monitor-coverage-and-representativeness.md).
:::

---

## Frequently Asked Questions

**Why is my city or country not listed?**
It either has no monitoring sites on the AirQo platform, or none of its sites has reported a valid PM₂.₅ reading in the last 3 days.

**Why did a location's rank change since I last looked?**
Live rankings are recalculated from the latest readings, which are refreshed hourly. A change in any location's average can move others up or down.

**Why does a location's live figure differ from its annual figure?**
The live figure is an average of the latest reading from each site. The annual figure is an average of every reading in the year.

**Why does a year show a dash?**
There is no recorded data for that location in that year. Missing years are never shown as zero.

**Which pollutants are ranked?**
PM₂.₅ only.

**Which countries are covered?**
Countries in Africa with active monitoring sites on the AirQo platform.

---

## Related Guides

- [Air Quality Levels](./air-quality-levels.md) — the color scale and concentration ranges
- [Interactive Map](./interactive-map.md) — explore individual monitoring sites
- [Air Quality Analysis](./air-quality-analysis.md) — chart trends for specific locations
- [Export Air Quality Data](../exporting-data/data-export.md) — download the underlying measurements
