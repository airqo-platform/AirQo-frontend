export async function GET() {
  const robots = `User-agent: *
Allow: /

# Prioritize African content and country pages
Allow: /uganda-air-quality
Allow: /kenya-air-quality
Allow: /nigeria-air-quality
Allow: /ghana-air-quality
Allow: /rwanda-air-quality
Allow: /tanzania-air-quality
Allow: /kampala-air-quality
Allow: /nairobi-air-quality
Allow: /lagos-air-quality
Allow: /accra-air-quality

# High-crawl-rate pages
User-agent: Googlebot
Allow: /
Crawl-delay: 0.5

# Optimize for African search
User-agent: Google-Extended
Allow: /

# Block access to admin or sensitive areas
Disallow: /api/
Disallow: /_next/static/
Disallow: /admin/
Disallow: /*.json$

# Allow access to important assets
Allow: /assets/
Allow: /favicon.ico
Allow: /icon.png
Allow: /apple-icon.png
Allow: /web-app-manifest-192x192.png

# Sitemap locations (multiple for better discovery)
Sitemap: https://airqo.net/sitemap.xml
Sitemap: https://www.airqo.net/sitemap.xml
Sitemap: https://airqo.africa/sitemap.xml

# Additional directives for better SEO
User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: Slurp
Crawl-delay: 1

User-agent: DuckDuckBot
Allow: /
Crawl-delay: 1

# Social media crawlers (for rich previews)
User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: LinkedInBot
Allow: /

User-agent: WhatsApp
Allow: /

# African-specific bots (if any)
User-agent: *
Crawl-delay: 2`;

  return new Response(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
