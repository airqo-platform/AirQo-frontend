---
sidebar_position: 2.5
sidebar_label: Blocked Requests
description: Why AirQo API requests get blocked or flagged in a security alert, and how to fix it — allowlisting your server's IP, dynamic cloud IPs, suspended tokens and pending clients.
---

# Troubleshooting blocked requests

Use this guide if:

- you received a **Daily Security Alert Summary** email about your API token, or
- requests that used to work now fail with `401 Unauthorized` or `403 Forbidden`, even though your token is correct.

---

## How AirQo protects your token

Every request is checked against the IP address it comes from. Requests from addresses that look risky are blocked automatically, even with a valid token. That includes addresses never seen with your token before, and many cloud and data-centre ranges, which are where most stolen tokens get used. When this happens we send you a daily summary email listing the token and IP addresses involved.

**This is usually not a sign that your token was stolen.** The most common cause is a legitimate server-side job running from a cloud platform whose IP address we have not been told about.

You stop the blocking by adding your server's IP address to the **IP Addresses** list of the API client that owns the token. Requests made from an address on that list with that client's tokens are never blocked because of their IP, and they stop appearing in security alerts.

---

## Quick diagnosis

When a request is rejected, the response body may include an `errors.code` that tells you why:

```json
{
  "success": false,
  "message": "Unauthorized",
  "errors": {
    "message": "Requests from IP address 203.0.113.25 are blocked for this token. Add your server's public IP address to this API client's IP addresses, then retry.",
    "code": "IP_BLOCKED",
    "docs": "https://platform.airqo.net/docs/api/reference/blocked-requests/"
  }
}
```

| `errors.code` | What it means | What to do |
|---|---|---|
| `IP_BLOCKED` | The IP address your request came from is blocked, and it is not on this client's IP Addresses list. | [Add your server's IP address](#step-2-add-the-ip-address-to-your-api-client). If it changes between runs, see [dynamic IP addresses](#if-your-ip-address-keeps-changing). |
| `TOKEN_SUSPENDED` | The token was automatically suspended after unusual activity. | [Review and reinstate or replace the token](#step-3-check-the-token-is-not-suspended). |
| `CLIENT_INACTIVE` | The API client that owns this token is not active yet, or has been deactivated. | [Check the client's status](#step-4-check-the-api-client-is-active). |
| `TOKEN_EXPIRED` | The token has passed its expiry date. | Generate a new token for the client. |

If there is no `errors.code`, work through the steps below in order. They cover blocked IP addresses, suspended tokens and inactive clients. Also check that the token hasn't expired. If it has, generate a new token for the client and replace the old one everywhere it's used.

---

## Step 1: Find your server's real public IP address

You need the address your **server** uses to reach the internet, not your laptop's address and not the server's private network address (such as `10.x.x.x`, `172.16–31.x.x` or `192.168.x.x`).

Run one of these **on the machine, container or function that calls the AirQo API**:

```bash
curl https://ifconfig.me
# or
curl https://checkip.amazonaws.com
```

```python
import requests
print(requests.get("https://ifconfig.me", timeout=10).text)
```

:::tip Compare with the alert email
The IP addresses in the security alert email are the addresses we actually saw. If they don't match what you added to your client, you have allowlisted the wrong address. Most often that's because the IP changes between runs ([see below](#if-your-ip-address-keeps-changing)).
:::

If your server connects over IPv6, the output will be an IPv6 address (for example `2001:db8::25`). Add that exact address.

---

## Step 2: Add the IP address to your API client

1. Sign in to [nexus.airqo.net](https://nexus.airqo.net) and go to **Profile → API**.
2. Find the API client that **owns the token** you are using, and click its **Edit** (pencil) icon.
3. Under **IP Addresses**, add the exact public IP address from Step 1. Add one entry for each address your servers use.
4. Click **Update**.

The change takes effect immediately; there is nothing to restart.

Keep in mind:

- **Exact addresses only.** Each entry must be a single IP address, such as `203.0.113.25`. Ranges and CIDR blocks such as `203.0.113.0/24` are not supported.
- **Per client.** An address you add allows requests made with **that client's tokens** only. If you have several clients, add the address to each client whose tokens are used from that server.
- **The client must be active.** Addresses on a client that is still awaiting approval are not used until it is approved.

---

## Step 3: Check the token is not suspended

If a token is used from many unfamiliar IP addresses in a short time, it is suspended automatically. A suspended token is rejected from **every** IP address, including allowlisted ones. You also receive a separate email when this happens.

1. Go to **Profile → API** in [nexus.airqo.net](https://nexus.airqo.net).
2. A suspended token shows a warning on its row. Click the **shield** icon to see the reason and the time of suspension.
3. If the activity was yours (for example, a cloud job running from changing IPs), first fix the IP addresses as described above. Then click **Reinstate token**.
4. If you don't recognise the activity, **don't reinstate it**. Generate a new token and stop using the old one ([see below](#if-you-dont-recognise-the-activity)).

:::note
Fix the IP addresses before you reinstate. Otherwise the same activity will suspend the token again, and repeat suspensions are triggered more quickly.
:::

---

## Step 4: Check the API client is active

New API clients must be approved by AirQo before their tokens work. Until then, requests with those tokens are rejected.

- On **Profile → API**, a client awaiting approval is shown as pending or inactive.
- You receive an email when your client is approved.

**You don't need a new client to fix blocked requests.** Adding the IP address to your existing, active client (Step 2) is enough, and it takes effect immediately.

---

## If your IP address keeps changing

Many cloud platforms give your code a different public IP address on every run, or every time it scales. Each new address is unknown to us, so it gets blocked and appears in your next security alert, even after you allowlist yesterday's address.

Signs this applies to you:

- the security alert lists **more than one** IP address for the same token, or a different one each day;
- your code runs on serverless functions, containers, autoscaling instances or a hosted CI runner.

The fix is to give your outbound traffic **one stable IP address**, then add that address to your client:

| Platform | How to get a stable outbound IP |
|---|---|
| **AWS EC2** | Attach an **Elastic IP** to the instance. |
| **AWS Lambda, ECS / Fargate** | Run in a VPC private subnet and route outbound traffic through a **NAT gateway** that has an Elastic IP. |
| **Google Cloud Run / Cloud Functions** | Use **Serverless VPC Access** (or Direct VPC egress) with **Cloud NAT** and a reserved static IP. |
| **Google Compute Engine** | Reserve a **static external IP** for the VM, or use Cloud NAT. |
| **Azure Functions / App Service** | Use **VNet integration** with an **Azure NAT Gateway** that has a static public IP. |
| **Vercel, Netlify, other hosted platforms** | Use the platform's static-IP option if available, or send AirQo API calls through a small proxy server that has a static IP. |
| **GitHub Actions / hosted CI runners** | Use a self-hosted runner with a static IP, or call the API through a proxy that has one. |
| **Home or office network** | Your internet provider may change your IP. Ask for a static IP, or run the job from a server that has one. |

If none of these are possible for you, contact [support@airqo.net](mailto:support@airqo.net). Include your API client name and the platform you run on.

---

## If you don't recognise the activity

If the IP addresses in the alert are not yours, assume the token has been exposed:

1. **Generate a new token** for the client and deploy it to your applications.
2. **Get the old token revoked immediately.** Generating a new token does **not** revoke the old one, so whoever has it can keep using it. Email [support@airqo.net](mailto:support@airqo.net) right away and ask for it to be revoked. Include your API client name and the last 4 characters of the old token.
3. **Find out how it leaked.** Check for tokens in browser-side code, mobile apps, public repositories and shared notebooks. See [Security Enhancements](../getting-started/security.md) for ways to protect your token.

:::warning Keep tokens server-side
Tokens used in browser JavaScript or mobile apps can be read by anyone. Scrapers collect them automatically. Always call the AirQo API from your own backend.
:::

---

## Contacting support

If you're still blocked after following this guide, email [support@airqo.net](mailto:support@airqo.net) with:

- your **API client name**;
- the **last 4 characters** of the token. Never send the full token;
- the **public IP address(es)** your server uses (from Step 1);
- the `errors.code` and full error response you received, if any;
- the date and time (with time zone) of a failed request.
