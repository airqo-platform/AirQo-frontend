'use client';

import { useState } from 'react';
import { AqAlertCircle } from '@airqo/icons-react';
import { Button } from '@/shared/components/ui/button';

interface NoInternetConnectionProps {
  onRetry?: () => void;
}

const NoInternetConnection = ({ onRetry }: NoInternetConnectionProps) => {
  const [retryMessage, setRetryMessage] = useState<string>('');

  const handleRetry = () => {
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      setRetryMessage('Still offline. Please check your internet connection.');
      return;
    }

    setRetryMessage('');
    onRetry?.();
  };

  return (
    <div className="min-h-screen w-full bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-lg rounded-xl border border-border bg-card p-8 shadow-lg">
        <div className="flex flex-col items-start gap-4">
          <div className="rounded-full bg-destructive/10 p-3 text-destructive">
            <AqAlertCircle size={28} />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-foreground">
              No internet connection
            </h1>
            <p className="text-sm text-muted-foreground">
              Check your network and try again. The app will reconnect
              automatically once internet is restored.
            </p>
          </div>
          <Button
            variant="outlined"
            onClick={handleRetry}
            className="mt-2"
          >
            Retry
          </Button>
          {retryMessage && (
            <p className="text-sm text-muted-foreground">{retryMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default NoInternetConnection;
