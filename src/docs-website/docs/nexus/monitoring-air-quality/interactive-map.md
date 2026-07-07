---
sidebar_position: 3
sidebar_label: Interactive Map
---

# Interactive Map

The Interactive Map lets you explore air quality readings from monitoring sites across Africa. You can search for locations, filter by country, switch pollutants, change the marker style, and inspect detailed site information.

---

## Accessing the Map

1. Log in to [AirQo Nexus](https://analytics.airqo.net).
2. Select **Map** in the sidebar.
3. Direct links:
   - **Individual workflow:** `https://analytics.airqo.net/user/map`
   - **Organization workflow:** `https://analytics.airqo.net/org/<your-org>/map`

---

## Map Layout

The map has two main areas:

- **Map canvas** — on the right on desktop, on the top on mobile — displays monitoring sites as interactive markers.
- **Sidebar** — on the left on desktop, on the bottom on mobile — contains search, country filter, location list, and site details.

On desktop, the sidebar and map share the screen height. On mobile, the map takes the top 40% of the screen and the sidebar takes the bottom 60%.

---

## Map Markers

Monitoring sites appear as markers on the map. When many sites are close together, they are grouped into a cluster that shows the number of sites inside.

### Marker Styles

You can change how individual sites are displayed using **Map Settings**:

| Style | Appearance |
|-------|------------|
| **Emoji** | An icon that reflects the current air quality level (default) |
| **Node** | A solid colored circle |
| **Number** | A colored circle showing the current pollutant value |

:::note
The **Heatmap** option appears in Map Settings but is currently disabled.
:::

### Air Quality Levels

Markers are colored and iconized based on the latest reading. See [Air Quality Levels](./air-quality-levels.md) for the full color scale and ranges.

Hover over a marker to see a tooltip with the site name and current reading. Select a marker to open its details in the sidebar.

---

## Map Controls

Controls are floating buttons on the map canvas:

| Control | What It Does |
|---------|--------------|
| **Map styles** | Open the Map Settings dialog to change the base map and marker style |
| **Copy map link** | Copy the current map URL to your clipboard |
| **Refresh map** | Reload the latest air quality readings |
| **Reset to default view** | Return the map to its initial position and zoom |
| **Find my location** | Center the map on your current geographic location |
| **Zoom in / Zoom out** | Adjust the map zoom level |

---

## Map Settings

Select the **Map styles** button to open **Map Settings**. From there you can choose:

### Map Type (Base Map)

| Style | Description |
|-------|-------------|
| **Streets** | Default road and place names map |
| **Satellite** | Aerial imagery |
| **Light** | Minimal light-colored map |
| **Dark** | Minimal dark-colored map |

### Map Details (Marker Style)

| Style | Description |
|-------|-------------|
| **Emoji** | Air quality icon markers |
| **Node** | Solid colored circles |
| **Number** | Circles showing the pollutant value |

Select **Apply** to update the map.

---

## Sidebar: Searching and Browsing Sites

### Search

Use the search field at the top of the sidebar to find villages, cities, or countries. Matching locations appear in the list below.

### Country Filter

Below the search field, a country list lets you filter sites by country. Select a country to show only its monitoring sites. Select it again to clear the filter.

### Location List

The main area of the sidebar lists available monitoring sites. Select any site to:

- Fly the map to that location
- Open the **Location Details** panel in the sidebar
- View current readings, forecast, health tips, and historical insights

---

## Site Details Panel

When you select a site, the sidebar switches to the details panel. It contains:

### Air Quality Forecast

A scrollable forecast card with two tabs:

- **Daily** — shows the next 7 days, with day, date, air quality icon, PM₂.₅ value, and confidence percentage.
- **Hourly** — shows the next 24 hours, with hour, icon, PM₂.₅ value, temperature, humidity, and confidence percentage.

Hover over any forecast pill for more details, including the air quality category, PM₂.₅ range, temperature, humidity, and trend message.

### Current Air Quality

A card showing:

- The selected pollutant and current value in µg/m³
- The air quality icon and category
- The location name

Select **Show more** to expand additional details:

- **Site name** — the formal name of the monitoring site
- **Source / Monitor** — the data provider and monitor identifier
- **Category / Deployment** — device category and deployment type
- **Pollutant** — current reading for the selected pollutant
- **Date / Time** — timestamp in GMT+3
- **City / Country** — geographic location of the monitor

### Health Alerts

A collapsible card with health tips related to the current air quality level. If the platform provides specific health tips for the site, they are listed here; otherwise a generic guidance message is shown.

### More Insights

A collapsible card with a small historical chart for the site. Select it to expand and view recent trends.

Select the **×** button at the top of the panel to return to the location list.

---

## Switching Pollutants

A dropdown at the top of the map lets you switch between:

- **PM₂.₅** — fine particulate matter (default)
- **PM₁₀** — coarse particulate matter

All markers, tooltips, and the details panel update immediately when you change the pollutant.

---

## Map Legend

A collapsible legend sits in the bottom-left corner of the map. Select it to expand and see the air quality categories represented by the marker icons. Hover over each icon to see the pollutant range for that category. For the full scale, see [Air Quality Levels](./air-quality-levels.md).

---

## Sharing the Map

Select the **Copy map link** button to copy the current map URL, including your position and selected pollutant, so you can share it with others.

---

## Organization Workflow Differences

In the Organization workflow, the map shows only the sites belonging to the organization's cohort. If the organization's data is set to private, a banner explains that map data is unavailable and points administrators to AirQo Vertex to change visibility.

If the organization's cohort has no deployed devices yet, an empty-state banner informs you that no data is available.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Map does not load | Check that your internet connection is working and that the map service is reachable. |
| No markers appear | Try zooming out, clearing the country filter, or checking that data visibility is public. |
| Organization map is blank | The organization data may be private or the cohort may have no deployed devices. |
| Forecast is unavailable | Forecasts require sufficient historical data for the selected site. Try another site. |
| "Unable to load cohort" | The organization address may be invalid or you may not have access. Retry or contact your administrator. |

---

## Related Guides

- [Air Quality Levels](./air-quality-levels.md)
- [Analytics Dashboard](./analytics-dashboard.md)
- [Favorite Locations](../managing-locations/favorite-locations.md)
