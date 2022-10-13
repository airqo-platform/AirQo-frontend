## Login

This is a post request that returns an authentication token that can be used by the user to access other parts of the platform accordingly.

Note that to login, **you need to have a registered account**, if you don't follow the [Request Access](../platform/join.md#request-access) guide to request and get one.

**Parameters**

**Query**

| Param  | Type   | Required | Description                                                                                  |
| :----- | :----- | :------- | :------------------------------------------------------------------------------------------- |
| tenant | string | True     | The organisation, default is airqo. Otherwise, ensure that you utilise the right tenant key. |

**Body**

| Field    | Type   | Required              |
| :------- | :----- | :-------------------- |
| email    | string | If userName is absent |
| userName | string | If email is absent    |
| password | string | True                  |

**Example**

```curl
curl --location --request POST 'https://api.airqo.net/api/v1/users/loginUser?tenant=airqo'
```

```json
{
  "email": "api-user@gmail.com",
  "userName": "api-user",
  "password": "142526246Asxdqdq"
}
```

**Responses**

<small>**200**</small>

```json
{
  "_id": "1",
  "userName": "api-user",
  "token": "JWT ey123abc",
  "email": "api-user@gmail.com"
}
```

<small>**403**</small>

When wrong credentials are used

```json
{
  "success": false,
  "message": "incorrect username or password"
}
```
