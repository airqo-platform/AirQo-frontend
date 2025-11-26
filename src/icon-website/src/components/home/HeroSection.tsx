import React from "react";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { motion } from "framer-motion";
const modernBlue = "#0A84FF";

export default function HeroSection() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="text-center pt-24 pb-16 sm:pt-32 sm:pb-24"
    >
      <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white">
        Beautiful <span style={{ color: modernBlue }}>React Icons</span> for
        Modern&nbsp;Web
      </h1>
      <p className="mx-auto max-w-2xl mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300">
        High-quality React icon components with TypeScript support. Thousands of
        icons, fully customizable.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Link
          href="/icons"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-white shadow-lg hover:scale-105 transition-transform"
          style={{ backgroundColor: modernBlue }}
        >
          Browse Icons <ArrowRight className="h-5 w-5" />
        </Link>
        <Link
          href="/docs"
          className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-lg hover:scale-105 transition-transform"
        >
          <Download className="h-5 w-5" /> Get Started
        </Link>
      </div>
    </motion.section>
  );
}
