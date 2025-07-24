"use client";
import React from "react";
import { motion } from "framer-motion";
import { Zap, Code, Palette, Search } from "lucide-react";
const modernBlue = "#0A84FF";

const features = [
  {
    icon: <Zap className="h-6 w-6" />,
    title: "1 000+ Icons",
    description: "Comprehensive collection for every use case",
  },
  {
    icon: <Code className="h-6 w-6" />,
    title: "TypeScript Ready",
    description: "Full type definitions out of the box",
  },
  {
    icon: <Palette className="h-6 w-6" />,
    title: "Fully Customizable",
    description: "Size, color, stroke – all via props",
  },
  {
    icon: <Search className="h-6 w-6" />,
    title: "Tree Shakable",
    description: "Import only what you need",
  },
];

export default function FeaturesSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="py-24"
    >
      <div className="mx-auto max-w-7xl px-4">
        <h2 className="text-center text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Why Choose AirQO Icons?
        </h2>
        <p className="text-center text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-12">
          Built for developers, designed for users.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              viewport={{ once: true }}
              className="p-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700"
            >
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-white mb-4"
                style={{ backgroundColor: modernBlue }}
              >
                {f.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {f.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {f.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
