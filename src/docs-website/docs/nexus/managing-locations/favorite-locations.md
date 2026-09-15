---
sidebar_position: 1
sidebar_label: "Favorite Locations (Deprecated)"
---

# Favorite Locations

:::warning Deprecated feature
The Favorite Locations ("My Favorites") feature is **no longer available** in the current AirQo Nexus app. The Quick Access cards for favorites have been removed and the dashboard is now the home page. This page is kept for reference only and may be removed in a future release.

- To explore locations, trends, and forecasts, use [Air Quality Analysis](../monitoring-air-quality/air-quality-analysis.md).
- To download data, use [Export Air Quality Data](../exporting-data/data-export.md).

**Everything below is historical reference only — the instructions no longer work in the current app. Do not follow them.**
:::

The Favorites feature let you follow up to four monitoring sites so they appeared on your dashboard every time you logged in. In the Individual workflow, this page was called **My Favorites**; in the Organization workflow, the same view was called **Dashboard**.

---

## Accessing Favorites (Historical)

| Workflow         | Sidebar Item     | Web Address                                        |
| ---------------- | ---------------- | -------------------------------------------------- |
| **Individual**   | **My Favorites** | `https://nexus.airqo.net/user/favorites`           |
| **Organization** | **Dashboard**    | `https://nexus.airqo.net/org/<your-org>/dashboard` |

You can also reach the Individual Favorites page from the [Home page](https://nexus.airqo.net/user/home) by selecting **My Favorites** or **Start here**.

---

## Adding Favorite Locations (Historical)

1. Open the **My Favorites** page (Individual) or **Dashboard** page (Organization).
2. Select **Manage Favorites**. The Add Favorites dialog opens.
3. Use the search field or browse the **Sites** table to find monitoring locations.
4. Select the checkboxes next to the sites you want to follow.
5. The sidebar shows your selected favorites and the count (for example, "Selected Favorites (2/4)").
6. Select **Save Favorites**.

:::caution Maximum of 4 favorites
You can save up to four favorite locations at a time. If you select more than four, the dialog shows an error and the **Save Favorites** button is disabled until you deselect the extra locations.
:::

---

## Managing Favorite Locations (Historical)

### Remove a Favorite

In the Add Favorites dialog, find the site in the **Selected Favorites** sidebar and select the **×** next to it. Then select **Save Favorites**.

### Clear All Favorites

In the Add Favorites dialog, select **Clear** to remove all selected locations. Then select **Save Favorites**.

### Refresh the Site List

Select the **Refresh** button in the dialog header to reload the available sites and your current preferences.

---

## Sites Table (Historical)

The Add Favorites dialog lists sites with the following columns:

| Column       | Description                                   |
| ------------ | --------------------------------------------- |
| **Location** | The site location name                        |
| **City**     | The city where the site is located            |
| **Country**  | The country where the site is located         |
| **Owner**    | The organization or entity that owns the site |

Use the column headers to sort, and use the pagination controls at the bottom to browse more sites.

---

## Viewing Favorite Data (Historical)

Once favorites are saved, the dashboard displays:

- **Quick Access cards** — one tile per favorite showing the current reading and air quality icon
- **Air Pollution Trends Over Time** — a line chart comparing your favorites
- **Air Pollution Levels Distribution** — a bar chart showing level distribution across your favorites

Select any location card or chart's **More Insights** option to explore the site in more detail.

---

## Tips (Historical)

- **Updating favorites:** You can change your favorite locations at any time by opening **Manage Favorites** again.
- **Exporting data:** If you need data for more than four locations, use the [Export Air Quality Data](../exporting-data/data-export.md) feature to select a broader range of sites, devices, cities, or countries.
- **Profile settings:** Manage your account preferences and security settings on the **Profile** page.

---

## Related Guides

- [Air Quality Analysis](../monitoring-air-quality/air-quality-analysis.md) — analyze trends and compare locations
- [Nexus Dashboard](../monitoring-air-quality/nexus-dashboard.md)
- [Air Quality Levels](../monitoring-air-quality/air-quality-levels.md)
- [Interactive Map](../monitoring-air-quality/interactive-map.md)
- [Export Air Quality Data](../exporting-data/data-export.md)
