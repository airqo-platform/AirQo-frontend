import { Metadata } from 'next';
import React from 'react';

import FormPage from './FormPage';

export const metadata: Metadata = {
  title: 'Contact Form | Get in Touch with AirQo',
  description:
    "Fill out our contact form to get in touch with AirQo. Whether you have questions about our air quality solutions, need support, or want to explore partnerships, we're here to help.",
  keywords:
    'AirQo contact form, get in touch, air quality inquiry, partnership request, support form, contact AirQo team',
  robots: {
    index: false,
    follow: true,
  },
};

const page = () => {
  return (
    <div>
      <FormPage />
    </div>
  );
};

export default page;
