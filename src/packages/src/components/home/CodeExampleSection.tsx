// components/home/CodeExampleSection.tsx
"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";

const frameworks = [
  {
    name: "React",
    install: "npm install @airqo/icons-react",
    usage: `import { AqHome01 } from '@airqo/icons-react';

<AqHome01 size={24} color="#0A84FF" />`,
    language: "tsx",
  },
  {
    name: "Vue",
    install: "npm install @airqo/icons-vue",
    usage: `<template>
  <AqHome01 :size="24" color="#0A84FF" />
</template>

<script setup>
import { AqHome01 } from '@airqo/icons-vue';
</script>`,
    language: "vue",
  },
  {
    name: "Flutter",
    install: "flutter pub add airqo_icons_flutter",
    usage: `import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';

AqHome01(
  size: 24.0,
  color: Color(0xFF0A84FF),
)`,
    language: "dart",
  },
];

export default function CodeExampleSection() {
  const [activeFramework, setActiveFramework] = useState(0);

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
            Choose Your Framework
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Same beautiful icons, optimized for your preferred framework.
          </p>
        </div>

        {/* Framework Tabs */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-gray-200 dark:bg-gray-800 rounded-lg p-1">
            {frameworks.map((framework, index) => (
              <button
                key={framework.name}
                onClick={() => setActiveFramework(index)}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  activeFramework === index
                    ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                {framework.name}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
                <span className="ml-4 text-sm text-gray-600 dark:text-gray-400">
                  {frameworks[activeFramework].name} Example
                </span>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Install
                </h4>
                <pre className="bg-gray-900 text-green-400 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{frameworks[activeFramework].install}</code>
                </pre>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                  Usage
                </h4>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                  <code>{frameworks[activeFramework].usage}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
