// components/home/SampleIcons.tsx
"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AirQOIconsUtils } from "@airqo/icons-react";
import type { IconMetadata } from "@airqo/icons-react";
const modernBlue = "#0A84FF";

export default function SampleIcons() {
  const [icons, setIcons] = useState<IconMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      // Fetch actual icons using the utility
      const all = AirQOIconsUtils.getAllIcons();
      // Use the first 6 icons or a random sample
      const sampleIcons = all.slice(0, 6);
      setIcons(sampleIcons);
      setLoading(false);
    } catch (error) {
      console.error("Failed to load icons:", error);
      setLoading(false);
      // Optionally set fallback icons if dynamic loading fails
    }
  }, []);

  return (
    <motion.section
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
      className="mt-16"
    >
      <div className="flex flex-wrap justify-center gap-6 p-8 bg-gray-50 dark:bg-gray-800/30 rounded-2xl">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center p-4">
                <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
                <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded mt-2 animate-pulse" />
              </div>
            ))
          : icons.map((icon, i) => (
              <motion.div
                key={icon.name} // Use unique icon name
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 * i }}
                className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800">
                  {/* Render the actual icon component */}
                  {icon.component && (
                    <icon.component
                      className="w-6 h-6"
                      style={{ color: modernBlue }}
                      // onError is not a standard SVG prop, removing for cleaner code
                    />
                  )}
                </div>
                <span className="mt-2 text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                  {icon.name} {/* Display actual icon name */}
                </span>
              </motion.div>
            ))}
      </div>
      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400 text-center">
        A quick look at our icons
      </p>
    </motion.section>
  );
}
