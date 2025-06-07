import { SitemapStream, streamToPromise } from 'sitemap';

export async function GET() {
  try {
    // Define site URLs
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || 'https://analytics.airqo.net';

    // Create a stream to write to
    const smStream = new SitemapStream({
      hostname: siteUrl,
    });

    // List all the pages you want to include in your sitemap
    const pages = [
      { url: '/', changefreq: 'monthly', priority: 1 },
      { url: '/home', changefreq: 'monthly', priority: 0.8 },
      { url: '/map', changefreq: 'weekly', priority: 0.8 },
      { url: '/analytics', changefreq: 'weekly', priority: 0.7 },
      { url: '/collocation', changefreq: 'monthly', priority: 0.7 },
      { url: '/settings', changefreq: 'monthly', priority: 0.6 },
      // add any other pages you want to include
    ];

    // Add each URL to the stream
    pages.forEach((page) => {
      smStream.write(page);
    });

    // End the stream
    smStream.end();

    // Generate the XML
    const sitemap = await streamToPromise(smStream).then((sm) => sm.toString());

    // Return the XML response
    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    console.log(error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
