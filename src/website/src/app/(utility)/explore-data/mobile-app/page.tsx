import MobileAppPage from '@/features/explore-data/MobileAppPage';
import { generateMetadata, generateViewport } from '@/lib/metadata';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

const appPageImage = optimizeCloudinaryUrl(
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132440/website/photos/explore/man-download-app_qg1pt2.png',
  { width: 1200, height: 630, crop: 'fill', format: 'jpg' },
);

export const metadata = generateMetadata({
  title: 'Get the AirQo mobile app',
  description:
    'Use the AirQo app to check local air quality readings and learn more about the air around you.',
  url: '/explore-data/mobile-app',
  image: {
    url: appPageImage,
    alt: 'A person using the AirQo air quality app',
    width: 1200,
    height: 630,
    type: 'image/jpeg',
  },
});

export const viewport = generateViewport();

const page = () => <MobileAppPage />;

export default page;
