// components/docs/DocHeader.tsx
import React from "react";
import { motion } from "framer-motion";

export default function DocHeader() {
  return (
    <div className="bg-white border-b border-gray-200 dark:bg-gray-900 dark:border-gray-800">
      <div className="px-4 py-12 mx-auto text-center max-w-7xl sm:px-6 lg:px-8">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4 text-4xl font-bold text-gray-900 dark:text-white"
        >
          Documentation
        </motion.h1>
        <p className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-300">
          Everything you need to get started with AirQo Icons for React, Vue,
          and Flutter.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mt-6">
          <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
            React
          </span>
          <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
            Vue 3
          </span>
          <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm font-medium">
            Flutter
          </span>
        </div>
      </div>
    </div>
  );
}
