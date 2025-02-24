export async function GET() {
  const robots = `
User-agent: *
Allow: /
Sitemap: https://airqo.net/sitemap.xml
  `;

  return new Response(robots, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
