'use client';

import Image from 'next/image';
import { Download, Monitor, ShieldCheck } from 'lucide-react';

import ReusableButton from '@/components/shared/button/ReusableButton';
import { VERTEX_DESKTOP_DOWNLOADS } from '@/core/constants/app-downloads';

const desktopStats = [
  { label: 'Platform', value: 'Windows' },
  { label: 'Installer', value: '.exe' },
  { label: 'Access', value: 'Vertex' },
];

export default function DownloadHero() {
  return (
    <section className="bg-primary-50">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,0.95fr)_minmax(420px,1.05fr)] lg:px-8 lg:py-14">
        <div className="max-w-3xl">
          <div className="mb-8 flex items-center gap-3">
            <Image
              src="/images/airqo_logo.svg"
              alt="AirQo"
              width={36}
              height={36}
              className="h-9 w-auto"
              priority
            />
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                AirQo Vertex Desktop
              </p>
              <p className="text-sm text-muted-foreground">
                Device deployment and data sharing from your desktop
              </p>
            </div>
          </div>

          <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-normal text-heading sm:text-5xl lg:text-6xl">
            Deploy Air Quality Devices and Share Data on your Desktop
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            Install Vertex Desktop for a focused workspace built around field
            deployment, device visibility, and trusted air quality data
            workflows.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <ReusableButton
              path={VERTEX_DESKTOP_DOWNLOADS.windows}
              target="_blank"
              rel="noopener noreferrer"
              variant="filled"
              Icon={Download}
              className="w-full text-base font-semibold sm:w-auto"
              padding="px-6 py-3"
            >
              Download for Windows
            </ReusableButton>
            <span className="text-sm text-muted-foreground">
              Windows is the currently supported platform.
            </span>
          </div>

          <div className="mt-8 grid max-w-xl grid-cols-3 gap-3">
            {desktopStats.map(item => (
              <div
                key={item.label}
                className="rounded-lg border border-border bg-white p-3"
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-1 text-sm font-semibold text-heading">
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="rounded-lg border border-border bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
              </div>
              <span className="text-xs font-medium text-muted-foreground">
                Vertex Desktop
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
                    {['Claim devices', 'Verify metadata', 'Share data'].map(
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
                        <div className="h-2 rounded-full bg-secondary" />
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${width}%` }}
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

              <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-900">
                  Ready to install on Windows
                </p>
                <p className="mt-1 text-sm text-emerald-800">
                  Download the latest installer and keep Vertex close to your
                  daily deployment work.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
