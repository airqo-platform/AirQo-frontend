---
sidebar_position: 6
sidebar_label: CSV Export
---

# CSV Export

Returns the currently-matched monitors as a flat CSV — one row per monitor — using the same filters as the [summary endpoint](./monitors-and-countries.md). Useful if you want a downloadable data table without re-shaping the JSON response yourself.

```http
GET /api/v2/devices/network-coverage/export.csv?token={SECRET_TOKEN}
```

:::warning Don't put `token` in a public "Download" link
If you're wiring this up to a download button a visitor clicks, don't use a link with `?token=` in it — anyone can read the token out of that URL. Route the download through your own backend instead, the same way as any other endpoint on this page. See [the note on query-string tokens →](./intro.md#endpoints-at-a-glance).
:::

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | string | Required |
| `search` | string | Optional. Filters monitors by name, city, or country. |
| `activeOnly` | boolean | Optional. |
| `types` | string | Optional. Comma-separated: `Reference`, `LCS`. |
| `network` | string | Optional. Comma-separated network names. |
| `countryId` | string | Optional. Scope the export to one country. |

**Example**

```bash
curl "https://api.airqo.net/api/v2/devices/network-coverage/export.csv?countryId=uganda&token={SECRET_TOKEN}" \
  -H "Accept: text/csv" \
  -o network-coverage-uganda.csv
```

The response is `Content-Type: text/csv`, with a header row followed by one row per matched monitor covering the same fields documented in [Monitor Details](./monitor-details.md) (`name`, `city`, `country`, `type`, `status`, `operator`, `manufacturer`, `pollutants`, and so on).

:::note A raw table, not a formatted report
`export.csv` returns raw rows, one per monitor. Some Africa Network Maps also offer a formatted download (totals, filters applied, per-country breakdown); the map on [airqo.net/solutions/network-coverage](https://airqo.net/solutions/network-coverage), for example, builds its summary report client-side and never calls this endpoint. For an all-countries report with no data filter active, it fetches fresh [impact statistics](./impact-statistics.md) at download time. Country-scoped and filtered reports use only the data the map has already loaded. If you just need a one-row-per-monitor table, call `export.csv` directly — it's simpler than reconstructing a report format.
:::

---

## Next steps

- [Back to the summary endpoint →](./monitors-and-countries.md)
- [Submit a monitor to the community registry →](./community-registry.md)
