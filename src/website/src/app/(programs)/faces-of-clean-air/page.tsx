import type { Metadata } from 'next';

import FacesOfCleanAirPage from '@/views/faces-of-clean-air/FacesOfCleanAirPage';

export const metadata: Metadata = {
  title: 'Faces of Clean Air | AirQo',
  description:
    'See the faces of clean air advocates from the Africa Clean Air Forum. View selfies shared by attendees showcasing air quality readings from their locations.',
  robots: { index: false, follow: false },
};

export default function FacesOfCleanAirRoute() {
  return <FacesOfCleanAirPage />;
}
