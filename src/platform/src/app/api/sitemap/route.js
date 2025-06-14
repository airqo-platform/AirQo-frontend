import { SitemapStream, streamToPromise } from 'sitemap';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { getSiteUrl } from '@/lib/envConstants';

export async function GET() {
  try {
    // Define site URLs
    const siteUrl = getSiteUrl();

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
    const sitemap = await streamToPromise(smStream).then((sm) => sm.toString()); // Return the XML response
    return new NextResponse(sitemap, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    });
  } catch (error) {
    logger.error('Sitemap generation error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
