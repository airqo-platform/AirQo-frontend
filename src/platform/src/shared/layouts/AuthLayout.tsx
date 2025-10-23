'use client';

import { ReactNode, useEffect, useState } from 'react';
import Image from 'next/image';
import Head from 'next/head';
import { Toaster } from '@/shared/components/ui';

// ============================================================================
// Types & Interfaces
// ============================================================================

interface AuthLayoutProps {
  pageTitle: string;
  children: ReactNode;
  rightText?: string;
  childrenTop?: string;
  sideBackgroundColor?: string;
  testimonialAuthor?: string;
  testimonialRole?: string;
  testimonialOrganization?: string;
  // centralized form heading and subtitle to keep auth pages consistent
  heading?: string;
  subtitle?: string;
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

const LOGO_CONFIG = {
  src: '/images/airqo_logo.svg',
  alt: 'AirQo logo',
  width: 47,
  height: 32,
} as const;

// ============================================================================
// Hooks
// ============================================================================

const useWindowWidth = () => {
  const [width, setWidth] = useState<number>(0);

  useEffect(() => {
    // Set initial width
    const handleResize = () => setWidth(window.innerWidth);
    handleResize();

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return width;
};

// ============================================================================
// Components
// ============================================================================

const Logo = () => (
  <Image
    src={LOGO_CONFIG.src}
    alt={LOGO_CONFIG.alt}
    width={LOGO_CONFIG.width}
    height={LOGO_CONFIG.height}
    priority
  />
);

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
    className={`hidden lg:flex lg:col-span-6 ${backgroundColor} items-center justify-center w-full`}
  >
    <div className="h-auto max-w-3xl px-12 py-10">
      <blockquote className="space-y-4">
        <p className="font-medium text-[24px] leading-8  dark:text-white max-w-[820px]">
          {text}
        </p>
        <footer className="space-y-1">
          <cite className="not-italic">
            <p className="text-lg font-medium leading-9  dark:text-white">
              — {author}
            </p>
            <p className="text-base font-normal leading-6 text-gray-500 dark:text-gray-400">
              {role}. {organization}
            </p>
          </cite>
        </footer>
      </blockquote>

      <div className="flex justify-center w-full mt-6">
        <div className="w-full max-w-[920px]">
          <Image
            src="/images/Account/analyticsImage.webp"
            alt="Analytics dashboard preview"
            width={920}
            height={480}
            className="object-contain w-full h-auto rounded-lg"
            priority
          />
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
  childrenTop,
  sideBackgroundColor,
  testimonialAuthor = DEFAULT_TESTIMONIAL.author,
  testimonialRole = DEFAULT_TESTIMONIAL.role,
  testimonialOrganization = DEFAULT_TESTIMONIAL.organization,
  heading,
  subtitle,
  headingClassName,
  subtitleClassName,
}: AuthLayoutProps) => {
  // Using custom hook instead of inline effect
  useWindowWidth();

  const testimonialText = rightText || DEFAULT_TESTIMONIAL.text;
  const contentTopMargin = childrenTop ?? '';

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} key="title" />
      </Head>

      <div className="h-screen">
        <div className="grid w-full h-full lg:grid-cols-11">
          <section className="lg:col-span-5 bg-white dark:bg-[#1b1d1e] py-10 px-6 lg:px-20 h-full flex justify-center items-center">
            <div className="w-full">
              <div className="mx-auto flex flex-col gap-12 w-full max-w-[360px]">
                {/* Logo */}
                <div className="text-center lg:text-left">
                  <Logo />
                </div>

                {/* Form Content (centralized heading/subtitle support) */}
                <div
                  className={`${contentTopMargin} flex flex-col justify-center items-start w-full`}
                >
                  <div className="flex flex-col w-full gap-3">
                    {/** Render centralized heading/subtitle when provided by pages */}
                    {typeof heading !== 'undefined' && (
                      <h1 className={headingClassName || 'text-3xl font-light'}>
                        {heading}
                      </h1>
                    )}

                    {typeof subtitle !== 'undefined' && (
                      <p
                        className={
                          subtitleClassName || 'text-md text-gray-600 mb-6'
                        }
                      >
                        {subtitle}
                      </p>
                    )}
                  </div>

                  {children}
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
