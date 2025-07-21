import type { Metadata } from 'next';

import CalibratePage from '@/views/products/CalibratePage';

export const metadata: Metadata = {
  title: 'AirQalibrate | Advanced Air Quality Sensor Calibration',
  description:
    'Ensure accuracy and reliability of air quality measurements with AirQalibrate - our specialized calibration platform designed for low-cost sensors in African environmental conditions.',
  keywords:
    'AirQalibrate, air quality calibration, sensor calibration, pollution monitor calibration, AirQo calibration tools, environmental sensor accuracy, air quality measurement accuracy, African air monitoring calibration',
  alternates: {
    canonical: 'https://airqo.net/products/calibrate',
  },
  openGraph: {
    type: 'website',
    title: 'AirQalibrate | Advanced Air Quality Sensor Calibration',
    description:
      'Ensure accuracy and reliability of air quality measurements with AirQalibrate - our specialized calibration platform for low-cost sensors.',
    url: 'https://airqo.net/products/calibrate',
    images: [
      {
        url: 'https://airqo.net/icon.png',
        width: 1200,
        height: 630,
        alt: 'AirQalibrate Sensor Calibration Platform',
      },
    ],
    siteName: 'AirQo',
  },
};

const page = () => {
  return (
    <div>
      <CalibratePage />
    </div>
  );
};

export default page;
