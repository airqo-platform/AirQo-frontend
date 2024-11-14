import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import {
  FaFacebookF,
  FaLinkedinIn,
  FaTwitter,
  FaYoutube,
} from 'react-icons/fa';

import CountrySelectorDialog from '../sections/footer/CountrySelectorDialog';
import MonitorDisplay from '../sections/footer/MonitorDisplay';
import ScrollToTopButton from './ScrollToTopButton';

const Footer = () => {
  return (
    <footer
      id="WebsiteFooter"
      className="relative py-8 px-4 max-w-5xl mx-auto text-[14px]"
    >
      <ScrollToTopButton />
      {/* Top Section with Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logo and Social Media */}
        <div className="flex flex-col space-y-4">
          <div>
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png"
              alt="AirQo"
              width={70}
              height={60}
            />
            <p className="text-gray-800 mt-4">
              Clean air for all <br /> African Cities.
            </p>
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
              <FaTwitter size={14} />
            </Link>
          </div>
        </div>

        {/* Links Section */}
        <div className="flex justify-between flex-wrap gap-8">
          {/* Products Section */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products/monitor"
                  className="text-gray-600 hover:underline"
                >
                  Binos Monitor
                </Link>
              </li>
              <li>
                <Link
                  href="/products/analytics"
                  className="text-gray-600 hover:underline"
                >
                  Analytics Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/products/api"
                  className="text-gray-600 hover:underline"
                >
                  Air Quality API
                </Link>
              </li>
              <li>
                <Link
                  href="/products/mobile-app"
                  className="text-gray-600 hover:underline"
                >
                  Mobile App
                </Link>
              </li>
              <li>
                <Link
                  href="/products/calibrate"
                  className="text-gray-600 hover:underline"
                >
                  AirQalibrate
                </Link>
              </li>
            </ul>
          </div>

          {/* Solutions Section */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-4">Solutions</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/solutions/african-cities"
                  className="text-gray-600 hover:underline"
                >
                  For African Cities
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/communities"
                  className="text-gray-600 hover:underline"
                >
                  For Communities
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/research"
                  className="text-gray-600 hover:underline"
                >
                  For Research
                </Link>
              </li>
            </ul>
          </div>

          {/* About Section */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-4">About</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about-us"
                  className="text-gray-600 hover:underline"
                >
                  About AirQo
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-gray-600 hover:underline"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/events" className="text-gray-600 hover:underline">
                  Events
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-600 hover:underline">
                  Press
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:underline">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:underline">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="https://blog.airqo.net/"
                  target="_blank"
                  className="text-gray-600 hover:underline"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

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
        <div className="text-center lg:text-left text-gray-600">
          &copy; {new Date().getFullYear()} AirQo &nbsp;|&nbsp;{' '}
          <Link href="/legal/terms-of-service" className="hover:underline">
            Terms of service
          </Link>
          &nbsp;|&nbsp;{' '}
          <Link href="/legal/privacy-policy" className="hover:underline">
            Privacy Policy
          </Link>
          &nbsp;|&nbsp;{' '}
          <Link href="/legal/airqo-data" className="hover:underline">
            AirQo Data
          </Link>
          &nbsp;|&nbsp;{' '}
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
