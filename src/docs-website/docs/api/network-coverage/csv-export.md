---
sidebar_position: 6
sidebar_label: CSV Export
---

# CSV Export

Returns the currently-matched monitors as a flat CSV — one row per monitor — using the same filters as the [summary endpoint](./monitors-and-countries.md). Useful if you want a downloadable data table without re-shaping the JSON response yourself.

```http
GET /api/v2/devices/network-coverage/export.csv?token={SECRET_TOKEN}
```

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | string | Required |
| `tenant` | string | Optional. Defaults to `airqo`. |
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

:::note The reference page builds its own CSV/PDF client-side
The **Download** button on [airqo.net/solutions/network-coverage](https://airqo.net/solutions/network-coverage) currently formats a summary report (totals, filters applied, per-country breakdown) from data it already has in memory, rather than calling this endpoint. If you just need a raw, one-row-per-monitor table, call `export.csv` directly — it's simpler than reconstructing the report format.
:::

---

## Next steps

- [Back to the summary endpoint →](./monitors-and-countries.md)
- [Submit a monitor to the community registry →](./community-registry.md)
