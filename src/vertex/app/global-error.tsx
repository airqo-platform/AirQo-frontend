'use client';

import { useEffect } from 'react';
import './globals.css';
import logger from '@/lib/logger';
import OopsIcon from '@/public/icons/Errors/OopsIcon';
import ReusableButton from '@/components/shared/button/ReusableButton';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Root layout error', error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-background antialiased">
        <div className="relative w-screen h-screen overflow-x-hidden flex items-center justify-center">
          <div className="flex flex-col justify-center items-center w-full md:px-48 px-6">
            <OopsIcon className="text-primary" />

            <div className="flex flex-col justify-center items-center w-full mt-6">
              <h1 className="text-4xl md:text-[40px] font-normal w-full max-w-xl text-center text-gray-900 md:leading-[56px]">
                <span className="text-primary font-bold">Oops!</span> Something went wrong.
              </h1>
              <span className="text-primary/70 mt-2 text-center">
                We apologize for the inconvenience. Please try again or return to login.
              </span>

              <div className="flex gap-4 mt-6">
                <ReusableButton
                  variant="outlined"
                  className="w-40"
                  onClick={() => window.location.assign('/login')}
                >
                  Go to Login
                </ReusableButton>
                <ReusableButton className="w-40" onClick={() => reset()}>
                  Try again
                </ReusableButton>
              </div>

              <p className="text-center text-gray-400 py-6">
                Error code: 500 application error
              </p>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
