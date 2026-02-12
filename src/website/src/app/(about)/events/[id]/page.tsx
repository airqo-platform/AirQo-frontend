import { Metadata } from 'next';

import SingleEvent from '@/views/events/SingleEvent';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  // You can fetch event details here if needed
  // For now, providing generic metadata
  return {
    title: `AirQo Event | Air Quality Community Engagement`,
    description:
      'Join this AirQo event focused on air quality monitoring, environmental health, and community engagement across African cities. Connect with experts and learn about clean air solutions.',
    keywords:
      'AirQo event, air quality event, environmental workshop, clean air conference, community engagement, air pollution awareness, African environmental event',
    alternates: {
      canonical: `https://airqo.net/events/${params.id}`,
    },
    openGraph: {
      type: 'website',
      url: `https://airqo.net/events/${params.id}`,
      title: 'AirQo Event | Air Quality Community Engagement',
      description:
        'Join this AirQo event focused on air quality monitoring and community engagement across African cities.',
      images: [
        {
          url: 'https://airqo.net/icon.png',
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
      images: ['https://airqo.net/icon.png'],
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
