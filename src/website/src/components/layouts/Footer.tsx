'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

import mainConfig from '@/configs/mainConfigs';

import CountrySelectorDialog from '../sections/footer/CountrySelectorDialog';
import MonitorDisplay from '../sections/footer/MonitorDisplay';
import FooterDocumentHub from './FooterDocumentHub';
import FooterLinkColumns from './FooterLinkColumns';
import ScrollToTopButton from './ScrollToTopButton';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="WebsiteFooter"
      className={`relative py-8 px-4 ${mainConfig.containerClass} text-[14px]`}
    >
      <ScrollToTopButton />
      {/* Top Section with Grid */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Logo and Social Media */}
        <div className="flex flex-col space-y-4">
          <div>
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png"
              alt="AirQo"
              width={70}
              height={60}
            />
            <h1 className="text-gray-700 font-semibold mt-4">
              Clean air for all <br /> African Cities.
            </h1>
          </div>
          <div className="flex space-x-4 mt-6">
            <Link
              href="https://www.facebook.com/AirQo"
              aria-label="Facebook"
              className="text-blue-600 bg-blue-50 rounded-full p-2 hover:bg-blue-200 transition-all"
            >
              <FaFacebookF size={14} />
            </Link>
            <Link
              href="https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ"
              aria-label="YouTube"
              className="text-blue-600 bg-blue-50 rounded-full p-2 hover:bg-blue-200 transition-all"
            >
              <FaYoutube size={14} />
            </Link>
            <Link
              href="https://www.linkedin.com/company/airqo/mycompany/"
              aria-label="LinkedIn"
              className="text-blue-600 bg-blue-50 rounded-full p-2 hover:bg-blue-200 transition-all"
            >
              <FaLinkedinIn size={14} />
            </Link>
            <Link
              href="https://x.com/AirQoProject"
              target="_blank"
              aria-label="Twitter"
              className="text-blue-600 bg-blue-50 rounded-full p-2 hover:bg-blue-200 transition-all"
            >
              <FaXTwitter size={14} />
            </Link>
          </div>
        </div>

        <FooterLinkColumns />
      </div>

      <FooterDocumentHub />

      <div className="border-t border-gray-200 my-8"></div>

      {/* Bottom Section */}
      <div className="flex flex-col lg:flex-row lg:justify-between items-center space-y-4 lg:space-y-0">
        {/* Location Button with Dialog */}
        <CountrySelectorDialog />

        {/* Monitors in Uganda */}
        <MonitorDisplay />
      </div>

      <div className="border-t border-gray-200 my-8"></div>

      {/* Footer Bottom Section */}
      <div className="flex flex-col text-sm lg:flex-row justify-between items-start lg:items-center space-y-4 lg:space-y-0">
        {/* Footer Bottom Links */}
        <div className="flex flex-wrap gap-4 text-center lg:text-left text-gray-600">
          &copy; {currentYear} AirQo
          <Link href="/legal/terms-of-service" className="hover:underline">
            Terms of service
          </Link>
          <Link href="/faqs" className="hover:underline">
            FAQs
          </Link>
          <Link href="/legal/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          <Link href="/legal/airqo-data" className="hover:underline">
            AirQo Data
          </Link>
          <Link href="/legal/payment-refund-policy" className="hover:underline">
            Payment Terms
          </Link>
        </div>

        {/* Makerere University Attribution */}
        <div className="flex flex-col items-center lg:items-start">
          <Image
            src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728142537/website/Logos/MakName_xmsi0k.png"
            alt="Makerere University"
            width={237}
            height={38}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
