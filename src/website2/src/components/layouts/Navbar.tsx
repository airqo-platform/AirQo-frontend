'use client';
import { motion, useAnimation } from 'framer-motion';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { RiCloseFill } from 'react-icons/ri';
import { TbChevronDown, TbMenu } from 'react-icons/tb';

import { CustomButton } from '@/components/ui';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  NavigationMenuViewport,
} from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useDispatch } from '@/hooks';
import { Link } from '@/navigation';
import { openModal } from '@/store/slices/modalSlice';
import TabNavigation from '@/views/cleanairforum/TabNavigation';

import { trackEvent } from '../GoogleAnalytics';
import NotificationBanner from './NotificationBanner';

// Type definitions
type MenuItem = {
  title: string;
  description?: string;
  href: string;
};

type MenuItems = {
  [key: string]: MenuItem[];
};

// Data for menu items
const menuItems: MenuItems = {
  Products: [
    {
      title: 'products.binosMonitor.title',
      description: 'products.binosMonitor.description',
      href: '/products/monitor',
    },
    {
      title: 'products.analyticsDashboard.title',
      description: 'products.analyticsDashboard.description',
      href: '/products/analytics',
    },
    {
      title: 'products.mobileApp.title',
      description: 'products.mobileApp.description',
      href: '/products/mobile-app',
    },
    {
      title: 'products.airQualityAPI.title',
      description: 'products.airQualityAPI.description',
      href: '/products/api',
    },
    {
      title: 'products.airQalibrate.title',
      description: 'products.airQalibrate.description',
      href: '/products/calibrate',
    },
  ],
  Solutions: [
    {
      title: 'solutions.africanCities.title',
      description: 'solutions.africanCities.description',
      href: '/solutions/african-cities',
    },
    {
      title: 'solutions.communities.title',
      description: 'solutions.communities.description',
      href: '/solutions/communities',
    },
    {
      title: 'solutions.research.title',
      description: 'solutions.research.description',
      href: '/solutions/research',
    },
  ],
  About: [
    { title: 'about.aboutUs', href: '/about-us' },
    { title: 'about.resources', href: '/resources' },
    { title: 'about.careers', href: '/careers' },
    { title: 'about.contactUs', href: '/contact' },
    { title: 'about.events', href: '/events' },
    { title: 'about.press', href: '/press' },
    { title: 'about.cleanAirForum', href: '/clean-air-forum/about' },
  ],
};

// Custom hook to detect scroll direction
function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down'>('up');

  useEffect(() => {
    let lastScrollY = window.pageYOffset;

    const updateScrollDirection = () => {
      const scrollY = window.pageYOffset;
      const direction = scrollY > lastScrollY ? 'down' : 'up';
      if (direction !== scrollDirection) {
        setScrollDirection(direction);
      }
      lastScrollY = scrollY > 0 ? scrollY : 0;
    };

    window.addEventListener('scroll', updateScrollDirection);

    return () => {
      window.removeEventListener('scroll', updateScrollDirection);
    };
  }, [scrollDirection]);

  return scrollDirection;
}

// Dropdown Menu Content Component
const DropdownMenuContent: React.FC<{
  title: string;
  items: MenuItem[];
}> = ({ title, items }) => {
  const t = useTranslations('navbar');

  return (
    <NavigationMenuContent className="bg-white shadow-lg md:w-[400px] lg:w-[600px] text-sm rounded-md p-4">
      <div className="text-gray-400 mb-4">{title}</div>
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
              {colItems.map((item) => (
                <li key={item.href}>
                  <NavigationMenuLink asChild>
                    <Link
                      href={item.href}
                      className="block p-2 rounded-xl hover:bg-blue-50 hover:text-blue-500 transition"
                    >
                      <div className="font-medium">{t(item.title)}</div>
                      {item.description && (
                        <div className="text-gray-500 text-sm mt-1">
                          {t(item.description)}
                        </div>
                      )}
                    </Link>
                  </NavigationMenuLink>
                </li>
              ))}
            </ul>
          ))}
      </div>
    </NavigationMenuContent>
  );
};

const Navbar: React.FC = () => {
  const t = useTranslations('navbar');
  const dispatch = useDispatch();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const scrollDirection = useScrollDirection();
  const controls = useAnimation();
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

  useEffect(() => {
    if (scrollDirection === 'down') {
      controls.start({ y: '-100%', transition: { duration: 0.3 } });
    } else if (scrollDirection === 'up') {
      controls.start({ y: '0%', transition: { duration: 0.3 } });
    }
  }, [scrollDirection, controls]);

  return (
    <motion.nav
      animate={controls}
      className="w-full bg-white sticky top-0 left-0 z-50"
    >
      {!pathname.startsWith('/clean-air-network') && <NotificationBanner />}
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
            />
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="text-gray-800 focus:outline-none md:hidden"
          >
            {menuOpen ? <RiCloseFill size={24} /> : <TbMenu size={30} />}
          </button>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex space-x-6 items-center">
            <NavigationMenuList className="space-x-3">
              {Object.entries(menuItems).map(([title, items]) => (
                <NavigationMenuItem key={title}>
                  <NavigationMenuTrigger className="text-gray-800 font-medium hover:text-blue-600 text-sm transition-colors">
                    {t(`menu.${title.toLowerCase()}`)}
                  </NavigationMenuTrigger>
                  <DropdownMenuContent
                    title={t(`menu.${title.toLowerCase()}`)}
                    items={items}
                  />
                </NavigationMenuItem>
              ))}
              <CustomButton
                onClick={() => dispatch(openModal())}
                className="text-blue-600 bg-blue-50 transition rounded-none"
              >
                {t('getInvolved')}
              </CustomButton>
              <CustomButton
                onClick={() => router.push('/explore-data')}
                className="rounded-none"
              >
                {t('exploreData')}
              </CustomButton>
            </NavigationMenuList>
            <NavigationMenuViewport />
          </NavigationMenu>

          {/* Mobile Navigation */}
          {menuOpen && (
            <div className="absolute top-[107px] left-0 w-full bg-white shadow-lg p-4 md:hidden z-40">
              {Object.entries(menuItems).map(([title, items]) => (
                <div key={title} className="mb-4">
                  <button
                    onClick={() => toggleExpandedMenu(title)}
                    className="text-gray-800 font-medium w-full text-left flex items-center justify-between"
                  >
                    {t(`menu.${title.toLowerCase()}`)}
                    <TbChevronDown
                      className={`ml-2 transition-transform duration-300 ${expandedMenu === title ? 'rotate-180' : 'rotate-0'}`}
                    />
                  </button>
                  <div
                    className={`overflow-hidden transition-max-height duration-300 ease-in-out ${expandedMenu === title ? 'max-h-screen' : 'max-h-0'}`}
                  >
                    {items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className="block px-4 py-2 text-gray-700 hover:bg-blue-50 transition rounded"
                      >
                        {t(item.title)}
                      </Link>
                    ))}
                  </div>
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
                  handleLinkClick();
                }}
                className="w-full text-blue-600 bg-blue-50 hover:bg-blue-100 transition rounded-none mb-2"
              >
                {t('getInvolved')}
              </CustomButton>
              <CustomButton
                onClick={() => {
                  trackEvent({
                    action: 'button_click',
                    category: 'navigation',
                    label: 'explore_data',
                  });
                  router.push('/explore-data');
                  handleLinkClick();
                }}
                className="w-full rounded-none"
              >
                {t('exploreData')}
              </CustomButton>
            </div>
          )}
        </div>
      </nav>
      {pathname.startsWith('/clean-air-network') && <TabNavigation />}
    </motion.nav>
  );
};

export default Navbar;
