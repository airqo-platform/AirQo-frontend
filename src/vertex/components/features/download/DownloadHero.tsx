'use client';

import Image from 'next/image';

import ReusableButton from '@/components/shared/button/ReusableButton';
import { VERTEX_DESKTOP_DOWNLOADS } from '@/core/constants/app-downloads';

const WindowsIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M0 3.449L9.75 2.1V11.7H0V3.449zm0 9.151h9.75v9.6L0 20.551V12.6zm10.55-10.701L24 0v11.7h-13.45V1.899zm0 10.701H24V24l-13.45-1.899V12.6z" />
  </svg>
);

export default function DownloadHero() {
  return (
    <section className="bg-primary-50 px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="max-w-3xl">
          <div className="mb-7 flex items-start gap-3 sm:mb-8 sm:items-center">
            <Image
              src="/images/airqo_logo.svg"
              alt="AirQo"
              width={36}
              height={36}
              className="h-8 w-auto shrink-0 sm:h-9"
              priority
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary sm:text-sm sm:tracking-[0.18em]">
                AirQo Vertex Desktop
              </p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground sm:mt-0">
                Device deployment and data sharing from your desktop
              </p>
            </div>
          </div>

          <h1 className="max-w-2xl text-3xl font-semibold leading-tight tracking-normal text-heading sm:text-5xl lg:text-6xl">
            Deploy Air Quality Devices and Share Data on your Desktop
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground sm:mt-6 sm:text-lg sm:leading-7">
            Install Vertex Desktop for a focused workspace built around field
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
      </div>
    </section>
  );
}
