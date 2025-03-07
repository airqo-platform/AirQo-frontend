import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Events | AirQo',
  description:
    'Explore upcoming and past events hosted by AirQo to raise awareness and promote actions for air quality improvement.',
  keywords:
    'AirQo events, air quality events, environmental events, AirQo conferences, air quality workshops',
};

export default function EventsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
