'use client';

import { useRouter } from 'next/navigation';
import Button from '@/common/components/Button';

export default function AdminNotFound() {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/user/Home');
  };

  return (
    <div className="w-full h-screen flex flex-grow justify-center items-center bg-white">
      <div className="flex flex-col items-center space-y-6 text-center max-w-md">
        <div className="text-6xl font-bold text-gray-300">404</div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Admin Page Not Found
        </h1>
        <p className="text-gray-600">
          The admin page you&apos;re looking for doesn&apos;t exist or has been
          moved.
        </p>
        <div className="flex gap-4">
          <Button
            onClick={handleGoBack}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go back
          </Button>
          <Button
            onClick={handleGoHome}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
