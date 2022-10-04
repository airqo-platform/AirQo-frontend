## Login

This is a post request that returns an authentication token that can be used by the user to access other parts of the platform accordingly.

Note that to login, **you need to have a registered account**, if you don't follow the [Request Access](../platform/join.md#request-access) guide to request and get one.

```
curl --location --request POST 'https://api.airqo.net/api/v1/users/loginUser?tenant=airqo'
```

**Query Params**
tenant: airqo
**Request Body**:

```json
{
  "email": "api-user@gmail.com", # Required if email is absent
  "userName": "api-user", # Required if email is absent
  "password": "142526246Asxdqdq" # Required
}
```

**Response Body**

```json
{
  "_id": "1",
  "userName": "api-user",
  "token": "JWT ey123abc",
  "email": "api-user@gmail.com"
}
```
