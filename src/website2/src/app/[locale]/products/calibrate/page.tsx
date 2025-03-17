import type { Metadata } from 'next';

import CalibratePage from '@/views/products/CalibratePage';

export const metadata: Metadata = {
  title: 'Air Quality Sensor Calibration Tools',
  description:
    "Ensure accurate air quality measurements with AirQo's specialized calibration tools and methodologies designed for the unique environmental conditions of African cities.",
  keywords:
    'air quality calibration, sensor calibration, pollution monitor calibration, AirQo calibration tools, environmental sensor accuracy, air quality measurement, African air monitoring',
  alternates: {
    canonical: 'https://airqo.net/products/calibrate',
  },
  openGraph: {
    title: 'Air Quality Sensor Calibration Tools | AirQo Products',
    description:
      "Ensure accurate air quality measurements with AirQo's specialized calibration tools for African environmental conditions.",
    url: 'https://airqo.net/products/calibrate',
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
