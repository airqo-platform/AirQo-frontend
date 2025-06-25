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
    <div className="relative w-screen h-screen dark:bg-transparent overflow-x-hidden">
      {/* Content */}
      <div className="flex flex-col justify-center items-center mt-14 w-full md:px-48 px-6">
        {/* Icon */}
        <OopsIcon className="text-primary" />

        <div className="flex flex-col justify-center items-center w-full mt-6">
          <h1 className="text-4xl md:text-[40px] font-normal w-full max-w-xl text-center text-black-900 md:leading-[56px]">
            <span className="text-primary font-bold">Oops!</span> We can&apos;t
            seem to find the page you&apos;re looking for
          </h1>

          <Button
            onClick={handleGoBack}
            className="mt-6 w-64 rounded-none text-white bg-primary border border-primary hover:bg-primary/90 hover:border-primary/90 font-medium"
          >
            Go back
          </Button>

          <p className="text-center text-grey-400 py-6">
            Error code: 404 Page not found
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
