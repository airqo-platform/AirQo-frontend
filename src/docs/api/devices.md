## Get devices

This is the API method for retrieving device measurements

**Parameters**

**Query**

| Param         | Type     | Required | Description                                                                                         |
| :------------ | :------- | :------- | :-------------------------------------------------------------------------------------------------- |
| tenant        | string   | True     | The organisation, default is airqo. Otherwise, please ensure that you utilise the right tenant key. |
| active        | string   | False    | Return only active devices. Can either be YES or NO. site                                           |
| id            | objectID | False    | Device object ID                                                                                    |
| name          | string   | False    | Unique device name                                                                                  |
| limit         | integer  | False    | Limit to your query, default limit is 50                                                            |
| skip          | integer  | False    | Number of items to skip in the query.                                                               |
| device_number | string   | False    | Unique identifier for a device.                                                                     |
| primary       | string   | False    | Return only primary devices, can either be YES or NO                                                |

**Example**

```curl
curl --location --request GET 'https://api.airqo.net/api/v1/devices?tenant=airqo' \
--header 'Authorization: JWT ey123abc'
```

**Responses**

<small>**200**</small>

```json
{
  "success": true,
  "message": "successfully retrieved the device details",
  "devices": [
    {
      "_id": "61363c2......",
      "visibility": true,
      "height": 2.5,
      "isPrimaryInLocation": true,
      "nextMaintenance": "2021-11-28T00:00:00.000Z",
      "isActive": true,
      "pictures": [null],
      "device_number": 101412414141414,
      "long_name": "AIRQO-100400 UNIT ACTIVE",
      "description": "AirQo Gen4 unit",
      "createdAt": "2021-09-06T09:13:24.364Z",
      "writeKey": "U2FsdGVkX1+eTgDM9hOO17AS4twadzeAr8bGSY7L4UFJwDsJUw74PbnrPsKD4j7e",
      "readKey": "U2FsdGVkX18uZVkBGg3as3gNQD3m8iQT1/b1Y2T8uH5EsYobo4UUC9TjgN8KJGLU",
      "name": "aq_100400",
      "deployment_date": "2021-08-28T00:00:00.000Z",
      "maintenance_date": "2021-09-06T16:05:00.723Z",
      "recall_date": "2021-09-06T16:05:00.723Z",
      "latitude": 0.6555555,
      "longitude": 33.406,
      "mountType": "faceboard",
      "powerType": "solar",
      "site": {
        "_id": "615adc89f.............",
        "nearest_tahmo_station": {
          "id": 220,
          "code": "TA00227",
          "latitude": 0.6555555,
          "longitude": 33.406,
          "timezone": "Africa/Nairobi"
        },
        "site_tags": ["route"],
        "street": "Acacia Close",
        "formatted_name": "Jinja, Uganda",
        "google_place_id": "ChIJeUw_U3qr1351531cQpTFjIHk",
        "town": "Jinja",
        "city": "Jinja",
        "district": "Jinja",
        "county": "Jinja",
        "region": "Eastern Region",
        "country": "Uganda",
        "latitude": 0.6555555,
        "longitude": 33.406,
        "name": "YMCA Jinja",
        "lat_long": "0.6555555_33.406000",
        "generated_name": "site_15030",
        "altitude": 1165.504150390625,
        "description": "YMCA Katoto",
        "createdAt": "2021-10-04T10:50:49.727Z",
        "updatedAt": "2021-11-01T13:33:49.341Z",
        "__v": 0
      }
    }
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
      "value": "606ef8f9",
      "msg": "id must be an object ID",
      "param": "id",
      "location": "query"
    }
  ]
}
```
