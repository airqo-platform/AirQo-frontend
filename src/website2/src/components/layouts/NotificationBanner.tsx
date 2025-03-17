'use client';

import { motion } from 'framer-motion';
import { useLocale, useTranslations } from 'next-intl';
import type React from 'react';
import { useState } from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';
import { FiChevronDown, FiGlobe } from 'react-icons/fi';

import mainConfig from '@/configs/mainConfigs';
import { Link, usePathname, useRouter } from '@/navigation';

import { trackEvent } from '../GoogleAnalytics';

const CLEAN_AIR_NETWORK_ROUTE = '/clean-air-network';

const NotificationBanner: React.FC = () => {
  const t = useTranslations('notificationBanner');
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  const handleNetworkClick = (version: 'desktop' | 'mobile') => {
    trackEvent({
      action: 'link_click',
      category: 'navigation',
      label: `clean_air_network_${version}`,
    });
  };

  const changeLanguage = (newLocale: string) => {
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="bg-blue-50 text-[14px] text-gray-700">
      <div
        className={`py-[11px] px-4 lg:px-0 flex space-x-5 justify-end items-center ${mainConfig.containerClass}`}
      >
        {/* Language Selector */}
        <div className="relative">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center space-x-2 text-sm font-medium focus:outline-none"
          >
            <FiGlobe className="w-4 h-4" />
            <span>{locale === 'en' ? 'English' : 'Français'}</span>
            <FiChevronDown
              className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {isOpen && (
            <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-xl z-20">
              <button
                onClick={() => changeLanguage('en')}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
              >
                English
              </button>
              <button
                onClick={() => changeLanguage('fr')}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
              >
                Français
              </button>
            </div>
          )}
        </div>

        {/* CLEAN-AIR Network Link */}
        <Link
          href={CLEAN_AIR_NETWORK_ROUTE}
          onClick={() => handleNetworkClick('desktop')}
        >
          <div className="items-center space-x-2 hidden md:flex cursor-pointer">
            <span className="text-sm font-medium">{t('joinNetwork')}</span>
            <motion.span
              className="text-blue-600 hover:text-blue-800 flex items-center"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              {t('learnMore')} <FaArrowRightLong className="ml-2 w-4 h-4" />
            </motion.span>
          </div>
          <div
            className="items-center space-x-2 flex md:hidden cursor-pointer"
            onClick={(e) => {
              e.stopPropagation(); // Prevent double event firing
              handleNetworkClick('mobile');
            }}
          >
            <span className="text-[10px] text-blue-600 hover:text-blue-800 font-medium">
              {t('joinNetwork')}
            </span>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default NotificationBanner;
