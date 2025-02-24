import { Metadata } from 'next';

import HomePage from './home/page';

// Define metadata with additional SEO properties
export const metadata: Metadata = {
  title: 'Home | AirQo',
  description: 'Explore the air quality monitoring data and tools by AirQo.',
  keywords: 'air quality, pollution, monitoring, AirQo, environment',
};

export default function Home() {
  return <HomePage />;
}
