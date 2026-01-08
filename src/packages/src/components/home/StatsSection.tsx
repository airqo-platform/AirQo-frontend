// components/home/StatsSection.tsx
"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { AirQOIconsUtils } from "@airqo/icons-react"; // Import for icon count

export default function StatsSection() {
  const [iconCount, setIconCount] = useState<number | null>(null);

  useEffect(() => {
    // Get the actual icon count on the client-side
    try {
      const count = AirQOIconsUtils.getAllIcons().length;
      setIconCount(count);
    } catch (err) {
      console.error("Failed to fetch icon count:", err);
      // Fallback to a number from docs if utils fail (unlikely in browser)
      setIconCount(1383);
    }
  }, []);

  // Define stats using the accurate counts
  const stats = [
    // Use dynamic count or fallback
    {
      label: "Total Icons",
      value: `${iconCount !== null ? iconCount : "1,383"}+`,
    },
    // Use 22 groups as per documentation
    { label: "Icon Categories", value: "22" },
    // Show supported frameworks
    { label: "Frameworks", value: "3" },
    { label: "Bundle per Icon", value: "~2-6KB" },
  ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      viewport={{ once: true }}
      className="py-16 bg-gray-50 dark:bg-gray-900/50"
    >
      <div className="mx-auto max-w-7xl px-4 grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
          >
            <div className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              {s.value}
            </div>
            <div className="mt-2 text-sm font-medium text-gray-600 dark:text-gray-400">
              {s.label}
            </div>
          </motion.div>
        ))}
      </div>
    </motion.section>
  );
}
