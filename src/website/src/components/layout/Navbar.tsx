'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiExternalLink } from 'react-icons/fi';
import { RiCloseFill } from 'react-icons/ri';
import { TbChevronDown, TbMenu } from 'react-icons/tb';

import { trackEvent } from '@/components/GoogleAnalytics';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import mainConfig from '@/config/site.config';
import { useDispatch } from '@/hooks';
import useLockBodyScroll from '@/hooks/useLockBodyScroll';
import { NAV_ITEMS, type NavMenuItem } from '@/lib/navItems';
import { getExternalLinkProps } from '@/lib/security/safeExternalLink';
import { CLOUDINARY_IMAGES } from '@/services/external/cloudinary.service';
import { openModal } from '@/store/slices/modalSlice';

import TopBanner from './TopBanner';

const NAV_MENU_CLOSE_DELAY_MS = 180;

const getMenuId = (title: string) =>
  `site-nav-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const isExternalItem = (item: NavMenuItem) =>
  item.newTab || item.href.startsWith('http');

const AirQoFallbackMark = ({ mobile = false }: { mobile?: boolean }) => (
  <span
    aria-hidden="true"
    className={`relative inline-flex items-end justify-center overflow-hidden rounded-[20px_20px_15px_15px] bg-[#1264f3] ${mobile ? 'h-8 w-[46px] pb-1' : 'h-11 w-[62px] pb-1.5'}`}
  >
    <span
      className={`absolute left-1/2 -translate-x-1/2 rotate-45 rounded-[7px] bg-[#1264f3] ${mobile ? '-top-2 h-6 w-6' : '-top-3 h-8 w-8'}`}
    />
    <span
      className={`relative font-bold tracking-[-0.08em] text-white ${mobile ? 'text-[11px]' : 'text-[15px]'}`}
    >
      airqo
    </span>
  </span>
);

const AirQoBrand = ({ mobile = false }: { mobile?: boolean }) => {
  const [logoFailed, setLogoFailed] = useState(false);

  return (
    <span className="inline-flex items-center" aria-label="AirQo">
      {logoFailed ? (
        <AirQoFallbackMark mobile={mobile} />
      ) : (
        <Image
          src={CLOUDINARY_IMAGES.logo}
          alt="AirQo"
          width={mobile ? 64 : 71}
          height={mobile ? 44 : 48}
          className={mobile ? 'h-8 w-auto' : 'h-10 w-auto'}
          priority={!mobile}
          onError={() => setLogoFailed(true)}
        />
      )}
    </span>
  );
};

const MenuLink: React.FC<{
  item: NavMenuItem;
  onClick?: () => void;
  className?: string;
}> = ({ item, onClick, className = '' }) => {
  const external = isExternalItem(item);
  const content = (
    <span className="flex items-start gap-2">
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-gray-900">{item.title}</span>
        {item.description && (
          <span className="mt-0.5 block text-xs leading-5 text-gray-500">
            {item.description}
          </span>
        )}
      </span>
      {external && (
        <FiExternalLink
          aria-hidden="true"
          className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400"
        />
      )}
    </span>
  );

  const sharedClassName = `group block rounded-md px-3 py-2.5 transition-colors hover:bg-blue-50 focus-visible:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${className}`;

  if (external) {
    return (
      <a
        href={item.href}
        {...getExternalLinkProps(item.href)}
        onClick={onClick}
        className={sharedClassName}
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={item.href} onClick={onClick} className={sharedClassName}>
      {content}
    </Link>
  );
};

const DropdownMenuContent: React.FC<{
  title: string;
  items: NavMenuItem[];
  menuId: string;
  isOpen: boolean;
  onPointerEnter: () => void;
  onNavigate: () => void;
  align?: 'left' | 'right';
}> = ({
  title,
  items,
  menuId,
  isOpen,
  onPointerEnter,
  onNavigate,
  align = 'left',
}) => (
  <div
    id={menuId}
    role="region"
    aria-label={`${title} menu`}
    aria-hidden={!isOpen}
    hidden={!isOpen}
    onPointerEnter={onPointerEnter}
    className={`absolute top-full z-[10001] w-[min(640px,calc(100vw-2rem))] pt-3 ${
      align === 'right' ? 'right-0' : 'left-0'
    }`}
  >
    <div className="max-h-[min(560px,calc(100vh-7rem))] overflow-y-auto rounded-md border border-gray-200 bg-white p-3 shadow-lg">
      <div className="mb-2 border-b border-gray-100 px-3 pb-2.5">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-gray-600">
          {title}
        </p>
      </div>
      <ul
        className={`grid gap-0.5 ${items.length > 5 ? 'sm:grid-cols-2' : 'grid-cols-1'}`}
      >
        {items.map((item) => (
          <li key={`${item.href}-${item.title}`}>
            <MenuLink item={item} onClick={onNavigate} />
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const Navbar: React.FC = () => {
  const dispatch = useDispatch();
  const navRef = useRef<HTMLElement>(null);
  const mobileNavigationRef = useRef<HTMLDivElement>(null);
  const lastScrollYRef = useRef(0);
  const hoverCloseTimeoutRef = useRef<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const [isHidden, setIsHidden] = useState(false);

  const toggleMenu = useCallback(() => setMenuOpen((prev) => !prev), []);

  const toggleExpandedMenu = useCallback(
    (menuName: string) =>
      setExpandedMenu((prev) => (prev === menuName ? null : menuName)),
    [],
  );

  const clearHoverCloseTimeout = useCallback(() => {
    if (hoverCloseTimeoutRef.current !== null) {
      window.clearTimeout(hoverCloseTimeoutRef.current);
      hoverCloseTimeoutRef.current = null;
    }
  }, []);

  const openDesktopMenu = useCallback(
    (menuName: string) => {
      clearHoverCloseTimeout();
      setExpandedMenu(menuName);
    },
    [clearHoverCloseTimeout],
  );

  const scheduleDesktopMenuClose = useCallback(
    (menuName: string) => {
      clearHoverCloseTimeout();
      hoverCloseTimeoutRef.current = window.setTimeout(() => {
        setExpandedMenu((current) => (current === menuName ? null : current));
        hoverCloseTimeoutRef.current = null;
      }, NAV_MENU_CLOSE_DELAY_MS);
    },
    [clearHoverCloseTimeout],
  );

  useEffect(() => () => clearHoverCloseTimeout(), [clearHoverCloseTimeout]);

  const handleLinkClick = useCallback(() => {
    clearHoverCloseTimeout();
    setMenuOpen(false);
    setExpandedMenu(null);
  }, [clearHoverCloseTimeout]);

  const openEngagementDialog = () => {
    trackEvent({
      action: 'button_click',
      category: 'engagement',
      label: 'get_involved',
    });
    dispatch(openModal());
    handleLinkClick();
  };

  useLockBodyScroll(menuOpen);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const lastScrollY = lastScrollYRef.current;

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsHidden(true);
      } else if (currentScrollY < lastScrollY) {
        setIsHidden(false);
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleOutsidePointer = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        expandedMenu &&
        !navRef.current?.contains(target) &&
        !mobileNavigationRef.current?.contains(target)
      ) {
        clearHoverCloseTimeout();
        setExpandedMenu(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && expandedMenu) {
        clearHoverCloseTimeout();
        navRef.current
          ?.querySelector<HTMLButtonElement>(
            `button[aria-controls="${getMenuId(expandedMenu)}"]`,
          )
          ?.focus();
        setExpandedMenu(null);
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointer);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [clearHoverCloseTimeout, expandedMenu]);

  return (
    <div
      className={`fixed top-0 z-[10000] w-full border-b border-gray-200 bg-white transition-transform duration-300 ${
        isHidden ? '-translate-y-full' : 'translate-y-0'
      }`}
    >
      <TopBanner />

      <nav ref={navRef} aria-label="Primary navigation" className="w-full">
        <div
          className={`flex min-h-[72px] items-center justify-between gap-4 px-4 ${mainConfig.containerClass}`}
        >
          <Link
            href={mainConfig.homePageUrl}
            aria-label="AirQo home"
            className="flex flex-shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            <AirQoBrand />
          </Link>

          <button
            type="button"
            onClick={toggleMenu}
            className="grid h-10 w-10 place-items-center rounded-md text-gray-800 transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 lg:hidden"
            aria-label={
              menuOpen ? 'Close navigation menu' : 'Open navigation menu'
            }
            aria-expanded={menuOpen}
            aria-controls="mobile-site-navigation"
          >
            <TbMenu size={26} aria-hidden="true" />
          </button>

          <div className="hidden min-w-0 flex-1 items-center justify-end gap-0.5 lg:flex xl:gap-1">
            {Object.entries(NAV_ITEMS).map(([title, items]) => {
              const menuId = getMenuId(title);
              const isExpanded = expandedMenu === title;

              return (
                <div
                  key={title}
                  className="relative flex-shrink-0"
                  onPointerEnter={(event) => {
                    if (event.pointerType !== 'touch') openDesktopMenu(title);
                  }}
                  onPointerLeave={(event) => {
                    if (event.pointerType !== 'touch') {
                      scheduleDesktopMenuClose(title);
                    }
                  }}
                  onFocusCapture={() => openDesktopMenu(title)}
                  onBlur={(event) => {
                    if (
                      !event.currentTarget.contains(
                        event.relatedTarget as Node | null,
                      )
                    ) {
                      clearHoverCloseTimeout();
                      setExpandedMenu((current) =>
                        current === title ? null : current,
                      );
                    }
                  }}
                >
                  <button
                    type="button"
                    onClick={() => openDesktopMenu(title)}
                    className="flex items-center whitespace-nowrap rounded-md px-2.5 py-3 text-[15px] font-medium text-gray-800 transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 xl:px-3"
                    aria-expanded={isExpanded}
                    aria-controls={menuId}
                  >
                    {title}
                    <TbChevronDown
                      aria-hidden="true"
                      className={`ml-1 h-4 w-4 text-gray-500 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <DropdownMenuContent
                    title={title}
                    items={items}
                    menuId={menuId}
                    isOpen={isExpanded}
                    onPointerEnter={clearHoverCloseTimeout}
                    onNavigate={handleLinkClick}
                    align={
                      ['Developers', 'Resources', 'About AirQo'].includes(title)
                        ? 'right'
                        : 'left'
                    }
                  />
                </div>
              );
            })}

            <Link
              href="/explore-data"
              onClick={handleLinkClick}
              className="ml-1 inline-flex flex-shrink-0 items-center whitespace-nowrap rounded-none bg-blue-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 xl:ml-2 xl:px-5"
            >
              Explore data
            </Link>
            <button
              type="button"
              onClick={openEngagementDialog}
              className="hidden flex-shrink-0 items-center whitespace-nowrap rounded-none bg-gray-100 px-4 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 xl:inline-flex xl:px-5"
            >
              Get involved
            </button>
          </div>
        </div>
      </nav>

      <Dialog
        open={menuOpen}
        onOpenChange={(open) => {
          if (!open) handleLinkClick();
          else setMenuOpen(true);
        }}
      >
        <DialogContent
          hideClose
          ref={mobileNavigationRef}
          id="mobile-site-navigation"
          aria-label="Site navigation"
          className="!fixed !inset-y-0 !left-0 !top-0 !z-[100001] !flex !h-[100svh] !max-h-[100svh] !translate-x-0 !translate-y-0 w-[min(360px,88vw)] flex-col bg-white shadow-2xl lg:hidden"
        >
          <DialogTitle className="sr-only">Main navigation</DialogTitle>

          <div className="flex flex-shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3.5">
            <Link
              href={mainConfig.homePageUrl}
              onClick={handleLinkClick}
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              <AirQoBrand mobile />
            </Link>
            <button
              type="button"
              onClick={handleLinkClick}
              className="grid h-9 w-9 place-items-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Close navigation menu"
            >
              <RiCloseFill size={22} aria-hidden="true" />
            </button>
          </div>

          <nav
            className="flex-1 overflow-y-auto"
            aria-label="Mobile site navigation"
          >
            {Object.entries(NAV_ITEMS).map(([title, items]) => {
              const isExpanded = expandedMenu === title;
              const menuId = `mobile-${getMenuId(title)}`;

              return (
                <section key={title} className="border-b border-gray-100">
                  <button
                    type="button"
                    onClick={() => toggleExpandedMenu(title)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-500"
                    aria-expanded={isExpanded}
                    aria-controls={menuId}
                  >
                    <span className="text-sm font-semibold text-gray-900">
                      {title}
                    </span>
                    <TbChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 text-gray-400 transition-transform ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <div id={menuId} hidden={!isExpanded}>
                    <ul className="space-y-0.5 px-3 pb-3">
                      {items.map((item) => (
                        <li key={`${item.href}-${item.title}`}>
                          <MenuLink
                            item={item}
                            onClick={handleLinkClick}
                            className="px-3 py-3"
                          />
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              );
            })}
          </nav>

          <div className="flex flex-shrink-0 flex-col gap-2 border-t border-gray-200 bg-gray-50 px-4 py-4">
            <Link
              href="/explore-data"
              onClick={handleLinkClick}
              className="w-full rounded-none bg-blue-600 px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Explore data
            </Link>
            <button
              type="button"
              onClick={openEngagementDialog}
              className="w-full rounded-none bg-gray-100 px-4 py-3 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            >
              Get involved
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Navbar;
