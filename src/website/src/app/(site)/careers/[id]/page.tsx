import { Metadata } from 'next';
import { headers } from 'next/headers';

import DetailsPage from '@/features/careers/DetailsPage';
import { buildSiteUrl } from '@/lib/siteUrl';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';
import { careersService } from '@/services/website';
import type { Career } from '@/types/api';

const careerOgImage = optimizeCloudinaryUrl(
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757015506/website/photos/about/teamImage_ganc1y_tyu1ft.webp',
  { width: 1200 },
);

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
  const canonicalUrl = buildSiteUrl(
    `/careers/${encodeURIComponent(params.id)}`,
    requestHost,
  );

  const career = await getCareer(params.id);

  const fallbackTitle = 'Career Opportunity | AirQo Careers';
  const fallbackDescription =
    'Explore this exciting career opportunity at AirQo. Join our mission to improve air quality across African cities through innovative technology and community engagement.';
  const title = career?.title?.trim() || fallbackTitle;
  const description = career?.description?.trim() || fallbackDescription;

  return {
    title,
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
          url: careerOgImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      siteName: 'AirQo',
    },
    robots: {
      index: true,
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
