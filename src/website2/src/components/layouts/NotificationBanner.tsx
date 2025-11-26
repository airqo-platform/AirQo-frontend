'use client';

import { motion } from 'framer-motion';
import type React from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';

// import { FiGlobe } from 'react-icons/fi';
import mainConfig from '@/configs/mainConfigs';

import { trackEvent } from '../GoogleAnalytics';

const CLEAN_AIR_NETWORK_ROUTE = 'https://cleanairafrica.org/';

const NotificationBanner: React.FC = () => {
  const handleNetworkClick = (version: 'desktop' | 'mobile') => {
    trackEvent({
      action: 'link_click',
      category: 'navigation',
      label: `clean_air_network_${version}`,
    });
  };

  return (
    <div className="bg-blue-50 text-[14px] text-gray-700">
      <div
        className={`py-[11px] px-4 lg:px-0 flex justify-end items-center ${mainConfig.containerClass}`}
      >
        {/* Language Selector */}
        {/* <div className="flex items-center space-x-2">
          <FiGlobe className="w-4 h-4" />
          <span className="text-sm font-medium">English</span>
        </div> */}

        {/* CLEAN-AIR Network Link */}
        <a
          href={CLEAN_AIR_NETWORK_ROUTE}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => handleNetworkClick('desktop')}
        >
          <div className="items-center space-x-2 hidden md:flex cursor-pointer">
            <span className="text-sm font-medium">
              Discover the Africa Clean Air Network
            </span>
            <motion.span
              className="text-blue-600 hover:text-blue-800 flex items-center"
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Number.POSITIVE_INFINITY }}
            >
              Visit Website <FaArrowRightLong className="ml-2 w-4 h-4" />
            </motion.span>
          </div>
          <div
            className="items-center space-x-2 flex md:hidden cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              handleNetworkClick('mobile');
              window.open(
                CLEAN_AIR_NETWORK_ROUTE,
                '_blank',
                'noopener,noreferrer',
              );
            }}
          >
            <span className="text-[10px] text-blue-600 hover:text-blue-800 font-medium">
              Africa Clean Air Network
            </span>
          </div>
        </a>
      </div>
    </div>
  );
};

export default NotificationBanner;
