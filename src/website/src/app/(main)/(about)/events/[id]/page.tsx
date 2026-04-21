import { Metadata } from 'next';
import { headers } from 'next/headers';

import { buildSiteUrl } from '@/lib/siteUrl';
import SingleEvent from '@/views/events/SingleEvent';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const requestHeaders = await headers();
  const requestHost =
    requestHeaders.get('x-forwarded-host') ?? requestHeaders.get('host');
  const canonicalUrl = buildSiteUrl(
    `/events/${encodeURIComponent(params.id)}`,
    requestHost,
  );
  const iconUrl = buildSiteUrl('/icon.png', requestHost);

  // You can fetch event details here if needed
  // For now, providing generic metadata
  return {
    title: `AirQo Event | Air Quality Community Engagement`,
    description:
      'Join this AirQo event focused on air quality monitoring, environmental health, and community engagement across African cities. Connect with experts and learn about clean air solutions.',
    keywords:
      'AirQo event, air quality event, environmental workshop, clean air conference, community engagement, air pollution awareness, African environmental event',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: 'AirQo Event | Air Quality Community Engagement',
      description:
        'Join this AirQo event focused on air quality monitoring and community engagement across African cities.',
      images: [
        {
          url: iconUrl,
          width: 1200,
          height: 630,
          alt: 'AirQo Event',
        },
      ],
      siteName: 'AirQo',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AirQoProject',
      title: 'AirQo Event | Air Quality Community Engagement',
      description:
        'Join this AirQo event focused on air quality monitoring and community engagement.',
      images: [iconUrl],
    },
    robots: {
      index: true,
      follow: true,
    },
    other: {
      'revisit-after': '7 days',
    },
  };
}

const page = ({ params }: { params: any }) => {
  return (
    <div>
      <SingleEvent id={params.id} />
    </div>
  );
};

export default page;
