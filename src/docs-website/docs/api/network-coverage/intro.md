---
sidebar_position: 1
sidebar_label: Overview
description: A shared, Africa-wide registry of air quality monitors, including community-submitted monitors from any manufacturer or operator — read it to map coverage and gaps, or contribute monitors to it.
---

# Network Coverage API

**Where is air quality being monitored across Africa, by whom, and where are the gaps?** The Network Coverage API answers that question with a single shared registry of air quality monitors across the continent. It can include reference-grade instruments and low-cost sensors from any manufacturer or operator, many of them submitted by the community, whether national ministries, embassies, universities, city authorities or other sensor networks, not only AirQo's own devices. Each monitor is tagged with who runs it and who made it.

The registry works **both ways**. You can read from it to power your own map, report or dashboard, and you can add monitors to it that AirQo doesn't yet know about. Every site built on the registry draws from and adds to the same dataset, so the picture of monitoring across Africa gets more complete each time someone uses it. [airqo.net/solutions/network-coverage](https://airqo.net/solutions/network-coverage) is the first interactive map built on the registry; it is not the only one meant to exist.

## Built for

| You are... | You use it to... |
|------------|------------------|
| **A funder or coalition** (e.g. Clean Air Fund, Clean Air Network, EPIC) | See where monitoring already exists, spot countries and cities with little or no coverage, and target investment |
| **A multilateral or government body** (e.g. a UN agency, a national environment agency) | Embed a continent-wide or national view of monitoring infrastructure in your own platform or reporting |
| **A monitor operator** (e.g. a university, embassy, city authority or independent network) | Get your monitors counted on the shared map by [submitting them to the registry](./community-registry.md) |
| **A researcher or analyst** | Pull an inventory of monitors by country, type, operator and manufacturer for landscape studies, as JSON or [CSV](./csv-export.md) |

If you're building something for one of these audiences, such as a website, app or report, the same endpoints apply.

:::tip New to the AirQo API?
This page assumes you already know how authentication and requests work. If you haven't yet, start with [AirQo API →](../intro.md) for the fundamentals, then come back here.
:::

:::info This is location and monitor metadata, not air-quality readings
Every endpoint here answers "what monitors exist, where, and run by whom" — not "what is the air quality right now." If you already have a monitor's identifiers and want its actual readings, that's the [Analytics API](../analytics-api/raw-data.md) or [Forecast API](../forecasts/overview.md) instead. In that sense this API is a sibling of the [Metadata API →](../reference/metadata.md): Metadata covers AirQo's own registered grids, cohorts, sites, and devices; Network Coverage covers the same *kind* of information — monitor identity and location — extended to monitors from any manufacturer or operator across Africa, not just AirQo's fleet.
:::

---

## What the reference map does with this data

[airqo.net/solutions/network-coverage](https://airqo.net/solutions/network-coverage) is one interface built on the endpoints below — a full-screen map with a country-first drill-down. Any of the same features can be rebuilt on another site using the same data:

1. **Overview** — every African country is shaded or pinned based on how many monitors it has, regardless of who operates them. Two view modes are available:
   - **Monitors** — one pin per monitor, coloured by type (Low-Cost Sensor, Reference, or Inactive).
   - **Coverage** — countries are shaded by monitor-count bucket (0, 1–9, 10–49, 50–199, 200–999, 1000+).
2. **Country drill-down** — clicking a country lists its monitors in a sidebar. From there you can search, and filter by monitor type, network/operator, and an "active only" toggle.
3. **Monitor detail** — clicking a monitor shows its full profile: operator, equipment, manufacturer, pollutants measured, sampling resolution, transmission method, deployment date, calibration history, 30-day uptime, co-location status, and whether its data is publicly viewable (with a link to view live data, where available).
4. **Impact statistics** — aggregate numbers behind the map: total monitors, breakdown by type and status, countries and cities covered, estimated population reached, and a breakdown **by sensor manufacturer** — this is a cross-manufacturer dataset by design, not an AirQo fleet count.
5. **Export** — the current filtered view can be downloaded as a PDF (map snapshot + data table) or CSV.
6. **Community submissions** — anyone, on any site built on this API, can add a monitor to the shared registry directly (name, location, operator, equipment, pollutants), protected by hCaptcha. This is how the dataset grows — it doesn't rely on AirQo alone to know about monitors on the continent. Contributing your own AirQo-owned device is a separate, more involved flow — see [Deploy to a Site](../../vertex/device-deployment/deploy-to-site.md) for that.

Everything below maps one of those features to the endpoint behind it.

---

## Endpoints at a glance

All endpoints live under `/api/v2/devices/network-coverage` and follow the same [authentication](../getting-started/authentication.md) rules as the rest of the API — pass your `token` as a query parameter.

:::warning Keep `token` out of anything a browser or public link can see
Because `token` travels in the URL, calling these endpoints directly from client-side JavaScript, an HTML form, or a public download link can leak it into server access logs, browser history, analytics tools, or a `Referer` header sent to whatever the response links to. HTTPS protects the URL in transit, but does nothing to stop any of that once the request lands. Make these calls from your own backend and hand the result to the browser — the way [airqo.net/solutions/network-coverage](https://airqo.net/solutions/network-coverage) itself does: its frontend never sees the token, a server-side route attaches it before forwarding the request.
:::

| Feature | Endpoint | Docs |
|---------|----------|------|
| Country-by-country monitor counts (map overview) | `GET /api/v2/devices/network-coverage` | [Monitors & Countries →](./monitors-and-countries.md) |
| Monitors within one country (drill-down) | `GET /api/v2/devices/network-coverage/countries/{countryId}/monitors` | [Monitors & Countries →](./monitors-and-countries.md) |
| Single monitor profile (detail panel) | `GET /api/v2/devices/network-coverage/monitors/{monitorId}` | [Monitor Details →](./monitor-details.md) |
| Aggregate stats (impact numbers) | `GET /api/v2/devices/network-coverage/impact` | [Impact Statistics →](./impact-statistics.md) |
| City population reference data | `GET`/`POST /api/v2/devices/network-coverage/cities` | [City Population Data →](./city-population-data.md) |
| Filtered data export | `GET /api/v2/devices/network-coverage/export.csv` | [CSV Export →](./csv-export.md) |
| Community monitor submission | `POST /api/v2/devices/network-coverage/registry` | [Community Registry →](./community-registry.md) |

---

## Monitor type and status

Every monitor returned by these endpoints carries a `type` and a `status`. They're independent of each other:

| Field | Values | Meaning |
|-------|--------|---------|
| `type` | `Reference`, `LCS`, `Inactive` | `Reference` = reference-grade instrument, `LCS` = low-cost sensor. A monitor can also be typed `Inactive` directly in the registry when it's been decommissioned. |
| `status` | `active`, `inactive` | Whether the monitor is currently operational, independent of its hardware type. |

:::note Filtering by "Inactive"
The `types` query parameter only accepts `Reference` and `LCS` — the backend treats "Inactive" as a status, not a hardware type. To show inactive monitors, fetch the data and filter client-side on `status === 'inactive'`, the way the reference page does.
:::

---

## Next steps

- [List countries and their monitors →](./monitors-and-countries.md)
- [Fetch a single monitor's profile →](./monitor-details.md)
- [Pull aggregate impact statistics →](./impact-statistics.md)
- [Export filtered data →](./csv-export.md)
- [Submit a monitor to the community registry →](./community-registry.md)
