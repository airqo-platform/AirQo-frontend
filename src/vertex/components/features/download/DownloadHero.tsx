'use client';

import { Monitor, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';

import ReusableButton from '@/components/shared/button/ReusableButton';
import { VERTEX_DESKTOP_DOWNLOADS } from '@/core/constants/app-downloads';
import { vertexConfig } from '@/vertex.config';

const WindowsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 3.449L9.75 2.1V11.7H0V3.449zm0 9.151h9.75v9.6L0 20.551V12.6zm10.55-10.701L24 0v11.7h-13.45V1.899zm0 10.701H24V24l-13.45-1.899V12.6z" />
  </svg>
);

export default function DownloadHero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="bg-primary-50 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 lg:min-h-[calc(100vh-5rem)] lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)]">
        <div className="max-w-3xl">
          <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-normal text-heading sm:text-5xl lg:text-6xl">
            Deploy Devices. Share Air Data
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-7">
            Install {vertexConfig.org.name} Desktop for a focused workspace built around field
            deployment, device visibility, and trusted air quality data
            workflows.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center">
            <ReusableButton
              path={VERTEX_DESKTOP_DOWNLOADS.windows}
              target="_blank"
              rel="noopener noreferrer"
              variant="filled"
              Icon={WindowsIcon}
              iconClassName="h-3 w-3"
              className="inline-flex w-full justify-center gap-2 rounded-md border-border bg-primary text-sm font-medium text-white shadow-none transition-all hover:border-foreground/20 hover:bg-primary/80 hover:shadow-none focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 sm:w-auto"
              padding="px-4 py-2"
            >
              Download for Windows
            </ReusableButton>
            <span className="text-sm leading-6 text-muted-foreground">
              Windows is the currently supported platform.
            </span>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="rounded-lg border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                {vertexConfig.org.name} Desktop
              </span>
            </div>
            <div className="grid gap-4 p-4 sm:p-6">
              <div className="flex items-center justify-between rounded-lg bg-primary px-4 py-3 text-white">
                <div>
                  <p className="text-sm font-semibold text-white">
                    Device rollout
                  </p>
                  <p className="text-xs text-white/80">
                    24 devices ready for deployment
                  </p>
                </div>
                <Monitor className="h-8 w-8 text-white" />
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-heading">
                    Deployment checks
                  </p>
                  <div className="mt-4 space-y-3">
                    {['Add devices', 'Verify metadata', 'Share data'].map(
                      step => (
                        <div key={step} className="flex items-center gap-2">
                          <ShieldCheck className="h-4 w-4 text-emerald-600" />
                          <span className="text-sm text-muted-foreground">
                            {step}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>
                <div className="rounded-lg border border-border bg-background p-4">
                  <p className="text-sm font-semibold text-heading">
                    Network visibility
                  </p>
                  <div className="mt-4 space-y-3">
                    {[82, 64, 48].map((width, index) => (
                      <div key={width} className="space-y-1.5">
                        <div className="h-2 rounded-full bg-secondary animate-pulse" />
                        <div
                          className="h-2 rounded-full bg-primary animate-pulse transition-all duration-1000 ease-out"
                          style={{ width: mounted ? `${width}%` : '0%' }}
                        />
                        {index === 2 && (
                          <p className="text-xs text-muted-foreground">
                            Recent sync activity
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
