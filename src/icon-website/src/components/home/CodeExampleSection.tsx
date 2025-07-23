"use client";
import React from "react";
import { motion } from "framer-motion";

export default function CodeExampleSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-24 bg-gray-50 dark:bg-gray-900/50"
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple to Use
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Get started in seconds.
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                  Install & Use
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Install
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>npm install @airqo/icons-react</code>
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Basic Usage
                </h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{`import { Home01 } from '@airqo/icons-react';
<Home01 size={24} color="#0A84FF" />`}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
