'use client';

import './globals.css';

import { motion } from 'framer-motion';
import React from 'react';

const Loading = () => {
  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-white z-[9999] fixed inset-0"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center space-y-4">
        <span className="loader"></span>
        <p className="text-gray-600 text-sm font-medium sr-only">Loading...</p>
      </div>
    </motion.div>
  );
};

export default Loading;
