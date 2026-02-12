'use client';

import { ReactNode } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { Toaster } from '@/shared/components/ui';
import { AqAirQo } from '@airqo/icons-react';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface AuthLayoutProps {
  pageTitle: string;
  children: ReactNode;
  rightText?: string;
  sideBackgroundColor?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;
  testimonialOrganization?: string;
  heading?: string;
  subtitle?: string;
  microLine?: string;
  headingClassName?: string;
  subtitleClassName?: string;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_TESTIMONIAL = {
  text: "Before joining the AirQo Analytics I spent ages trying to send emails to AirQo support to get access to air quality data. What you've built here is so much better for air pollution monitoring than anything else on the market!",
  author: 'Jennifer',
  role: 'Environment officer',
  organization: 'NEMA',
};

// ============================================================================
// Components
// ============================================================================

const Logo = () => <AqAirQo className="w-12 h-8" />;

interface TestimonialSectionProps {
  text: string;
  author: string;
  role: string;
  organization: string;
  backgroundColor?: string;
}

const TestimonialSection = ({
  text,
  author,
  role,
  organization,
  backgroundColor = 'bg-blue-50 dark:bg-[#252627]',
}: TestimonialSectionProps) => (
  <div
    className={`hidden lg:flex lg:col-span-6 ${backgroundColor} w-full h-full overflow-y-auto`}
  >
    <div className="flex items-center justify-center w-full px-8 py-8 lg:px-10 xl:px-12 2xl:px-16">
      <div className="w-full max-w-4xl space-y-6 lg:space-y-8">
        <div className="space-y-4 lg:space-y-6">
          <h3 className="text-base font-medium leading-relaxed dark:text-white lg:text-lg xl:text-xl">
            {text}
          </h3>
          <div className="space-y-1">
            <p className="text-sm font-medium leading-6 dark:text-white lg:text-base xl:text-lg">
              — {author}
            </p>
            <p className="text-xs font-normal leading-6 text-gray-500 dark:text-gray-400 lg:text-sm xl:text-base">
              {role}. {organization}
            </p>
          </div>
        </div>

        <div className="flex justify-center w-full">
          <div className="w-full">
            <Image
              src="/images/Account/analyticsImage.webp"
              alt="Analytics dashboard preview"
              width={920}
              height={480}
              className="object-contain w-full h-auto max-w-full rounded-lg"
              priority
              style={{ maxHeight: '55vh' }}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================================
// Main Component
// ============================================================================

const AuthLayout = ({
  pageTitle,
  children,
  rightText,
  sideBackgroundColor,
  testimonialAuthor = DEFAULT_TESTIMONIAL.author,
  testimonialRole = DEFAULT_TESTIMONIAL.role,
  testimonialOrganization = DEFAULT_TESTIMONIAL.organization,
  heading,
  subtitle,
  microLine,
  headingClassName = 'text-base lg:text-lg xl:text-2xl font-semibold text-gray-900 dark:text-white',
  subtitleClassName = 'text-sm text-gray-600 dark:text-gray-400',
}: AuthLayoutProps) => {
  const testimonialText = rightText || DEFAULT_TESTIMONIAL.text;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} key="title" />
      </Head>

      <div className="w-full h-screen overflow-hidden">
        <div className="grid w-full h-full lg:grid-cols-11">
          {/* Left Side - Form Section */}
          <section className="w-full h-full lg:col-span-5 bg-white dark:bg-[#1b1d1e] overflow-y-auto">
            <div className="flex items-center justify-center min-h-full py-8 px-6 sm:py-12 sm:px-8 lg:py-8 lg:px-8 xl:px-12 2xl:px-16">
              <div className="w-full max-w-[400px] space-y-6 lg:space-y-8">
                {/* Logo */}
                <div className="flex justify-center lg:justify-start">
                  <Logo />
                </div>

                {/* Form Content */}
                <div className="space-y-4 lg:space-y-6">
                  {/* Centralized Heading & Subtitle */}
                  {(heading || subtitle) && (
                    <div className="space-y-2">
                      {heading && (
                        <h1 className={headingClassName}>{heading}</h1>
                      )}
                      {subtitle && (
                        <p className={subtitleClassName}>{subtitle}</p>
                      )}
                      {microLine && (
                        <blockquote className="mt-4 text-xs text-gray-500 dark:text-gray-400 italic border-l-2 border-gray-300 dark:border-gray-600 pl-3 leading-relaxed">
                          {microLine}
                        </blockquote>
                      )}
                    </div>
                  )}

                  {/* Form Children */}
                  <div className="w-full">{children}</div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Side - Testimonial */}
          <TestimonialSection
            text={testimonialText}
            author={testimonialAuthor}
            role={testimonialRole}
            organization={testimonialOrganization}
            backgroundColor={sideBackgroundColor}
          />
        </div>
      </div>
      <Toaster />
    </>
  );
};

AuthLayout.displayName = 'AuthLayout';

export default AuthLayout;
