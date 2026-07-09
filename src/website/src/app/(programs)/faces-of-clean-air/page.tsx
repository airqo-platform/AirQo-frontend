import FacesOfCleanAirPage from '@/features/faces-of-clean-air/FacesOfCleanAirPage';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'Faces of Clean Air | AirQo',
  description:
    'See the faces of clean air advocates from the Africa Clean Air Forum. View selfies shared by attendees showcasing air quality readings from their locations.',
  keywords:
    'Faces of Clean Air, Africa Clean Air Forum selfies, air quality advocates, PM2.5 readings Africa, clean air community, air quality conference photos',
  url: '/faces-of-clean-air',
});

export default function FacesOfCleanAirRoute() {
  return <FacesOfCleanAirPage />;
}
