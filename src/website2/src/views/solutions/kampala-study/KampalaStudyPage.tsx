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
        staggerChildren: 0.15,
        duration: 0.6,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
    },
  },
  fadeIn: {
    initial: { opacity: 0, scale: 0.95 },
    whileInView: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.7, ease: 'easeOut' },
    },
  },
};

// Content constants
const BENEFITS = [
  {
    title: 'Real-time Air Quality Information',
    description:
      'Access live air quality data for your neighborhood, empowering you to make informed decisions about outdoor activities.',
    icon: LuMapPin,
    gradient: 'from-blue-500 to-cyan-500',
  },
  {
    title: 'Health-Informed Daily Decisions',
    description:
      'Learn when to exercise outdoors, when to keep windows closed, and how to protect vulnerable family members.',
    icon: LuActivity,
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    title: 'Contribute to Scientific Research',
    description:
      'Your participation helps us understand air pollution patterns and develop better solutions for urban communities.',
    icon: LuLightbulb,
    gradient: 'from-purple-500 to-pink-500',
  },
  {
    title: 'Shape Future Innovations',
    description:
      'Influence the development of air quality tools, policies, and city-level interventions for Kampala and beyond.',
    icon: LuTrendingUp,
    gradient: 'from-orange-500 to-red-500',
  },
];

const PARTICIPATION_STEPS = [
  {
    step: '01',
    title: 'Install the Study App',
    description:
      'Click the link shared and install the study APK to get started with the research.',
  },
  {
    step: '02',
    title: 'Log in with Your Account',
    description:
      'Sign in using your credentials via the settings tab. Please avoid using Guest Mode.',
  },
  {
    step: '03',
    title: 'Complete the Survey',
    description:
      'Take a moment to fill out the short survey in the Learn tab about how air quality affects your daily routine.',
  },
  {
    step: '04',
    title: 'Explore the App',
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

  return (
    <div className="flex flex-col w-full overflow-hidden bg-white">
      {/* Hero Section - Modern gradient design */}
      <section className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0yaC00Yy0xLjEgMC0yIC45LTIgMnY0YzAgMS4xLjkgMiAyIDJoNGMxLjEgMCAyLS45IDItMnYtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />

        <motion.div
          className="relative max-w-6xl mx-auto px-6 lg:px-8"
          initial="hidden"
          animate="visible"
          variants={animations.container}
        >
          <motion.div
            variants={animations.item}
            className="text-center space-y-6"
          >
            <div className="inline-block">
              <span className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 backdrop-blur-sm text-sm font-medium">
                <LuHeart className="w-4 h-4 mr-2" />
                Join the Movement
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Kampala Air Quality Study
            </h1>

            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto leading-relaxed">
              Be part of a community transforming how Kampala stays informed
              about air quality and contributing to cleaner, healthier
              neighborhoods for everyone.
            </p>

            <motion.div variants={animations.item} className="pt-6">
              <Button
                onClick={() => window.open('#', '_blank')}
                size="lg"
                className="bg-white text-indigo-600 hover:bg-gray-50 text-lg px-8 py-6 h-auto rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
              >
                <LuDownload className="w-5 h-5 mr-2" />
                Download Study App
              </Button>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Why This Study Matters Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <motion.div
          className="max-w-6xl mx-auto px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={animations.container}
        >
          <motion.div variants={animations.item} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Why This Study Matters
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Understanding how air quality information influences daily
              decisions
            </p>
          </motion.div>

          <motion.div
            variants={animations.item}
            className="bg-white rounded-2xl shadow-xl p-8 md:p-12 lg:p-16"
          >
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed mb-6">
                Air pollution affects how we live, especially our health, yet
                many people lack access to reliable, real-time information. This
                study is designed to understand how access to air quality
                information can improve everyday decisions and help build
                better, more responsive clean-air innovations for all urban
                residents.
              </p>

              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-8 my-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-6">
                  Research Objectives
                </h3>
                <ul className="space-y-4">
                  {[
                    'Inform citizens about their personal exposure to air pollution',
                    'Learn how people check and use air quality information',
                    'Understand whether knowing air quality influences daily choices',
                    'Discover what features help people better understand their exposure',
                    'Identify what additional information communities need to protect their health',
                  ].map((item, index) => (
                    <li key={index} className="flex items-start text-gray-700">
                      <svg
                        className="w-6 h-6 text-indigo-600 mr-3 mt-0.5 flex-shrink-0"
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
                This knowledge will help shape future air quality tools,
                policies, and city-level interventions for Kampala and similar
                African cities.
              </p>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 lg:py-28">
        <motion.div
          className="max-w-7xl mx-auto px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={animations.container}
        >
          <motion.div variants={animations.item} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              What&apos;s in it for You?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join the study and unlock these benefits for yourself and your
              community
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit, index) => (
              <motion.div
                key={index}
                variants={animations.item}
                className="group relative bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div
                  className={cn(
                    'absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300',
                    benefit.gradient,
                  )}
                />
                <div className="relative">
                  <div
                    className={cn(
                      'inline-flex p-4 rounded-2xl bg-gradient-to-br mb-6',
                      benefit.gradient,
                    )}
                  >
                    <benefit.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Infographic Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
        <motion.div
          className="max-w-7xl mx-auto px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={animations.container}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div variants={animations.item} className="space-y-6">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900">
                Your Participation Makes a Difference
              </h2>
              <div className="space-y-4 text-lg text-gray-700">
                <p className="leading-relaxed">
                  Every data point you contribute helps us build a comprehensive
                  understanding of air quality patterns in Kampala. Your
                  insights will directly inform:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <span className="text-indigo-600 font-bold mr-3">→</span>
                    <span>
                      Public health policies and air quality regulations
                    </span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 font-bold mr-3">→</span>
                    <span>Development of user-friendly air quality tools</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 font-bold mr-3">→</span>
                    <span>Community awareness and education programs</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-indigo-600 font-bold mr-3">→</span>
                    <span>
                      Future research on urban air pollution in Africa
                    </span>
                  </li>
                </ul>
              </div>
            </motion.div>

            <motion.div variants={animations.item} className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="https://images.unsplash.com/photo-1573167243872-43c6433b9d40?w=800&h=600&fit=crop"
                  alt="Community members using air quality data"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How to Participate Section */}
      <section className="py-20 lg:py-28 bg-white">
        <motion.div
          className="max-w-6xl mx-auto px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={animations.container}
        >
          <motion.div variants={animations.item} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              How to Participate
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four simple steps to join the study
            </p>
          </motion.div>

          <div className="grid gap-8 md:grid-cols-2">
            {PARTICIPATION_STEPS.map((step, index) => (
              <motion.div
                key={index}
                variants={animations.item}
                className="relative bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 hover:border-indigo-300 transition-all duration-300"
              >
                <div className="flex items-start space-x-6">
                  <div className="flex-shrink-0">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {step.step}
                    </div>
                  </div>
                  <div className="flex-1 pt-2">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600 leading-relaxed">
                      {step.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div variants={animations.item} className="text-center mt-12">
            <Button
              onClick={() => window.open('#', '_blank')}
              size="lg"
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-lg px-10 py-6 h-auto rounded-full shadow-xl"
            >
              <LuDownload className="w-5 h-5 mr-2" />
              Download Study App Now
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Video Section */}
      <section className="py-20 lg:py-28 bg-gray-50">
        <motion.div
          className="max-w-6xl mx-auto px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={animations.container}
        >
          <motion.div variants={animations.item} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Watch How It Works
            </h2>
            <p className="text-xl text-gray-600">
              See how easy it is to participate in the study
            </p>
          </motion.div>

          <motion.div
            variants={animations.item}
            className="relative w-full rounded-2xl overflow-hidden shadow-2xl bg-gray-900"
          >
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
          </motion.div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 lg:py-28 bg-white">
        <motion.div
          className="max-w-4xl mx-auto px-6 lg:px-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={animations.container}
        >
          <motion.div variants={animations.item} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Find answers to common questions about the study
            </p>
          </motion.div>

          <motion.div variants={animations.item} className="space-y-4">
            {FAQS.map((faq) => (
              <div
                key={faq.id}
                className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-indigo-300 transition-colors duration-300"
              >
                <button
                  onClick={() => handleAccordionToggle(faq.id)}
                  className="w-full flex items-center justify-between p-6 md:p-8 text-left"
                >
                  <h3 className="text-lg md:text-xl font-bold text-gray-900 pr-8">
                    {faq.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openAccordionId === faq.id ? (
                      <FiChevronUp className="w-6 h-6 text-indigo-600" />
                    ) : (
                      <FiChevronDown className="w-6 h-6 text-gray-400" />
                    )}
                  </div>
                </button>
                {openAccordionId === faq.id && (
                  <div className="px-6 md:px-8 pb-6 md:pb-8">
                    <p className="text-gray-700 leading-relaxed text-lg">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDE0YzAtMS4xLS45LTItMi0yaC00Yy0xLjEgMC0yIC45LTIgMnY0YzAgMS4xLjkgMiAyIDJoNGMxLjEgMCAyLS45IDItMnYtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20" />

        <motion.div
          {...animations.fadeIn}
          viewport={{ once: true, amount: 0.3 }}
          className="relative max-w-4xl mx-auto px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of Kampala residents contributing to cleaner air for
            all
          </p>
          <Button
            onClick={() => window.open('#', '_blank')}
            size="lg"
            className="bg-white text-indigo-600 hover:bg-gray-50 text-lg px-10 py-6 h-auto rounded-full shadow-xl hover:shadow-2xl transition-all duration-300"
          >
            <LuDownload className="w-5 h-5 mr-2" />
            Download the App Now
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default KampalaStudyPage;
