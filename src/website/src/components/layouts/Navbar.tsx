'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import { RiCloseFill } from 'react-icons/ri';
import { TbChevronDown, TbMenu } from 'react-icons/tb';

import { CustomButton } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useDispatch } from '@/hooks';
import { NAV_ITEMS } from '@/lib/navItems';
import { openModal } from '@/store/slices/modalSlice';

import { trackEvent } from '../GoogleAnalytics';
import TopBanner from './TopBanner';
// import NotificationBanner from './NotificationBanner';

// Type definitions
type MenuItem = {
  title: string;
  description?: string;
  href: string;
  newTab?: boolean;
};

// MenuItems type is no longer needed (nav comes from shared NAV_ITEMS)

// Nav items are sourced from a shared utility to avoid duplication
// See: src/lib/navItems.ts

// Helper component for rendering dropdown items with translation support
const DropdownMenuContent: React.FC<{
  title: string;
  items: MenuItem[];
  className?: string;
}> = ({ title, items, className = '' }) => (
  <div
    className={`bg-white shadow-lg md:w-[400px] lg:w-[600px] text-sm rounded-md p-4 translate-element ${className}`}
  >
    <div className="text-gray-400 mb-4 translate-element">{title}</div>
    <div className="flex gap-8">
      {items
        .reduce<MenuItem[][]>((acc, item, idx) => {
          const colIdx = Math.floor(idx / Math.ceil(items.length / 2));
          if (!acc[colIdx]) acc[colIdx] = [];
          acc[colIdx].push(item);
          return acc;
        }, [])
        .map((colItems, index) => (
          <ul key={index} className="flex-1 space-y-3">
            {colItems.map((item) => {
              const isExternal = item.href.startsWith('http');
              const shouldOpenInNewTab = isExternal || item.newTab;
              return (
                <li key={item.href}>
                  {shouldOpenInNewTab ? (
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-2 rounded-xl hover:bg-blue-50 hover:text-blue-500 transition translate-element"
                    >
                      <div className="font-medium translate-element">
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-gray-500 translate-element">
                          {item.description}
                        </div>
                      )}
                    </a>
                  ) : (
                    <Link
                      href={item.href}
                      target={item.newTab ? '_blank' : undefined}
                      rel={item.newTab ? 'noopener noreferrer' : undefined}
                      className="block p-2 rounded-xl hover:bg-blue-50 hover:text-blue-500 transition translate-element"
                    >
                      <div className="font-medium translate-element">
                        {item.title}
                      </div>
                      {item.description && (
                        <div className="text-gray-500 translate-element">
                          {item.description}
                        </div>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        ))}
    </div>
  </div>
);

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);
  const toggleExpandedMenu = useCallback(
    (menuName: string) =>
      setExpandedMenu((prev) => (prev === menuName ? null : menuName)),
    [],
  );

  const handleLinkClick = useCallback(() => {
    setMenuOpen(false);
    setExpandedMenu(null);
  }, []);

  // Lock body scroll while mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY) {
        setIsHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <div
      className={`w-full fixed top-0 z-[10000] shadow-sm transition-transform duration-300 ${
        isHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      {/* Top Banner */}
      <TopBanner />
      <nav className="w-full bg-white p-4">
        <div
          className={`flex items-center justify-between ${mainConfig.containerClass}`}
        >
          {/* Logo Section */}
          <Link
            href={`${mainConfig.homePageUrl}`}
            passHref
            className="flex items-center"
          >
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png"
              alt="AirQo"
              width={71}
              height={48}
              className="h-10 w-auto cursor-pointer"
              priority={true}
            />
          </Link>

          {/* Mobile Menu Hamburger */}
          <button
            onClick={toggleMenu}
            className="grid h-9 w-9 place-items-center rounded-lg text-gray-800 transition-colors hover:bg-gray-100 focus:outline-none md:hidden"
            aria-label={
              menuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={menuOpen}
          >
            <TbMenu size={26} />
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            {Object.entries(NAV_ITEMS).map(([title, items]) => (
              <div key={title} className="relative group">
                <button className="text-gray-800 font-medium hover:text-blue-600 text-sm transition-colors translate-element flex items-center">
                  {title}
                  <TbChevronDown className="ml-1 h-4 w-4" />
                </button>
                <DropdownMenuContent
                  title={title}
                  items={items}
                  className="absolute top-full left-0 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-[9999]"
                />
              </div>
            ))}
            <CustomButton
              onClick={() => {
                trackEvent({
                  action: 'button_click',
                  category: 'engagement',
                  label: 'get_involved',
                });
                dispatch(openModal());
              }}
              className="text-blue-600 bg-blue-50 transition rounded-none"
            >
              Get involved
            </CustomButton>
            <CustomButton
              onClick={() => {
                trackEvent({
                  action: 'button_click',
                  category: 'navigation',
                  label: 'explore_data',
                });
                router.push('/explore-data');
              }}
              className="rounded-none"
            >
              Explore data
            </CustomButton>
          </div>
        </div>
      </nav>

      {/* ── Mobile Navigation Drawer ── */}
      {/* Backdrop */}
      <div
        aria-hidden="true"
        className={`fixed inset-0 z-[9990] bg-black/40 backdrop-blur-sm transition-opacity duration-300 md:hidden ${
          menuOpen
            ? 'pointer-events-auto opacity-100'
            : 'pointer-events-none opacity-0'
        }`}
        onClick={handleLinkClick}
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Site navigation"
        className={`fixed inset-y-0 left-0 z-[9995] flex w-[300px] max-w-[88vw] flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3.5">
          <Link href={mainConfig.homePageUrl} onClick={handleLinkClick}>
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728138368/website/Logos/logo_rus4my.png"
              alt="AirQo"
              width={64}
              height={44}
              className="h-8 w-auto"
            />
          </Link>
          <button
            type="button"
            onClick={handleLinkClick}
            className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close navigation menu"
          >
            <RiCloseFill size={20} />
          </button>
        </div>

        {/* Scrollable Nav Content */}
        <div className="flex-1 overflow-y-auto">
          {Object.entries(NAV_ITEMS).map(([title, items]) => (
            <div key={title} className="border-b border-gray-100 last:border-0">
              <button
                onClick={() => toggleExpandedMenu(title)}
                className="flex w-full items-center justify-between px-5 py-3.5 text-left transition-colors hover:bg-gray-50"
                aria-expanded={expandedMenu === title}
              >
                <span className="text-sm font-semibold text-gray-800 translate-element">
                  {title}
                </span>
                <TbChevronDown
                  className={`h-4 w-4 flex-shrink-0 text-gray-400 transition-transform duration-200 ${
                    expandedMenu === title ? 'rotate-180' : 'rotate-0'
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  expandedMenu === title
                    ? 'max-h-[500px] opacity-100'
                    : 'max-h-0 opacity-0'
                }`}
              >
                <ul className="space-y-0.5 px-3 pb-3">
                  {items.map((item) => {
                    const isExternal = item.href.startsWith('http');
                    const shouldOpenInNewTab = isExternal || item.newTab;
                    return (
                      <li key={item.href}>
                        {shouldOpenInNewTab ? (
                          <a
                            href={item.href}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={handleLinkClick}
                            className="flex flex-col rounded-lg px-3 py-2 transition-colors hover:bg-blue-50"
                          >
                            <span className="text-sm font-medium text-gray-800 hover:text-blue-700 translate-element">
                              {item.title}
                            </span>
                            {item.description && (
                              <span className="mt-0.5 text-xs leading-snug text-gray-500 translate-element">
                                {item.description}
                              </span>
                            )}
                          </a>
                        ) : (
                          <Link
                            href={item.href}
                            target={shouldOpenInNewTab ? '_blank' : undefined}
                            rel={
                              shouldOpenInNewTab
                                ? 'noopener noreferrer'
                                : undefined
                            }
                            onClick={handleLinkClick}
                            className="flex flex-col rounded-lg px-3 py-2 transition-colors hover:bg-blue-50 translate-element"
                          >
                            <span className="text-sm font-medium text-gray-800 hover:text-blue-700 translate-element">
                              {item.title}
                            </span>
                            {item.description && (
                              <span className="mt-0.5 text-xs leading-snug text-gray-500 translate-element">
                                {item.description}
                              </span>
                            )}
                          </Link>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Drawer Footer CTAs */}
        <div className="flex flex-shrink-0 flex-col gap-2 border-t border-gray-200 bg-gray-50 px-4 py-4">
          <button
            type="button"
            onClick={() => {
              trackEvent({
                action: 'button_click',
                category: 'engagement',
                label: 'get_involved',
              });
              dispatch(openModal());
              handleLinkClick();
            }}
            className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100"
          >
            Get involved
          </button>
          <button
            type="button"
            onClick={() => {
              trackEvent({
                action: 'button_click',
                category: 'navigation',
                label: 'explore_data',
              });
              router.push('/explore-data');
              handleLinkClick();
            }}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Explore data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
