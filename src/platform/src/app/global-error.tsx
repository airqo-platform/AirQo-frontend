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
      <head>
        <style>{`
          html, body {
            min-height: 100%;
            margin: 0;
            background: #f8fafc;
            color: #0f172a;
            font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }

          * {
            box-sizing: border-box;
          }

          button {
            font: inherit;
          }
        `}</style>
      </head>
      <body>
        <div
          className="min-h-screen w-full bg-background flex items-center justify-center p-6"
          style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            className="w-full max-w-xl rounded-xl border border-border bg-card p-8 shadow-lg text-center"
            style={{
              width: '100%',
              maxWidth: '36rem',
              border: '1px solid #d0d7de',
              background: '#ffffff',
              padding: '2rem',
              borderRadius: '1rem',
              boxShadow: '0 20px 50px rgba(15, 23, 42, 0.12)',
              textAlign: 'center',
            }}
          >
            <div
              className="mb-6 flex justify-center"
              style={{
                marginBottom: '1.5rem',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <OopsIcon size={96} style={{ display: 'block' }} />
            </div>
            <h1
              className="text-2xl font-semibold text-foreground mb-3"
              style={{
                margin: '0 0 0.75rem',
                fontSize: '1.5rem',
                lineHeight: 1.2,
                fontWeight: 600,
                color: '#0f172a',
              }}
            >
              We ran into a problem
            </h1>
            <p
              className="text-sm text-muted-foreground mb-6"
              style={{
                margin: '0 0 1.5rem',
                fontSize: '0.95rem',
                lineHeight: 1.6,
                color: '#64748b',
              }}
            >
              A critical error occurred. Please try again, or return home.
            </p>
            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-3"
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.75rem',
              }}
            >
              <Button
                onClick={reset}
                style={{
                  minWidth: '8.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #2563eb',
                  background: '#2563eb',
                  color: '#ffffff',
                  fontWeight: 600,
                  boxShadow: '0 10px 24px rgba(59, 130, 246, 0.18)',
                  cursor: 'pointer',
                }}
              >
                Try again
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push('/user/home')}
                style={{
                  minWidth: '8.75rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '0.75rem',
                  border: '1px solid #2563eb',
                  background: '#ffffff',
                  color: '#2563eb',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
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
