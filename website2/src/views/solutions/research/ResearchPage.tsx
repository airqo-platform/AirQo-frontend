'use client';

import { motion } from 'framer-motion';
import { BarChart3, Shield, Users, Zap } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React from 'react';

import CardWrapper from '@/components/sections/solutions/CardWrapper';
import HeroSection from '@/components/sections/solutions/HeroSection';
import { CustomButton, Divider } from '@/components/ui';
import { cn } from '@/lib/utils';

import DataAccessSection from './data-access';
import FellowshipSection from './fellowship-section';
import PlatformIntegration from './platform-integration';

// Animation variants
const animations = {
  container: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  },
  fadeIn: {
    initial: { opacity: 0, y: 50 },
    whileInView: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  },
};

// Constants
const CONTENT = {
  benefits: [
    {
      title: 'Enhanced Data Accessibility',
      description:
        'Remote access to high-quality air quality data for improved decision making and research.',
      icon: BarChart3,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      title: 'Cost Efficiency',
      description:
        'Lower operational costs for sustainable air quality monitoring in African cities through innovative solutions.',
      icon: Zap,
      color: 'bg-green-50 text-green-600',
    },
    {
      title: 'Capacity Building',
      description:
        'Knowledge sharing and research collaboration to strengthen air quality management capabilities.',
      icon: Users,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      title: 'Scalable Solutions',
      description:
        'Adaptable solutions for various regulatory-grade monitors applicable across multiple African cities.',
      icon: Shield,
      color: 'bg-orange-50 text-orange-600',
    },
  ],
};

const ResearchPage = () => {
  const router = useRouter();

  const MotionSection = ({ className = '', children, ...props }: any) => (
    <motion.section
      className={`max-w-5xl mx-auto px-4 ${className}`}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={animations.container}
      {...props}
    >
      {children}
    </motion.section>
  );

  return (
    <div className="flex flex-col w-full space-y-20 overflow-hidden">
      {/* Hero Section */}
      <HeroSection
        bgColor="bg-[#E9F7EF]"
        breadcrumbText="Solutions > For Research"
        title="For Research"
        description="We actively collaborate with researchers across the world to jointly tackle air quality research challenges."
        containerVariants={animations.container}
        itemVariants={animations.item}
      />

      {/* Description Section */}
      <MotionSection className="text-center">
        <motion.p
          className="text-2xl lg:text-[40px] lg:leading-[48px] text-gray-800"
          variants={animations.item}
        >
          We aim to advance the understanding of air quality issues in
          sub-Saharan Africa through a multidisciplinary approach. We leverage
          IoT and sensing technology, AI and Machine Learning, and temporal and
          spatial modeling to enhance air quality management across the
          continent.
        </motion.p>
      </MotionSection>

      <Divider className="bg-[#E9F7EF]" />

      {/* Industrial consultation */}
      <DataAccessSection />

      {/* Benefits Section */}
      <motion.div
        className="max-w-5xl mx-auto px-4 lg:px-0"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={animations.container}
      >
        <div className="relative">
          <motion.h3
            className="text-2xl font-bold text-center mb-8"
            variants={animations.item}
          >
            Key Benefits
          </motion.h3>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {CONTENT.benefits.map((benefit, i) => (
              <motion.div
                key={i}
                variants={animations.item}
                className="group relative border bg-white rounded-xl shadow-sm transition-all duration-200 hover:shadow-md"
              >
                <div className="p-4">
                  <div
                    className={cn(
                      'inline-flex rounded-lg p-3 ring-1 ring-inset ring-gray-200/20 mb-4',
                      benefit.color,
                    )}
                  >
                    <benefit.icon className="w-6 h-6" />
                  </div>
                  <h4 className="font-semibold text-xl mb-2 group-hover:text-blue-600 transition-colors">
                    {benefit.title}
                  </h4>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
                <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Platform Integration Section */}
      <PlatformIntegration />

      {/* Fellowship Section */}
      <FellowshipSection />

      {/* Publications Section */}
      <motion.section
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={animations.container}
      >
        <CardWrapper>
          <motion.div className="space-y-4" variants={animations.item}>
            <h4 className="text-[#0CE87E] uppercase text-[20px]">
              Publications
            </h4>
            <h2 className="text-3xl lg:text-[40px] leading-[48px]">
              Managing the Environment for Climate Resilient Livelihoods and
              Sustainable Economic Development.
            </h2>
            <div className="space-y-2">
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Created by </span>
                <span>National Environment Management Authority(NEMA)</span>
              </p>
              <p className="text-lg text-gray-700">
                <span className="font-semibold">Supported by </span>
                <span>AirQo and Makerere University</span>
              </p>
            </div>
            <CustomButton
              onClick={() => {
                window.open(
                  'https://www.nema.go.ug/sites/default/files/NSOER%202018-2019.pdf',
                  '_blank',
                );
              }}
              className="flex items-center bg-transparent text-black justify-center w-full max-w-[200px] border border-black px-4 py-3 bg-none mt-4"
            >
              Read Report &rarr;
            </CustomButton>
          </motion.div>
        </CardWrapper>
      </motion.section>

      {/* Call to Action */}
      <motion.div
        {...animations.fadeIn}
        viewport={{ once: true, amount: 0.2 }}
        className="flex justify-center px-4"
      >
        <CustomButton
          onClick={() => router.push('/explore-data')}
          className="bg-[#0CE87E] text-black rounded-lg max-w-5xl mx-auto w-full py-16 text-center"
        >
          <h3 className="text-3xl font-bold mb-4">
            Explore our digital air quality tools.
          </h3>
          <span className="px-6 py-3 bg-none mt-4">Explore data &rarr;</span>
        </CustomButton>
      </motion.div>
    </div>
  );
};

export default ResearchPage;
