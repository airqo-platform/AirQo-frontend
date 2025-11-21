'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/core/redux/hooks';
import ReusableButton from '@/components/shared/button/ReusableButton';
import OopsIcon from '@/public/icons/Errors/OopsIcon';

/**
 * 404 Not Found page component
 * Automatically rendered by Next.js when a route is not found
 */
export default function NotFound() {
  const router = useRouter();
  const activeGroup = useAppSelector((state) => state.user.activeGroup);

  const handleGoHome = () => {
    if (activeGroup) {
      router.push('/home');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <OopsIcon className="w-32 h-32 text-primary" />
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Oops! Page Not Found
        </h1>

        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Don&apos;t worry, let&apos;s get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <ReusableButton variant="filled" className="px-6 py-3" onClick={handleGoHome}>
            Go Home
          </ReusableButton>

          <ReusableButton
            variant="outlined"
            className="px-6 py-3"
            onClick={() => window.history.back()}
          >
            Go Back
          </ReusableButton>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please{' '}
            <a href="mailto:analytics@airqo.net" className="text-primary hover:text-primary/80 underline">contact support</a>.
          </p>
        </div>
      </div>
    </div>
  );
}