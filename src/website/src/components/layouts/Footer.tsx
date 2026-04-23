'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { FaArrowRightLong, FaXTwitter } from 'react-icons/fa6';

import mainConfig from '@/configs/mainConfigs';

import CountrySelectorDialog from '../sections/footer/CountrySelectorDialog';
import MonitorDisplay from '../sections/footer/MonitorDisplay';
import ScrollToTopButton from './ScrollToTopButton';

const footerDocuments = [
  {
    title: 'Researchers Guide',
    description: 'How researchers and partners can work with AirQo data.',
    href: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1776942291/website/docs/v1.0.3_-_AirQo_Researchers_Guide_jkmvkm.pdf',
  },
  {
    title: 'Air Quality Data Access Guide',
    description: 'How to request, access, and use AirQo air quality data.',
    href: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1776942291/website/docs/AirQo_Air_Quality_Data_Access_Guide_faswo5.pdf',
  },
  {
    title: 'Fair Usage Policy',
    description: 'Responsible, open, and sustainable use of AirQo data.',
    href: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1776942291/website/docs/AirQo_Fair_Usage_Policy_ox4o6b.pdf',
  },
];

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

        {/* Links Section */}
        <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {/* Products Section */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-4">Products</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/products/monitor"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Binos Monitor
                </Link>
              </li>
              <li>
                <Link
                  href="/products/analytics"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Analytics Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/products/api"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Air Quality API
                </Link>
              </li>
              <li>
                <Link
                  href="/products/mobile-app"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Mobile App
                </Link>
              </li>
              <li>
                <Link
                  href="/products/calibrate"
                  className="text-gray-600 transition-colors hover:text-blue-700"
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
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  For African Cities
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/communities"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  For Communities
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/research"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  For Research
                </Link>
              </li>
              <li>
                <Link
                  href="/solutions/network-coverage"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 transition-colors hover:text-blue-700"
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
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  About AirQo
                </Link>
              </li>
              <li>
                <Link
                  href="/resources"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Resources
                </Link>
              </li>
              <li>
                <Link
                  href="/events"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Events
                </Link>
              </li>
              <li>
                <Link
                  href="/faqs"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/africa-clean-air-forum"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Africa Clean Air Forum
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Press
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Careers
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="https://blog.airqo.net/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Public Section */}
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-800 mb-4">Public</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/resources"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Publications
                </Link>
              </li>
              <li>
                <Link
                  href="/explore-data"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Datasets
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/airqo-data"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Data Access
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
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Packages
                </Link>
              </li>
              <li>
                <Link
                  href="https://docs.airqo.net/airqo-rest-api-documentation/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  Documentation
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/airqo-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 transition-colors hover:text-blue-700"
                >
                  GitHub
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <section
        aria-labelledby="footer-documents-heading"
        className="mt-10 overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.05)]"
      >
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative overflow-hidden bg-gradient-to-b from-blue-50/60 to-transparent p-6 sm:p-8 lg:p-10">
            <div className="relative">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-blue-600">
                Data access documents
              </p>
              <h3
                id="footer-documents-heading"
                className="mt-3 text-xl font-semibold text-slate-900 sm:text-2xl"
              >
                Find the right AirQo guide quickly
              </h3>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                Access to AirQo data is guided by our commitment to openness,
                responsible use, and impact.
              </p>
              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
                These documents provide guidance on how to access and use AirQo
                air quality data.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-200 bg-slate-50/60">
            {footerDocuments.map((document, index) => (
              <Link
                key={document.title}
                href={document.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${document.title} PDF`}
                className="group flex items-center gap-3 px-5 py-4 transition-colors duration-200 hover:bg-white sm:px-6"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-sm font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
                  0{index + 1}
                </span>

                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-semibold text-slate-900 transition-colors group-hover:text-blue-700">
                    {document.title}
                  </h4>
                  <p className="mt-0.5 text-sm leading-5 text-slate-600">
                    {document.description}
                  </p>
                </div>

                <span className="flex items-center gap-2 text-sm font-semibold text-blue-700">
                  <span className="hidden sm:inline">Open</span>
                  <FaArrowRightLong className="text-sm transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
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
