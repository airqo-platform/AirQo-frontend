---
sidebar_position: 5
sidebar_label: City Population Data
---

# City Population Data

A small reference dataset pairing cities with population figures, used to calculate the "population reached" numbers in [Impact Statistics](./impact-statistics.md). Most integrations only need the `GET` — the `POST` is for contributing a missing or updated figure.

---

## List city population records

```http
GET /api/v2/devices/network-coverage/cities?token={SECRET_TOKEN}
```

**Query parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `token` | string | Required |
| `country` | string | Optional. Filter to one country. |

**Example**

```bash
curl "https://api.airqo.net/api/v2/devices/network-coverage/cities?country=Uganda&token={SECRET_TOKEN}"
```

**Example response**

```json
{
  "success": true,
  "cities": [
    {
      "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "city": "kampala",
      "displayCity": "Kampala",
      "country": "uganda",
      "displayCountry": "Uganda",
      "iso2": "UG",
      "population": 1680000,
      "year": 2024,
      "source": "UBOS 2024 projection",
      "notes": ""
    }
  ]
}
```

**Response fields**

| Field | Description |
|-------|-------------|
| `city`, `country` | Lower-cased matching keys |
| `displayCity`, `displayCountry` | Human-readable names for display |
| `population` | Population figure |
| `year` | The year the figure applies to |
| `source` | Citation for the figure, e.g. a national statistics bureau |
| `notes` | Optional free-text context |

---

## Add a city population record

```http
POST /api/v2/devices/network-coverage/cities?token={SECRET_TOKEN}
```

**Request body**

```json
{
  "city": "Kampala",
  "country": "Uganda",
  "iso2": "UG",
  "population": 1680000,
  "year": 2024,
  "source": "UBOS 2024 projection",
  "notes": "Optional context"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `city` | string | Yes | |
| `country` | string | Yes | |
| `iso2` | string | Yes | Two-letter country code |
| `population` | number | Yes | |
| `year` | number | Yes | |
| `source` | string | Yes | Citation for the figure |
| `notes` | string | No | |

**Example response**

```json
{
  "success": true,
  "message": "City population saved",
  "cities": [
    {
      "_id": "66f1a2b3c4d5e6f7a8b9c0d1",
      "city": "kampala",
      "displayCity": "Kampala",
      "country": "uganda",
      "displayCountry": "Uganda",
      "iso2": "UG",
      "population": 1680000,
      "year": 2024,
      "source": "UBOS 2024 projection"
    }
  ]
}
```

---

## Next steps

- [Back to impact statistics →](./impact-statistics.md)
- [Submit a monitor to the community registry →](./community-registry.md)
