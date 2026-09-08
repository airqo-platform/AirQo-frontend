---
sidebar_position: 1
sidebar_label: Overview
---

# Network Coverage API

This is a shared record of the **air quality monitoring landscape across Africa** — not a list of AirQo devices. Reference-grade instruments, low-cost sensors, and equipment from any manufacturer or operator (national ministries, embassies, universities, city authorities, other sensor networks) all live in the same backend, tagged with who runs them and who made them. [airqo.net/solutions/network-coverage](https://airqo.net/solutions/network-coverage) is simply the first interactive map built on top of it.

The point of documenting it here is to let it be reused: any organisation with a stake in the continent's air quality picture — a UN agency, the Clean Air Fund, the Clean Air Network, EPIC, a national environment agency, a research institution — can pull this same data into their own site, and can contribute monitors their partners run that AirQo doesn't know about. One shared backend, fed and read by many client-facing apps, gives everyone a more complete picture than any single site maintaining its own list.

:::tip New to the AirQo API?
This page assumes you already know how authentication and requests work. If you haven't yet, start with [AirQo API →](../intro.md) for the fundamentals, then come back here.
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
6. **Community submissions** — anyone, on any site built on this API, can add a monitor to the shared registry directly (name, location, operator, equipment, pollutants), protected by hCaptcha. This is how the dataset stays complete — it doesn't rely on AirQo alone to know about every monitor on the continent. Contributing your own AirQo-owned device is a separate, more involved flow — see [Deploy to a Site](../../vertex/device-deployment/deploy-to-site.md) for that.

Everything below maps one of those features to the endpoint behind it.

---

## Endpoints at a glance

All endpoints live under `/api/v2/devices/network-coverage` and follow the same [authentication](../getting-started/authentication.md) rules as the rest of the API — pass your `token` as a query parameter.

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
