# AirQo AI Platform

## Overview

AirQo AI is an advanced air quality monitoring and forecasting platform designed to efficiently collect, analyze, and forecast air quality data across Africa. Our mission is to provide accurate insights and raise awareness about air pollution in African cities.

AirQo AI Platform [https://ai.airqo.net/](https://ai.airqo.net/).
 
## Features

### Embed a grid map on any website

After deploying this frontend, website owners can paste this HTML and replace
`YOUR_GRID_ID` with their AirQo grid ID:

```html
<iframe
  src="https://ai.airqo.net/website-map-integration?grid_id=YOUR_GRID_ID"
  title="Kampala Air Quality Map"
  style="width:100%;height:800px;border:0;display:block;"
  loading="lazy"
></iframe>
```

Use the hostname serving your deployed frontend if it differs from the example.
The homepage's embed code generator automatically uses the current browser
origin: localhost during development, the Vercel preview hostname on previews,
and your production hostname on the published site. The copied URL remains tied
to that deployment; generate code from production for a permanent public embed.
No PHP, JavaScript installation, API token, or login is required on the embedding
website. The map fills the iframe, fits the grid's monitoring sites, and shows
PM2.5 concentrations and AQI categories in marker popups. The initial
readings load when the iframe opens; reload it to fetch newer readings.
The embedded document preserves the supplied `map.html` layout: a full-screen
map, place search, numbered site markers, left-side controls, an AQI legend,
and a responsive forecast panel. Its HTML lives in `src/embed/map.html` and is
served by `/website-map-integration`; Vercel file tracing includes the document.
Use the heatmap control to display the grid's spatial air quality overlay and
the site-values control to toggle marker values. Select a monitoring site for its 7-day
forecast, expected concentration range, confidence, weather, and health guidance.
Forecast and heatmap availability depends on the grid; failures in these layers
leave measured site readings visible. Reload the iframe to retry unavailable layers.

The server proxy also permits grid-specific `predict/daily-forecasting/{grid_id}`
and `spatial/heatmaps/{grid_id}`, matching `php/leaflet-with-forecast.php`.
These three grid endpoints share a one-hour Next.js server Data Cache across
visitors. Each grid, endpoint, query (including page/limit), and server token has
its own cache entry. Simultaneous requests on one server instance are coalesced.
HTTP/API failures and malformed responses are not cached. Other routes and POSTs
retain their existing uncached behavior. After one hour, Next.js revalidates on
the next request and may serve the previous entry while refreshing; failed
refreshes can retain the last successful entry. Measurements also have the
reference map's one-hour browser cache. No cron or additional database is needed.

The frontend host must configure `API_TOKEN` on the server. The map calls the
existing `/api/airqo` proxy for `devices/measurements/grids/{grid_id}`, following
the grid endpoint used in `php/retrieve-air-quality-data.php`. Credentials stay
on the server. Test locally with
`http://localhost:3000/website-map-integration/?grid_id=YOUR_GRID_ID`.

The deployed embed route sets `Content-Security-Policy: frame-ancestors 'self' http: https:`
to allow HTTP and HTTPS websites to frame it. During `npm run dev`, this header
is omitted so standalone `file://` HTML test pages can embed the local map.
Restart the dev server after changing `next.config.ts`. For production or Vercel
previews, serve your test HTML over HTTP (for example `python -m http.server 8080`
from its folder and open `http://localhost:8080/your-page.html`); file pages have
opaque origins that a framing policy cannot reliably allow.
Ensure your hosting/CDN does not add an
`X-Frame-Options: DENY` or `SAMEORIGIN` header, or an additional restrictive
`frame-ancestors` policy to this route. Other frontend routes are unaffected.
The parent website's CSP must also allow the frontend origin in `frame-src`.

- **Interactive Map**: Real-time visualization of air quality data across various locations.
- **Site Locator**: AI-powered tool to suggest optimal locations for new air quality sensors.
- **Site Categorization**: Automatically categorize sites based on their characteristics and surrounding environment.
- **Air Quality Reports**: Generate comprehensive reports with historical data and trends.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/airqo-ai-platform.git
   cd airqo-ai-platform
   ```

2. Install dependencies:
   ```
   npm install
   # or
   yarn install
   ```

3. Set up environment variables:
   Copy `.env.example` to `.env.local` and provide the values needed by your environment:
   ```env
   API_TOKEN=your_api_token_here
   NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token_here
   NEXT_PUBLIC_AQI_API_URL=your_aqi_heatmap_endpoint_here
   NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=your_google_analytics_id_here
   ```

   `API_TOKEN` is server-only. Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

4. Run the development server:
   ```
   npm run dev
   # or
   yarn dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### Code Quality and Build

Before committing or deploying changes, ensure code quality and build readiness by running:
   ```
   npm run lint   # Lint the codebase
   npm run build  # Create an optimized production build
   ```

## Usage

### Home Page
The home page displays an interactive map with real-time air quality data. Users can:
- Search for specific locations
- View air quality information for different sites
- Toggle between street and satellite map views

### Locate Page
Use the Site Locator tool to find optimal locations for new air quality sensors:
1. Draw a polygon on the map to define the area of interest
2. Set parameters such as the number of sensors and minimum distance between them
3. Add must-have locations if needed
4. Submit the request to receive AI-generated suggestions for sensor placements

### Categorize Page
Categorize sites based on their characteristics:
1. Click on the map or upload a CSV file with site coordinates
2. View the AI-generated category for each site
3. Export the results as a CSV file

### Reports Page
Generate comprehensive air quality reports:
1. Select a grid and date range
2. View visualizations of air quality trends
3. Access AI-generated insights and recommendations


## Deployment

The easiest way to deploy your AirQo AI Platform is to use the [Vercel Platform](https://vercel.com) from the creators of Next.js.

### Deploying on Vercel

1. Sign up for a Vercel account if you haven't already: [https://vercel.com/signup](https://vercel.com/signup)

2. Install the Vercel CLI:
   ```
   npm i -g vercel
   ```

3. Run the following command from your project's root directory:
   ```
   vercel
   ```

4. Follow the prompts to link your project to Vercel and configure your deployment settings.

5. Once deployed, Vercel will provide you with a URL for your live application.

### Continuous Deployment

Vercel supports continuous deployment with GitHub, GitLab, and Bitbucket. When you push changes to your repository, Vercel will automatically deploy the updates.

To set up continuous deployment:

1. Connect your Git repository to your Vercel project.
2. Configure your project settings on the Vercel dashboard.
3. Push changes to your repository, and Vercel will automatically build and deploy your updates.

For more detailed information about deploying Next.js applications on Vercel, check out the [Next.js deployment documentation](https://nextjs.org/docs/deployment).

## Technologies Used

- Next.js
- React
- TypeScript
- Tailwind CSS
- Leaflet (for maps)
- Shadcn UI components
- Lucide React icons

## Contributing

We welcome contributions to the AirQo AI Platform! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature-name`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature-name`)
6. Create a new Pull Request

Please ensure your code follows the project's coding standards and includes appropriate tests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

For any questions or support, please contact us at support@airqo.net or visit our website [https://www.airqo.net](https://www.airqo.net).
