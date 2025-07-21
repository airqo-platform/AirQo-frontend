'use client';

import Link from 'next/link';
import CardWrapper from '@/common/components/CardWrapper';

export default function OrganizationNotFound({ orgSlug }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#1b1d1e] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <CardWrapper className="overflow-hidden" padding="py-8 px-4 sm:px-10">
          <div className="flex flex-col items-center">
            {/* AirQo Logo */}
            <div className="mb-6">
              <img
                className="h-12 w-auto"
                src="/icons/airqo_logo.svg"
                alt="AirQo logo"
              />
            </div>

            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <svg
                className="h-6 w-6 text-red-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 13.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>

            <h2 className="mt-2 text-center text-2xl font-bold text-gray-900 dark:text-white">
              Organization Not Found
            </h2>

            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              The organization &quot;{orgSlug}&quot; does not exist or is not
              accessible.
            </p>

            <div className="mt-6 w-full">
              <div className="rounded-md bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <div className="text-sm text-yellow-700 dark:text-yellow-300">
                  <p className="font-medium">What you can do:</p>
                  <ul className="mt-2 list-disc pl-5 space-y-1">
                    <li>Check the URL for typos</li>
                    <li>Contact your organization admin for the correct URL</li>
                    <li>Use the main AirQo login page instead</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col space-y-3 w-full">
              <Link
                href="/user/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Main Login
              </Link>

              <button
                onClick={() => window.location.reload()}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Reload Page
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Need help? Contact support at{' '}
                <a
                  href="mailto:support@airqo.net"
                  className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  support@airqo.net
                </a>
              </p>
            </div>
          </div>
        </CardWrapper>
      </div>
    </div>
  );
}
