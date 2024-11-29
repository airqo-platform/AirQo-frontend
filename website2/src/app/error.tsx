'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { CustomButton } from '@/components/ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error or send it to an external service
    console.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 p-6">
      <div className="text-center">
        {/* Error Icon */}
        <div className="mb-6 flex justify-center items-center">
          <svg
            className="w-16 h-16 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 16h-1v-4h-1m0-4h.01M12 18h.01M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z"
            />
          </svg>
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-blue-600 mb-4">
          Oops! Something went wrong
        </h1>
        <p className="text-lg text-gray-600 mb-8">
          We&apos;re sorry, an unexpected error has occurred. Please try one of
          the following options:
        </p>

        {/* Buttons */}
        <div className="flex space-x-4 justify-center">
          <CustomButton className=" text-white " onClick={reset}>
            Try Again
          </CustomButton>

          <Link href="/">
            <CustomButton className="bg-gray-600 text-white ">
              Go to Homepage
            </CustomButton>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          If the problem persists, please{' '}
          <Link href="/contact" className="text-blue-600 underline">
            contact our support team.
          </Link>
        </div>
      </div>
    </div>
  );
}
