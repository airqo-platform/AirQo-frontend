import { MetadataRoute } from 'next';

import { getPrimarySiteUrl } from '@/lib/siteUrl';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getPrimarySiteUrl();

  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
