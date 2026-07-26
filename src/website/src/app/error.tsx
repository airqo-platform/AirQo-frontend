'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { useEffect } from 'react';
import { FiHelpCircle, FiHome, FiRefreshCw } from 'react-icons/fi';

import TopBanner from '@/components/layout/TopBanner';

function ErrorIllustration() {
  return (
    <svg
      width="320"
      height="240"
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-auto w-full max-w-[320px]"
      aria-hidden="true"
    >
      {/* Ground / landscape */}
      <ellipse cx="160" cy="220" rx="140" ry="20" fill="#e8d5b7" />
      <path
        d="M20 220 C60 180, 100 200, 160 185 C220 170, 260 190, 300 220"
        fill="#c9a96e"
      />
      <path
        d="M40 220 C80 195, 120 210, 160 200 C200 190, 240 205, 280 220"
        fill="#d4b87a"
      />

      {/* Hills / mountains */}
      <path
        d="M0 200 Q80 120 160 180 Q240 120 320 200 L320 240 L0 240 Z"
        fill="#7ab8a0"
      />
      <path
        d="M0 210 Q60 160 120 190 Q180 150 240 190 Q300 160 320 210 L320 240 L0 240 Z"
        fill="#5da68a"
      />

      {/* River */}
      <path
        d="M0 195 Q80 185 160 195 Q240 205 320 195"
        stroke="#6bb5d4"
        strokeWidth="8"
        strokeLinecap="round"
        fill="none"
        opacity="0.6"
      />

      {/* Octocat-like character */}
      <g transform="translate(120, 100)">
        {/* Body */}
        <ellipse cx="40" cy="70" rx="35" ry="25" fill="#1a1a2e" />
        {/* Head */}
        <circle cx="40" cy="35" r="30" fill="#1a1a2e" />
        {/* Ears */}
        <path d="M15 15 L25 30 L10 30 Z" fill="#1a1a2e" />
        <path d="M65 15 L55 30 L70 30 Z" fill="#1a1a2e" />
        {/* Eyes */}
        <circle cx="30" cy="32" r="5" fill="white" />
        <circle cx="50" cy="32" r="5" fill="white" />
        <circle cx="31" cy="33" r="2.5" fill="#1a1a2e" />
        <circle cx="51" cy="33" r="2.5" fill="#1a1a2e" />
        {/* Mouth */}
        <path
          d="M32 45 Q40 52 48 45"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
        {/* Tentacles */}
        <path
          d="M20 85 Q15 105 10 115"
          stroke="#1a1a2e"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M30 88 Q28 108 25 118"
          stroke="#1a1a2e"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M50 88 Q52 108 55 118"
          stroke="#1a1a2e"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M60 85 Q65 105 70 115"
          stroke="#1a1a2e"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
        />
      </g>

      {/* Signpost */}
      <g transform="translate(200, 80)">
        <rect x="18" y="0" width="4" height="100" fill="#8B7355" rx="2" />
        <rect x="-10" y="5" width="60" height="28" fill="#D4A574" rx="4" />
        <text
          x="20"
          y="24"
          textAnchor="middle"
          fill="#5a3e1b"
          fontSize="14"
          fontWeight="bold"
          fontFamily="Inter, sans-serif"
        >
          500
        </text>
      </g>

      {/* Decorative dots */}
      <circle cx="30" cy="60" r="3" fill="#145DFF" opacity="0.3" />
      <circle cx="50" cy="40" r="2" fill="#145DFF" opacity="0.2" />
      <circle cx="290" cy="50" r="3" fill="#145DFF" opacity="0.3" />
      <circle cx="270" cy="70" r="2" fill="#145DFF" opacity="0.2" />
    </svg>
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
      <TopBanner />
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          className="flex flex-col items-center"
        >
          <ErrorIllustration />
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
            href="https://status.airqo.africa"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="AirQo Status (opens in new tab)"
            className="transition-colors hover:text-blue-600"
          >
            AirQo Status
          </a>
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
