// components/home/HeroSection.tsx
import React from "react";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-500/10 dark:bg-blue-500/20 blur-[100px] rounded-full opacity-50" />
      </div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center pt-24 pb-16 sm:pt-32 sm:pb-24 relative z-10"
      >
        <div className="px-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white text-balance">
            Beautiful{" "}
            <span className="text-[#0A84FF]">Multi-Framework Icons</span> for
            Modern&nbsp;Apps
          </h1>
          {/* Updated to showcase multi-framework support */}
          <p className="mx-auto max-w-2xl mt-6 text-lg sm:text-xl text-gray-600 dark:text-gray-300 text-balance leading-relaxed">
            High-quality icon components for React, Vue, and Flutter with
            TypeScript support. <br className="hidden sm:block" />
            <span className="font-semibold text-gray-900 dark:text-white">
              1,383+ icons
            </span>{" "}
            across 22 categories, fully customizable.
          </p>

          <div className="flex flex-wrap gap-3 justify-center mt-8 mb-10">
            {["React", "Vue 3", "Flutter", "TypeScript"].map((tech) => (
              <span
                key={tech}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm font-medium backdrop-blur-sm"
              >
                {tech}
              </span>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link
              href="/icons"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 hover:scale-105 transition-all bg-[#0A84FF] hover:bg-[#0070e0]"
            >
              Browse Icons <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full font-semibold text-lg bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 shadow-lg hover:shadow-xl hover:scale-105 transition-all"
            >
              <Download className="h-5 w-5" /> Get Started
            </Link>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
