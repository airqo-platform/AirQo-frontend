import { Metadata } from 'next';

import DetailsPage from '@/views/careers/DetailsPage';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  // You can fetch career details here if needed
  // For now, providing generic metadata
  return {
    title: `Career Opportunity | AirQo Careers`,
    description:
      'Explore this exciting career opportunity at AirQo. Join our mission to improve air quality across African cities through innovative technology and community engagement.',
    keywords:
      'AirQo career opportunity, job opening, environmental careers, air quality jobs, tech jobs Africa, AirQo employment',
    alternates: {
      canonical: `https://airqo.net/careers/${params.id}`,
    },
    openGraph: {
      type: 'website',
      url: `https://airqo.net/careers/${params.id}`,
      title: 'Career Opportunity | AirQo Careers',
      description:
        'Explore this exciting career opportunity at AirQo. Join our mission to improve air quality across African cities.',
      images: [
        {
          url: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728295735/website/photos/about/teamImage_ganc1y.png',
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
