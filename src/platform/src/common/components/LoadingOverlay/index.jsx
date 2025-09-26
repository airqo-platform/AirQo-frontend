'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AqRefreshCw04 } from '@airqo/icons-react';

/**
 * Loading Overlay Component
 * A transparent loading overlay with skeleton placeholders and refresh animation
 */
const LoadingOverlay = ({ isVisible }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm z-[9999] flex items-center justify-center"
          role="dialog"
          aria-modal="true"
          aria-label="Loading"
        >
          {/* Central loading content: rotating icon and the word 'Refreshing' */}
          <motion.div
            initial={{ scale: 0.98, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="bg-transparent rounded p-0 mx-4 max-w-sm w-full text-center"
          >
            <div>
              <div className="mb-3 flex justify-center">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                  <AqRefreshCw04 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Refreshing
              </h3>
            </div>
          </motion.div>

          {/* Background skeleton elements removed to keep overlay fully transparent */}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default LoadingOverlay;
