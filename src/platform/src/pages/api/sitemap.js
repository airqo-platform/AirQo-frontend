// pages/api/sitemap.js
import { SitemapStream, streamToPromise } from 'sitemap';

export default async (req, res) => {
  try {
    // Set response header
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');

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

    // Send the XML to the browser
    res.write(sitemap);
    res.end();
  } catch (error) {
    console.log(error);
    res.statusCode = 500;
    res.end();
  }
};
