'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

import mainConfig from '@/config/site.config';

import CountrySelectorDialog from '../sections/footer/CountrySelectorDialog';
import MonitorDisplay from '../sections/footer/MonitorDisplay';
import ScrollToTopButton from './ScrollToTopButton';

const footerLinks = {
  products: [
    { label: 'Binos Monitor', href: '/products/monitor' },
    { label: 'AirQo Nexus', href: '/products/nexus' },
    { label: 'Air Quality API', href: '/products/api' },
    { label: 'Mobile App', href: '/products/mobile-app' },
    { label: 'AirQalibrate', href: '/products/calibrate' },
    { label: 'AirQo Vertex', href: '/products/vertex' },
    { label: 'AirQo Beacon', href: '/products/beacon' },
    { label: 'AirQo AI Platform', href: '/products/ai-platform' },
  ],
  solutions: [
    { label: 'For African Cities', href: '/solutions/african-cities' },
    { label: 'For Communities', href: '/solutions/communities' },
    { label: 'For Research', href: '/solutions/research' },
    {
      label: 'Network Coverage',
      href: '/solutions/network-coverage',
      external: true,
    },
  ],
  about: [
    { label: 'About AirQo', href: '/about-us' },
    { label: 'Resources', href: '/resources' },
    { label: 'Events', href: '/events' },
    { label: 'FAQs', href: '/faqs' },
    { label: 'Africa Clean Air Forum', href: '/africa-clean-air-forum' },
    {
      label: 'Faces of Clean Air',
      href: '/africa-clean-air-forum-2026/faces-of-clean-air',
    },
    { label: 'Selfies', href: '/africa-clean-air-forum-2026/selfies' },
    { label: 'Air Quality Quiz', href: '/africa-clean-air-forum-2026/quiz' },
    {
      label: 'Quiz Leaderboard',
      href: '/africa-clean-air-forum-2026/leaderboard',
    },
    { label: 'Press', href: '/press' },
    { label: 'Careers', href: '/careers' },
    { label: 'Contact Us', href: '/contact' },
    { label: 'Blogs', href: '/blogs' },
  ],
  developers: [
    { label: 'Packages', href: '/packages' },
    { label: 'AirQo DevCon 2026', href: '/developers/airqo-devcon' },
    {
      label: 'Documentation',
      href: 'https://platform.airqo.net/docs/api/intro/',
      external: true,
    },
    {
      label: 'GitHub',
      href: 'https://github.com/airqo-platform',
      external: true,
    },
  ],
};

const socialLinks = [
  {
    icon: FaFacebookF,
    href: 'https://www.facebook.com/AirQo',
    label: 'Facebook',
  },
  {
    icon: FaYoutube,
    href: 'https://www.youtube.com/channel/UCx7YtV55TcqKGeKsDdT5_XQ',
    label: 'YouTube',
  },
  {
    icon: FaLinkedinIn,
    href: 'https://www.linkedin.com/company/airqo/mycompany/',
    label: 'LinkedIn',
  },
  {
    icon: FaXTwitter,
    href: 'https://x.com/AirQoProject',
    label: 'X',
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="WebsiteFooter"
      className={`relative pt-16 pb-8 px-4 ${mainConfig.containerClass}`}
    >
      <ScrollToTopButton />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8">
        {/* Brand Column */}
        <div className="lg:col-span-4">
          <Image
            src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png"
            alt="AirQo"
            width={64}
            height={54}
            className="mb-5"
          />
          <p className="text-[15px] text-gray-600 leading-relaxed max-w-[260px]">
            Clean air for all African Cities.
          </p>
          <div className="flex items-center gap-3 mt-6">
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-blue-600 hover:text-white transition-colors duration-200"
              >
                <social.icon size={14} />
              </Link>
            ))}
          </div>
        </div>

        {/* Links Columns */}
        <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div>
            <h3 className="text-[13px] font-semibold text-gray-900 mb-4">
              Products
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.products.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold text-gray-900 mb-4">
              Solutions
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.solutions.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold text-gray-900 mb-4">
              About
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.about.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-[13px] font-semibold text-gray-900 mb-4">
              Developers
            </h3>
            <ul className="space-y-2.5">
              {footerLinks.developers.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.external ? '_blank' : undefined}
                    rel={link.external ? 'noopener noreferrer' : undefined}
                    className="text-[14px] text-gray-500 hover:text-gray-900 transition-colors duration-150"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Data Access Section */}
      <div className="mt-14 rounded-xl border border-gray-200 bg-gray-50/80 px-6 py-7 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-3 lg:items-center">
          <div className="lg:col-span-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
              AirQo Data Access
            </p>
            <h3 className="text-[17px] font-semibold text-gray-900 mb-2">
              Guidance for responsible use
            </h3>
            <p className="text-[14px] text-gray-500 leading-relaxed max-w-2xl">
              Access to AirQo data is guided by our commitment to openness,
              responsible use, and impact. These documents provide guidance on
              how to access and use AirQo air quality data.
            </p>
          </div>

          <div className="flex flex-col gap-2.5">
            <Link
              href="https://platform.airqo.net/docs/data-access/researchers-guide/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-gray-300 transition-colors"
            >
              <span className="text-[14px] font-medium text-gray-700">
                Researchers Guide
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 group-hover:text-blue-600 transition-colors">
                View Guide
              </span>
            </Link>
            <Link
              href="https://platform.airqo.net/docs/data-access/fair-usage-policy/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 hover:border-gray-300 transition-colors"
            >
              <span className="text-[14px] font-medium text-gray-700">
                Fair Usage Policy
              </span>
              <span className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 group-hover:text-blue-600 transition-colors">
                View Policy
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Country & Monitors */}
      <div className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <CountrySelectorDialog />
        <MonitorDisplay />
      </div>

      {/* Bottom Bar */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-gray-400">
          <span>&copy; {currentYear} AirQo</span>
          <Link
            href="/legal/terms-of-service"
            className="hover:text-gray-700 transition-colors"
          >
            Terms of service
          </Link>
          <Link href="/faqs" className="hover:text-gray-700 transition-colors">
            FAQs
          </Link>
          <Link
            href="/legal/privacy-policy"
            className="hover:text-gray-700 transition-colors"
          >
            Privacy Policy
          </Link>
          <Link
            href="/legal/cookies"
            className="hover:text-gray-700 transition-colors"
          >
            Cookies Policy
          </Link>
          <Link
            href="/legal/airqo-data"
            className="hover:text-gray-700 transition-colors"
          >
            AirQo Data
          </Link>
          <Link
            href="/legal/payment-refund-policy"
            className="hover:text-gray-700 transition-colors"
          >
            Payment Terms
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-gray-400">
            A project by
          </span>
          <Image
            src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728142537/website/Logos/MakName_xmsi0k.png"
            alt="Makerere University"
            width={160}
            height={26}
          />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
