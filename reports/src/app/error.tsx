'use client';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

import { Button } from '@/components/ui/button';
import ErrorBoundaryImage from '@/public/images/ErrorBoundary.png';

interface ErrorProps {
  error: Error & { digest?: string };
}

const ErrorComponent: React.FC<ErrorProps> = ({ error }) => {
  const router = useRouter();

  useEffect(() => {
    logError(error);
  }, [error]);

  // Utility function to log errors, can be extended for error tracking services
  const logError = (error: Error) => {
    console.error(error);
    // integrate error tracking services like Sentry, LogRocket, etc.
  };

  const handleRetry = () => {
    router.push('/home');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-gray-50">
      <div className="p-6 space-y-8 text-center bg-white rounded-md shadow-lg">
        <div className="flex items-center justify-center w-48 h-48 p-3 mx-auto bg-blue-100 rounded-full">
          <Image
            src={ErrorBoundaryImage}
            alt="Error occurred"
            width={200}
            height={200}
            className="mix-blend-multiply"
            priority
          />
        </div>
        <div className="space-y-4">
          <h2 className="text-3xl font-bold text-gray-900">Oops! Something Went Wrong</h2>
          <p className="text-lg text-gray-500 max-w-md mx-auto">
            We&apos;re sorry for the inconvenience. Our team has been notified and is working on a
            fix. Please try again later or return to the home page.
          </p>
        </div>
        <div>
          <Button
            type="button"
            onClick={handleRetry}
            className="px-6 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition ease-in-out"
            aria-label="Go back to the home page"
          >
            Go Home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ErrorComponent;
