---
sidebar_position: 7
sidebar_label: Community Registry
---

# Community Registry

This is how the shared dataset grows: anyone, from any site built on this API, can add a monitor that isn't already on record — this is the "Add monitor to network" dialog on the reference page. It's for cataloguing **any** air quality monitor, run by any organisation, using any manufacturer's equipment. It is not for registering an AirQo-owned device specifically.

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
| `countryId` | string | No | Only send this if you already have the country's slug from the [summary endpoint](./monitors-and-countries.md) — otherwise omit it and let the backend derive one from `country` |

**Example response**

```json
{
  "success": true,
  "message": "Monitor added to registry",
  "registry": {
    "_id": "66f4a2b3c4d5e6f7a8b9c0d2",
    "name": "US Embassy Kampala",
    "country": "Uganda",
    "countryId": "uganda"
  }
}
```

Once submitted, the new entry is picked up by the [summary](./monitors-and-countries.md), [country-monitors](./monitors-and-countries.md#get-monitors-for-a-single-country), and [monitor-detail](./monitor-details.md) endpoints like any other monitor.

---

## The hCaptcha requirement

`captchaToken` is a response token from [hCaptcha](https://www.hcaptcha.com/), solved client-side and passed through on submission — the same anti-spam gate the reference page's dialog uses. To reuse this endpoint on your own site, register your own hCaptcha site key and solve it in your form before calling this endpoint; a missing or invalid token is rejected.

---

## Next steps

- [Back to the API overview →](./intro.md)
- [Deploy an AirQo device instead →](../../vertex/device-deployment/deploy-to-site.md)
