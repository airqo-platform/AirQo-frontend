'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { Button } from '@/shared/components/ui';
import OopsIcon from '@/shared/components/ui/OopsIcon';
import { selectActiveGroup } from '@/shared/store/selectors';

/**
 * 404 Not Found page component
 * Automatically rendered by Next.js when a route is not found
 */
export default function NotFound() {
  const router = useRouter();
  const activeGroup = useSelector(selectActiveGroup);

  const handleGoHome = () => {
    if (activeGroup) {
      if (activeGroup.title.toLowerCase() === 'airqo') {
        router.push('/user/home');
      } else {
        router.push(`/org/${activeGroup.organizationSlug}/dashboard`);
      }
    } else {
      // Fallback if no active group is available
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <OopsIcon className="w-32 h-32" />
        </div>

        {/* Error Message */}
        <h1 className="text-4xl font-bold text-foreground mb-4">
          Oops! Page Not Found
        </h1>

        <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Don&apos;t worry, let&apos;s get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button variant="filled" className="px-6 py-3" onClick={handleGoHome}>
            Go Home
          </Button>

          <Button
            variant="outlined"
            className="px-6 py-3"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>

        {/* Additional Help */}
        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            If you believe this is an error, please{' '}
            <a
              href="mailto:support@airqo.net"
              className="text-primary hover:text-primary/80 underline"
            >
              contact support
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
