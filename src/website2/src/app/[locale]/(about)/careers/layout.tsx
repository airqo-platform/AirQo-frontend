import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Careers | Join the AirQo Team',
  description:
    'Explore career opportunities at AirQo and join us in improving air quality across Africa. See how you can contribute to our mission and make an impact.',
  keywords:
    'AirQo careers, jobs at AirQo, air quality jobs, environmental jobs, AirQo team, work at AirQo',
};

export default function CareersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
