# Network Coverage API (Minimum Scope)

This is the trimmed API contract for only what the Coverage page needs now.

## Base

- Base URL example: `https://api.airqo.net/v2`
- Response content type: `application/json`
- Timestamp format: ISO 8601 UTC

## 1) Coverage + Monitors Payload

`GET /network-coverage`

Returns all data needed to render:

- country sidebar list
- choropleth shading (count per country)
- map monitor nodes

### Query Parameters

- `search` (optional, string)
- `activeOnly` (optional, boolean)
- `types` (optional, csv enum): `Reference,LCS,Inactive`

### Response

```json
{
  "countries": [
    {
      "id": "uganda",
      "country": "Uganda",
      "iso2": "UG",
      "monitorCount": 6,
      "monitors": [
        {
          "id": "ug-kcca-ref-01",
          "name": "KCCA Nakawa Reference Station",
          "country": "Uganda",
          "iso2": "UG",
          "city": "Kampala",
          "latitude": 0.3314,
          "longitude": 32.618,
          "type": "Reference",
          "status": "active",
          "lastActive": "2026-03-18T10:21:00Z"
        }
      ]
    }
  ],
  "meta": {
    "totalCountries": 54,
    "monitoredCountries": 7
  }
}
```

## 2) Monitor Detail Payload (Sidebar)

`GET /network-coverage/monitors/{monitorId}`

Returns detailed monitor information for the selected monitor sidebar panel.

### Response

```json
{
  "id": "ug-kcca-ref-01",
  "name": "KCCA Nakawa Reference Station",
  "city": "Kampala",
  "country": "Uganda",
  "iso2": "UG",
  "latitude": 0.3314,
  "longitude": 32.618,
  "type": "Reference",
  "status": "active",
  "lastActive": "2026-03-18T10:21:00Z"
}
```

## 3) Export Data

`GET /network-coverage/export.csv`

`GET /network-coverage/export.pdf`

### Query Parameters

- `countryId` (optional)
- `activeOnly` (optional, boolean)
- `types` (optional, csv enum): `Reference,LCS,Inactive`

### CSV Header

```csv
Country,City,Monitor Name,Type,Status,Latitude,Longitude,Last Active
```

## Error Shape

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```
