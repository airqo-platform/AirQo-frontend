'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react';
import { FiChevronDown, FiX } from 'react-icons/fi';
import { HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2';

type NavMenuItem = {
  title: string;
  description?: string;
  href: string;
  newTab?: boolean;
};

type NavMenuSection = Record<string, NavMenuItem[]>;

const NAV_ITEMS: NavMenuSection = {
  Products: [
    {
      title: 'Binos Monitor',
      description: 'Built in Africa for African cities',
      href: '/products/monitor',
    },
    {
      title: 'Analytics Dashboard',
      description: 'Air quality analytics for African cities',
      href: '/products/analytics',
    },
    {
      title: 'Mobile App',
      description: 'Discover the quality of air around you',
      href: '/products/mobile-app',
    },
    {
      title: 'Air Quality API',
      description: 'Access raw and calibrated data',
      href: '/products/api',
    },
    {
      title: 'AirQalibrate',
      description: 'Calibrate your low-cost sensor data',
      href: '/products/calibrate',
    },
  ],
  Solutions: [
    {
      title: 'For African Cities',
      description: 'Advancing air quality management in African Cities',
      href: '/solutions/african-cities',
    },
    {
      title: 'For Communities',
      description: 'Empowering communities with air quality information',
      href: '/solutions/communities',
    },
    {
      title: 'For Research',
      description: 'Advancing knowledge and evidence on air quality issues',
      href: '/solutions/research',
    },
    {
      title: 'Kampala Air Quality Study',
      description: 'Join our real-time air pollution research study',
      href: '/solutions/kampala-study',
    },
    {
      title: 'Network Coverage',
      description: 'Explore air quality monitoring data across Africa',
      href: '/solutions/network-coverage',
      newTab: true,
    },
  ],
  About: [
    { title: 'About Us', href: '/about-us' },
    { title: 'Resources', href: '/resources' },
    { title: 'Careers', href: '/careers' },
    { title: 'Contact Us', href: '/contact' },
    { title: 'Events', href: '/events' },
    { title: 'Press', href: '/press' },
    { title: 'FAQs', href: '/faqs' },
    { title: 'Africa Clean Air Forum', href: '/africa-clean-air-forum' },
  ],
  Developers: [
    {
      title: 'Packages',
      description: 'Open source libraries and developer tools',
      href: '/packages',
    },
    {
      title: 'Documentation',
      description: 'API guides and technical resources',
      href: 'https://docs.airqo.net/airqo-rest-api-documentation/',
      newTab: true,
    },
    {
      title: 'GitHub',
      description: 'Explore our open source projects',
      href: 'https://github.com/airqo-platform',
      newTab: true,
    },
  ],
};

interface NetworkCoverageNavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const NetworkCoverageNavDrawer: React.FC<NetworkCoverageNavDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [expandedSection, setExpandedSection] = useState<string | null>(
    'Solutions',
  );

  useEffect(() => {
    if (!isOpen) {
      // Slight delay so animation completes before resetting
      const t = window.setTimeout(() => setExpandedSection('Solutions'), 310);
      return () => window.clearTimeout(t);
    }
    return undefined;
  }, [isOpen]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') onClose();
  };

  const toggleSection = (title: string) => {
    setExpandedSection((prev) => (prev === title ? null : title));
  };

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[9990] bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        onKeyDown={handleKeyDown}
        className={`fixed inset-y-0 left-0 z-[9995] flex w-[300px] max-w-[88vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-slate-100 bg-white px-4 py-3.5">
          <a href="/home" className="flex items-center" onClick={onClose}>
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png"
              alt="AirQo"
              width={64}
              height={44}
              className="h-8 w-auto"
            />
          </a>
          <button
            type="button"
            onClick={onClose}
            className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close navigation menu"
          >
            <FiX className="h-4.5 w-4.5 h-[18px] w-[18px]" />
          </button>
        </div>

        {/* Scrollable nav content */}
        <nav className="flex-1 overflow-y-auto" aria-label="Site navigation">
          {Object.entries(NAV_ITEMS).map(([sectionTitle, items]) => {
            const isExpanded = expandedSection === sectionTitle;
            return (
              <div
                key={sectionTitle}
                className="border-b border-slate-100 last:border-0"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(sectionTitle)}
                  className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-slate-50"
                  aria-expanded={isExpanded}
                  aria-controls={`nav-section-${sectionTitle}`}
                >
                  <span className="text-sm font-semibold text-slate-800">
                    {sectionTitle}
                  </span>
                  <FiChevronDown
                    className={`h-4 w-4 flex-shrink-0 text-slate-400 transition-transform duration-200 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Sub-items */}
                <div
                  id={`nav-section-${sectionTitle}`}
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? 'max-h-[600px] opacity-100'
                      : 'max-h-0 opacity-0'
                  }`}
                >
                  <ul className="space-y-0.5 px-3 pb-3">
                    {items.map((item) => {
                      const isExternal = item.href.startsWith('http');
                      const opensInNewTab = isExternal || item.newTab;

                      const content = (
                        <span className="flex items-start gap-2">
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-medium text-slate-800 group-hover:text-blue-700">
                              {item.title}
                            </span>
                            {item.description && (
                              <span className="mt-0.5 block text-xs leading-snug text-slate-500">
                                {item.description}
                              </span>
                            )}
                          </span>
                          {opensInNewTab && (
                            <HiOutlineArrowTopRightOnSquare className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
                          )}
                        </span>
                      );

                      const sharedClass =
                        'group flex w-full rounded-lg px-3 py-2 transition-colors hover:bg-blue-50';

                      return (
                        <li key={item.href}>
                          {opensInNewTab ? (
                            <a
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={onClose}
                              className={sharedClass}
                            >
                              {content}
                            </a>
                          ) : (
                            <Link
                              href={item.href}
                              onClick={onClose}
                              className={sharedClass}
                            >
                              {content}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer CTAs */}
        <div className="flex flex-shrink-0 flex-col gap-2 border-t border-slate-200 bg-slate-50 px-4 py-4">
          <a
            href="/explore-data"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Explore Data
          </a>
          <a
            href="/home"
            onClick={onClose}
            className="flex w-full items-center justify-center rounded-lg border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-50"
          >
            Back to Main Site
          </a>
        </div>
      </div>
    </>
  );
};

export default NetworkCoverageNavDrawer;
