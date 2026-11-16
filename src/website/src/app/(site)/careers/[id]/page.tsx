import { Metadata } from 'next';
import { headers } from 'next/headers';

import DetailsPage from '@/features/careers/DetailsPage';
import {
  cleanMetadataText,
  DEFAULT_METADATA,
  resolveMetadataImage,
} from '@/lib/metadata';
import { buildSiteUrl, getPrimarySiteUrl } from '@/lib/siteUrl';
import { careersService } from '@/services/website';
import type { Career } from '@/types/api';

const getCareer = async (id: string): Promise<Career | null> => {
  try {
    return await careersService.getCareerDetails(id);
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
    `/careers/${encodeURIComponent(params.id)}`,
    undefined,
    requestHost,
    requestProtocol,
  );
  const siteUrl = getPrimarySiteUrl(requestHost, requestProtocol);

  const career = await getCareer(params.id);

  const fallbackTitle = 'Career Opportunity | AirQo Careers';
  const fallbackDescription =
    'Explore this career opportunity at AirQo and learn how to apply.';
  const title = career?.title?.trim()
    ? `${career.title.trim()} | AirQo Careers`
    : fallbackTitle;
  const description = cleanMetadataText(
    career?.description || career?.descriptions?.[0]?.description,
    fallbackDescription,
  );
  const imageUrl = resolveMetadataImage(
    DEFAULT_METADATA.defaultImage.url,
    siteUrl,
  );

  return {
    title: { absolute: title },
    description,
    keywords:
      'AirQo career opportunity, job opening, environmental careers, air quality jobs, tech jobs Africa, AirQo employment',
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
          alt: DEFAULT_METADATA.defaultImage.alt,
        },
      ],
      siteName: 'AirQo',
    },
    twitter: {
      card: 'summary_large_image',
      site: '@AirQoProject',
      title,
      description,
      images: [{ url: imageUrl, alt: DEFAULT_METADATA.defaultImage.alt }],
    },
    robots: {
      index: career?.is_active !== false,
      follow: true,
    },
  };
}

const page = ({ params }: { params: { id: string } }) => {
  return (
    <div>
      <DetailsPage id={params.id} />
    </div>
  );
};

export default page;
