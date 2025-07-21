import { Metadata } from 'next';
import React from 'react';

import ContactPage from './ContactPage';

export const metadata: Metadata = {
  title: "Contact AirQo | Get in Touch with Africa's Air Quality Experts",
  description:
    'Contact AirQo for air quality monitoring solutions, partnerships, or support. Reach out to our team of experts working to improve air quality across African cities.',
  keywords:
    'contact AirQo, air quality support, AirQo partnerships, air quality consultation, AirQo team contact, environmental monitoring support, air quality solutions inquiry',
  alternates: {
    canonical: 'https://airqo.net/contact',
  },
  openGraph: {
    type: 'website',
    url: 'https://airqo.net/contact',
    title: "Contact AirQo | Get in Touch with Africa's Air Quality Experts",
    description:
      'Contact AirQo for air quality monitoring solutions, partnerships, or support. Reach out to our team of experts working to improve air quality across African cities.',
    images: [
      {
        url: 'https://airqo.net/icon.png',
        width: 1200,
        height: 630,
        alt: 'Contact AirQo',
      },
    ],
    siteName: 'AirQo',
  },
};

const page = () => {
  return (
    <div>
      <ContactPage />
    </div>
  );
};

export default page;
