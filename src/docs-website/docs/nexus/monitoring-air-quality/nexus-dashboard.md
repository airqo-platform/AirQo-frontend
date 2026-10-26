---
sidebar_position: 2
sidebar_label: AirQo Nexus Dashboard
---

# AirQo Nexus Dashboard

Nexus has two starting pages: **Home** for an individual workspace and **Dashboard** for an organization workspace. They serve different purposes and should not be treated as the same report.

## Where to find each page

| Workspace | Page | URL |
| --- | --- | --- |
| Individual | Home | `https://nexus.airqo.net/user/home` |
| Organization | Dashboard | `https://nexus.airqo.net/org/<your-org>/dashboard` |

After you sign in, Nexus opens the page for your current workspace.

## Individual Home

Home is an adaptive starting point that changes based on your saved work:

- **Continue your work** reopens a saved chart or comparison when one is available.
- **Ask AirQo** opens the beta assistant when enabled.
- **Jump right in** links to Compare places, Analyze trends, Explore a location, Visualize my data, Export data, and Compare cities and countries.
- **Updates from your places** shows recent readings from the locations in your saved comparison. If you have not saved locations yet, select **Compare places** to start.
- **Watch overview**, **Data access**, and **Request an organization** are available at the bottom of the page.

Home is a launchpad. Use [Air Quality Analysis](./air-quality-analysis.md) for saved charts and comparisons, and the [Interactive Map](./interactive-map.md) for site-level details.

:::note
Home may show fewer sections when you have no saved work or when an optional feature, such as Ask AirQo, is disabled for the current environment.
:::

## Organization Dashboard

The organization Dashboard is a cohort-level air-quality report. It includes:

- A cohort selector when the organization has more than one cohort.
- A date range for a single period of up to 31 days.
- A PM2.5 or PM10 selector and a **Refresh** action.
- Summary cards for average PM2.5, average PM10, active days, and devices represented.
- A daily trend, a typical-day profile, a site comparison table, and an air-quality scale.

The report uses calibrated daily values for the selected cohort and period. If no cohort is assigned, Nexus asks an administrator to assign devices to a cohort. If the selected period has no readings, choose another period or cohort.

## Reading air-quality categories

Home cards, reports, map markers, and detail views use air-quality categories to make readings easier to scan. The thresholds are provided by Nexus and may be updated centrally. See [Air Quality Levels](./air-quality-levels.md) for how to interpret the labels and colors.

## Troubleshooting

| Issue | What to do |
| --- | --- |
| Home has no updates | Save a comparison in Air Quality Analysis; Home uses those saved locations for updates. |
| Organization report has no cohort | Ask an organization administrator to assign devices to a cohort. |
| Organization report has no readings | Choose a different date range or cohort. |
| Report values look unexpected | Check the pollutant, selected cohort, and report period. |

## Related guides

- [Air Quality Levels](./air-quality-levels.md)
- [Air Quality Analysis](./air-quality-analysis.md)
- [Interactive Map](./interactive-map.md)
- [Export Air Quality Data](../exporting-data/data-export.md)
