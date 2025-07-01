import { Metadata } from 'next';
import React from 'react';

import SuccessPage from './SuccessPage';

export const metadata: Metadata = {
  title: 'Message Sent Successfully | AirQo Contact',
  description:
    'Thank you for contacting AirQo! Your message has been successfully sent. Our team will get back to you soon regarding your air quality inquiry or partnership request.',
  keywords:
    'contact success, message sent, AirQo contact confirmation, inquiry submitted, partnership request sent',
  robots: {
    index: false,
    follow: false,
  },
};

const page = () => {
  return (
    <div>
      <SuccessPage />
    </div>
  );
};

export default page;
