import { NextResponse } from 'next/server';

export function GET() {
  // Get the base URL, with fallback
  const baseUrl = (
    process.env.NEXT_PUBLIC_ORIGINAL_PLATFORM || 'https://analytics.airqo.net'
  ).replace(/\/$/, '');

  // Generate the robots.txt content
  const robotsTxt = `User-agent: *
Disallow: /api/

# Allow all popular search engines
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Slurp
Allow: /

User-agent: DuckDuckBot
Allow: /

User-agent: Baiduspider
Allow: /

User-agent: YandexBot
Allow: /

# Block other crawlers and bots
User-agent: *
Allow: /

# Disallow api folder access
Disallow: /pages/api/
Disallow: /api/

# Allow local development
Host: localhost

# Domain specific rules
Host: analytics.airqo.net
Host: staging-analytics.airqo.net

Sitemap: ${baseUrl}/sitemap.xml`.trim();

  return new NextResponse(robotsTxt, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
