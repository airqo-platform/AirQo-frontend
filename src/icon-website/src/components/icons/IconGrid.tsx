"use client";
import React from "react";
import { motion } from "framer-motion";
import type { IconMetadata } from "@airqo/icons-react";
import IconCard from "./IconCard";

interface Props {
  icons: IconMetadata[];
  onSelect: (icon: IconMetadata) => void;
}

export default function IconGrid({ icons, onSelect }: Props) {
  if (icons.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-center py-16"
      >
        <div className="w-20 h-20 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-10 h-10 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white">
          No icons found
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Try a different search.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-7xl px-4 py-8 grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4"
    >
      {icons.map((icon, i) => (
        <motion.div
          key={icon.name}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: i * 0.02 }}
        >
          <IconCard icon={icon} onClick={() => onSelect(icon)} />
        </motion.div>
      ))}
    </motion.div>
  );
}
