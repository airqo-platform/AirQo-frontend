'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import type { IconType } from 'react-icons';
import { BiLinkExternal } from 'react-icons/bi';
import { FiCheck } from 'react-icons/fi';

import mainConfig from '@/config/site.config';
import { cn } from '@/lib/utils';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      duration: 0.5,
      ease: 'easeOut',
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

const cardVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: 'easeOut' },
  },
};

type ProductImageConfig = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type ProductAction = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

type ProductCapability = {
  title: string;
  description: string;
  Icon: IconType;
};

type ProductUseCase = {
  title: string;
  description: string;
};

type ProductQuickLink = {
  title: string;
  description: string;
  href: string;
};

type ProductSpotlightSection = {
  eyebrow?: string;
  title: React.ReactNode;
  description: string[];
  image: ProductImageConfig;
  /** Kept for compatibility; the editorial shell no longer uses it. */
  cardBackgroundClassName: string;
  action?: ProductAction;
  reverse?: boolean;
};

type ProductDownloadSection = {
  title: React.ReactNode;
  description: string;
  actions: ProductAction[];
};

type ProductPageTheme = {
  accentTextClassName: string;
  /** Kept for compatibility; the editorial shell no longer uses it. */
  heroBackgroundClassName: string;
  /** Kept for compatibility; the editorial shell no longer uses it. */
  capabilitiesBackgroundClassName: string;
  /** Kept for compatibility; the editorial shell no longer uses it. */
  audiencesBackgroundClassName: string;
  /** Kept for compatibility; the editorial shell no longer uses it. */
  ctaBackgroundClassName: string;
  /** Kept for compatibility; the editorial shell no longer uses it. */
  quickLinksCardClassName: string;
};

type ProductMarketingPageProps = {
  theme: ProductPageTheme;
  hero: {
    breadcrumb: string;
    eyebrow?: string;
    title: React.ReactNode;
    description: string;
    image: ProductImageConfig;
    actions?: ProductAction[];
  };
  intro?: {
    title: React.ReactNode;
    description: React.ReactNode;
  };
  primarySection?: ProductSpotlightSection;
  capabilities: {
    title: React.ReactNode;
    description: string;
    items: ProductCapability[];
  };
  /** Optional slot rendered after capabilities and before useCases. */
  children?: React.ReactNode;
  /** Move the custom slot after the download section when needed. */
  childrenAfterDownload?: boolean;
  /** Move the custom slot after the secondary spotlight section when needed. */
  childrenAfterSecondary?: boolean;
  useCases?: {
    title: React.ReactNode;
    description: string;
    items: ProductUseCase[];
  };
  downloadSection?: ProductDownloadSection;
  secondarySection?: ProductSpotlightSection;
  audiences?: {
    title: React.ReactNode;
    description: string;
    items: string[];
  };
  ctaSection?: {
    eyebrow: string;
    title: React.ReactNode;
    description: string;
    actions: ProductAction[];
    quickLinks?: ProductQuickLink[];
  };
};

/** Internal links navigate in the same tab; external links open a new tab. */
const isInternalHref = (href: string): boolean => href.startsWith('/');

const productActionButtonBaseClassName =
  'inline-flex items-center justify-center gap-2 whitespace-normal rounded-md px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2';

const ProductActionButton = ({ action }: { action: ProductAction }) => {
  const variantClassName =
    action.variant === 'secondary'
      ? 'border border-ink bg-white text-ink hover:bg-gray-50'
      : 'bg-brand text-white hover:bg-brand-700';

  const className = cn(productActionButtonBaseClassName, variantClassName);

  if (isInternalHref(action.href)) {
    return (
      <Link href={action.href} className={className}>
        {action.label}
      </Link>
    );
  }

  return (
    <a
      href={action.href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
    >
      {action.label}
      <BiLinkExternal className="h-4 w-4" aria-hidden="true" />
    </a>
  );
};

const ProductSpotlight = ({
  section,
  accentTextClassName,
}: {
  section: ProductSpotlightSection;
  accentTextClassName: string;
}) => {
  const isReversed = section.reverse;

  return (
    <motion.section
      className="py-16 lg:py-20"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div
        className={`${mainConfig.containerClass} grid items-center gap-10 px-4 sm:px-6 lg:grid-cols-12 lg:gap-12 lg:px-8`}
      >
        <motion.div
          className={cn(
            'min-w-0 lg:col-span-7',
            isReversed ? 'lg:order-2' : 'lg:order-1',
          )}
          variants={itemVariants}
        >
          <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-surface-muted">
            <Image
              src={section.image.src}
              alt={section.image.alt}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />
          </div>
        </motion.div>

        <motion.div
          className={cn(
            'min-w-0 lg:col-span-5',
            isReversed ? 'lg:order-1' : 'lg:order-2',
          )}
          variants={itemVariants}
        >
          {section.eyebrow ? (
            <p
              className={`mb-3 font-mono text-[11px] uppercase tracking-[0.2em] ${accentTextClassName}`}
            >
              {section.eyebrow}
            </p>
          ) : null}
          <h3 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {section.title}
          </h3>
          <div className="mt-4 space-y-4 text-base leading-7 text-gray-600">
            {section.description.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {section.action ? (
            <div className="mt-6">
              <ProductActionButton action={section.action} />
            </div>
          ) : null}
        </motion.div>
      </div>
    </motion.section>
  );
};

const ProductMarketingPage = ({
  theme,
  hero,
  intro,
  primarySection,
  capabilities,
  children,
  childrenAfterDownload = false,
  childrenAfterSecondary = false,
  useCases,
  downloadSection,
  secondarySection,
  audiences,
  ctaSection,
}: ProductMarketingPageProps) => {
  const exploreQuickLink: ProductQuickLink = {
    title: 'Explore the full AirQo system',
    description: 'Browse all eight AirQo tools.',
    href: '/products',
  };
  const quickLinks = ctaSection?.quickLinks
    ? [...ctaSection.quickLinks, exploreQuickLink]
    : [exploreQuickLink];
  const hasQuickLinks = quickLinks.length > 0;

  return (
    <div className="pb-16 flex flex-col w-full">
      <motion.section
        className="border-b border-line bg-white"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`${mainConfig.containerClass} px-4 py-12 sm:px-6 sm:py-16 lg:px-8`}
        >
          <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-12">
            <motion.div
              className="min-w-0 lg:col-span-7"
              variants={itemVariants}
            >
              <Link
                href="/products"
                className="text-sm text-gray-500 transition-colors hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                {hero.breadcrumb}
              </Link>
              {hero.eyebrow ? (
                <p
                  className={`mt-4 font-mono text-[11px] uppercase tracking-[0.2em] ${theme.accentTextClassName}`}
                >
                  {hero.eyebrow}
                </p>
              ) : null}
              <h1 className="mt-3 text-[32px] font-semibold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
                {hero.title}
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
                {hero.description}
              </p>
              {hero.actions && hero.actions.length > 0 ? (
                <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  {hero.actions.map((action) => (
                    <ProductActionButton key={action.label} action={action} />
                  ))}
                </div>
              ) : null}
            </motion.div>

            <motion.div
              className="min-w-0 lg:col-span-5"
              variants={itemVariants}
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-surface-muted">
                <Image
                  src={hero.image.src}
                  alt={hero.image.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {intro ? (
        <motion.section
          className="border-t border-line"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div
            className={`${mainConfig.containerClass} grid grid-cols-1 gap-8 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:px-8`}
          >
            <motion.h2
              className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl"
              variants={itemVariants}
            >
              {intro.title}
            </motion.h2>
            <motion.div
              className="text-lg leading-7 text-gray-600"
              variants={itemVariants}
            >
              {intro.description}
            </motion.div>
          </div>
        </motion.section>
      ) : null}

      {primarySection ? (
        <ProductSpotlight
          section={primarySection}
          accentTextClassName={theme.accentTextClassName}
        />
      ) : null}

      <motion.section
        className="bg-surface-muted"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`${mainConfig.containerClass} px-4 py-12 sm:px-6 sm:py-16 lg:px-8`}
        >
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
            <motion.h2
              className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl"
              variants={itemVariants}
            >
              {capabilities.title}
            </motion.h2>
            <motion.p
              className="text-lg leading-7 text-gray-600"
              variants={itemVariants}
            >
              {capabilities.description}
            </motion.p>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {capabilities.items.map(({ title, description, Icon }) => (
              <motion.div
                key={title}
                className="rounded-md border border-line bg-white p-6"
                variants={cardVariants}
              >
                <Icon className="h-6 w-6 text-brand" aria-hidden="true" />
                <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink">
                  {title}
                </h3>
                <p className="mt-3 text-base leading-7 text-gray-600">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {!childrenAfterDownload && !childrenAfterSecondary ? children : null}

      {useCases ? (
        <motion.section
          className="bg-white"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div
            className={`${mainConfig.containerClass} px-4 py-12 sm:px-6 sm:py-16 lg:px-8`}
          >
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <motion.h2
                className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl"
                variants={itemVariants}
              >
                {useCases.title}
              </motion.h2>
              <motion.p
                className="text-lg leading-7 text-gray-600"
                variants={itemVariants}
              >
                {useCases.description}
              </motion.p>
            </div>

            <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-3">
              {useCases.items.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="border-t border-line pt-6"
                  variants={itemVariants}
                >
                  <p
                    className={`font-mono text-xs ${theme.accentTextClassName}`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-3 text-xl font-semibold tracking-tight text-ink">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-gray-600">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      ) : null}

      {downloadSection ? (
        <motion.section
          className="bg-white py-12 sm:py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
            <div className="rounded-md border border-brand-100 bg-brand-50 p-8 lg:p-12">
              <div className="max-w-2xl">
                <motion.h2
                  className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl"
                  variants={itemVariants}
                >
                  {downloadSection.title}
                </motion.h2>
                <motion.p
                  className="mt-4 text-lg leading-7 text-gray-600"
                  variants={itemVariants}
                >
                  {downloadSection.description}
                </motion.p>
                <motion.div
                  className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap"
                  variants={itemVariants}
                >
                  {downloadSection.actions.map((action) => (
                    <ProductActionButton key={action.label} action={action} />
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>
      ) : null}

      {childrenAfterDownload ? children : null}

      {secondarySection ? (
        <ProductSpotlight
          section={secondarySection}
          accentTextClassName={theme.accentTextClassName}
        />
      ) : null}

      {childrenAfterSecondary ? children : null}

      {audiences ? (
        <motion.section
          className="bg-white py-12 sm:py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
            <div className="rounded-md border border-line bg-surface-muted p-8 lg:p-12">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:items-start">
                <motion.div className="space-y-5" variants={itemVariants}>
                  <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl">
                    {audiences.title}
                  </h2>
                  <p className="text-lg leading-7 text-gray-600">
                    {audiences.description}
                  </p>
                </motion.div>

                <motion.div
                  className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                  variants={containerVariants}
                >
                  {audiences.items.map((item) => (
                    <motion.div
                      key={item}
                      className="flex items-start gap-3 rounded-md border border-line bg-white px-4 py-3 text-sm font-medium text-ink"
                      variants={cardVariants}
                    >
                      <FiCheck
                        className="mt-0.5 h-4 w-4 flex-shrink-0 text-brand"
                        aria-hidden="true"
                      />
                      <span>{item}</span>
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </motion.section>
      ) : null}

      {ctaSection ? (
        <motion.section
          className="bg-white py-12 sm:py-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
            <div
              className={`rounded-md border border-brand-100 bg-brand-50 p-8 lg:p-12 grid grid-cols-1 ${hasQuickLinks ? 'lg:grid-cols-2' : ''} gap-10 items-center`}
            >
              <motion.div
                className={cn('space-y-5', !hasQuickLinks && 'max-w-3xl')}
                variants={itemVariants}
              >
                <p
                  className={`font-mono text-[11px] uppercase tracking-[0.2em] ${theme.accentTextClassName}`}
                >
                  {ctaSection.eyebrow}
                </p>
                <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl lg:text-4xl">
                  {ctaSection.title}
                </h2>
                <p className="text-lg leading-7 text-gray-600">
                  {ctaSection.description}
                </p>
                <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:flex-wrap">
                  {ctaSection.actions.map((action) => (
                    <ProductActionButton key={action.label} action={action} />
                  ))}
                </div>
              </motion.div>

              {hasQuickLinks ? (
                <motion.div
                  className="rounded-md border border-line bg-white p-6"
                  variants={cardVariants}
                >
                  <h3 className="mb-5 text-xl font-semibold tracking-tight text-ink">
                    Explore more
                  </h3>
                  <div className="grid grid-cols-1 gap-3">
                    {quickLinks.map((link) => {
                      const linkClassName =
                        'w-full rounded-md border border-line bg-white px-4 py-4 text-left transition-colors hover:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand';
                      const linkContent = (
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <p className="font-semibold text-ink">
                              {link.title}
                            </p>
                            <p className="mt-1 text-sm leading-6 text-gray-600">
                              {link.description}
                            </p>
                          </div>
                          {isInternalHref(link.href) ? null : (
                            <BiLinkExternal
                              className="mt-1 h-5 w-5 flex-shrink-0 text-slate-500"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                      );

                      return isInternalHref(link.href) ? (
                        <Link
                          key={link.title}
                          href={link.href}
                          className={linkClassName}
                        >
                          {linkContent}
                        </Link>
                      ) : (
                        <a
                          key={link.title}
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={linkClassName}
                        >
                          {linkContent}
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              ) : null}
            </div>
          </div>
        </motion.section>
      ) : null}
    </div>
  );
};

export default ProductMarketingPage;
