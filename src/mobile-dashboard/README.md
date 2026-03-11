# AirQo Mobile Survey Dashboard

An internal Next.js dashboard for managing AirQo mobile app surveys and viewing research response data.

## Getting Started

### Prerequisites

- Node.js 18+
- Access to AirQo API credentials

### Environment Variables

Create a `.env.local` file in `src/mobile-dashboard/`:

```env
# AirQo API base URL (required)
NEXT_PUBLIC_AIRQO_API_BASE_URL=https://api.airqo.net

# Auth provider (e.g. airqo, google)
NEXT_PUBLIC_AUTH_PROVIDER=airqo
```

### Run the Development Server

From `src/mobile-dashboard/`:

```bash
npm install
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### App Entry Point

The main page is at `src/app/page.tsx` (Survey Generator).
Research data is at `src/app/research/page.tsx`.

### Auth & API Proxy Flow

All AirQo API requests are proxied through Next.js API routes under `src/app/api/` to keep auth tokens server-side and avoid CORS issues. The frontend fetches `/api/surveys`, `/api/responses`, etc., which forward to `NEXT_PUBLIC_AIRQO_API_BASE_URL` with the Authorization header.

To configure auth locally:
1. Sign in via the `/` page using your AirQo credentials.
2. The auth token is stored in context and passed as the `Authorization` header to all API calls.
3. Set `NEXT_PUBLIC_AIRQO_API_BASE_URL` to point to the dev/staging API or a local proxy as needed.

## Build

```bash
npm run build
npm start
```
