'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React from 'react';
import type { IconType } from 'react-icons';
import { BiLinkExternal } from 'react-icons/bi';

import { CustomButton } from '@/components/ui';
import mainConfig from '@/config/site.config';

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
  heroBackgroundClassName: string;
  capabilitiesBackgroundClassName: string;
  audiencesBackgroundClassName: string;
  ctaBackgroundClassName: string;
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
  intro: {
    title: React.ReactNode;
    description: React.ReactNode;
  };
  primarySection?: ProductSpotlightSection;
  capabilities: {
    title: React.ReactNode;
    description: string;
    items: ProductCapability[];
  };
  useCases?: {
    title: React.ReactNode;
    description: string;
    items: ProductUseCase[];
  };
  downloadSection?: ProductDownloadSection;
  secondarySection: ProductSpotlightSection;
  audiences?: {
    title: React.ReactNode;
    description: string;
    items: string[];
  };
  ctaSection: {
    eyebrow: string;
    title: React.ReactNode;
    description: string;
    actions: ProductAction[];
    quickLinks: ProductQuickLink[];
  };
};

const openExternalLink = (href: string) => {
  window.open(href, '_blank', 'noopener,noreferrer');
};

const ProductActionButton = ({ action }: { action: ProductAction }) => {
  const className =
    action.variant === 'secondary'
      ? 'border border-black bg-transparent text-gray-800 hover:bg-gray-100'
      : 'bg-blue-700 text-white hover:bg-blue-800';

  return (
    <CustomButton
      type="button"
      onClick={() => openExternalLink(action.href)}
      className={`flex items-center justify-center ${className}`}
    >
      {action.label}
      <BiLinkExternal className="ml-2 text-lg" aria-hidden="true" />
    </CustomButton>
  );
};

const ProductSpotlight = ({
  section,
}: {
  section: ProductSpotlightSection;
}) => {
  const isReversed = section.reverse;

  return (
    <motion.section
      className="px-4 pb-16 lg:pb-24"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={containerVariants}
    >
      <div
        className={`flex flex-col-reverse ${mainConfig.containerClass} lg:flex-row items-center lg:items-start relative`}
      >
        <motion.div
          className={`w-full ${
            isReversed
              ? 'order-2 lg:order-1 mt-12 lg:mt-0 lg:mr-[300px]'
              : 'mt-12 lg:mt-0 lg:ml-[300px]'
          }`}
          variants={itemVariants}
        >
          <Image
            src={section.image.src}
            alt={section.image.alt}
            width={section.image.width ?? 741}
            height={section.image.height ?? 540}
            style={{ objectFit: 'cover' }}
            className="rounded-lg w-full md:w-full"
          />
        </motion.div>

        <motion.div
          className={`${section.cardBackgroundClassName} relative p-6 rounded-lg shadow-md md:w-[630px] md:-top-10 lg:max-w-md lg:absolute z-10 ${
            isReversed ? 'lg:right-0 lg:top-16' : 'lg:left-0 lg:top-8'
          }`}
          variants={cardVariants}
        >
          {section.eyebrow ? (
            <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-blue-700">
              {section.eyebrow}
            </p>
          ) : null}
          <h3 className="mb-4 text-2xl font-bold text-gray-900">
            {section.title}
          </h3>
          <div className="space-y-4 text-lg text-gray-700">
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
  useCases,
  downloadSection,
  secondarySection,
  audiences,
  ctaSection,
}: ProductMarketingPageProps) => {
  return (
    <div className="pb-16 flex flex-col w-full space-y-20 overflow-hidden">
      <motion.section
        className={`${theme.heroBackgroundClassName} py-16 px-4`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`${mainConfig.containerClass} grid grid-cols-1 md:grid-cols-2 gap-12 items-center`}
        >
          <motion.div className="space-y-6" variants={itemVariants}>
            <p className="text-gray-500 mb-2 text-[14px]">{hero.breadcrumb}</p>
            {hero.eyebrow ? (
              <p
                className={`text-sm uppercase tracking-[0.18em] font-semibold ${theme.accentTextClassName}`}
              >
                {hero.eyebrow}
              </p>
            ) : null}
            <h1 className="text-[42px] leading-[50px] md:text-[48px] md:leading-[56px] font-bold mb-2 text-gray-900">
              {hero.title}
            </h1>
            <p className="text-[18px] text-gray-700">{hero.description}</p>
            {hero.actions && hero.actions.length > 0 && (
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {hero.actions.map((action) => (
                  <ProductActionButton key={action.label} action={action} />
                ))}
              </div>
            )}
          </motion.div>

          <motion.div
            className="flex justify-center w-full"
            variants={itemVariants}
          >
            <Image
              src={hero.image.src}
              alt={hero.image.alt}
              width={hero.image.width ?? 500}
              height={hero.image.height ?? 350}
              style={{ objectFit: 'cover' }}
              className="rounded-lg w-full md:w-full"
              priority
            />
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        className={`${mainConfig.containerClass} px-4 grid grid-cols-1 lg:grid-cols-2 gap-8`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <motion.h2
          className="text-[40px] font-semibold mb-4 leading-tight text-gray-900"
          variants={itemVariants}
        >
          {intro.title}
        </motion.h2>
        <motion.div
          className="text-lg text-gray-700 mb-6"
          variants={itemVariants}
        >
          {intro.description}
        </motion.div>
      </motion.section>

      {primarySection ? <ProductSpotlight section={primarySection} /> : null}

      <motion.section
        className={`${theme.capabilitiesBackgroundClassName} py-16 px-4`}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div className={`${mainConfig.containerClass} space-y-8`}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.h2
              className="text-[40px] font-semibold leading-tight text-gray-900"
              variants={itemVariants}
            >
              {capabilities.title}
            </motion.h2>
            <motion.p className="text-lg text-gray-700" variants={itemVariants}>
              {capabilities.description}
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {capabilities.items.map(({ title, description, Icon }) => (
              <motion.div
                key={title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                variants={cardVariants}
              >
                <div className="inline-flex rounded-full bg-slate-50 p-3 text-blue-700 shadow-sm">
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-xl font-semibold text-gray-900">
                  {title}
                </h3>
                <p className="mt-3 text-base leading-7 text-gray-700">
                  {description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {useCases ? (
        <motion.section
          className="px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className={`${mainConfig.containerClass} space-y-8`}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.h2
                className="text-[32px] lg:text-[40px] leading-tight font-semibold text-gray-900"
                variants={itemVariants}
              >
                {useCases.title}
              </motion.h2>
              <motion.p
                className="text-lg text-gray-700"
                variants={itemVariants}
              >
                {useCases.description}
              </motion.p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {useCases.items.map((item, index) => (
                <motion.div
                  key={item.title}
                  className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
                  variants={cardVariants}
                >
                  <p
                    className={`text-sm font-semibold ${theme.accentTextClassName}`}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-4 text-xl font-semibold text-gray-900">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-base leading-7 text-gray-700">
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
          className="px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div
            className={`${mainConfig.containerClass} rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-8 lg:p-12`}
          >
            <div className="max-w-2xl">
              <motion.h2
                className="text-[32px] lg:text-[40px] leading-tight font-semibold text-gray-900 mb-4"
                variants={itemVariants}
              >
                {downloadSection.title}
              </motion.h2>
              <motion.p
                className="text-lg text-gray-700 mb-6"
                variants={itemVariants}
              >
                {downloadSection.description}
              </motion.p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                variants={itemVariants}
              >
                {downloadSection.actions.map((action) => (
                  <ProductActionButton key={action.label} action={action} />
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>
      ) : null}

      <ProductSpotlight section={secondarySection} />

      {audiences ? (
        <motion.section
          className="px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div
            className={`${mainConfig.containerClass} ${theme.audiencesBackgroundClassName} rounded-2xl p-8 lg:p-12`}
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <motion.div className="space-y-5" variants={itemVariants}>
                <h2 className="text-[32px] lg:text-[40px] leading-tight font-semibold text-gray-900">
                  {audiences.title}
                </h2>
                <p className="text-lg text-gray-700">{audiences.description}</p>
              </motion.div>

              <motion.div
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                variants={containerVariants}
              >
                {audiences.items.map((item) => (
                  <motion.div
                    key={item}
                    className="rounded-xl border border-white/70 bg-white/80 px-4 py-4 text-sm font-medium text-gray-800 shadow-sm"
                    variants={cardVariants}
                  >
                    {item}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>
      ) : null}

      <motion.section
        className="px-4 pt-16 lg:pt-24"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
      >
        <div
          className={`${mainConfig.containerClass} rounded-2xl border border-blue-100 ${theme.ctaBackgroundClassName} p-8 lg:p-12 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center`}
        >
          <motion.div className="space-y-5" variants={itemVariants}>
            <p
              className={`text-sm tracking-wide uppercase font-semibold ${theme.accentTextClassName}`}
            >
              {ctaSection.eyebrow}
            </p>
            <h2 className="text-[32px] lg:text-[40px] leading-tight font-semibold text-gray-900">
              {ctaSection.title}
            </h2>
            <p className="text-lg text-gray-700">{ctaSection.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {ctaSection.actions.map((action) => (
                <ProductActionButton key={action.label} action={action} />
              ))}
            </div>
          </motion.div>

          <motion.div
            className={`rounded-xl border border-gray-200 p-6 shadow-sm ${theme.quickLinksCardClassName}`}
            variants={cardVariants}
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-5">
              Explore more
            </h3>
            <div className="grid grid-cols-1 gap-4">
              {ctaSection.quickLinks.map((link) => (
                <a
                  key={link.title}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-4 text-left transition-colors hover:border-blue-200 hover:bg-blue-50"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {link.title}
                      </p>
                      <p className="mt-1 text-sm leading-6 text-gray-700">
                        {link.description}
                      </p>
                    </div>
                    <BiLinkExternal
                      className="mt-1 h-5 w-5 flex-shrink-0 text-slate-500"
                      aria-hidden="true"
                    />
                  </div>
                </a>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
};

export default ProductMarketingPage;
