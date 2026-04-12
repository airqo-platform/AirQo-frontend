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

1. Click your profile icon in the top-right corner of the dashboard.
2. Navigate to **Account Settings**.
3. Find the **API Access** or **Credentials** section.
4. Click **Generate Credentials** to create a new key pair.
5. You will receive two values:
   - **CLIENT** — identifies your application
   - **SECRET TOKEN** — used to authenticate API requests

:::warning Store your credentials securely
Your `SECRET TOKEN` grants access to all data your account is authorised for. Treat it like a password — never expose it in client-side code or public repositories.
:::

---

## Step 3 — Using your credentials

### GET endpoints (measurements, heatmaps, forecasts)

Pass your `SECRET TOKEN` as a query parameter:

```
GET https://api.airqo.net/api/v2/devices/measurements/cohorts/{COHORT_ID}?token=YOUR_SECRET_TOKEN
```

### POST endpoints (Analytics API)

Pass your token in the `Authorization` header:

```http
POST https://api.airqo.net/api/v3/public/analytics/raw-data
Content-Type: application/json
Authorization: Bearer YOUR_SECRET_TOKEN
```

---

## Token expiration

API tokens are valid for **7 months** from the date they are generated. AirQo will send you an email notification before your token expires.

:::tip Avoid service interruption
Rotate your token before it expires. After generating a new token, update it in all places where it is used — server environment variables, configuration files, or secrets managers.
:::

---

## IP whitelisting

If you are making API calls from a server (as opposed to a browser), you must whitelist your server's public IP address in your AirQo account settings.

**Without IP whitelisting, requests from server IPs will return empty data or an unauthorised error**, even when a valid token is supplied.

To whitelist your IP:
1. Go to **Account Settings** in [analytics.airqo.net](https://analytics.airqo.net).
2. Find the **IP Whitelist** section.
3. Add each public IP address that your servers will use.

:::note Dynamic IPs
If your servers use dynamic IP addresses (e.g. ephemeral cloud instances), consider routing API requests through a static NAT gateway or egress IP so you can maintain a stable whitelist.
:::

---

## Next steps

- [Choose a subscription tier →](./pricing-tiers)
- [Make your first API call →](./quick-start)
