/**
 * Static routes to be included in the sitemap.xml file
 *
 */
const staticRoutes = [
  '',
  'about',
  'about-us',
  'careers',
  'events',
  'press',
  'resources',
  'clean-air-forum',
  'clean-air-forum/about',
  'clean-air-forum/glossary',
  'clean-air-forum/logistics',
  'clean-air-forum/partners',
  'clean-air-forum/program-committee',
  'clean-air-forum/resources',
  'clean-air-forum/sessions',
  'clean-air-forum/speakers',
  'clean-air-forum/sponsorships',
  'clean-air-network',
  'clean-air-network/events',
  'clean-air-network/membership',
  'clean-air-network/resources',
  'contact',
  'explore-data',
  'explore-data/mobile-app',
  'home',
  'legal/airqo-data',
  'legal/payment-refund-policy',
  'legal/privacy-policy',
  'legal/terms-of-service',
  'partners',
  'products',
  'products/analytics',
  'products/api',
  'products/calibrate',
  'products/mobile-app',
  'products/monitor',
  'solutions',
  'solutions/african-cities',
  'solutions/communities',
  'solutions/research',
];

export async function GET() {
  const baseUrl = 'https://airqo.net';

  // Build the <urlset> entries dynamically from the static routes
  const urlsXml = staticRoutes
    .map((route) => {
      // Remove leading/trailing slashes, then create the full URL
      const path = route.replace(/^\/|\/$/g, '');
      return `
        <url>
          <loc>${baseUrl}/${path}</loc>
          <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
          <priority>0.80</priority>
        </url>
      `;
    })
    .join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urlsXml}
  </urlset>`;

  return new Response(sitemap, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
