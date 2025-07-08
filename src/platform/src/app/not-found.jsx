'use client';

import { useRouter } from 'next/navigation';
import OopsIcon from '@/icons/Errors/OopsIcon';
import Button from '@/common/components/Button';

const NotFound = () => {
  const router = useRouter();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-screen bg-white dark:bg-transparent overflow-x-hidden p-4">
      {/* Centered Content */}
      <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto gap-8">
        {/* Enhanced Oops Icon */}
        <div className="flex items-center justify-center w-40 h-40 md:w-56 md:h-56">
          <OopsIcon className="w-full h-full text-primary" />
        </div>
        <h1 className="text-3xl md:text-4xl font-semibold text-center text-black-900 dark:text-white leading-tight">
          <span className="text-primary font-bold">Oops!</span> We can&apos;t
          seem to find the page you&apos;re looking for
        </h1>
        <Button
          onClick={handleGoBack}
          className="text-white bg-primary border border-primary hover:bg-primary/90 hover:border-primary/90 font-medium py-3 text-base md:text-lg"
        >
          Go back
        </Button>
        <p className="text-center text-grey-400 text-base md:text-lg">
          Error code: 404 Page not found
        </p>
      </div>
    </div>
  );
};

export default NotFound;
