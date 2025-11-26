"use client";
import React from "react";
import { motion } from "framer-motion";
import { useIconGroups } from "@airqo/icons-react";
import { AirQOIconsUtils } from "@airqo/icons-react";

export default function StatsSection() {
  const groups = useIconGroups();
  const totalCount = AirQOIconsUtils.getAllIcons().length;

  const stats = [
    { label: "Total Icons", value: `${totalCount}+` },
    { label: "Icon Categories", value: `${groups.length}+` },
    { label: "Bundle Size", value: "~2-4 KB" },
    { label: "React 18+", value: "Compatible" },
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
