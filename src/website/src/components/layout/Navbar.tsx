'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { FiArrowRight, FiArrowUpRight, FiExternalLink } from 'react-icons/fi';
import { RiCloseFill } from 'react-icons/ri';
import { TbChevronDown, TbMenu } from 'react-icons/tb';

import { trackEvent } from '@/components/GoogleAnalytics';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { API_CONSOLE_URL } from '@/config/console.config';
import {
  getProductsByFamily,
  type Product,
  PRODUCT_FAMILIES,
  PRODUCT_FAMILY_ORDER,
} from '@/config/products.config';
import mainConfig from '@/config/site.config';
import { useDispatch } from '@/hooks';
import useLockBodyScroll from '@/hooks/useLockBodyScroll';
import {
  AFRICA_CLEAN_AIR_FORUM_URL,
  NAV_ITEMS,
  NAV_MENU_LINKS,
  type NavMenuItem,
} from '@/lib/navItems';
import { getExternalLinkProps } from '@/lib/security/safeExternalLink';
import { CLOUDINARY_IMAGES } from '@/services/external/cloudinary.service';
import { openModal } from '@/store/slices/modalSlice';

import TopBanner from './TopBanner';

const NAV_MENU_CLOSE_DELAY_MS = 180;

const getMenuId = (title: string) =>
  `site-nav-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;

const isExternalItem = (item: NavMenuItem) =>
  item.newTab || item.href.startsWith('http');

const toNavMenuItem = (product: Product): NavMenuItem => ({
  title: product.name,
  description: product.tagline,
  href: product.href,
});

type FeaturedCard = {
  title: string;
  description: string;
  href: string;
  external?: boolean;
};

const FEATURED_CARDS: Record<string, FeaturedCard> = {
  Solutions: {
    title: 'Network coverage',
    description: 'Explore the monitoring network across African cities.',
    href: '/solutions/network-coverage',
  },
  Developers: {
    title: 'API Console',
    description: 'Manage clients, tokens, usage, and plans.',
    href: API_CONSOLE_URL,
    external: true,
  },
  Resources: {
    title: 'Research & publications',
    description: 'Evidence and findings from AirQo research.',
    href: '/resources?tab=research',
  },
  About: {
    title: 'Africa Clean Air Forum',
    description: 'The annual forum for clean air action in Africa.',
    href: AFRICA_CLEAN_AIR_FORUM_URL,
    external: true,
  },
};

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
        <span className="block font-medium text-ink">{item.title}</span>
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

  const sharedClassName = `group block rounded-md px-3 py-2.5 transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${className}`;

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

const MobileProductLink: React.FC<{
  item: NavMenuItem;
  onClick: () => void;
}> = ({ item, onClick }) => (
  <Link
    href={item.href}
    onClick={onClick}
    className="flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-muted focus-visible:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
  >
    <span className="min-w-0 break-words">{item.title}</span>
    <FiArrowRight
      aria-hidden="true"
      className="h-3.5 w-3.5 flex-none text-gray-400"
    />
  </Link>
);

const MegaMenuPanel: React.FC<{
  menuId: string;
  isOpen: boolean;
  onPointerEnter: () => void;
  children: React.ReactNode;
}> = ({ menuId, isOpen, onPointerEnter, children }) => (
  <div
    id={menuId}
    role="region"
    aria-label="Navigation menu"
    aria-hidden={!isOpen}
    hidden={!isOpen}
    onPointerEnter={onPointerEnter}
    className="absolute left-0 right-0 top-full z-[10001] pt-3"
  >
    <div className="mx-auto max-w-7xl px-3 sm:px-4 lg:px-6">
      <div className="max-h-[min(72vh,680px)] overflow-y-auto overscroll-contain rounded-md border border-line bg-white p-4 shadow-sm">
        {children}
      </div>
    </div>
  </div>
);

const ProductsMenuContent: React.FC<{ onNavigate: () => void }> = ({
  onNavigate,
}) => (
  <div>
    <div className="mb-3 flex items-center justify-between gap-4 border-b border-line px-3 pb-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">
        Products
      </p>
      <Link
        href={NAV_MENU_LINKS.Products}
        onClick={onNavigate}
        className="inline-flex flex-shrink-0 items-center gap-1.5 text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        View all products
        <FiArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
      </Link>
    </div>

    <div className="grid grid-cols-3 gap-4 px-1">
      {PRODUCT_FAMILY_ORDER.map((family) => {
        const familyInfo = PRODUCT_FAMILIES.find((info) => info.id === family);
        const items = getProductsByFamily(family);

        return (
          <div key={family} className="min-w-0">
            <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-slate-500">
              {familyInfo?.number} · {familyInfo?.label}
            </p>
            <ul className="space-y-0.5">
              {items.map((item) => (
                <li key={item.href}>
                  <MenuLink item={toNavMenuItem(item)} onClick={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        );
      })}
    </div>

    <div className="mt-4 flex flex-col gap-2 border-t border-line px-3 pt-3 sm:flex-row sm:items-center sm:gap-6">
      <a
        href="https://ai.airqo.net/map"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open live map (opens in a new tab)"
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        Open live map
        <FiArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
      </a>
      <Link
        href={NAV_MENU_LINKS.Products}
        onClick={onNavigate}
        className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        Compare all products
        <FiArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
      </Link>
    </div>
  </div>
);

const RichMenuContent: React.FC<{
  title: string;
  items: NavMenuItem[];
  onNavigate: () => void;
}> = ({ title, items, onNavigate }) => {
  const featured = FEATURED_CARDS[title];
  const viewAllHref =
    NAV_MENU_LINKS[title as keyof typeof NAV_MENU_LINKS] ?? '/';

  return (
    <div>
      <div className="mb-3 flex items-center justify-between gap-4 border-b border-line px-3 pb-3">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">
          {title}
        </p>
        <Link
          href={viewAllHref}
          onClick={onNavigate}
          className="inline-flex flex-shrink-0 items-center gap-1.5 text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          View all
          <FiArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
        </Link>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <ul className="grid gap-0.5 sm:grid-cols-2">
          {items.map((item) => (
            <li key={`${item.href}-${item.title}`}>
              <MenuLink item={item} onClick={onNavigate} />
            </li>
          ))}
        </ul>

        {featured && (
          <aside className="min-w-0 rounded-md border border-line bg-surface-muted p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">
              Featured
            </p>
            <h4 className="mt-2 text-[15px] font-semibold text-ink">
              {featured.title}
            </h4>
            <p className="mt-1.5 text-sm leading-6 text-gray-600">
              {featured.description}
            </p>
            {featured.external ? (
              <a
                href={featured.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Open
                <FiArrowUpRight aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            ) : (
              <Link
                href={featured.href}
                onClick={onNavigate}
                className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                Open
                <FiArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            )}
          </aside>
        )}
      </div>
    </div>
  );
};

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
      className={`fixed left-2 right-2 top-2 z-[10000] transition-transform duration-300 sm:left-3 sm:right-3 sm:top-3 ${
        isHidden ? '-translate-y-[120%]' : 'translate-y-0'
      }`}
    >
      <div className="w-full rounded-md border border-line bg-white shadow-sm">
        <TopBanner insideShell />

        <nav
          ref={navRef}
          aria-label="Primary navigation"
          className="relative w-full"
        >
          <div className="mx-auto flex min-h-[64px] max-w-7xl items-center justify-between gap-4 px-3 sm:px-4 lg:px-6">
            <Link
              href={mainConfig.homePageUrl}
              aria-label="AirQo home"
              className="flex flex-shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              <AirQoBrand />
            </Link>

            <button
              type="button"
              onClick={toggleMenu}
              className="grid h-10 w-10 place-items-center rounded-md text-ink transition-colors hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 lg:hidden"
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
                const isProducts = title === 'Products';

                return (
                  <div
                    key={title}
                    className="static"
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
                      className="flex items-center whitespace-nowrap rounded-md px-2.5 py-3 text-[15px] font-medium text-ink transition-colors hover:bg-gray-100 focus-visible:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 xl:px-3"
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
                    <MegaMenuPanel
                      menuId={menuId}
                      isOpen={isExpanded}
                      onPointerEnter={clearHoverCloseTimeout}
                    >
                      {isProducts ? (
                        <ProductsMenuContent onNavigate={handleLinkClick} />
                      ) : (
                        <RichMenuContent
                          title={title}
                          items={items}
                          onNavigate={handleLinkClick}
                        />
                      )}
                    </MegaMenuPanel>
                  </div>
                );
              })}

              <a
                href="https://ai.airqo.net/map"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Live map (opens in a new tab)"
                className="ml-1 inline-flex flex-shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md bg-brand px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 xl:ml-2 xl:px-5"
              >
                Live map
                <FiExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </nav>
      </div>

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
          className="!fixed !bottom-2 !left-2 !top-2 !right-auto !z-[100001] !flex !h-[calc(100dvh-1rem)] !max-h-[calc(100dvh-1rem)] !w-[min(380px,calc(100vw-1rem))] !translate-x-0 !translate-y-0 flex-col overflow-hidden rounded-md border border-line bg-white shadow-2xl lg:hidden"
        >
          <DialogTitle className="sr-only">Main navigation</DialogTitle>

          <div className="flex flex-shrink-0 items-center justify-between border-b border-line px-4 py-3.5">
            <Link
              href={mainConfig.homePageUrl}
              onClick={handleLinkClick}
              className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            >
              <AirQoBrand mobile />
            </Link>
            <button
              type="button"
              onClick={handleLinkClick}
              className="grid h-9 w-9 place-items-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Close navigation menu"
            >
              <RiCloseFill size={22} aria-hidden="true" />
            </button>
          </div>

          <nav
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
            aria-label="Mobile site navigation"
          >
            {Object.entries(NAV_ITEMS).map(([title, items]) => {
              const isExpanded = expandedMenu === title;
              const menuId = `mobile-${getMenuId(title)}`;
              const isProducts = title === 'Products';

              return (
                <section key={title} className="border-b border-line">
                  <button
                    type="button"
                    onClick={() => toggleExpandedMenu(title)}
                    className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
                    aria-expanded={isExpanded}
                    aria-controls={menuId}
                  >
                    <span className="text-sm font-semibold text-ink">
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
                    {isProducts ? (
                      <div className="space-y-0.5 px-3 pb-3">
                        {PRODUCT_FAMILY_ORDER.map((family) => {
                          const familyInfo = PRODUCT_FAMILIES.find(
                            (info) => info.id === family,
                          );
                          const familyItems = getProductsByFamily(family);

                          return (
                            <div key={family} className="pt-2">
                              <p className="px-3 py-1 font-mono text-[11px] uppercase tracking-[0.2em] text-gray-500">
                                {familyInfo?.label}
                              </p>
                              <ul className="space-y-0.5">
                                {familyItems.map((item) => (
                                  <li key={item.href}>
                                    <MobileProductLink
                                      item={toNavMenuItem(item)}
                                      onClick={handleLinkClick}
                                    />
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
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
                    )}
                  </div>
                </section>
              );
            })}
          </nav>

          <div className="flex flex-shrink-0 flex-col gap-2 rounded-md border-t border-line bg-surface-muted px-4 py-4">
            <a
              href="https://ai.airqo.net/map"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Live map (opens in a new tab)"
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-brand px-4 py-3 text-center text-sm font-medium text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Live map
              <FiExternalLink aria-hidden="true" className="h-3.5 w-3.5" />
            </a>
            <button
              type="button"
              onClick={openEngagementDialog}
              className="w-full rounded-md bg-gray-100 px-4 py-3 text-sm font-medium text-ink transition-colors hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
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
