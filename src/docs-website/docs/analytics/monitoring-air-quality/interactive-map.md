---
sidebar_position: 2
sidebar_label: Interactive Map
---

# Interactive Map

The Interactive Map lets you explore air quality monitoring sites across Africa. You can view individual site readings, toggle heatmap layers, switch pollutants, and inspect site details.

---

## Accessing the Map

1. Log in to AirQo Analytics.
2. Click **Map** in the sidebar.
3. Direct URLs:
   - **Personal workspace:** `analytics.airqo.net/user/map`
   - **Organization workspace:** `analytics.airqo.net/org/<your-org>/map`

---

## Map Features

### Site Markers

Monitoring sites appear as color-coded markers based on the latest air quality reading:

| Color | Air Quality Level |
|-------|-------------------|
| Green | Good |
| Yellow | Moderate |
| Orange | Unhealthy for Sensitive Groups |
| Red | Unhealthy |
| Purple | Very Unhealthy |
| Dark Red | Hazardous |

Click any marker to open a popup with:

- Real-time PM₂.₅ and PM₁₀ readings
- Site name and location
- Recent trend chart
- Weekly air quality forecast
- Option to add the site to your favorites

### Heatmap Layer

Toggle the heatmap to see pollution density across regions instead of individual markers. The heatmap is useful for:

- Identifying pollution hotspots
- Comparing air quality across large areas
- Visualizing regional patterns

Use the layer control to switch between markers and heatmap.

### Pollutant Toggle

Switch between PM₂.₅ and PM₁₀ views:

- **PM₂.₅** — fine particulate matter (≤2.5 micrometers), shown by default
- **PM₁₀** — coarse particulate matter (≤10 micrometers)

The map markers and heatmap update automatically when you change the pollutant.

### Location Search

Use the search bar to find a specific site, city, or region. The map zooms to the selected location and highlights nearby monitors.

### Full-Screen Mode

Click the full-screen button to expand the map to the entire viewport. The sidebar collapses automatically to give you more space.

---

## Site Detail Panel

When you select a site, a detail panel opens with more information:

- **Current readings** — latest PM₂.₅ and PM₁₀ values
- **24-hour trend** — recent measurements over the last day
- **Weekly forecast** — predicted air quality for the coming week
- **Site metadata** — device type, installation date, and location coordinates
- **Add to favorites** — save the site to your Home Dashboard

---

## Saving a Favorite Location from the Map

1. Navigate to the **Map** page.
2. Find a monitoring site by searching or browsing the map.
3. Click the site marker to open its popup.
4. Click the **star icon** or **Add to Favorites** button.
5. The site appears on your Home page and in My Favorites.

You can save up to **four** favorite locations. See [Managing Favorite Locations](../managing-locations/favorite-locations.md) for more details.

---

## Map Legend

The legend shows the color scale used for markers and the heatmap. It updates automatically when you switch between PM₂.₅ and PM₁₀.

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Map not loading | Check your internet connection and ensure Mapbox is accessible. |
| Markers are not visible | Try zooming out or adjusting the pollutant filter. |
| Heatmap appears blank | Heatmap density depends on data availability in the visible area. Pan or zoom to a region with more monitors. |
| Forecast is unavailable | Forecasts are generated for locations with sufficient historical data. Try a different site. |
