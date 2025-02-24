# Release Notes

The AirQo API is regularly updated with new features, bug fixes, and performance improvements. You can specify which version of the API to load in the v parameter of the API request.

---

This changelog lists releases by date and version number, along with associated changes.
Find the API reference [here](api/README.md#api-reference).

---

### 1.7.4

29th July 2022

**Changes to V2 of Get Device Measurements**

- Added support for CSV responses with the introduction of a new query parameter (format)
- Responses are now in descending order with the most recent measurements at the top.
- Applied compression algorithms which have greatly decreased the size of the response body and hence increased the speed of the product.
- Addressed challenges with the datetime query parameters where the results were the start and end datetimes returned were not reflective of the exact query parameter values entered.
- Sanitised the timestamp output format, Initially, the timestamp returned as an object instead of just the string value.

### 1.7.3

7th October 2021

**Changed**

- Removed extra/unnecessary fields from events endpoint (s2_pm2_5 s2_pm10).
- The returned pollutant values (PM<small>2.5</small> and PM<small>10</small>) is now the averages of the two sensors for each pollutant.
- Minimum frequency is now hourly , not raw values.
- Removes empty objects, arrays, empty strings, NaN, null and undefined values from response.
- Makes the query parameter recent=no as the default for the GET Events endpoint

### 1.7.2

24th September, 2021

**Changed**

- Remove extra/unnecessary fields (s2_pm2_5).
- The returned pollutant values are averages of the two sensors
  Minimum frequency of hourly , not raw values.
- Removes empty objects, arrays, empty strings, NaN, null and undefined values from response

**Added**

- Added a new query parameter (external) whose default is always "yes".

### 1.7.1

10th September, 2021

**Fixed**

- For the GET Events, one can now be able to retrieve hourly data using the frequency query parameter.

**Changed**

- Changed the device field in the JSON response from \_id to device.

**Added**

- Metadata query parameter when fetching events. So a person can be able to select the type of metadata they want. Can either be device or site_id accordingly.
