'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import {
  LuActivity,
  LuDownload,
  LuHeart,
  LuLightbulb,
  LuMapPin,
  LuTrendingUp,
} from 'react-icons/lu';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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

// Content constants
const BENEFITS = [
  {
    title: 'Real-time air quality information',
    description:
      'Access timely air quality information for your neighborhood, empowering you to make informed decisions about outdoor activities.',
    icon: LuMapPin,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    title: 'Health-informed daily decisions',
    description:
      'Plan your day with confidence, choose the best times to walk, jog, or exercise outdoors, and take simple steps to protect vulnerable family members from poor air quality.',
    icon: LuActivity,
    color: 'bg-green-50 text-green-600',
  },
  {
    title: 'Contribute to scientific research',
    description:
      'Your participation helps us understand air pollution patterns and develop better solutions for urban communities.',
    icon: LuLightbulb,
    color: 'bg-purple-50 text-purple-600',
  },
  {
    title: 'Shape future innovations',
    description:
      'Influence the development of air quality tools, policies, and city-level interventions for Kampala and beyond.',
    icon: LuTrendingUp,
    color: 'bg-orange-50 text-orange-600',
  },
];

const PARTICIPATION_STEPS = [
  {
    step: '01',
    title: 'Install the study app',
    description:
      'Click the link shared and install the study APK to get started with the research.',
  },
  {
    step: '02',
    title: 'Log in with your account',
    description:
      'Sign in using your credentials via the settings tab. Please avoid using Guest Mode.',
  },
  {
    step: '03',
    title: 'Complete the survey',
    description:
      'Take a moment to fill out the short survey in the Learn tab about how air quality affects your daily routine.',
  },
  {
    step: '04',
    title: 'Explore the app',
    description:
      'Discover features and learn about the quality of the air you are breathing in real-time.',
  },
];

const FAQS = [
  {
    id: 1,
    question: "Why isn't this version on the App Store or Google Play Store?",
    answer:
      'To protect the research integrity, the pilot app is offered only through a private APK download link. This ensures we maintain control over the study environment and data collection process.',
  },
  {
    id: 2,
    question: 'Will this affect my phone or data?',
    answer:
      'No, the app is lightweight, safe, and works like any normal Android app. It has minimal impact on your phone performance and data usage.',
  },
  {
    id: 3,
    question: 'Do I get paid for participating?',
    answer:
      'Participation is voluntary. However, we will share updates, insights, and opportunities for community involvement throughout and after the study.',
  },
  {
    id: 4,
    question: 'What happens after the study?',
    answer:
      'Your participation will help build better, more responsive clean air interventions for all urban residents in Kampala and other similar African cities. The findings will inform policy and future app development.',
  },
];

const KampalaStudyPage = () => {
  const [openAccordionId, setOpenAccordionId] = useState<number | null>(null);

  const handleAccordionToggle = (faqId: number) => {
    setOpenAccordionId(openAccordionId === faqId ? null : faqId);
  };

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
    <div className="flex flex-col w-full space-y-20 overflow-hidden bg-white">
      {/* Hero Section */}
      <section className="bg-[#DFF5E8] py-16 px-4 h-full">
        <motion.div
          className="max-w-5xl mx-auto text-center"
          initial="hidden"
          animate="visible"
          variants={animations.container}
        >
          <motion.div variants={animations.item} className="space-y-6">
            <div className="inline-block">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-[#0CE87E]/20 text-sm font-medium text-gray-700">
                Solutions &gt; Kampala air pollution exposure study
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
              Kampala air pollution exposure study
            </h1>

            <p className="text-lg md:text-xl text-gray-700 max-w-3xl mx-auto">
              Be part of a community transforming how Kampala stays informed
              about air quality and contributing to cleaner, healthier
              neighborhoods for everyone.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* Why This Study Matters Section */}
      <MotionSection>
        <motion.div variants={animations.item} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Why this study matters
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Understanding how air quality information influences daily decisions
          </p>
        </motion.div>

        <motion.div
          variants={animations.item}
          className="bg-white rounded-xl border border-gray-200 p-8 md:p-12"
        >
          <div className="space-y-6">
            <p className="text-lg text-gray-700 leading-relaxed">
              Air pollution affects how we live, especially our health, yet many
              people lack access to reliable, real-time information. This study
              is designed to understand how access to air quality information
              can improve everyday decisions and help build better, more
              responsive clean-air innovations for all urban residents.
            </p>

            <div className="bg-[#E9F7EF] rounded-xl p-6 md:p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Research objectives
              </h3>
              <ul className="space-y-3">
                {[
                  'Inform citizens about their personal exposure to air pollution',
                  'Learn how people check and use air quality information',
                  'Understand whether knowing air quality influences daily choices',
                  'Discover what features help people better understand their exposure',
                  'Identify what additional information communities need to protect their health',
                ].map((item, index) => (
                  <li key={index} className="flex items-start text-gray-700">
                    <svg
                      className="w-5 h-5 text-[#0CE87E] mr-3 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-lg text-gray-700 leading-relaxed">
              This knowledge will help shape future air quality tools, policies,
              and city-level interventions for Kampala and similar African
              cities.
            </p>
          </div>
        </motion.div>
      </MotionSection>

      {/* Benefits Section */}
      <MotionSection>
        <motion.div variants={animations.item} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            What&apos;s in it for you?
          </h2>
          <p className="text-lg text-gray-600">
            Join the study and unlock these benefits for yourself and your
            community
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit, index) => (
            <motion.div
              key={index}
              variants={animations.item}
              className="group relative bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200"
            >
              <div
                className={cn(
                  'inline-flex p-3 rounded-lg mb-4 ring-1 ring-inset ring-gray-200/20',
                  benefit.color,
                )}
              >
                <benefit.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-[#0CE87E] transition-colors">
                {benefit.title}
              </h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                {benefit.description}
              </p>
            </motion.div>
          ))}
        </div>
      </MotionSection>

      {/* Infographic Section */}
      <section className="bg-[#F9FAFB] py-20">
        <motion.div
          className="max-w-5xl mx-auto px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={animations.container}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={animations.item} className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Your participation makes a difference
              </h2>
              <div className="space-y-4 text-base text-gray-700">
                <p className="leading-relaxed">
                  Your contribution helps us build a comprehensive understanding
                  of air quality patterns in Kampala. Your insights will
                  directly inform:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <LuMapPin className="w-5 h-5 text-[#0CE87E] mr-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Public health policies and air quality regulations
                    </span>
                  </li>
                  <li className="flex items-start">
                    <LuLightbulb className="w-5 h-5 text-[#0CE87E] mr-3 mt-0.5 flex-shrink-0" />
                    <span>Development of user-friendly air quality tools</span>
                  </li>
                  <li className="flex items-start">
                    <LuHeart className="w-5 h-5 text-[#0CE87E] mr-3 mt-0.5 flex-shrink-0" />
                    <span>Community awareness and education programs</span>
                  </li>
                  <li className="flex items-start">
                    <LuTrendingUp className="w-5 h-5 text-[#0CE87E] mr-3 mt-0.5 flex-shrink-0" />
                    <span>
                      Future research on urban air pollution in Africa
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div variants={animations.item} className="relative">
              <div className="relative rounded-xl overflow-hidden shadow-lg">
                <Image
                  src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1769702390/website/photos/Solutions/NEW_qvppa1.webp"
                  alt="Community members discussing and using mobile devices"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How to Participate Section */}
      <MotionSection>
        <motion.div variants={animations.item} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            How to participate
          </h2>
          <p className="text-lg text-gray-600">
            Four simple steps to join the study
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-2">
          {PARTICIPATION_STEPS.map((step, index) => (
            <motion.div
              key={index}
              variants={animations.item}
              className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#0CE87E] transition-all duration-200"
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-[#0CE87E] flex items-center justify-center text-black font-bold text-lg">
                    {step.step}
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div variants={animations.item} className="text-center mt-8">
          <Button
            size={'lg'}
            onClick={() =>
              window.open(
                'https://drive.google.com/file/d/1gshIrY3gi_8RSfdmhFSHF25xE90fu2h5/view',
                '_blank',
              )
            }
            className="bg-[#0CE87E] text-black hover:bg-[#0BD170]"
          >
            <LuDownload className="w-5 h-5 mr-2" />
            Install the APK
          </Button>
        </motion.div>
      </MotionSection>

      {/* Video Section */}
      <section className="bg-[#F9FAFB] py-20">
        <motion.div
          className="max-w-5xl mx-auto px-4"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={animations.container}
        >
          <motion.div variants={animations.item} className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Watch how it works
            </h2>
            <p className="text-lg text-gray-600">
              See how easy it is to participate in the study
            </p>
          </motion.div>

          <motion.div variants={animations.item} className="relative">
            <div className="relative w-full rounded-xl overflow-hidden shadow-lg bg-gray-900">
              <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                <iframe
                  src="https://www.loom.com/embed/6903b35adc7645fbbd82aad3aa489f4a"
                  className="absolute top-0 left-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  title="Kampala Air Quality Study Tutorial"
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <MotionSection className="py-20">
        <motion.div variants={animations.item} className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Frequently asked questions
          </h2>
          <p className="text-lg text-gray-600">
            Find answers to common questions about the study
          </p>
        </motion.div>

        <div className="space-y-3 w-full">
          {FAQS.map((faq) => {
            const isOpen = openAccordionId === faq.id;

            return (
              <div
                key={faq.id}
                className="w-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-[#0CE87E] transition-colors duration-200"
              >
                <button
                  onClick={() => handleAccordionToggle(faq.id)}
                  aria-expanded={isOpen}
                  className={`w-full flex items-center justify-between p-6 text-left ${isOpen ? 'rounded-t-xl' : ''}`}
                >
                  <h3 className="text-base md:text-lg font-semibold text-gray-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {isOpen ? (
                      <FiChevronUp className="w-5 h-5 text-[#0CE87E]" />
                    ) : (
                      <FiChevronDown className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </button>

                {/* smooth CSS-driven accordion: animate max-height + padding to avoid layout jumps */}
                <div
                  className="overflow-hidden"
                  style={{
                    maxHeight: isOpen ? '400px' : '0px',
                    transition: 'max-height 300ms ease, padding 300ms ease',
                    padding: isOpen ? '0 1.5rem 1.5rem' : '0 1.5rem 0',
                  }}
                >
                  <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                </div>
              </div>
            );
          })}
        </div>
      </MotionSection>
    </div>
  );
};

export default KampalaStudyPage;
