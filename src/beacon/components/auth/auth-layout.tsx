'use client';

import { ReactNode } from 'react';
import { AqAirQo } from '@airqo/icons-react';

interface AuthLayoutProps {
  children: ReactNode;
  heading?: string;
  subtitle?: string;
  microLine?: string;
  headingClassName?: string;
  subtitleClassName?: string;
}

const Logo = () => <AqAirQo className="h-9 w-14 text-primary" />;

const AuthLayout = ({
  children,
  heading,
  subtitle,
  microLine,
  headingClassName = 'text-lg lg:text-xl xl:text-3xl font-bold text-gray-900 dark:text-white',
  subtitleClassName = 'text-base lg:text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed',
}: AuthLayoutProps) => (
  <main className="min-h-screen w-full overflow-y-auto overscroll-contain bg-gray-50 px-4 py-4 dark:bg-[#151718] sm:px-6 sm:py-10 flex items-center justify-center">
    <div className="flex min-h-full w-full items-center justify-center">
      <section className="w-full max-w-xl rounded-none border-0 bg-transparent px-0 py-4 shadow-none dark:bg-transparent sm:rounded-2xl sm:border sm:border-gray-200 sm:bg-white sm:px-10 sm:py-9 sm:shadow-sm sm:dark:border-gray-700 sm:dark:bg-[#1b1d1e]">
        <div className="mx-auto w-full max-w-[440px] space-y-7 sm:space-y-8">
          <div className="flex justify-start">
            <Logo />
          </div>

          {(heading || subtitle || microLine) && (
            <div className="space-y-3 text-left">
              {heading && <h1 className={headingClassName}>{heading}</h1>}
              {subtitle && <p className={subtitleClassName}>{subtitle}</p>}
              {microLine && (
                <div className="border-l-2 border-gray-300 pl-3 text-left text-xs italic leading-relaxed text-gray-500 dark:border-gray-600 dark:text-gray-400">
                  {microLine}
                </div>
              )}
            </div>
          )}

          <div className="w-full">{children}</div>
        </div>
      </section>
    </div>
  </main>
);

AuthLayout.displayName = 'AuthLayout';

export default AuthLayout;
