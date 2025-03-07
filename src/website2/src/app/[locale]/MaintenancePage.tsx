'use client';
import { motion } from 'framer-motion';
import React from 'react';

interface MaintenancePageProps {
  message: string;
}

const MaintenancePage: React.FC<MaintenancePageProps> = ({ message }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
      className="fixed inset-0 flex flex-col items-center justify-center bg-blue-50 z-50"
    >
      <div className="bg-white p-8 sm:p-12 shadow-xl max-w-xl mx-auto text-center rounded-lg">
        <motion.h1
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-2xl sm:text-5xl font-bold text-blue-600 mb-6"
        >
          Site Under Maintenance
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-base sm:text-lg text-gray-700 mb-6"
        >
          {message ||
            'We are currently upgrading our website to serve you better. Please check back soon.'}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-sm text-gray-600"
        >
          If you need assistance, feel free to reach us at{' '}
          <a
            href="mailto:support@airqo.net"
            className="text-blue-600 underline font-semibold"
          >
            support@airqo.net
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MaintenancePage;
