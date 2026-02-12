import { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | AirQo Careers',
    default: 'Job Opportunities at AirQo',
  },
  description:
    'Explore career opportunities at AirQo and join our mission to improve air quality across Africa.',
  keywords:
    'AirQo careers, air quality jobs, environmental careers, tech jobs Africa',
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
