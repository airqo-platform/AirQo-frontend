'use client';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

const NotFound = () => {
  const router = useRouter();

  const handleBack = () => {
    router.push('/home');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-blue-800 text-white">
      <div className="text-center px-6 py-12 bg-white bg-opacity-10 rounded-lg shadow-lg max-w-lg">
        <h1 className="text-7xl font-extrabold mb-4">404</h1>
        <p className="text-2xl mb-6">Oops! The page you are looking for could not be found.</p>
        <Button
          type="button"
          onClick={handleBack}
          className="px-6 py-3 text-blue-600 bg-white font-semibold rounded-lg shadow-md hover:bg-blue-100 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
          aria-label="Go back to the homepage"
        >
          Go Back Home
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
