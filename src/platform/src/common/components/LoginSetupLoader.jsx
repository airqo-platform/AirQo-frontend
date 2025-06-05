'use client';

import React from 'react';
import { motion } from 'framer-motion';

const LoginSetupLoader = ({
  organizationName = null,
  organizationLogo = null,
  isOrganization = false,
}) => {
  // Dot animation variants with improved timing
  const dotVariants = {
    start: { opacity: 0.3, scale: 0.8 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.8,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'reverse',
      },
    },
  };

  const containerVariants = {
    start: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  // Determine display content based on whether it's an organization or individual
  const displayName = isOrganization
    ? organizationName || 'Organization'
    : 'AirQo';
  const logoSrc = isOrganization
    ? organizationLogo || '/icons/airqo_logo.svg'
    : '/icons/airqo_logo.svg';
  const welcomeMessage = isOrganization
    ? `Welcome to ${displayName}`
    : 'Welcome to AirQo';

  return (
    <div className="w-full h-screen flex flex-col justify-center items-center bg-white dark:bg-gray-900">
      {/* Main content container */}
      <motion.div
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Logo */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <img
            src={logoSrc}
            alt={`${displayName} Logo`}
            className="h-20 w-auto"
            onError={(e) => {
              e.target.src = '/icons/airqo_logo.svg';
            }}
          />
        </motion.div>

        {/* Welcome Message */}
        <motion.div
          className="text-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            {welcomeMessage}
          </h1>
          <motion.p
            className="text-sm text-gray-600 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            Setting up your dashboard...
          </motion.p>
        </motion.div>

        {/* Three dots loading animation */}
        <motion.div
          className="flex space-x-2"
          variants={containerVariants}
          initial="start"
          animate="animate"
        >
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"
              variants={dotVariants}
              style={{
                animationDelay: `${index * 0.2}s`,
              }}
            />
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginSetupLoader;
