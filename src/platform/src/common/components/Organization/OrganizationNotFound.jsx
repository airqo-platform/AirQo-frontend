'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaExclamationTriangle } from 'react-icons/fa';

export default function OrganizationNotFound({ orgSlug }) {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/account/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="flex flex-col items-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <FaExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>

            <h2 className="mt-2 text-center text-2xl font-bold text-gray-900">
              Organization Not Found
            </h2>

            <p className="mt-2 text-center text-sm text-gray-600">
              The organization "{orgSlug}" does not exist or is not accessible.
            </p>

            <div className="mt-6 w-full">
              <div className="rounded-md bg-yellow-50 p-4">
                <div className="text-sm text-yellow-700">
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
              <button
                onClick={handleGoBack}
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Go Back
              </button>

              <Link
                href="/account/login"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                AirQo Main Login
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">
                Need help? Contact support at{' '}
                <a
                  href="mailto:support@airqo.net"
                  className="text-blue-600 hover:text-blue-500"
                >
                  support@airqo.net
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
