'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

import mainConfig from '@/configs/mainConfigs';

import CountrySelectorDialog from '../sections/footer/CountrySelectorDialog';
import MonitorDisplay from '../sections/footer/MonitorDisplay';
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

        {/* Links Section */}
        <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-4">
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
                  prefetch={false}
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
              <li>
                <Link
                  href="/solutions/network-coverage"
                  prefetch={false}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:underline"
                >
                  Network Coverage
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
                <Link href="/faqs" className="text-gray-600 hover:underline">
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/africa-clean-air-forum"
                  className="text-gray-600 hover:underline"
                >
                  Africa Clean Air Forum
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

          {/* Developers Section */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-4">Developers</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/packages"
                  prefetch={false}
                  className="text-gray-600 hover:underline"
                >
                  Packages
                </Link>
              </li>
              <li>
                <Link
                  href="https://docs.airqo.net/airqo-rest-api-documentation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:underline"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/airqo-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:underline"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <section aria-labelledby="footer-data-access" className="mt-10">
        <div className="rounded-2xl border border-gray-200 bg-gray-50 px-5 py-6 sm:px-6 lg:px-8">
          <div className="grid gap-6 lg:grid-cols-3 lg:items-start">
            <div className="space-y-3 lg:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
                AirQo data access
              </p>
              <h3
                id="footer-data-access"
                className="text-lg font-semibold text-gray-800"
              >
                Guidance for responsible use
              </h3>
              <p className="leading-relaxed text-gray-600">
                Access to AirQo data is guided by our commitment to openness,
                responsible use, and impact. These documents provide guidance on
                how to access and use AirQo air quality data.
              </p>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href="https://res.cloudinary.com/dbibjvyhm/image/upload/v1776942291/website/docs/v1.0.3_-_AirQo_Researchers_Guide_jkmvkm.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
              >
                <span className="font-medium">Researchers Guide</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 group-hover:text-blue-600">
                  View PDF
                </span>
              </Link>
              <Link
                href="https://res.cloudinary.com/dbibjvyhm/image/upload/v1776942291/website/docs/AirQo_Fair_Usage_Policy_ox4o6b.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-700 transition hover:border-blue-200 hover:text-blue-700"
              >
                <span className="font-medium">Fair Usage Policy</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 group-hover:text-blue-600">
                  View PDF
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

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
