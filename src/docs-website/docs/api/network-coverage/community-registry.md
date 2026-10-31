---
sidebar_position: 7
sidebar_label: Community Registry
---

# Community Registry

This is how the Africa Network Coverage dataset grows: anyone, from any Africa Network Map or other site built on this API, can add a monitor that isn't already on record — for example, through an "Add monitor to network" dialog like the one on [airqo.net/solutions/network-coverage](https://airqo.net/solutions/network-coverage). It's for cataloguing **any** air quality monitor, run by any organisation, on any network, using any manufacturer's equipment. It is not for registering an AirQo-owned device specifically.

:::note Registering an AirQo device is different
If you're deploying an AirQo-owned device, use [Deploy to a Site](../../vertex/device-deployment/deploy-to-site.md) in Vertex instead. This registry endpoint is a lightweight, public catalogue entry — it doesn't create a device record or wire up data ingestion.
:::

---

## Submit a monitor

```http
POST /api/v2/devices/network-coverage/registry?token={SECRET_TOKEN}
```

:::warning Never call this with `token` from a public-facing form
This is the endpoint your own "Add monitor" form would submit to — but if that form is a public webpage, don't have the browser call this URL with `?token=` directly; the token would be readable in your page's requests. Submit the form to your own backend first, and have your backend attach the token when it calls this endpoint server-side. See [the note on query-string tokens →](./intro.md#endpoints-at-a-glance).
:::

**Request body**

```json
{
  "name": "US Embassy Kampala",
  "city": "Kampala",
  "country": "Uganda",
  "iso2": "UG",
  "latitude": 0.3123,
  "longitude": 32.5811,
  "type": "Reference",
  "status": "active",
  "network": "us-embassy",
  "operator": "US Department of State",
  "equipment": "BAM 1022",
  "manufacturer": "Met One Instruments",
  "pollutants": ["PM2.5"],
  "site": "US Embassy compound",
  "deployed": "2019-03-01",
  "publicData": "Yes",
  "viewDataUrl": "https://airnow.gov",
  "captchaToken": "10000000-aaaa-bbbb-cccc-000000000001"
}
```

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `name` | string | Yes | |
| `country` | string | Yes | |
| `latitude`, `longitude` | number | Yes | -90–90 / -180–180 |
| `network` | string | Yes | |
| `operator` | string | Yes | |
| `manufacturer` | string | Yes | |
| `pollutants` | string[] | Yes | |
| `captchaToken` | string | Yes | An hCaptcha response token — see below |
| `type` | `Reference` \| `LCS` \| `Inactive` | No | Defaults to `LCS` |
| `status` | `active` \| `inactive` | No | Defaults to `active` |
| `city`, `iso2`, `site`, `equipment`, `deployed` | string | No | |
| `calibrationLastDate`, `calibrationMethod`, `uptime30d` | string | No | |
| `organisation`, `coLocation`, `coLocationNote` | string | No | |
| `resolution`, `transmission` | string | No | |
| `publicData` | `Yes` \| `No` | No | Defaults to `No` |
| `viewDataUrl` | string | No | Link to the monitor's own data portal, if public |
| `countryId` | string | No | Only send this if you already have the country's slug from the [summary endpoint](./monitors-and-countries.md) — otherwise omit it and let the API derive one from `country` |

**Example response**

A successful submission returns `201 Created` for a new entry, or `200 OK` when it updates an existing one. The `registry` object includes the saved entry and the fields you need to read it back:

```json
{
  "success": true,
  "message": "Monitor added to registry",
  "registry": {
    "_id": "66f4a2b3c4d5e6f7a8b9c0d2",
    "monitorId": "66f4a2b3c4d5e6f7a8b9c0d2",
    "name": "US Embassy Kampala",
    "country": "Uganda",
    "countryId": "uganda",
    "iso2": "UG",
    "availability": "available"
  }
}
```

| Field | Description |
|-------|-------------|
| `_id` | The registry entry's own ID |
| `monitorId` | The ID to pass to [`GET /network-coverage/monitors/{monitorId}`](./monitor-details.md). For a standalone entry, like the one above, it equals `_id`. For an entry that enriches an existing AirQo site, it is that **site's** ID, not the registry `_id`. **Always use `monitorId`** to look the monitor up, never `_id`. |
| `countryId` | The country slug to use with [`GET /network-coverage/countries/{countryId}/monitors`](./monitors-and-countries.md#get-monitors-for-a-single-country) |
| `iso2` | Two-letter country code — derived from `country` if you didn't send one |
| `availability` | Whether the monitor can be read back yet — see below. Returned in the response only; it isn't stored on the entry. |

### Reading the monitor back

`availability` tells you whether the new entry is visible on the read endpoints:

| Value | Meaning |
|-------|---------|
| `available` | The monitor is readable right away from the [summary](./monitors-and-countries.md), [country-monitors](./monitors-and-countries.md#get-monitors-for-a-single-country), and [monitor-detail](./monitor-details.md) endpoints. |
| `pending` | The entry is linked to a site that has no active device yet. Those endpoints won't return it until a device is deployed at that site. |

When `availability` is `"available"`, you can rely on read-after-write: the new monitor appears on the very next request to any of those endpoints, so your map can refresh, or open `GET /network-coverage/monitors/{monitorId}`, straight after a successful submission. When it's `"pending"`, tell the user their submission was saved but won't appear on the map until the site has an active device.

---

## Errors

Failed submissions return a non-2xx status code and a body in this shape:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "message": "latitude must be between -90 and 90"
  }
}
```

| Status | When |
|--------|------|
| `400 Bad Request` | A field failed validation (missing required field, out-of-range coordinate, invalid `type`, etc.) |
| `400 Bad Request` | `captchaToken` is missing |
| `403 Forbidden` | `captchaToken` failed hCaptcha verification |
| `404 Not Found` | The entry is linked to a site that doesn't exist |
| `409 Conflict` | A registry entry already exists for that site |
| `429 Too Many Requests` | Rate limit reached — at most **20 submissions per hour per IP address** |

Show `errors.message` (or `message`) to the user. On `429`, ask them to try again later rather than retrying automatically.

---

## The hCaptcha requirement

`captchaToken` is a response token from [hCaptcha](https://www.hcaptcha.com/), solved client-side and passed through on submission — the same anti-spam gate the submission form on airqo.net uses. To reuse this endpoint on your own site, register your own hCaptcha site key and solve it in your form before calling this endpoint; a missing token is rejected with `400` and an invalid one with `403` (see [Errors](#errors)).

---

## Next steps

- [Back to the API overview →](./intro.md)
- [Deploy an AirQo device instead →](../../vertex/device-deployment/deploy-to-site.md)
