"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Home, ArrowLeft } from "lucide-react";

const modernBlue = "#0A84FF";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col items-center justify-center px-4 relative">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 120 }}
        className="text-center max-w-md"
        role="main"
        aria-label="404 Page Not Found"
      >
        {/* Large 404 */}
        <h1
          className="text-8xl sm:text-9xl font-extrabold tracking-tighter"
          style={{ color: modernBlue }}
          aria-label="404"
        >
          404
        </h1>

        {/* Heading */}
        <h2 className="mt-4 text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Page Not Found
        </h2>

        {/* Subtext */}
        <p className="mt-2 text-base text-gray-600 dark:text-gray-400">
          The page you’re looking for doesn’t exist or has been moved.
        </p>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-lg transition-transform hover:scale-105"
            style={{ backgroundColor: modernBlue }}
            aria-label="Go to homepage"
          >
            <Home className="w-4 h-4" />
            Go Home
          </Link>

          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.history.length > 1) {
                window.history.back();
              } else {
                window.location.href = "/";
              }
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white shadow-lg transition-transform hover:scale-105"
            aria-label="Go back to previous page"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>
        </div>
      </motion.div>

      {/* Subtle decorative element */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.08 }}
        transition={{ duration: 1, delay: 0.4 }}
        className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none"
        aria-hidden="true"
      >
        <span
          className="text-[20rem] font-bold select-none"
          style={{ color: modernBlue }}
        >
          404
        </span>
      </motion.div>
    </div>
  );
}
