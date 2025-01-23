'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FaArrowRightLong } from 'react-icons/fa6';
// import { FiGlobe } from 'react-icons/fi';

const NotificationBanner: React.FC = () => {
  const router = useRouter();

  return (
    <div className="bg-blue-50 text-[14px] text-gray-700">
      <div className="py-[11px] px-4 lg:px-0 flex justify-end items-center max-w-5xl mx-auto">
        {/* Language Selector */}
        {/* <div className="flex items-center space-x-2">
          <FiGlobe className="w-4 h-4" />
          <span className="text-sm font-medium">English</span>
        </div> */}

        {/* CLEAN-AIR Network Link */}
        <div
          onClick={() => router.push('/clean-air-network')}
          className="items-center space-x-2 hidden md:flex cursor-pointer"
        >
          <span className="text-sm font-medium">
            Join the CLEAN-AIR Network
          </span>
          <motion.span
            className="text-blue-600 hover:text-blue-800 flex items-center"
            animate={{ x: [0, 4, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Learn more <FaArrowRightLong className="ml-2 w-4 h-4" />
          </motion.span>
        </div>
        <div
          onClick={() => router.push('/clean-air-network')}
          className="items-center space-x-2 flex md:hidden cursor-pointer"
        >
          <span className="text-[10px] text-blue-600 hover:text-blue-800 font-medium">
            Join the CLEAN-AIR Network
          </span>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;
