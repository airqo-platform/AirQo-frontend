'use client';

import { motion } from 'framer-motion';
import React from 'react';

const Loading = () => {
  return (
    <motion.div
      className="flex items-center justify-center min-h-screen bg-white"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex flex-col items-center space-y-4">
        <span className="loader"></span>
        <p className="text-gray-600 text-sm font-medium">Loading...</p>
      </div>

      <style jsx>{`
        .loader {
          width: 48px;
          height: 48px;
          display: inline-block;
          position: relative;
        }
        .loader::after,
        .loader::before {
          content: '';
          box-sizing: border-box;
          width: 48px;
          height: 48px;
          border-radius: 50%;
          border: 2px solid #145dff;
          position: absolute;
          left: 0;
          top: 0;
          animation: animloader 2s linear infinite;
        }
        .loader::after {
          animation-delay: 1s;
        }

        @keyframes animloader {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </motion.div>
  );
};

export default Loading;
