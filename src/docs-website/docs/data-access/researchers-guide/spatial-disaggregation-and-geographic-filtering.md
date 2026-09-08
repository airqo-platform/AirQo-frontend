---
sidebar_position: 4
sidebar_label: 3. Spatial Disaggregation & Filtering
---

# 3. Spatial Disaggregation and Geographic Filtering

:::info Looking for location approximation?
Coordinate approximation now has its own page: [4. Location Approximation](./location-approximation.md).
:::

### 3.1 Selecting Monitors by Geographic Area

AirQo provides three methods for spatial data selection:

- **Method 1 – AirQo Nexus (Bulk Export)**: Select specific cities or regions, choose individual monitoring sites, define custom date ranges, and export in CSV format.
- **Method 2 – Grid API**: Query data by geographic coordinates or administrative boundaries (districts, divisions, parishes). See the [AirQo API documentation](../../api/intro.md).
- **Method 3 – Manual Monitor Selection**: Use the AirQo Nexus interactive map to identify and select individual monitors within your study region.

### 3.2 Geographic Coverage

Visit our [network coverage page](https://airqo.net/solutions/network-coverage) for monitor locations, or contact [support@airqo.net](mailto:support@airqo.net) for specific coverage in your study area.

### 3.3 Finding the Nearest Monitor to a Specific Location

Not every neighbourhood, village, or landmark has a monitor named after it — AirQo Nexus lists monitoring **sites**, not every administrative area. If the specific place you're interested in doesn't appear in the site list, the fastest way to find a usable proxy site is by proximity rather than by name:

- **AirQo Mobile App — "Near You"**: Install the [AirQo Mobile App](https://airqo.net/explore-data/mobile-app), enable location access, and open the **Near You** tab on the Dashboard (also available as a "Nearby" filter on the Map tab). It uses your phone's GPS to list the closest active monitoring sites within 10 km, nearest first. This is the quickest way for anyone — researchers included — to identify a proxy site for a location that isn't directly listed.
- **Programmatically via the API**: Call the [Find the nearest sites to a coordinate](../../api/reference/metadata.md#find-the-nearest-sites-to-a-coordinate) endpoint with a `latitude`/`longitude`/`radius` to get back the nearest sites sorted by distance — useful for scripting a batch of locations rather than looking them up one at a time in the app.
- **Manually via the Nexus map**: On the [AirQo Nexus](https://nexus.airqo.net/) interactive map, zoom in on your area of interest and visually identify the closest available site(s), keeping in mind the [~0.5 km coordinate approximation](./location-approximation.md) applied to all displayed locations.
- **Ask AirQo support**: If you'd like AirQo to confirm the most appropriate proxy site for a specific location (e.g. for a paper or report), contact [support@airqo.net](mailto:support@airqo.net) with the location name or coordinates.
