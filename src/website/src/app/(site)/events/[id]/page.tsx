import { Metadata } from 'next';
import { headers } from 'next/headers';

import MainLayout from '@/components/layout/MainLayout';
import SingleEvent from '@/features/events/SingleEvent';
import {
  cleanMetadataText,
  DEFAULT_METADATA,
  resolveMetadataImage,
} from '@/lib/metadata';
import { buildSiteUrl, getPrimarySiteUrl } from '@/lib/siteUrl';
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
  const requestProtocol =
    requestHeaders.get('x-forwarded-proto') ??
    (process.env.NODE_ENV === 'development' ? 'http' : 'https');
  const canonicalUrl = buildSiteUrl(
    `/events/${encodeURIComponent(params.id)}`,
    undefined,
    requestHost,
    requestProtocol,
  );
  const siteUrl = getPrimarySiteUrl(requestHost, requestProtocol);

  const event = await getEvent(params.id);

  const fallbackTitle = 'AirQo event';
  const fallbackDescription =
    'Find details about this AirQo event and its air quality community programme.';
  const title = event?.title?.trim()
    ? `${event.title.trim()} | AirQo`
    : fallbackTitle;
  const description = cleanMetadataText(
    event?.description || event?.event_details,
    fallbackDescription,
  );
  const imageUrl = resolveMetadataImage(
    event?.event_image_url ||
      event?.event_image ||
      event?.background_image_url ||
      event?.background_image,
    siteUrl,
  );

  return {
    title: { absolute: title },
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
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: event?.title?.trim() || DEFAULT_METADATA.defaultImage.alt,
        },
      ],
      siteName: 'AirQo',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AirQoProject',
      title,
      description,
      images: [
        {
          url: imageUrl,
          alt: event?.title?.trim() || DEFAULT_METADATA.defaultImage.alt,
        },
      ],
    },
    robots: {
      index: Boolean(event),
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
