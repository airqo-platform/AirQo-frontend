'use client';
import React, { useState, useEffect } from 'react';

import { useNetworkChecker } from '@/hooks/useNetworkChecker';
import NoInternetSVG from '@/public/assets/svgs/NoInternetSVG';

const NetworkStatus: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [retrying, setRetrying] = useState(false);
  const [retryTimer, setRetryTimer] = useState<number | null>(null);
  const isOnline = useNetworkChecker();

  const handleRetry = () => {
    setRetrying(true);
    setRetryTimer(
      setTimeout(() => window.location.reload(), 5000) as unknown as number,
    );
  };

  const cancelRetry = () => {
    if (retryTimer) {
      clearTimeout(retryTimer);
      setRetryTimer(null);
      setRetrying(false);
    }
  };

  useEffect(() => {
    return () => {
      if (retryTimer) clearTimeout(retryTimer);
    };
  }, [retryTimer]);

  if (!isOnline) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 px-4">
        <div className="text-center max-w-lg">
          <NoInternetSVG className="w-64 h-64 mx-auto mb-6" />
          <h1 className="text-3xl md:text-4xl text-blue-800 font-bold mb-4">
            Oops! No Internet Connection
          </h1>
          <p className="text-lg mb-6 text-gray-700">
            It seems you are offline. Please check your connection and try
            again.
          </p>
          <div className="space-x-4">
            <button
              onClick={handleRetry}
              className="px-6 py-3 bg-blue-700 text-white rounded-md transition hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-700 focus:ring-opacity-50 disabled:opacity-50"
              aria-label="Retry connection"
              disabled={retrying}
            >
              {retrying ? 'Retrying in 5s...' : 'Retry Now'}
            </button>
            {retrying && (
              <button
                onClick={cancelRetry}
                className="px-6 py-3 bg-gray-300 text-gray-800 rounded-md transition hover:bg-gray-400 focus:outline-none focus:ring-4 focus:ring-gray-400 focus:ring-opacity-50"
                aria-label="Cancel retry"
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default NetworkStatus;
