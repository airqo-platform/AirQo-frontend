---
sidebar_position: 4
sidebar_label: Security Enhancements
---

# Security Enhancements

AirQo provides multiple independent security layers that you can stack on each API client and its token. All controls are configured from **Profile → API** inside [nexus.airqo.net](https://nexus.airqo.net) — no code deployment required.

---

## Security model overview

Each API client has two configuration levels:

| Level | Where to configure | Controls |
|---|---|---|
| **Client level** | Edit Client dialog | IP whitelist, origin restriction enforcement, client secret requirement |
| **Token level** | Token Security dialog | Allowed grids, allowed cohorts, allowed origins, access schedule |

Apply client-level controls first to establish a baseline, then use token-level controls to scope individual tokens to the minimum data and time windows they need.

---

## Client Secret (X-Client-Secret header)

### What it is

A **Client Secret** is a secondary credential tied to an API client. When enabled, every API request using that client's token **must also send the secret** via the `X-Client-Secret` request header. A request that provides a valid token but omits the secret will be rejected.

This acts as a second factor for API access — even if a token is leaked, it cannot be used without the corresponding secret.

### How to enable it

1. Go to **Profile → API** in [nexus.airqo.net](https://nexus.airqo.net).
2. Click the **Edit** (pencil) icon on the relevant client.
3. Check **Require client secret on every request**.
4. Copy the displayed Client Secret and store it securely (e.g. in a secrets manager or environment variable).

### How to use it in requests

```http
GET https://api.airqo.net/api/v2/devices/measurements/cohorts/{COHORT_ID}?token=YOUR_SECRET_TOKEN
X-Client-Secret: YOUR_CLIENT_SECRET
```

```python
import requests

response = requests.get(
    "https://api.airqo.net/api/v2/devices/measurements/cohorts/YOUR_COHORT_ID",
    params={"token": "YOUR_SECRET_TOKEN"},
    headers={"X-Client-Secret": "YOUR_CLIENT_SECRET"},
)
```

:::warning Never expose the Client Secret client-side
The `X-Client-Secret` header must only be sent from your own backend server. Do not include it in browser JavaScript, mobile apps, or any code that runs on end-user devices.
:::

### Regenerating the Client Secret

If a secret is compromised, an administrator can regenerate it from the admin panel. After regeneration, all services using the old secret will fail until they are updated with the new value. Coordinate the rotation carefully to avoid downtime.

---

## IP whitelisting

### What it is

IP whitelisting restricts which source IP addresses are allowed to call the API using a given client's token. Requests arriving from an IP not on the list will be rejected.

### When you need it

This control is **required for all server-side integrations**. Without it, requests from server IPs may return empty data or an unauthorised error even with a valid token.

### How to configure it

1. Go to **Profile → API** in [nexus.airqo.net](https://nexus.airqo.net).
2. Click the **Edit** (pencil) icon on the relevant client.
3. Add each public IP address your server uses under **IP Addresses**.
4. Click **Update** to save.

You can add multiple IP addresses to a single client — add all egress IPs your application may use (including load balancers and NAT gateways).

:::note Dynamic IPs
If your servers use dynamic or ephemeral IP addresses (e.g. auto-scaling cloud instances), route all API traffic through a static NAT gateway or egress proxy so you can maintain a stable whitelist.
:::

---

## Origin restriction (browser-based integrations)

### What it is

Origin restriction limits browser-based requests to specific domain origins. When enabled on a client, the API checks the `Origin` header of incoming requests and rejects any that do not match an entry in the client's allowed-origins list.

This is the browser-equivalent of IP whitelisting: it prevents other websites from making API requests using your token.

### How to configure it

**Client level (enforcement toggle):**

1. Go to **Profile → API** in [nexus.airqo.net](https://nexus.airqo.net).
2. Click the **Edit** (pencil) icon on the relevant client.
3. Check **Enforce origin restriction**.
4. Add each allowed origin under **Allowed origins** — use the full origin with protocol, for example `https://app.airqo.net`.
5. Click **Update** to save.

**Token level (fine-grained per-token origins):**

You can also set allowed origins per token inside the **Token Security** dialog. Token-level origins take precedence when set.

1. Click the **shield** icon on the token row.
2. Enter origins under **Allowed origins** in the Token Security dialog.

### Origin format

Origins must include the protocol (`http://` or `https://`) and the exact host. Do not include paths or trailing slashes.

| Valid | Invalid |
|---|---|
| `https://app.airqo.net` | `app.airqo.net` (missing protocol) |
| `https://dashboard.example.org` | `https://dashboard.example.org/` (trailing slash) |
| `http://localhost:3000` | `localhost:3000` (missing protocol) |

---

## Data scope restrictions (Grids and Cohorts)

### What it is

A token can be scoped to specific Grid IDs or Cohort IDs. When restrictions are set, requests using that token can only fetch data for the listed grids or cohorts — all other resources return an unauthorised or empty response.

This is useful when you issue tokens to third-party partners or sub-organisations that should only see a defined subset of your data.

### How to configure it

1. Go to **Profile → API** in [nexus.airqo.net](https://nexus.airqo.net).
2. Click the **shield** icon on the token row to open the Token Security dialog.
3. Under **Restrict to Grids**, enter each Grid ID the token is allowed to access.
4. Under **Restrict to Cohorts**, enter each Cohort ID the token is allowed to access.
5. Click **Save changes**.

Leaving both lists empty means the token is unrestricted and can access all grids and cohorts your account has permission for.

:::tip Finding IDs
See [Finding IDs →](../reference/finding-ids.md) for instructions on locating your Grid IDs and Cohort IDs.
:::

---

## Access schedule

### What it is

An access schedule restricts a token to specific days of the week and UTC hour windows. Requests made outside the configured schedule are rejected, even with a valid token.

This is useful for service accounts that should only operate during business hours, or for tokens given to external integrators who only need data during defined periods.

### How to configure it

1. Go to **Profile → API** in [nexus.airqo.net](https://nexus.airqo.net).
2. Click the **shield** icon on the token row.
3. In the Token Security dialog, check **Access schedule** to enable it.
4. Select the **Allowed days** (Sun–Sat checkboxes). Leaving all days unchecked allows requests every day.
5. Set **Start hour UTC** and **End hour UTC** (0–23). The range is inclusive of the start hour and exclusive at the end.
6. Click **Save changes**.

### Example

To allow access only on weekdays between 06:00 and 20:00 UTC:

- Allowed days: Mon, Tue, Wed, Thu, Fri
- Start hour UTC: 6
- End hour UTC: 20

Any request arriving outside this window — including on Saturday or Sunday — will be rejected.

:::note All times are UTC
The access schedule uses UTC for all hour values. Convert to the local time zone of your integration when planning the window.
:::

---

## Auto-suspension

### What it is

AirQo monitors request patterns on each token. If suspicious activity is detected (e.g. an unusual spike in requests, requests from unexpected locations), the token is **automatically suspended** and all subsequent requests using it will fail until you reinstate it.

### How to check and reinstate a suspended token

1. Go to **Profile → API** in [nexus.airqo.net](https://nexus.airqo.net).
2. A suspended token will show a warning indicator on the token row and display the status as suspended.
3. Click the **shield** icon to open the Token Security dialog.
4. A banner at the top will show:
   - The suspension reason
   - The date and time the token was suspended
5. Click **Reinstate token** to restore access.

:::warning Investigate before reinstating
Before reinstating a suspended token, review your logs to understand whether the flagged activity was expected. If the suspension was caused by a genuine security incident (leaked token, compromised service), rotate the token instead of reinstating it.
:::

---

## Token rotation

Tokens are valid for **7 months**. AirQo sends an email notification before expiry, but you should not wait for it.

**Recommended rotation process:**

1. Generate a new token for the same client (the old token remains valid until its expiry date).
2. Deploy the new token to all environments and services.
3. Verify that requests succeed with the new token.
4. Allow the old token to expire naturally, or contact [support@airqo.net](mailto:support@airqo.net) if you need to revoke it immediately.

:::tip Zero-downtime rotation
Because the old and new tokens are both valid during the transition window, you can roll out the new token gradually without any downtime.
:::

---

## Security checklist

Use this checklist when setting up or auditing an API client:

- [ ] Access token stored in an environment variable or secrets manager — not in code
- [ ] **Client Secret enabled** and stored securely for all server-side clients
- [ ] Server egress IPs whitelisted on the client
- [ ] Origin restriction enabled with an explicit allowlist for browser-based clients
- [ ] Token scoped to the minimum required Grids and Cohorts
- [ ] Access schedule configured if the integration has defined operating hours
- [ ] Token expiry reminder set (aim to rotate 2–3 weeks before expiry)
- [ ] Auto-suspension alerts monitored and response process documented

---

## Next steps

- [Best Practices →](../reference/best-practices.md)
- [Make your first API call →](./quick-start.md)
- [Finding IDs →](../reference/finding-ids.md)
