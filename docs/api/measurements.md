## Get measurements

This is the API method for retrieving device measurements

**Parameters**

**Query**

| Param     | Type    | Required               | Description                                                                                                                                       |
| :-------- | :------ | :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| tenant    | string  | True                   | The organisation, default is airqo. Otherwise, please ensure that you utilise the right tenant key.                                               |
| site      | string  | False                  | Unique name of the site                                                                                                                           |
| site_id   | object  | False                  | Object ID of the site                                                                                                                             |
| device    | string  | If device_id is absent | Unique device name                                                                                                                                |
| limit     | integer | False                  | Limit to your query, default limit is 50                                                                                                          |
| skip      | integer | False                  | Number of items to skip in the query.                                                                                                             |
| startTime | string  | False                  | Date in this format: YYYY-MM-DD or the UTC time format in case you would like to access data at specific times, eg: 2021-05-24T12:45:24.000Z      |
| endTime   | string  | False                  | Date in this format: YYYY-MM-DD. or the UTC time format in case you would like to access data at specific times, example: 2021-05-24T12:45:24.000 |
| device_id | object  | If device is absent    | Unique object ID of the device                                                                                                                    |
| frequency | string  | True                   | Averaging period of the measurements. Can be hourly, daily or raw                                                                                 |

**Example**

```curl
curl --location --request GET 'https://api.airqo.net/api/v2/devices/events?tenant=airqo' \
--header 'Authorization: JWT ey123abc'
```

**Responses**

<small>**200**</small>

```json
{
    "isCache": true,
    "success": true,
    "message": "successfully listed the Events",
    "measurements": [
        {
            "_id": "606ef94..........",
            "time": "2021-07-27T16:47:43.000Z",
            "is_test_data": true,
            "pm2_5": {
                "value": 48.12,
                "calibratedValue": null,
                "uncertaintyValue": null,
                "standardDeviationValue": null
            },
            "s2_pm2_5": {
                "value": 35.78,
                "calibratedValue": null,
                "uncertaintyValue": null,
                "standardDeviationValue": null
            },
            "pm10": {
                "value": 58.88,
                "calibratedValue": null,
                "uncertaintyValue": null,
                "standardDeviationValue": null
            },
            "s2_pm10": {
                "value": 44.95,
                "calibratedValue": null,
                "uncertaintyValue": null,
                "standardDeviationValue": null
            },
            "frequency": "raw",
            "battery": {
                "value": 4.21
            },
            "location": {
                "latitude": {
                    "value": null
                },
                "longitude": {
                    "value": null
                }
            },
            "altitude": {
                "value": 110936700000000000000
            },
            "speed": {
                "value": 0
            },
            "satellites": {
                "value": 0
            },
            "hdop": {
                "value": 0
            },
            "internalTemperature": {
                "value": 29
            },
            "externalTemperature": {
                "value": 23.52
            },
            "internalHumidity": {
                "value": 38
            },
            "externalHumidity": {
                "value": 62.68
            },
            "externalAltitude": null,
            "pm1": {
                "value": null,
                "calibratedValue": null,
                "uncertaintyValue": null,
                "standardDeviationValue": null
            },
            "no2": {
                "value": null,
                "calibratedValue": null,
                "uncertaintyValue": null,
                "standardDeviationValue": null
            },
            "deviceDetails": null
        },
        .....
    ]
```

<small>**403**</small>

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
