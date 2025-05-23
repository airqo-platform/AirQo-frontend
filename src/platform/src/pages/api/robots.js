import { stripTrailingSlash } from '../../core/utils/strings';
export default function handler(req, res) {
  // Set cache control headers
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
  res.setHeader('Content-Type', 'text/plain');

  // Generate the robots.txt content
  const robotsTxt = `
User-agent: *
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

Sitemap: ${stripTrailingSlash(process.env.NEXT_PUBLIC_ORIGINAL_PLATFORM) || 'https://analytics.airqo.net'}/sitemap.xml
  `;

  res.status(200).send(robotsTxt);
}
