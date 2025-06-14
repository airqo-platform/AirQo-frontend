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
      { url: '/user/Home', changefreq: 'monthly', priority: 0.8 },
      { url: '/user/map', changefreq: 'weekly', priority: 0.8 },
      { url: '/user/analytics', changefreq: 'weekly', priority: 0.7 },
      { url: '/user/collocation', changefreq: 'monthly', priority: 0.7 },
      { url: '/user/settings', changefreq: 'monthly', priority: 0.6 },
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
    // eslint-disable-next-line no-undef
    return new Response(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.log(error);
    // eslint-disable-next-line no-undef
    return new Response('Internal Server Error', { status: 500 });
  }
}
