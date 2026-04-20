import { Metadata } from 'next';
import { headers } from 'next/headers';

import { buildSiteUrl } from '@/lib/siteUrl';
import DetailsPage from '@/views/careers/DetailsPage';

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

  // You can fetch career details here if needed
  // For now, providing generic metadata
  return {
    title: `Career Opportunity | AirQo Careers`,
    description:
      'Explore this exciting career opportunity at AirQo. Join our mission to improve air quality across African cities through innovative technology and community engagement.',
    keywords:
      'AirQo career opportunity, job opening, environmental careers, air quality jobs, tech jobs Africa, AirQo employment',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: 'website',
      url: canonicalUrl,
      title: 'Career Opportunity | AirQo Careers',
      description:
        'Explore this exciting career opportunity at AirQo. Join our mission to improve air quality across African cities.',
      images: [
        {
          url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1757015506/website/photos/about/teamImage_ganc1y_tyu1ft.webp',
          width: 1200,
          height: 630,
          alt: 'AirQo Career Opportunity',
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

const page = ({ params }: { params: any }) => {
  return (
    <div>
      <DetailsPage id={params.id} />
    </div>
  );
};

export default page;
