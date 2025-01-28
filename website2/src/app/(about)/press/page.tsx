import { Metadata } from 'next';

import PressPage from '@/views/press/PressPage';

export const metadata: Metadata = {
  title: 'Press | AirQo in the News',
  description:
    'Stay updated with the latest news and media coverage about AirQo’s efforts to monitor and improve air quality in Africa.',
  keywords:
    'AirQo press, AirQo news, air quality news, AirQo media, air pollution in Africa, AirQo coverage',
};

const page = () => {
  return (
    <div>
      <PressPage />
    </div>
  );
};

export default page;
