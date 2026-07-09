import LandingScreen from '@/features/clean-air-forum-2026/screens/LandingScreen';
import {
  generateMetadata as createMetadata,
  generateViewport,
} from '@/lib/metadata';

export const metadata = createMetadata({
  title: 'Africa Clean Air Forum 2026',
  description:
    'Live event experience for the Africa Clean Air Forum 2026 stall.',
  url: '/africa-clean-air-forum-2026',
});

export const viewport = generateViewport();

const page = () => {
  return <LandingScreen />;
};

export default page;
