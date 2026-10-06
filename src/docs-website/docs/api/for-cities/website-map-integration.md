---
sidebar_position: 5
sidebar_label: Website Map Integration
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Website Map Integration — Live Map with Forecasts

This guide is for **city governments and institutions** that want to publish a live air quality map on their own website, as Kampala Capital City Authority (KCCA) does. Start with the hosted embed below, or follow the HTML and PHP instructions to run AirQo's open-source Leaflet map sample locally, deploy it on an existing website, and verify it in production.

## Add an air quality map to your website

For a quick integration, open [Add an air quality map to your website](https://ai.airqo.net/#embed-map), enter your city's Grid ID, and copy the generated iframe code into your website's HTML or a CMS custom HTML block. This works on both HTML and PHP websites. No API key or backend setup is needed on your website.

1. Find [your city's Grid ID](./intro.md#finding-your-grid-id).
2. Enter it in the [AirQo map embed tool](https://ai.airqo.net/#embed-map) and select **Copy embed code**.
3. Paste the code into your page, adjust the height and title as needed, and check that the map loads on your published website.

The hosted map includes live site readings, seven-day forecasts, and a heatmap overlay. For control over the map code and hosting, use the HTML or PHP sample described below.

## HTML and PHP integration

The sample displays, for every public site in your city's Grid:

- **Current measurements** as colour-coded map markers
- A **seven-day daily forecast** panel when a site is clicked (where forecasts are available)
- **Site search**
- An optional **AQI heatmap** overlay

It has two parts: a map page and a small Node.js service. The Node service supplies the Grid ID to the page and forwards API requests to AirQo, adding your access token on the server. **The token never reaches the visitor's browser.**

The map page comes in two variants. Both use the same Node service and the same proxy routes:

| Variant | Use it when | Page served by |
|---------|-------------|----------------|
| **HTML** | Your website serves static pages, or you want the Node service to serve the page too | Your web server, or the Node service |
| **PHP** | Your website runs on PHP (e.g. a CMS or custom PHP site) | Your existing PHP handler |

Pick your variant in the tabs below. Your choice applies to every tab on this page.

:::tip Already familiar with the endpoints?
This guide covers deployment only. For the data behind the map, see [Recent Measurements](./recent-measurements.md), [Spatial Heatmaps](./spatial-heatmaps.md), and the [Forecast API](../forecasts/overview.md).
:::

---

## Source files

Repository: [github.com/airqo-platform/code-samples](https://github.com/airqo-platform/code-samples/tree/staging) (`staging` branch). Use files from the same branch and folder together. They are not interchangeable between folders.

<Tabs groupId="website-stack" queryString>
<TabItem value="html" label="HTML" default>

Folder: [`javascript/`](https://github.com/airqo-platform/code-samples/tree/staging/javascript)

| File | Purpose |
|------|---------|
| [`leaflet-with-forecast.html`](https://github.com/airqo-platform/code-samples/blob/staging/javascript/leaflet-with-forecast.html) | The map page (Leaflet + jQuery, loaded from CDNs) |
| [`leaflet-forecast-server.js`](https://github.com/airqo-platform/code-samples/blob/staging/javascript/leaflet-forecast-server.js) | Node.js service: config endpoint, allowlisted API proxy, health check. Can also serve the HTML page. |
| [`leaflet-forecast-nginx.conf.example`](https://github.com/airqo-platform/code-samples/blob/staging/javascript/leaflet-forecast-nginx.conf.example) | Reference Nginx routes. Do not publish it. |

</TabItem>
<TabItem value="php" label="PHP">

Folder: [`php/`](https://github.com/airqo-platform/code-samples/tree/staging/php)

| File | Purpose |
|------|---------|
| [`leaflet-with-forecast.php`](https://github.com/airqo-platform/code-samples/blob/staging/php/leaflet-with-forecast.php) | The map page, served by PHP (Leaflet + jQuery, loaded from CDNs) |
| [`leaflet-forecast-server.js`](https://github.com/airqo-platform/code-samples/blob/staging/php/leaflet-forecast-server.js) | Private Node.js service: config endpoint, allowlisted API proxy, health check. Serves **no** pages. |
| [`leaflet-forecast-router.php`](https://github.com/airqo-platform/code-samples/blob/staging/php/leaflet-forecast-router.php) | Router for PHP's built-in server. **Local development only.** |
| [`.env.example`](https://github.com/airqo-platform/code-samples/blob/staging/php/.env.example) | Template for local credentials and ports |
| [`leaflet-forecast-nginx.conf.example`](https://github.com/airqo-platform/code-samples/blob/staging/php/leaflet-forecast-nginx.conf.example) | Reference Nginx routes. Do not publish it. |

</TabItem>
</Tabs>

---

## Requirements

| Requirement | Notes |
|-------------|-------|
| **Node.js** | **18 or newer** when credentials are set as environment variables. The PHP variant's `.env` file support needs **20.12 or newer**. Run it on a server that can keep a persistent process. The map page alone cannot work because it needs the proxy. |
| **PHP** (PHP variant only) | Your existing PHP hosting. For local testing, the `php` command-line executable with `allow_url_fopen` enabled (the default). |
| **An AirQo API access token** | See [Step 1](#step-1--get-your-access-token). Forecasts require a **Premium** tier token. See [Pricing & Access Tiers](../getting-started/pricing-tiers.md). |
| **Your city's Grid ID** | See [Finding your Grid ID](./intro.md#finding-your-grid-id), or ask AirQo support |
| **An HTTPS website** | Plus a way to route selected paths to the Node service on the **same domain** (e.g. Nginx, Apache, IIS, or an equivalent platform rewrite) |
| **Network access** | Server → `https://api.airqo.net` (outbound). Browser → `unpkg.com` (Leaflet), `code.jquery.com`, and OpenStreetMap tiles. If your site sets a Content Security Policy, allow these. |

No `npm install` or Composer install is needed. The Node service uses only Node built-ins, and the browser loads its libraries from CDNs.

:::warning PHP-only shared hosting
Hosting that runs PHP but cannot run a persistent Node process cannot host this proxy. Run the Node service on a separate backend and route the website's `/airqo-config` and `/airqo-api/` paths to it on the same domain, or implement equivalent proxy routes in PHP.
:::

---

## Step 1 — Get your access token

Create an API client and generate a token in Nexus as described in [Authentication & Setup → Generate your API credentials](../getting-started/authentication.md#step-2--generate-your-api-credentials). If your organisation already has a client for its city sensors, open [API settings in Nexus](https://nexus.airqo.net/user/profile?tab=api) and reuse that client's token. You do not need a new client for this integration.

This token will be used **only on the server**. Configure the client to match:

- **Do not enable origin restriction** on this client. Requests come from your Node server, which sends no `Origin` header. See [Best Practices → Origin restriction](../reference/best-practices.md#origin-restriction-browser-integrations).
- **Consider scoping the token to your Grid** and **whitelisting your server's egress IP**. See [Security Enhancements](../getting-started/security.md).

**If the token is suspended or needs replacing**, you do not need a new client:

- **Suspended:** choose **Reinstate** on the client. See [Auto-suspension](../getting-started/security.md#auto-suspension).
- **Replace:** choose **Regenerate Token** on the existing client. The new token replaces the old one, so update **every** integration that uses this client. See [Token rotation](../getting-started/security.md#token-rotation).

After changing the token, update it in the server's environment and **restart the Node service**.

:::danger Keep the token server-side
Never put the token in the map page, client-side JavaScript, a public repository, a browser-visible URL, a "public" build-time environment variable, a screenshot, or a support message.
:::

---

## Step 2 — Run the sample locally

<Tabs groupId="website-stack" queryString>
<TabItem value="html" label="HTML" default>

The Node service serves the HTML page and the proxy together, so one terminal is enough. Clone the `staging` branch and run the server from the repository root.

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

</TabItem>
<TabItem value="php" label="PHP">

Locally, two processes run side by side: Node on port **8080** (the proxy) and PHP's built-in server on port **8082** (the page). The supplied router forwards the page's config and API requests from PHP to Node.

```text
Browser ──► PHP built-in server :8082 ──► Node service :8080 ──► api.airqo.net
            (page + router)                (adds the token)
```

**1. Clone the repository and check your runtimes:**

```bash
git clone --branch staging --single-branch https://github.com/airqo-platform/code-samples.git
cd code-samples
node --version   # 20.12 or newer
php --version
```

**2. Create your `.env` file from the template:**

```powershell
# Windows (PowerShell)
Copy-Item .\php\.env.example .\php\.env
notepad .\php\.env
```

```bash
# macOS / Linux
cp php/.env.example php/.env
```

Replace both credential placeholders. Keep the port and host as shown, because the local router expects Node on `127.0.0.1:8080`:

```ini title="php/.env"
AIRQO_API_TOKEN=YOUR_ACCESS_TOKEN
AIRQO_GRID_ID=YOUR_GRID_ID
PORT=8080
HOST=127.0.0.1
NODE_ENV=production
```

`.env` is listed in the sample's `.gitignore`. Never commit it.

**3. Start Node** in a first terminal from the repository root, and leave it running:

```bash
node php/leaflet-forecast-server.js      # Windows: node .\php\leaflet-forecast-server.js
```

**4. Start PHP** in a second terminal, also from the repository root, and leave it running:

```bash
php -S 127.0.0.1:8082 -t php php/leaflet-forecast-router.php
```

**5. Check each layer, in order:**

| URL | Expected |
|-----|----------|
| [http://127.0.0.1:8080/healthz](http://127.0.0.1:8080/healthz) | `{"status":"ok"}` from Node |
| [http://127.0.0.1:8082/airqo-config](http://127.0.0.1:8082/airqo-config) | `{"gridId":"..."}` through the PHP router |
| [http://127.0.0.1:8082/leaflet-with-forecast.php](http://127.0.0.1:8082/leaflet-with-forecast.php) | The map |

Always open the page through PHP on port 8082, not as a file on disk. The router serves only the map page and the proxy routes, and blocks every other file, including `.env` and the Node source. PHP's built-in server is for local development only.

:::note Shell variables override `.env`
Node loads `.env` from the same folder as `leaflet-forecast-server.js`, but variables already set in the terminal take precedence. If an old token, Grid ID, host, or port is still set from an earlier session, clear it in the Node terminal and restart Node:

```powershell
# Windows (PowerShell)
Remove-Item Env:AIRQO_API_TOKEN, Env:AIRQO_GRID_ID, Env:PORT, Env:HOST -ErrorAction SilentlyContinue
node .\php\leaflet-forecast-server.js
```

```bash
# macOS / Linux
unset AIRQO_API_TOKEN AIRQO_GRID_ID PORT HOST
node php/leaflet-forecast-server.js
```

:::

</TabItem>
</Tabs>

---

## Step 3 — Deploy on your existing website

### How it fits together

The page calls **root-level** paths on its own domain. Your web server must route them to the Node service:

| Path | Routed to Node? | Purpose |
|------|-----------------|---------|
| The map page (e.g. `/air-quality/` or `/leaflet-with-forecast.php`) | No. Served by your web server or PHP. | The map |
| `/airqo-config` | **Yes** | Returns `{"gridId":"..."}` to the page |
| `/airqo-api/` | **Yes** | Allowlisted proxy to `api.airqo.net` |
| `/healthz` | Optional | Returns `{"status":"ok"}` for monitoring |

The page uses **absolute** paths for `/airqo-config` and `/airqo-api/`, so a page placed in a subdirectory still calls the root paths. If your website already uses either path, change the paths in the page and in your proxy rules together. Do not route the whole domain to the Node service.

### Place the files

<Tabs groupId="website-stack" queryString>
<TabItem value="html" label="HTML" default>

- Copy `leaflet-with-forecast.html` to a location your web server serves, e.g. `/var/www/airqo/leaflet-with-forecast.html`.
- Put `leaflet-forecast-server.js` in a private directory, e.g. `/opt/airqo/leaflet-forecast-server.js`.

The Node service can also serve the page itself at `/` and `/leaflet-with-forecast.html` if both files stay together in one directory. On an existing website, it is usually simpler to let your normal web server serve the HTML.

</TabItem>
<TabItem value="php" label="PHP">

- Copy **only** `leaflet-with-forecast.php` into your website's public directory, e.g. `/var/www/example/public/leaflet-with-forecast.php`. Keep your existing PHP handler.
- Put `leaflet-forecast-server.js` **outside** the public directory, e.g. `/opt/airqo/leaflet-forecast-server.js`.

Do not upload the whole `php/` sample folder to the public directory. `leaflet-forecast-router.php` is for local development only, and `.env` and the Node source must never be downloadable. The sample's `.gitignore` does not protect a `.env` file on a public web server.

</TabItem>
</Tabs>

### Run the Node service

Configure these as **service environment variables** in your service manager (e.g. systemd) or deployment platform, with the token in its secret store. Do not paste them as a shell script:

| Variable | Value |
|----------|-------|
| `NODE_ENV` | `production` |
| `HOST` | **Same-host proxy (e.g. Nginx):** `127.0.0.1`, so the service listens internally only. **Managed platform or container:** the address the platform can reach, usually `0.0.0.0`. Set it explicitly: the HTML variant defaults to `0.0.0.0`, the PHP variant to `127.0.0.1`. |
| `PORT` | **Same-host proxy:** `8080`, which must match `proxy_pass`. **Managed platform or container:** leave unset if the platform injects `PORT`, otherwise use the port the platform routes to. |
| `AIRQO_API_TOKEN` | Your access token (store it as a secret) |
| `AIRQO_GRID_ID` | Your city's Grid ID |

Start command: `node /opt/airqo/leaflet-forecast-server.js`

In production the server **refuses to start** unless both `AIRQO_API_TOKEN` and `AIRQO_GRID_ID` are set. Run it under a service manager so it restarts after a crash or reboot.

:::note Port numbers
This guide uses `8080` for the Node service throughout. The `javascript/` README and its Nginx example use `8081`. Any free port works, as long as `PORT` and every `proxy_pass` match.
:::

### Nginx example

Add these locations inside your existing HTTPS `server` block. `proxy_pass` has **no trailing slash**, so the original request path is passed through unchanged. `^~` stops regex locations elsewhere in your config (such as a PHP or static-asset handler) from capturing `/airqo-api/` requests.

<Tabs groupId="website-stack" queryString>
<TabItem value="html" label="HTML" default>

```nginx
location = /air-quality/ {
    alias /var/www/airqo/leaflet-with-forecast.html;
    default_type text/html;
}

location = /airqo-config {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location ^~ /airqo-api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_buffering off;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Optional, for monitoring only:
location = /healthz {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}
```

Change the `alias` if you copied the HTML elsewhere.

</TabItem>
<TabItem value="php" label="PHP">

Keep your existing PHP configuration. PHP keeps serving the page, and only these paths go to Node:

```nginx
location = /airqo-config {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

location ^~ /airqo-api/ {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_buffering off;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
}

# Optional, for monitoring only:
location = /healthz {
    proxy_pass http://127.0.0.1:8080;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
}
```

The page is then available at `https://example.org/leaflet-with-forecast.php`. In a subdirectory such as `/air-quality/leaflet-with-forecast.php` it still calls the root paths above.

</TabItem>
</Tabs>

Validate and reload:

```bash
sudo nginx -t && sudo systemctl reload nginx
```

Apache, IIS, or your hosting platform can provide equivalent reverse-proxy routes. If your website and backend run on different platforms, configure equivalent **same-origin rewrites** from the website to the backend. Do not set up an unrestricted public CORS proxy.

### Embed in an existing page (optional)

Once the standalone map works, you can show it inside any page or CMS HTML block with an iframe. Adjust the `src` path and height:

<Tabs groupId="website-stack" queryString>
<TabItem value="html" label="HTML" default>

```html
<iframe src="/air-quality/"
        title="Air quality forecast map"
        style="width:100%;height:700px;border:0;"
        loading="lazy"></iframe>
```

</TabItem>
<TabItem value="php" label="PHP">

```html
<iframe src="/leaflet-with-forecast.php"
        title="Air quality forecast map"
        style="width:100%;height:700px;border:0;"
        loading="lazy"></iframe>
```

</TabItem>
</Tabs>

`leaflet-forecast-server.js` is a backend program. Never load it with a browser `<script>` tag.

---

## How requests flow

1. The browser loads the map page and requests `/airqo-config`, which returns `{"gridId":"..."}`. The Grid ID is public, but the token is not.
2. The page requests, through the proxy:

   | Browser path (after `/airqo-api`) | Data |
   |-----------------------------------|------|
   | `/api/v2/devices/measurements/grids/{gridId}` | [Current measurements](./recent-measurements.md) |
   | `/api/v2/predict/daily-forecasting/{gridId}` | [Daily forecasts](../forecasts/overview.md#scope-grid-and-cohort-forecasting) |
   | `/api/v2/spatial/heatmaps/{gridId}` | [Heatmap](./spatial-heatmaps.md) image and bounds (only when the heatmap control is switched on) |

3. The Node service **allows only `GET` requests to these three paths for its configured Grid**. It drops any `token` parameter supplied by the browser, adds the server-side token, and passes the AirQo response back.
4. The page joins measurements and forecasts by `site_id`. A site with no matching forecast shows a "no forecast" message.

:::info The proxy is public
The token stays private, but `/airqo-config` and `/airqo-api/` can be called by anyone who can reach your website, and those calls count against your token. If you need to restrict access, add website authentication, rate limits, or caching in front of these routes. See [Security and operations](#security-and-operations).
:::

---

## Using the map

- **Search** finds a monitoring site. Click a marker or a search result to open the site panel.
- **Select a forecast day** to see the expected PM2.5 range and forecast confidence. Expand **Meteorological conditions** for temperature, humidity, and wind, where provided.
- **Heatmap control** (coloured map icon) toggles the AQI heatmap overlay.
- **Site values control** (numbered pin, PHP variant): markers show the rounded PM2.5 reading by default. Use this control to hide or restore the numbers. Units (µg/m³) appear in the site popup.

A blue background shows that a control is active. Forecasts depend on API coverage and matching site identifiers, so a site can have current measurements but no forecast or meteorological fields.

---

## Step 4 — Verify the deployment

Replace `example.org` and the page path with your own:

<Tabs groupId="website-stack" queryString>
<TabItem value="html" label="HTML" default>

```bash
curl -i https://example.org/airqo-config   # {"gridId":"..."}, with no token
curl -i https://example.org/air-quality/   # 200, served over HTTPS
curl -i https://example.org/healthz        # {"status":"ok"} (if exposed)
```

</TabItem>
<TabItem value="php" label="PHP">

```bash
curl -i https://example.org/airqo-config                # {"gridId":"..."}, with no token
curl -i https://example.org/leaflet-with-forecast.php   # 200, served over HTTPS
curl -i https://example.org/healthz                     # {"status":"ok"} (if exposed)
```

</TabItem>
</Tabs>

`/healthz` only confirms that the Node process responds. It does not test your token or data availability, so always check a real data request too.

Then, in a browser:

- [ ] Markers appear on the map
- [ ] Search selects a site, and clicking a site opens its forecast panel
- [ ] The heatmap overlay loads when switched on
- [ ] In the browser's **Network** tab, `/airqo-api/` requests succeed, and no request URL or page source contains your token
- [ ] `leaflet-forecast-server.js` and any `.env` file **cannot** be downloaded from your website

If a panel is empty, inspect the `/airqo-api/` requests in the Network tab. A missing forecast for an individual site can be legitimate, as long as its `site_id` matches the live measurement and the Grid has forecast coverage.

---

## Troubleshooting

These issues are specific to this integration. For API status codes in general, see [Error Codes](../reference/error-codes.md).

| Symptom | What to check |
|---------|---------------|
| Blank page, or `/airqo-config` fails | Is `/airqo-config` routed to the Node service, and is the service running? |
| Node exits at startup | Both `AIRQO_API_TOKEN` and `AIRQO_GRID_ID` must be set in production. Check that `PORT` is free and valid. For `.env` loading, Node must be 20.12 or newer. |
| `401` / `403` on `/airqo-api/` calls | The **server-side** token: is it the real token rather than a template placeholder, not suspended, and on a tier that includes the endpoint (forecasts need Premium)? A stale shell variable can also override `.env`. See [401](../reference/error-codes.md#401-unauthorized) and [403](../reference/error-codes.md#403-forbidden--tier-restriction). |
| `404` with `"AirQo API route not allowed."` | The request is not one of the three allowlisted paths for the configured Grid. Check the Grid ID and your path rewrite. |
| `404` from AirQo | Check the Grid ID. See [404 Not Found](../reference/error-codes.md#404-not-found). |
| `502` `"Could not reach the AirQo API."` | Outbound connectivity from the server to `api.airqo.net`, and the service logs. Upstream requests time out after **30 seconds**. |
| `502` from your web server | The Node service is not running or not on the port in `proxy_pass`. Check `/healthz` on the server itself, e.g. `curl http://127.0.0.1:8080/healthz`. |
| Markers but no forecasts | Measurements and forecasts are separate requests. Check the forecast response and your tier, and confirm that forecast `site_id`s match measurement `site_id`s. |
| Map tiles or libraries do not load | Browser access to `unpkg.com`, `code.jquery.com`, and OpenStreetMap tiles, and your site's Content Security Policy. |
| **PHP, local:** `php` or `node` not found | Install the runtime and add it to your `PATH`. |
| **PHP, local:** `404` on `/airqo-config` | Start PHP with the router command from [Step 2](#step-2--run-the-sample-locally) and open the page on port **8082**. The page shows "Server configuration unavailable" in this case. |
| **PHP, local:** `502` "Cannot reach the Node service on port 8080" | Start Node with `PORT=8080`, enable `allow_url_fopen` in PHP, and clear stale `PORT` / `HOST` shell variables. |

Never paste a real token into a support ticket, screenshot, or browser console.

---

## Security and operations

- Keep credentials out of the public web directory, Git, browser JavaScript, public environment settings, URLs, and screenshots.
- Bind Node to `127.0.0.1` when your web server runs on the same host, and keep the Node port closed to the public.
- Serve the page over **HTTPS** only.
- Store the token in your platform's secret store, restart Node after any credential change, and monitor `/healthz`.
- The proxy routes are publicly callable. Add website authentication or **rate limits** if you need to restrict who can retrieve the data.
- For high-traffic public pages, consider **caching** responses at the proxy (heatmaps and forecasts change infrequently; see [Best Practices → Caching](../reference/best-practices.md#caching)). The sample proxy sends `Cache-Control: no-store, max-age=0`, so HTTP caches such as Nginx `proxy_cache` will not store its responses as-is. To cache public Grid data, either change that header in `leaflet-forecast-server.js` or override it at your cache with an explicit TTL. In Nginx, caching must first be enabled: define a cache zone in the `http` block, e.g. `proxy_cache_path /var/cache/nginx/airqo keys_zone=airqo:10m;`. Then, in the `/airqo-api/` location, turn it on with `proxy_cache airqo;` and add `proxy_ignore_headers Cache-Control;` and `proxy_cache_valid 200 30m;`.
- Review AirQo's API [usage terms and fair usage policy](../../data-access/fair-usage-policy/index.md) before going live.

---

## Attribution

AirQo data is open access **provided it is used with appropriate attribution**. Both variants show a **"Powered by AirQo"** link in the map's bottom-right corner. Keep it visible.

Both variants also blank the OpenStreetMap tile credit, which the [OpenStreetMap tile usage policy](https://operations.osmfoundation.org/policies/tiles/) requires. Restore it before going live:

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
