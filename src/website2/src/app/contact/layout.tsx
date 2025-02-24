import { Metadata } from 'next';
import React from 'react';

import Navbar from '@/components/layouts/Navbar';

export const metadata: Metadata = {
  title: 'Contact Us | AirQo - Get in Touch for Air Quality Solutions',
  description:
    'Reach out to AirQo for inquiries, partnerships, or support. Whether you are looking for air quality data, seeking collaboration, or need assistance with our tools and services, our team is ready to assist.',
  keywords:
    'Contact AirQo, air quality contact, AirQo support, AirQo inquiries, air pollution solutions contact, environmental health contact, air quality partnerships, AirQo office contact',
};

type ContactLayoutProps = {
  children: React.ReactNode;
};

const ContactLayout: React.FC<ContactLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden">
      <div className="w-full border-b border-gray-200 sticky top-0 z-50">
        <Navbar />
      </div>
      <main>{children}</main>
    </div>
  );
};

export default ContactLayout;
