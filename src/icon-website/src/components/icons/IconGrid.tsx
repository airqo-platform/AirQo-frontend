// components/icons/IconGrid.tsx
"use client";
import React from "react";
import { motion } from "framer-motion";
import type { IconMetadata } from "@airqo/icons-react";
import IconCard from "./IconCard";

interface Props {
  icons: IconMetadata[]; // Icons to display
  isLoading: boolean; // Loading state
  selectedGroup: string | null; // Group filter state (used for empty state context if needed)
  onSelect: (icon: IconMetadata) => void;
}

export default function IconGrid({
  icons,
  isLoading,
  selectedGroup,
  onSelect,
}: Props) {
  // Show loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-16">
        <span className="loader"></span>
        <span className="ml-3 text-gray-600 dark:text-gray-400">
          Loading icons...
        </span>
      </div>
    );
  }

  // Handle case where no icons are found
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
          {selectedGroup
            ? `No icons found in "${selectedGroup}" group.`
            : "Try a different search or filter."}
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="mx-auto max-w-7xl px-4 py-8 flex-grow"
    >
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12 gap-4">
        {icons.map((icon, i) => (
          <motion.div
            key={icon.name}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: Math.min(i * 0.01, 0.5) }} // Cap delay to avoid long waits for large lists
          >
            <IconCard icon={icon} onClick={() => onSelect(icon)} />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
