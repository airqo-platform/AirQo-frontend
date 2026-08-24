import { Metadata } from 'next';
import { headers } from 'next/headers';

import MainLayout from '@/components/layout/MainLayout';
import SingleEvent from '@/features/events/SingleEvent';
import { buildSiteUrl } from '@/lib/siteUrl';
import { eventsService } from '@/services/website';
import type { EventV2 } from '@/types/api';

const getEvent = async (id: string): Promise<EventV2 | null> => {
  try {
    return await eventsService.getEventDetails(id);
  } catch {
    // Never let metadata generation crash; fall back to generic metadata.
    return null;
  }
};

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

  const event = await getEvent(params.id);

  const fallbackTitle = 'AirQo Event | Air Quality Community Engagement';
  const fallbackDescription =
    'Join this AirQo event focused on air quality monitoring, environmental health, and community engagement across African cities. Connect with experts and learn about clean air solutions.';
  const title = event?.title?.trim() || fallbackTitle;
  const description = event?.description?.trim() || fallbackDescription;

  return {
    title,
    description,
    keywords:
      'AirQo event, air quality event, environmental workshop, clean air conference, community engagement, air pollution awareness, African environmental event',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title,
      description: event?.description?.trim()
        ? description
        : 'Join this AirQo event focused on air quality monitoring and community engagement across African cities.',
      images: [
        {
          url: iconUrl,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'AirQo',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AirQoProject',
      title,
      description: event?.description?.trim()
        ? description
        : 'Join this AirQo event focused on air quality monitoring and community engagement.',
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

const page = ({ params }: { params: { id: string } }) => {
  return (
    <MainLayout>
      <SingleEvent slug={params.id} />
    </MainLayout>
  );
};

export default page;
