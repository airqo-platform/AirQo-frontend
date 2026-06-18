---
sidebar_position: 1
sidebar_label: Authentication & Setup
---

# Authentication & Setup

Before making any API requests, you need an AirQo account and a set of API credentials. This page walks you through the complete setup process.

---

## Step 1 — Create an AirQo account

Go to [https://analytics.airqo.net](https://analytics.airqo.net) and sign up for a free account. Once registered, you will be taken to the AirQo Analytics dashboard.

---

## Step 2 — Generate your API credentials

1. Click your **profile icon** in the top-right corner of the dashboard.
2. Select **Profile** from the dropdown menu.
3. Navigate to the **API** tab (also accessible from the left-hand sidebar under your profile settings).
4. You will see your list of **API Clients** — each client holds a token and a set of security controls.
5. Click **Create Client** to create a new API client. Give it a descriptive name (e.g. `My App - Production`).
6. Once created, click **Generate Token** on the client row to issue an access token.

After generating a token, each API client exposes two credentials:

| Credential | Where it appears | Purpose |
|---|---|---|
| **Access Token** (SECRET TOKEN) | Token column on the client row | Sent as `?token=` on every API request |
| **Client Secret** | Edit Client dialog → *Require client secret* | Optional second factor sent as the `X-Client-Secret` header |

:::warning Store your credentials securely
Your access token grants access to all data your account is authorised for. Treat it like a password — never expose it in client-side code or public repositories. If you enable the Client Secret, protect it with the same care.
:::

---

## Step 3 — Using your credentials

All AirQo API endpoints — both GET and POST — authenticate via the `token` query parameter. Append `?token=YOUR_SECRET_TOKEN` to every request URL.

**GET request example:**

```http
GET https://api.airqo.net/api/v2/devices/measurements/cohorts/{COHORT_ID}?token=YOUR_SECRET_TOKEN
```

**POST request example:**

```http
POST https://api.airqo.net/api/v3/public/analytics/raw-data?token=YOUR_SECRET_TOKEN
Content-Type: application/json
```

If you have enabled the **Client Secret** requirement on your client, also include the secret in a request header:

```http
GET https://api.airqo.net/api/v2/devices/measurements/cohorts/{COHORT_ID}?token=YOUR_SECRET_TOKEN
X-Client-Secret: YOUR_CLIENT_SECRET
```

---

## Token expiration

API tokens are valid for **7 months** from the date they are generated. AirQo will send you an email notification before your token expires.

:::tip Avoid service interruption
Rotate your token before it expires. After generating a new token, update it in all places where it is used — server environment variables, configuration files, or secrets managers.
:::

---

## IP whitelisting

If you are making API calls from a server (as opposed to a browser), you must whitelist your server's public IP address on your API client.

**Without IP whitelisting, requests from server IPs will return empty data or an unauthorised error**, even when a valid token is supplied.

To whitelist your IP:

1. Go to **Profile → API** in [analytics.airqo.net](https://analytics.airqo.net).
2. Click the **Edit** (pencil) icon on the relevant client.
3. Add each public IP address your servers will use under **IP Addresses**.

:::note Dynamic IPs
If your servers use dynamic IP addresses (e.g. ephemeral cloud instances), consider routing API requests through a static NAT gateway or egress IP so you can maintain a stable whitelist.
:::

---

## Additional security controls

Beyond IP whitelisting, each API client and its token support several layers of protection that you can configure directly from the platform:

- **Client Secret** — require a second credential (`X-Client-Secret` header) on every request
- **Origin restriction** — limit browser-based requests to specific domain origins
- **Data scope** — restrict a token to specific Grid IDs or Cohort IDs
- **Access schedule** — permit requests only on certain days of the week and within UTC hour windows
- **Auto-suspension** — automatic token suspension when suspicious activity is detected

See [Security Enhancements →](./security.md) for a full walkthrough of every control.

---

## Next steps

- [Security Enhancements →](./security.md)
- [Choose a subscription tier →](./pricing-tiers.md)
- [Make your first API call →](./quick-start.md)
