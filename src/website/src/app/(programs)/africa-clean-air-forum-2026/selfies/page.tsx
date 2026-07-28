import SelfiesScreen from '@/features/clean-air-forum-2026/screens/SelfiesScreen';
import { generateMetadata } from '@/lib/metadata';

export const metadata = generateMetadata({
  title: 'Selfies | Faces of Clean Air',
  description:
    'View selfies shared by attendees of the Africa Clean Air Forum showcasing air quality readings from their locations.',
  keywords:
    'Faces of Clean Air selfies, Africa Clean Air Forum photos, air quality advocates, PM2.5 readings Africa, clean air community',
  url: '/africa-clean-air-forum-2026/selfies',
});

export default function SelfiesRoute() {
  return <SelfiesScreen />;
}
