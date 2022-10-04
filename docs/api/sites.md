## Get sites

This get request gives you all the public sites' details.

```curl
curl --location --request GET 'https://api.airqo.net/api/v1/devices/sites?tenant=airqo' \
--header 'Authorization: JWT ey123abc'
```

**Query Params**

tenant: airqo

**Response Body**

```json
{
  "success": "true",
  "message": "successfully retrieved the site details",
  "sites": [
    // Array of sites
  ]
}
```
