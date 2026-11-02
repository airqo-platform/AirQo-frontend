---
sidebar_position: 1
sidebar_label: Overview
description: Africa Network Coverage — a shared, Africa-wide registry of air quality monitors from any network, manufacturer or operator. Read it to build your own Africa Network Map, or contribute monitors to it.
---

# Africa Network Coverage API

**Where is air quality being monitored across Africa, by whom, and where are the gaps?** Africa Network Coverage answers that question with a single shared registry of air quality monitors across the continent. It covers reference-grade instruments and low-cost sensors from any network, manufacturer or operator: national ministries, embassies, universities, city authorities, independent sensor networks and AirQo among them. Many entries are submitted by the community. Each monitor is tagged with who runs it and who made it.

AirQo hosts and maintains the registry and serves it through the AirQo API. The data itself belongs to no single network.

The registry works **both ways**. You can read from it to power your own map, report or dashboard, and you can add monitors that aren't in it yet. Every site built on the registry draws from and adds to the same dataset, so the picture of monitoring across Africa gets more complete each time someone uses it.

## Built for

| You are... | You use it to... |
|------------|------------------|
| **A funder or coalition** (e.g. Clean Air Fund, Clean Air Network, EPIC) | See where monitoring already exists, spot countries and cities with little or no coverage, and target investment |
| **A multilateral or government body** (e.g. a UN agency, a national environment agency) | Embed a continent-wide or national view of monitoring infrastructure in your own platform or reporting |
| **A monitor operator** (e.g. a university, embassy, city authority or independent network) | Get your monitors counted on every Africa Network Map by [submitting them to the registry](./community-registry.md) |
| **A researcher or analyst** | Pull an inventory of monitors by country, type, operator and manufacturer for landscape studies, as JSON or [CSV](./csv-export.md) |

If you're building something for one of these audiences, such as a website, app or report, the same endpoints apply.

:::tip New to the AirQo API?
This page assumes you already know how authentication and requests work. If you haven't yet, start with [AirQo API →](../intro.md) for the fundamentals, including how to get an API token, then come back here.
:::

:::info This is location and monitor metadata, not air-quality readings
Every endpoint here answers "what monitors exist, where, and run by whom" — not "what is the air quality right now." If you already have a monitor's identifiers and want its actual readings, that's the [Analytics API](../analytics-api/raw-data.md) or [Forecast API](../forecasts/overview.md) instead. In that sense this API is a sibling of the [Metadata API →](../reference/metadata.md): Metadata covers AirQo's own registered grids, cohorts, sites, and devices; Africa Network Coverage covers the same *kind* of information — monitor identity and location — for monitors from any network, manufacturer or operator across Africa.
:::

---

## Building an Africa Network Map

An **Africa Network Map** is any interactive map built on these endpoints. Several exist or are in progress: [airqo.net/solutions/network-coverage](https://airqo.net/solutions/network-coverage) is one, and partner organisations are building their own versions from the same data. None of them is the canonical one — they all read from and write to the same registry.

A typical Africa Network Map offers some or all of these features:

1. **Overview** — every African country is shaded or pinned based on how many monitors it has, regardless of who operates them. Two view modes are common:
   - **Monitors** — one pin per monitor, coloured by type (Low-Cost Sensor, Reference, or Inactive).
   - **Coverage** — countries are shaded by monitor-count bucket (e.g. 0, 1–9, 10–49, 50–199, 200–999, 1000+).
2. **Search and drill-down** — searching or clicking a country lists its monitors in a sidebar, with filters for monitor type, network/operator, and an "active only" toggle. A search for a city name can open that city directly.
3. **Monitor detail** — clicking a monitor shows its full profile: operator, equipment, manufacturer, pollutants measured, sampling resolution, transmission method, deployment date, calibration history, 30-day uptime, co-location status, and whether its data is publicly viewable (with a link to view live data, where available).
4. **Impact statistics** — aggregate numbers behind the map: total monitors, breakdown by type and status, countries and cities covered, estimated population reached, and a breakdown **by sensor manufacturer** — this is a cross-manufacturer dataset by design, not any one network's fleet count.
5. **Export** — the current filtered view can be downloaded, for example as CSV.
6. **Community submissions** — anyone, on any map built on this API, can add a monitor to the shared registry directly (name, location, operator, equipment, pollutants), protected by hCaptcha. This is how the dataset grows — it doesn't rely on any single organisation to know about every monitor on the continent. Deploying an AirQo-owned device is a separate, more involved flow — see [Deploy to a Site](../../vertex/device-deployment/deploy-to-site.md) for that.

Everything below maps one of those features to the endpoint behind it.

---

## Endpoints at a glance

All endpoints live under `/api/v2/devices/network-coverage` on `https://api.airqo.net` and follow the same [authentication](../getting-started/authentication.md) rules as the rest of the AirQo API — pass your `token` as a query parameter.

:::warning Keep `token` out of anything a browser or public link can see
Because `token` travels in the URL, calling these endpoints directly from client-side JavaScript, an HTML form, or a public download link can leak it into server access logs, browser history, analytics tools, or a `Referer` header sent to whatever the response links to. HTTPS protects the URL in transit, but does nothing to stop any of that once the request lands. Make these calls from your own backend and hand the result to the browser. That's how the airqo.net map works: its frontend never sees the token, because a server-side route attaches it before forwarding the request.
:::

| Feature | Endpoint | Docs |
|---------|----------|------|
| Country-by-country monitor counts and search (map overview) | `GET /api/v2/devices/network-coverage` | [Monitors & Countries →](./monitors-and-countries.md) |
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
The `types` query parameter only accepts `Reference` and `LCS` — the API treats "Inactive" as a status, not a hardware type. To show inactive monitors, fetch the data and filter client-side on `status === 'inactive'`.
:::

---

## What a monitor count means

Each "monitor" in these endpoints, and each point on an Africa Network Map, is a **monitored site**, not a physical device:

- **AirQo sites** appear only if they have at least one deployed device. Several devices deployed at the same site count as one point.
- **Community-registered entries** count once each.

So the totals here are not a device inventory. They won't match a network's own device count, which usually includes devices that are in storage, in transit or otherwise not deployed.

---

## How fresh the data is

The summary, country-monitors, CSV export and impact endpoints share a cached copy of the monitor list, which is at most 5 minutes old:

- **Registry and city population changes** clear the cache, so they show on the next request.
- **Online status and newly deployed AirQo devices** can take up to 5 minutes to appear.
- **[Monitor detail](./monitor-details.md)** always reads live data, so it can briefly be newer than the lists.

`generatedAt` in a response shows when the response was built, not when the cached data was computed.

:::note If your backend caches these responses
The behaviour above describes the API itself. If your own backend or proxy caches these responses, clear those cached responses after a successful registry or city population write. Otherwise your users can keep seeing the old data until your cache expires.
:::

---

## Next steps

- [List countries and their monitors →](./monitors-and-countries.md)
- [Fetch a single monitor's profile →](./monitor-details.md)
- [Pull aggregate impact statistics →](./impact-statistics.md)
- [Export filtered data →](./csv-export.md)
- [Submit a monitor to the community registry →](./community-registry.md)
