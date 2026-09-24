---
sidebar_position: 5
sidebar_label: Website Map Integration
---

# Website Map Integration — Live Map with Forecasts

This guide is for **city governments and institutions** that want to publish a live air quality map on their own website, as Kampala Capital City Authority (KCCA) does. It walks through running AirQo's open-source Leaflet map sample locally, deploying it on an existing website, and verifying it in production.

The sample displays, for every public site in your city's Grid:

- **Current measurements** as colour-coded map markers
- A **seven-day daily forecast** panel when a site is clicked (where forecasts are available)
- **Site search**
- An optional **AQI heatmap** overlay

It has two parts: a static HTML page and a small Node.js service. The Node service supplies the Grid ID to the page and forwards API requests to AirQo, adding your access token on the server. **The token never reaches the visitor's browser.**

:::tip Already familiar with the endpoints?
This guide covers deployment only. For the data behind the map, see [Recent Measurements](./recent-measurements.md), [Spatial Heatmaps](./spatial-heatmaps.md), and the [Forecast API](../forecasts/overview.md).
:::

---

## Source files

| File | Purpose |
|------|---------|
| [`javascript/leaflet-forecast-server.js`](https://github.com/airqo-platform/code-samples/blob/staging/javascript/leaflet-forecast-server.js) | Node.js service: config endpoint, allowlisted API proxy, health check |
| [`javascript/leaflet-with-forecast.html`](https://github.com/airqo-platform/code-samples/blob/staging/javascript/leaflet-with-forecast.html) | The map page (Leaflet + jQuery, loaded from CDNs) |

Repository: [github.com/airqo-platform/code-samples](https://github.com/airqo-platform/code-samples/tree/staging) (`staging` branch)

---

## Requirements

| Requirement | Notes |
|-------------|-------|
| **Node.js 18 or newer** | On a server that can run a persistent process. The HTML page alone cannot work because it needs the proxy. |
| **An AirQo API access token** | See [Authentication & Setup](../getting-started/authentication.md). Forecasts require a **Premium** tier token. See [Pricing & Access Tiers](../getting-started/pricing-tiers.md). |
| **Your city's Grid ID** | See [Finding your Grid ID](./intro.md#finding-your-grid-id) |
| **An HTTPS website** | Plus a way to route selected paths to the Node service (e.g. Nginx, or an equivalent platform rewrite) |
| **Network access** | Server → `https://api.airqo.net` (outbound). Browser → Leaflet, jQuery, and OpenStreetMap tile resources. |

No `npm install` is needed. The server uses only Node built-ins, and the browser loads its libraries from CDNs.

---

## Step 1 — Get your access token

Create an API client and generate a token in Nexus as described in [Authentication & Setup → Generate your API credentials](../getting-started/authentication.md#step-2--generate-your-api-credentials). If your organisation already has a client for its city sensors, reuse that client's token. You do not need a new client for this integration.

This token will be used **only on the server**. Configure the client to match:

- **Do not enable origin restriction** on this client. Requests come from your Node server, which sends no `Origin` header. See [Best Practices → Origin restriction](../reference/best-practices.md#origin-restriction-browser-integrations).
- **Consider scoping the token to your Grid** and **whitelisting your server's egress IP**. See [Security Enhancements](../getting-started/security.md).

If the token is later suspended or needs replacing, follow [Auto-suspension](../getting-started/security.md#auto-suspension) or [Token rotation](../getting-started/security.md#token-rotation). After changing the token, update it in the server's environment and **restart the Node service**.

:::danger Keep the token server-side
Never put the token in the HTML, client-side JavaScript, a public repository, a browser-visible URL, a "public" build-time environment variable, a screenshot, or a support message.
:::

---

## Step 2 — Run the sample locally

Clone the `staging` branch and run the server from the repository root.

**macOS / Linux:**

```bash
git clone --branch staging https://github.com/airqo-platform/code-samples.git
cd code-samples
export AIRQO_API_TOKEN="YOUR_ACCESS_TOKEN"
export AIRQO_GRID_ID="YOUR_GRID_ID"
node javascript/leaflet-forecast-server.js
```

**Windows (PowerShell):**

```powershell
git clone --branch staging https://github.com/airqo-platform/code-samples.git
cd code-samples
$env:AIRQO_API_TOKEN = "YOUR_ACCESS_TOKEN"
$env:AIRQO_GRID_ID = "YOUR_GRID_ID"
node .\javascript\leaflet-forecast-server.js
```

Keep the terminal running and open [http://127.0.0.1:8080/](http://127.0.0.1:8080/). Do not open the HTML file directly as a `file://` URL. It needs the server's proxy.

---

## Step 3 — Deploy on your existing website

### How it fits together

The page calls three **root-level** paths on its own origin. Your web server must route them to the Node service:

| Path | Routed to Node? | Purpose |
|------|-----------------|---------|
| `/air-quality/` (or any page path you choose) | No. Served by your web server. | The HTML page |
| `/airqo-config` | **Yes** | Returns `{"gridId":"..."}` to the page |
| `/airqo-api/` | **Yes** | Allowlisted proxy to `api.airqo.net` |
| `/healthz` | Optional | Returns `{"status":"ok"}` for monitoring |

The HTML uses **absolute** paths for `/airqo-config` and `/airqo-api/`, so a page placed in a subdirectory still calls the root paths. If your website already uses either path, change the paths in the HTML and in your proxy rules together.

### Run the Node service

Configure these as **service environment variables** in your service manager (e.g. systemd) or deployment platform. Do not paste them as a shell script:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `HOST` | `127.0.0.1` (listen internally only; the default is `0.0.0.0`) |
| `PORT` | `8080` |
| `AIRQO_API_TOKEN` | Your access token (store it as a secret) |
| `AIRQO_GRID_ID` | Your city's Grid ID |

Start command: `node javascript/leaflet-forecast-server.js`

In production the server **refuses to start** unless both `AIRQO_API_TOKEN` and `AIRQO_GRID_ID` are set. Run it under a service manager so it restarts after a crash or reboot.

:::note Serving the page
The Node service can also serve the page itself at `/` and `/leaflet-with-forecast.html`, provided both files stay together in the `javascript` directory. On an existing website, it is usually simpler to let your normal web server serve the HTML, as below.
:::

### Nginx example

Add these locations inside your existing HTTPS `server` block and adjust the file path. `proxy_pass` has **no trailing slash**, so the original request path is passed through unchanged.

```nginx
location = /air-quality/ {
    alias /var/www/airqo/leaflet-with-forecast.html;
    default_type text/html;
}

location = /airqo-config {
    proxy_pass http://127.0.0.1:8080;
}

location /airqo-api/ {
    proxy_pass http://127.0.0.1:8080;
}

# Optional, for monitoring only:
location = /healthz {
    proxy_pass http://127.0.0.1:8080;
}
```

Copy the HTML to `/var/www/airqo/leaflet-with-forecast.html`, or change the `alias`. If your website and backend run on different platforms, configure equivalent **same-origin rewrites** from the website to the backend.

---

## How requests flow

1. The browser requests `/airqo-config` and receives `{"gridId":"..."}`. The Grid ID is public, but the token is not.
2. The page requests, through the proxy:
   - `/airqo-api/api/v2/devices/measurements/grids/{gridId}` for [current measurements](./recent-measurements.md)
   - `/airqo-api/api/v2/predict/daily-forecasting/{gridId}` for [daily forecasts](../forecasts/overview.md#scope-grid-and-cohort-forecasting)
   - `/airqo-api/api/v2/spatial/heatmaps/{gridId}` for the [heatmap](./spatial-heatmaps.md) (only when the heatmap control is switched on)
3. The Node service **allows only these three paths for its configured Grid**. It drops any `token` parameter supplied by the browser, adds the server-side token, and passes the AirQo response back.
4. The page joins measurements and forecasts by `site_id`. A site with no matching forecast shows a "no forecast" message.

---

## Step 4 — Verify the deployment

Replace `example.org` with your domain:

```bash
curl -i https://example.org/healthz        # {"status":"ok"} (if exposed)
curl -i https://example.org/airqo-config   # {"gridId":"..."}, with no token
curl -i https://example.org/air-quality/   # 200, served over HTTPS
```

Then, in a browser:

- [ ] Markers appear on the map
- [ ] Clicking a site opens its forecast panel
- [ ] The heatmap overlay loads when switched on
- [ ] No request in the browser's **Network** tab contains your token

If a panel is empty, inspect the `/airqo-api/` requests in the Network tab. A missing forecast for an individual site can be legitimate, as long as its `site_id` matches the live measurement and the Grid has forecast coverage.

---

## Troubleshooting

These issues are specific to this integration. For API status codes in general, see [Error Codes](../reference/error-codes.md).

| Symptom | What to check |
|---------|---------------|
| Blank page, or `/airqo-config` fails | Is `/airqo-config` routed to the Node service, and is the service running? |
| `401` / `403` on `/airqo-api/` calls | The **server-side** token: is it valid, not suspended, and on a tier that includes the endpoint (forecasts need Premium)? See [401](../reference/error-codes.md#401-unauthorized) and [403](../reference/error-codes.md#403-forbidden--tier-restriction). |
| `404` with `"AirQo API route not allowed."` | The request is not one of the three allowlisted paths for the configured Grid. Check the Grid ID and your path rewrite. |
| `404` from AirQo | Check the Grid ID. See [404 Not Found](../reference/error-codes.md#404-not-found). |
| `502` `"Could not reach the AirQo API."` | Outbound connectivity from the server to `api.airqo.net`, and the service logs. Upstream requests time out after **30 seconds**. |
| Markers but no forecasts | Measurements and forecasts are separate requests. Check the forecast response and your tier, and confirm that forecast `site_id`s match measurement `site_id`s. |

Never paste a real token into a support ticket, screenshot, or browser console.

---

## Security and operations

- Keep the Node port closed to the public. Only your web server should reach it.
- Serve the page over **HTTPS** only.
- Store the token in your platform's secret store and monitor `/healthz`.
- For high-traffic public pages, consider **caching** responses at the proxy (heatmaps and forecasts change infrequently; see [Best Practices → Caching](../reference/best-practices.md#caching)) and adding **rate limits**.
- Review AirQo's API [usage terms and fair usage policy](../../data-access/fair-usage-policy/index.md) before going live.

---

## Attribution

AirQo data is open access **provided it is used with appropriate attribution**. The sample shows a **"Powered by AirQo"** link in the map's bottom-right corner. Keep it visible.

The sample also blanks the OpenStreetMap tile credit, which the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/) requires. Restore it before going live:

```javascript
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);
```

We also recommend a short acknowledgement near the map, for example:

> Air quality data and forecasts provided by [AirQo](https://airqo.net), Makerere University.

---

## Next steps

- [Understand the measurement response →](./recent-measurements.md#response-fields)
- [Forecast response fields and AQI categories →](../forecasts/overview.md#response-field-reference)
- [Harden your API client →](../getting-started/security.md#security-checklist)
