# API Reference

With this API reference, you can explore and interact with all the endpoints of the AirQo API.

This documentation shares the RESTful api endpoints provided by AirQo for retrieving measurements and device metadata from the AirQo monitoring network.

# BASE URL

https://api.airqo.net/api/{VERSION_NUMBER}

Available version numbers:

- v1
- v2

# Authentication

For each HTTP request, you will need to add the `Authorization` HEADER with it's respective token value. To get a token, you follow the [Login](../api/users.md#login) guide.

```
curl --location --request GET 'api.airqo.net/api/v1/devices/sites?tenant=airqo' \
--header 'Authorization: JWT ey123abc'
```

The access token is unique to a each individual account. All keys have expiry periods which may be different for every user as specified by the AirQo administrator.
On expiry, a user can get for a new token by loggin in using their account credentials or a refresh token provided on first sign up.

---

For support, please reach out to support@airqo.net to report bugs. We will also appreciate any feedback you would like to share with us!
