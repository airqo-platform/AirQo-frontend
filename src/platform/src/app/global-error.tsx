'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components/ui/button';
import OopsIcon from '@/shared/components/ui/OopsIcon';
import logger from '@/shared/lib/logger';

interface GlobalErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  const router = useRouter();

  useEffect(() => {
    logger.error('Global error boundary caught an error', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card p-8 shadow-lg text-center">
            <div className="mb-6 flex justify-center">
              <OopsIcon className="w-24 h-24" />
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-3">
              We ran into a problem
            </h1>
            <p className="text-sm text-muted-foreground mb-6">
              A critical error occurred. Please try again, or return home.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={reset}>Try again</Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/user/home')}
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
