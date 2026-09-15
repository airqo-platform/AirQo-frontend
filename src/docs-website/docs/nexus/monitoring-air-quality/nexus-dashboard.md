---
sidebar_position: 2
sidebar_label: AirQo Nexus Dashboard
---

# AirQo Nexus Dashboard

The AirQo Nexus Dashboard is the home page you see after logging in. It shows air quality trends and readings for your configured locations, scoped to your personal or organization workspace. In the **Individual** workflow this is the **Home** page; in the **Organization** workflow it is the **Dashboard** page.

---

## Where to Find the Dashboard

| Workflow         | Sidebar Item  | Web Address                                        |
| ---------------- | ------------- | -------------------------------------------------- |
| **Individual**   | **Home**      | `https://nexus.airqo.net/user/home`                |
| **Organization** | **Dashboard** | `https://nexus.airqo.net/org/<your-org>/dashboard` |

After logging in, you land directly on the dashboard.

---

## Dashboard Components

### Location Cards

At the top of the dashboard, a **Quick Access** card shows one tile for each selected location. Each tile displays:

- The latest **PM₂.₅** or **PM₁₀** value for the selected pollutant
- An **air quality icon** based on the current reading
- The **site name** and location
- The **selected pollutant** at the top of the card

:::tip
Select any location tile to open the **More Insights** view for that site.
:::

### Trend Charts

Below the location cards, the dashboard shows two charts side by side on large screens:

| Chart                                 | What It Shows                                                                              |
| ------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Air Pollution Trends Over Time**    | A line chart of pollutant levels across your selected locations over the chosen date range |
| **Air Pollution Levels Distribution** | A bar chart showing the distribution of pollutant levels across your selected locations    |

Each chart lets you:

- **Refresh** the data
- **Download** the chart as PNG or PDF
- Open **More Insights** for deeper exploration

### Filter Bar

Above the charts you can change:

- **Pollutant** — switch between PM₂.₅ and PM₁₀
- **Date range** — choose the start and end dates
- **Frequency** — set the aggregation level for the time series

## Empty Dashboard States

### Individual Workflow

If no locations are configured yet, the dashboard shows an empty state prompting you to add locations.

### Organization Workflow

If your organization has no deployed devices, or if your organization's data visibility is set to private, the dashboard shows a message explaining that data is unavailable. Organization administrators can manage device visibility in AirQo Vertex.

---

## Reading Air Quality Levels

The dashboard uses AirQo's air quality categories to make readings easy to interpret. See [Air Quality Levels](./air-quality-levels.md) for the full color scale and ranges.

---

## Organization Dashboard

In the Organization workflow, the Dashboard shows the same AirQo Nexus view but scoped to the organization's sites:

- Summary cards for the organization's selected monitoring sites
- Trend and distribution charts for organization locations
- Quick access to export and visualization tools scoped to the organization

:::caution Private organization data
If your organization's information is set to private, recent readings will not appear on the dashboard. An administrator must make the data public in AirQo Vertex.
:::

---

## Troubleshooting

| Issue                                       | Solution                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Dashboard shows an empty state              | No locations are configured yet for your workspace.                                         |
| Cards show "--" instead of a value          | The selected site may not have recent readings, or your organization's data may be private. |
| Chart values look unexpected                | Check that the correct pollutant and date range are selected.                               |
| Dashboard is empty in organization workflow | Ensure the organization has deployed devices and that data visibility is public.            |

---

## Related Guides

- [Air Quality Levels](./air-quality-levels.md)
- [Air Quality Analysis](./air-quality-analysis.md) — analyze trends and compare locations
- [Interactive Map](./interactive-map.md)
- [Export Air Quality Data](../exporting-data/data-export.md)
