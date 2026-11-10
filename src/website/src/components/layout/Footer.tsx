'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaFacebookF, FaLinkedinIn, FaYoutube } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';

import { AFRICA_CLEAN_AIR_FORUM_URL } from '@/lib/navItems';
import { CLOUDINARY_IMAGES } from '@/services/external/cloudinary.service';

import CountrySelectorDialog from '../sections/footer/CountrySelectorDialog';
import MonitorDisplay from '../sections/footer/MonitorDisplay';
import ScrollToTopButton from './ScrollToTopButton';

type FooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

const LIVE_MAP_URL = 'https://ai.airqo.net/map';
const NEXUS_URL = 'https://nexus.airqo.net/';

const solutionLinks: FooterLink[] = [
  { label: 'View all solutions', href: '/solutions' },
  { label: 'For African Cities', href: '/solutions/african-cities' },
  { label: 'For Communities', href: '/solutions/communities' },
  { label: 'For Research', href: '/solutions/research' },
  { label: 'Network Coverage', href: '/solutions/network-coverage' },
  { label: 'Kampala Study', href: '/solutions/kampala-study' },
];

const productLinks: FooterLink[] = [
  { label: 'Measure', href: '/products#measure' },
  { label: 'Understand', href: '/products#understand' },
  { label: 'Act', href: '/products#act' },
];

const resourceLinks: FooterLink[] = [
  { label: 'Technical documentation', href: '/resources?tab=technical' },
  { label: 'Research & publications', href: '/resources?tab=research' },
  { label: 'Guides & manuals', href: '/resources?tab=guide,manual' },
  { label: 'Policy documents', href: '/resources?tab=policy' },
  { label: 'Blog & insights', href: 'https://blog.airqo.net/', external: true },
  { label: 'Events', href: '/events' },
  { label: 'FAQs', href: '/faqs' },
];

const companyLinks: FooterLink[] = [
  { label: 'About AirQo', href: '/about-us' },
  { label: 'Partners', href: '/about-us#partners' },
  { label: 'Press', href: '/press' },
  { label: 'Careers', href: '/careers' },
  { label: 'Contact', href: '/contact' },
  {
    label: 'Africa Clean Air Forum',
    href: AFRICA_CLEAN_AIR_FORUM_URL,
    external: true,
  },
];

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

const dataAccessLinks: FooterLink[] = [
  { label: 'Live map', href: LIVE_MAP_URL, external: true },
  { label: 'AirQo Nexus', href: NEXUS_URL, external: true },
  {
    label: 'AirQo API Guide',
    href: 'https://platform.airqo.net/docs/api/intro/',
    external: true,
  },
  { label: 'Fair Usage Policy', href: '/legal/airqo-data#rate-limiting' },
  { label: 'AirQo Data', href: '/legal/airqo-data' },
];

const legalLinks = [
  { label: 'Terms of service', href: '/legal/terms-of-service' },
  { label: 'Privacy Policy', href: '/legal/privacy-policy' },
  { label: 'Cookies Policy', href: '/legal/cookies' },
  { label: 'Payment Terms', href: '/legal/payment-refund-policy' },
];

const FooterLinkList: React.FC<{
  title: string;
  links: FooterLink[];
  className?: string;
}> = ({ title, links, className = '' }) => (
  <div className={`min-w-0 ${className}`}>
    <h3 className="mb-4 text-[13px] font-semibold text-ink">{title}</h3>
    <ul className="space-y-2.5">
      {links.map((link) => (
        <li key={link.href} className="min-w-0">
          <Link
            href={link.href}
            target={link.external ? '_blank' : undefined}
            rel={link.external ? 'noopener noreferrer' : undefined}
            className="break-words text-[14px] text-gray-600 transition-colors duration-150 hover:text-brand"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [makerereImageFailed, setMakerereImageFailed] = React.useState(false);

  return (
    <footer id="WebsiteFooter" className="relative mx-2 mb-2 sm:mx-3 sm:mb-3">
      <ScrollToTopButton />

      <div className="w-full overflow-hidden rounded-md border border-line bg-white text-gray-600 shadow-sm">
        {/* Main footer */}
        <div className="bg-white">
          <div className="mx-auto max-w-7xl px-4 pt-12 pb-10 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-8">
              {/* Brand Column */}
              <div className="min-w-0 lg:col-span-4">
                <Image
                  src={CLOUDINARY_IMAGES.logo}
                  alt="AirQo"
                  width={64}
                  height={54}
                  className="mb-5"
                />
                <p className="max-w-[300px] text-[15px] leading-relaxed text-gray-600">
                  Clean air for all African cities. We measure, understand, and
                  act on air quality data with communities, researchers, and
                  governments.
                </p>
                <div className="mt-6 flex items-center gap-3">
                  {socialLinks.map((social) => (
                    <Link
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="flex h-9 w-9 flex-none items-center justify-center rounded-md bg-gray-100 text-gray-600 transition-colors duration-200 hover:bg-brand hover:text-white"
                    >
                      <social.icon size={14} />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Link Columns */}
              <div className="grid min-w-0 grid-cols-2 gap-8 sm:grid-cols-4 lg:col-span-8">
                <div className="min-w-0">
                  <h3 className="mb-4 text-[13px] font-semibold text-ink">
                    Products
                  </h3>
                  <ul className="space-y-2.5">
                    {productLinks.map((link) => (
                      <li key={link.href} className="min-w-0">
                        <Link
                          href={link.href}
                          className="break-words text-[14px] text-gray-600 transition-colors duration-150 hover:text-brand"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                    <li className="min-w-0">
                      <Link
                        href="/products"
                        className="break-words text-[14px] font-semibold text-brand transition-colors duration-150 hover:underline"
                      >
                        All products
                      </Link>
                    </li>
                  </ul>
                </div>

                <FooterLinkList title="Solutions" links={solutionLinks} />
                <FooterLinkList title="Resources" links={resourceLinks} />
                <FooterLinkList title="Company" links={companyLinks} />
              </div>
            </div>

            {/* Data Access Callout */}
            <div className="mt-14 rounded-md border border-brand-100 bg-brand-50 px-5 py-6 sm:px-7 sm:py-7">
              <div className="grid gap-6 lg:grid-cols-3 lg:items-center">
                <div className="min-w-0 lg:col-span-2">
                  <p className="mb-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-brand-700">
                    AirQo Data Access
                  </p>
                  <h3 className="mb-2 text-[17px] font-semibold text-ink">
                    Guidance for responsible use
                  </h3>
                  <p className="max-w-2xl text-[14px] leading-relaxed text-gray-700">
                    Access to AirQo data is guided by our commitment to
                    openness, responsible use, and impact. These documents
                    explain how to access and use AirQo air quality data.
                  </p>
                </div>

                <div className="flex flex-col gap-2.5">
                  {dataAccessLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      target={link.external ? '_blank' : undefined}
                      rel={link.external ? 'noopener noreferrer' : undefined}
                      className="group flex items-center justify-between gap-3 rounded-md border border-line bg-white px-4 py-3 transition-colors hover:border-brand-200 hover:bg-brand-50/60"
                    >
                      <span className="min-w-0 break-words text-[14px] font-medium text-ink">
                        {link.label}
                      </span>
                      <span className="flex-none font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500 transition-colors group-hover:text-brand-700">
                        View
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Light bottom band */}
        <div className="border-t border-line bg-surface-muted">
          <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <CountrySelectorDialog />
              <MonitorDisplay />
            </div>

            {/* Bottom Bar */}
            <div className="mt-6 flex flex-col gap-4 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px] text-gray-600">
                <span>&copy; {currentYear} AirQo</span>
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-2">
                {makerereImageFailed ? (
                  <span className="text-sm font-medium text-gray-600">
                    A project by Makerere University
                  </span>
                ) : (
                  <Image
                    src={CLOUDINARY_IMAGES.makerereName}
                    alt="A project by Makerere University"
                    width={160}
                    height={26}
                    onError={() => setMakerereImageFailed(true)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
