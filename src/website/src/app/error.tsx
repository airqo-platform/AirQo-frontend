'use client';

import Image_404 from '@public/assets/svgs/402.svg';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { FiHelpCircle, FiHome, FiRefreshCw } from 'react-icons/fi';

function MinimalBanner() {
  return (
    <div className="flex items-center justify-between bg-[#145DFF] px-4 py-2 text-xs text-white/90 sm:px-6">
      <span className="font-medium">AirQo</span>
      <span className="hidden sm:inline">
        Bridging the Air Quality Data Gap in Africa
      </span>
    </div>
  );
}

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <MinimalBanner />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="flex flex-col items-center"
        >
          <Image
            src={Image_404}
            alt="Error illustration"
            width={300}
            height={300}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5, ease: 'easeInOut' }}
          className="mt-8 text-center"
        >
          <h1 className="text-4xl font-bold text-gray-900">
            <span className="text-blue-600">Oops!!!</span> Something went wrong
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5, ease: 'easeInOut' }}
          className="mt-4 max-w-md text-center text-gray-500"
        >
          We track these errors automatically, but if the problem persists feel
          free to contact us. In the meantime, try refreshing.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5, ease: 'easeInOut' }}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700 active:scale-95"
          >
            <FiRefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 active:scale-95"
          >
            <FiHome className="h-4 w-4" />
            Go to Homepage
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-10 flex items-center gap-6 text-sm text-gray-400"
        >
          <Link
            href="/contact"
            className="inline-flex items-center gap-1.5 transition-colors hover:text-blue-600"
          >
            <FiHelpCircle className="h-3.5 w-3.5" />
            Contact Support
          </Link>
          <span aria-hidden="true" className="text-gray-300">
            &mdash;
          </span>
          <a
            href="https://twitter.com/AirQoProject"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="AirQo on Twitter (opens in new tab)"
            className="transition-colors hover:text-blue-600"
          >
            @AirQoProject
          </a>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-6 text-xs text-gray-400"
        >
          Error code: {(error as any).digest || '500'}
        </motion.p>
      </div>
    </div>
  );
}
