'use client';

import { motion } from 'framer-motion';
import React from 'react';

import { cn } from '@/lib/utils';

interface HeroSectionProps {
  bgColor?: string;
  breadcrumbText: string;
  title: string;
  description: string;
  containerVariants: any;
  itemVariants: any;
  className?: string;
  disableInitialAnimation?: boolean;
}

const HeroSection: React.FC<HeroSectionProps> = ({
  bgColor = 'bg-[#E9F7EF]',
  breadcrumbText,
  title,
  description,
  containerVariants,
  itemVariants,
  className,
  disableInitialAnimation = false,
}) => {
  return (
    <motion.section
      className={cn(bgColor, 'py-12 sm:py-16 px-4', className)}
      initial={disableInitialAnimation ? false : 'hidden'}
      animate={disableInitialAnimation ? 'visible' : undefined}
      whileInView={disableInitialAnimation ? undefined : 'visible'}
      viewport={
        disableInitialAnimation ? undefined : { once: true, amount: 0.2 }
      }
      variants={containerVariants}
    >
      <div className="max-w-xl w-full mx-auto text-center">
        <motion.div variants={itemVariants} className="space-y-3">
          <p className="text-gray-500">{breadcrumbText}</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold break-words">
            {title}
          </h1>
          <p className="text-lg">{description}</p>
        </motion.div>
      </div>
    </motion.section>
  );
};

export default HeroSection;
