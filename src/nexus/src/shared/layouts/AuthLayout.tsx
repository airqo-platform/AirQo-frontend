'use client';

import { ReactNode } from 'react';
import Head from 'next/head';
import { AqAirQo } from '@airqo/icons-react';

interface AuthLayoutProps {
  pageTitle: string;
  children: ReactNode;
  heading?: string;
  subtitle?: string;
  microLine?: string;
  headingClassName?: string;
  subtitleClassName?: string;
}

const Logo = () => <AqAirQo className="h-9 w-14" />;

const AuthLayout = ({
  pageTitle,
  children,
  heading,
  subtitle,
  microLine,
  headingClassName = 'text-lg lg:text-xl xl:text-3xl font-bold text-gray-900 dark:text-white',
  subtitleClassName = 'text-base lg:text-lg text-gray-700 dark:text-gray-300 font-medium leading-relaxed',
}: AuthLayoutProps) => (
  <>
    <Head>
      <title>{pageTitle}</title>
      <meta property="og:title" content={pageTitle} key="title" />
    </Head>

    <main className="min-h-dvh w-full overflow-y-auto bg-gray-50 px-4 py-6 dark:bg-[#151718] sm:px-6 sm:py-10">
      <div className="flex min-h-[calc(100dvh-3rem)] items-center justify-center sm:min-h-[calc(100dvh-5rem)]">
        <section className="w-full max-w-xl rounded-2xl border border-gray-200 bg-white px-5 py-7 shadow-sm dark:border-gray-700 dark:bg-[#1b1d1e] sm:px-10 sm:py-9">
          <div className="mx-auto w-full max-w-[440px] space-y-7 sm:space-y-8">
            <div className="flex justify-center">
              <Logo />
            </div>

            {(heading || subtitle) && (
              <div className="space-y-3 text-center">
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
  </>
);

AuthLayout.displayName = 'AuthLayout';

export default AuthLayout;
