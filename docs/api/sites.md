## Get sites

This get request gives you all the public sites' details.

**Parameters**

**Query**

| Param  | Type   | Required | Description                                                                                  |
| :----- | :----- | :------- | :------------------------------------------------------------------------------------------- |
| tenant | string | True     | The organisation, default is airqo. Otherwise, ensure that you utilise the right tenant key. |

**Example**

```curl
curl --location --request GET 'https://api.airqo.net/api/v1/devices/sites?tenant=airqo' \
--header 'Authorization: JWT ey123abc'
```

**Responses**

<small>**200**</small>

```json
{
  "success": "true",
  "message": "successfully retrieved the site details",
  "sites": [
    // Array of sites
  ]
}
```

<small>**400**</small>

In case of bad requests

```json
{
  "success": false,
  "message": "bad request errors",
  "errors": [
    {
      "value": "airq",
      "msg": "the tenant value is not among the expected ones",
      "param": "tenant",
      "location": "query"
    }
  ]
}
```
