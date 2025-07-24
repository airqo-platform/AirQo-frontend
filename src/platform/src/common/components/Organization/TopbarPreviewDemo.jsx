import React, { useState } from 'react';
import Image from 'next/image';

/**
 * TopbarPreviewDemo - A demo component showing the enhanced logo preview
 * This demonstrates how the logo appears in the topbar once uploaded
 */
const TopbarPreviewDemo = ({
  logoUrl = null,
  organizationName = 'Your Organization',
  isVisible = true,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!isVisible || !logoUrl) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-lg p-6 border border-blue-100 dark:border-gray-600 shadow-sm">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-3 flex items-center">
        <svg
          className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
          />
        </svg>
        Topbar Preview
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
        This is how your logo will appear in the platform&apos;s topbar.
      </p>

      {/* Mock Topbar */}
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          {/* Left side with logo and org name */}
          <div className="flex items-center space-x-3">
            <div className="relative h-10 w-10 bg-white dark:bg-gray-50 rounded-lg shadow-sm ring-1 ring-gray-200 dark:ring-gray-300 overflow-hidden transition-all duration-200 hover:scale-105">
              {' '}
              {!imageError && (
                <Image
                  src={logoUrl}
                  alt="Organization logo preview"
                  fill
                  sizes="40px"
                  className="object-contain p-1.5"
                  loading="lazy"
                  onError={() => setImageError(true)}
                />
              )}
              {imageError && (
                <div className="flex items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-700">
                  <span className="text-xs text-gray-500 font-medium">
                    {organizationName
                      ? organizationName.charAt(0).toUpperCase()
                      : 'O'}
                  </span>
                </div>
              )}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {organizationName}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Air Quality Analytics Platform
              </p>
            </div>
          </div>

          {/* Right side mock elements */}
          <div className="flex items-center space-x-4">
            {/* Mock navigation items */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="h-2 w-16 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
              <div className="h-2 w-12 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
              <div className="h-2 w-14 bg-gray-200 dark:bg-gray-600 rounded-full animate-pulse"></div>
            </div>

            {/* Mock notifications and user menu */}
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-5 5l-5-5h5v-12z"
                  />
                </svg>
              </div>
              <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                {organizationName
                  ? organizationName.charAt(0).toUpperCase()
                  : 'U'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Size variations preview */}
      <div className="mt-6 pt-4 border-t border-blue-100 dark:border-gray-600">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Logo variations across different contexts:
        </p>
        <div className="grid grid-cols-4 gap-4">
          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="relative mb-2 mx-auto h-6 w-6 bg-white dark:bg-gray-50 rounded shadow-sm ring-1 ring-gray-200 dark:ring-gray-300 overflow-hidden">
              <Image
                src={logoUrl}
                alt="Compact logo"
                fill
                sizes="24px"
                className="object-contain p-0.5"
                loading="lazy"
                onError={() => {}}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Compact
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Mobile nav
            </p>
          </div>

          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="relative mb-2 mx-auto h-8 w-8 bg-white dark:bg-gray-50 rounded shadow-sm ring-1 ring-gray-200 dark:ring-gray-300 overflow-hidden">
              <Image
                src={logoUrl}
                alt="Standard logo"
                fill
                sizes="32px"
                className="object-contain p-1"
                loading="lazy"
                onError={() => {}}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Standard
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Main topbar
            </p>
          </div>

          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="relative mb-2 mx-auto h-12 w-12 bg-white dark:bg-gray-50 rounded-lg shadow-sm ring-1 ring-gray-200 dark:ring-gray-300 overflow-hidden">
              <Image
                src={logoUrl}
                alt="Large logo"
                fill
                sizes="48px"
                className="object-contain p-1.5"
                loading="lazy"
                onError={() => {}}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Large
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Dashboard
            </p>
          </div>

          <div className="text-center p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
            <div className="relative mb-2 mx-auto h-16 w-16 bg-white dark:bg-gray-50 rounded-lg shadow-sm ring-1 ring-gray-200 dark:ring-gray-300 overflow-hidden">
              <Image
                src={logoUrl}
                alt="Hero logo"
                fill
                sizes="64px"
                className="object-contain p-2"
                loading="lazy"
                onError={() => {}}
              />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Hero
            </span>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Welcome page
            </p>
          </div>
        </div>
      </div>

      {/* Tips section */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-gray-800 rounded-lg border border-blue-100 dark:border-gray-600">
        <div className="flex items-start space-x-2">
          <svg
            className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-800 dark:text-blue-200">
              Pro Tips:
            </p>
            <ul className="text-xs text-blue-700 dark:text-blue-300 mt-1 space-y-1">
              <li>• SVG format with transparent background works best</li>
              <li>• Square or rectangular aspect ratios are recommended</li>
              <li>
                • High contrast logos ensure visibility in both light and dark
                themes
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopbarPreviewDemo;
