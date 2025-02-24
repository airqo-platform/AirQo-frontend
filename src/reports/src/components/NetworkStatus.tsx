'use client';
import { useNetworkChecker } from '@/hooks/useNetworkChecker';

interface NetworkStatusProps {
  children: React.ReactNode;
}

const NetworkStatus: React.FC<NetworkStatusProps> = ({ children }) => {
  const isOnline = useNetworkChecker();

  if (!isOnline) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="text-center">
          <h1 className="text-4xl text-blue-700 font-bold">No internet connection</h1>
          <p className="text-lg mt-4">Please check your connection and try again</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 px-4 py-2 bg-blue-700 text-white rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-opacity-50"
            aria-label="Retry connection"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default NetworkStatus;
