export async function GET() {
  const robots = `User-agent: *
Allow: /

# High-crawl-rate pages
User-agent: Googlebot
Allow: /
Crawl-delay: 1

# Block access to admin or sensitive areas if any
Disallow: /api/
Disallow: /_next/
Disallow: /admin/

# Allow access to important assets
Allow: /assets/
Allow: /favicon.ico
Allow: /icon.png
Allow: /apple-icon.png

# Sitemap location
Sitemap: https://airqo.net/sitemap.xml

# Additional directives for better SEO
User-agent: Bingbot
Crawl-delay: 2

User-agent: Slurp
Crawl-delay: 2`;

  return new Response(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
