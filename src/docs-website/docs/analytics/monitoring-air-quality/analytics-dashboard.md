---
sidebar_position: 2
sidebar_label: Analytics Dashboard
---

# Analytics Dashboard

The Analytics Dashboard shows air quality trends and readings for the locations you follow. In the **Individual** workflow the dashboard is on the **My Favorites** page; in the **Organization** workflow it is on the **Dashboard** page. Both pages show the same analytics view, scoped to your personal or organization workspace.

---

## Where to Find the Dashboard

| Workflow | Sidebar Item | Web Address |
|----------|--------------|-------------|
| **Individual** | **My Favorites** | `https://analytics.airqo.net/user/favorites` |
| **Organization** | **Dashboard** | `https://analytics.airqo.net/org/<your-org>/dashboard` |

After logging in, you land on the [Home page](https://analytics.airqo.net/user/home), which is a welcome screen with quick-action buttons. Select **My Favorites** or **Start here** to open the dashboard.

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

| Chart | What It Shows |
|-------|---------------|
| **Air Pollution Trends Over Time** | A line chart of pollutant levels across your selected locations over the chosen date range |
| **Air Pollution Levels Distribution** | A bar chart showing the distribution of pollutant levels across your selected locations |

Each chart lets you:

- **Refresh** the data
- **Download** the chart as PNG or PDF
- Open **More Insights** for deeper exploration

### Filter Bar

Above the charts you can change:

- **Pollutant** — switch between PM₂.₅ and PM₁₀
- **Date range** — choose the start and end dates
- **Frequency** — set the aggregation level for the time series

### Manage Favorites

Select **Manage Favorites** to open the **Add Favorites** dialog, where you can search for sites and select up to four locations to display on the dashboard.

---

## Empty Dashboard States

### Individual Workflow

If you have not selected any favorite locations yet, the dashboard shows an empty state with an **Add favorite** button. Select it to open the Add Favorites dialog and choose up to four sites.

### Organization Workflow

If your organization has no deployed devices, or if your organization's data visibility is set to private, the dashboard shows a message explaining that data is unavailable. Organization administrators can manage device visibility in AirQo Vertex.

---

## Reading Air Quality Levels

The dashboard uses AirQo's air quality categories to make readings easy to interpret. See [Air Quality Levels](./air-quality-levels.md) for the full color scale and ranges.

---

## Adding or Changing Favorite Locations

1. On the dashboard, select **Manage Favorites**.
2. In the Add Favorites dialog, search or browse the list of monitoring sites.
3. Select the checkboxes next to the sites you want to follow.
4. The sidebar shows your selected favorites (maximum 4).
5. Select **Save Favorites**.

For detailed instructions, see [Favorite Locations](../managing-locations/favorite-locations.md).

---

## Organization Dashboard

In the Organization workflow, the Dashboard shows the same analytics view but scoped to the organization's sites:

- Summary cards for the organization's selected monitoring sites
- Trend and distribution charts for organization locations
- Quick access to export and visualisation tools scoped to the organization

:::caution Private organization data
If your organization's information is set to private, recent readings will not appear on the dashboard. An administrator must make the data public in AirQo Vertex.
:::

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Dashboard shows "No favorite locations yet" | Add up to four favorite locations using **Manage Favorites**. |
| Cards show "--" instead of a value | The selected site may not have recent readings, or your organization's data may be private. |
| Chart values look unexpected | Check that the correct pollutant and date range are selected. |
| Dashboard is empty in organization workflow | Ensure the organization has deployed devices and that data visibility is public. |

---

## Related Guides

- [Air Quality Levels](./air-quality-levels.md)
- [Favorite Locations](../managing-locations/favorite-locations.md)
- [Interactive Map](./interactive-map.md)
- [Export Air Quality Data](../exporting-data/data-export.md)
