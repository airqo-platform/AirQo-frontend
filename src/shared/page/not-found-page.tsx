'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import OopsIcon from './oops-icon';

/*
 * 404 page. Copied from nexus/src/app/not-found.tsx; vertex/app/not-found.tsx is
 * the same page with a different support address. Beacon has none and shows
 * Next's default 404.
 *
 * Nexus worked out "Go Home" from the active group in Redux; it is now `homeHref`.
 * Nexus's own Button (filled/outlined) is swapped for the shared one
 * (default/outline), so the buttons follow the shadcn sizes.
 */
interface NotFoundPageProps {
  homeHref: string;
  supportEmail: string;
}

export default function NotFoundPage({ homeHref, supportEmail }: NotFoundPageProps) {
  const router = useRouter();

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

        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Don&apos;t worry, let&apos;s get you back on track.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button className="px-6 py-3" onClick={() => router.push(homeHref)}>
            Go Home
          </Button>

          <Button
            variant="outline"
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
              href={`mailto:${supportEmail}`}
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
