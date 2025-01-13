'use client';

import { motion } from 'framer-motion';
import { BarChart3, Shield, Users, Zap } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

import HeroSection from '@/components/sections/solutions/HeroSection';
import { CustomButton, Divider } from '@/components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

// Constants
const CONTENT = {
  researchAreas: [
    "Participating in scientific research and academic writing for projects aligned with AirQo's priorities and the fellow's technical expertise.",
    'Contributing to product development and deployment, such as applied machine learning in air quality or user experience research.',
    'Translating research into policy and impact.',
    'Conducting specific studies, such as examining the impact of air quality on particular population segments.',
  ],
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
  images: {
    blob: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248677/website/photos/Solutions/AirQo_blob_fill_ro37jv.svg',
    consultation: [
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248679/website/photos/Solutions/AirQo_Web_IMG06_nvv5xu.webp',
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728255497/website/photos/Solutions/consult-2_lnfllz.webp',
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728255497/website/photos/Solutions/consult-long_ehdzts.webp',
    ],
  },
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
        description="Advancing knowledge, evidence and understanding of air quality issues in sub-Saharan Africa."
        containerVariants={animations.container}
        itemVariants={animations.item}
      />

      {/* Description Section */}
      <MotionSection className="text-center">
        <motion.p
          className="text-2xl lg:text-[40px] leading-[48px] text-gray-800"
          variants={animations.item}
        >
          We actively collaborate with researchers across the world to jointly
          tackle air quality research challenges.
          <br /> <br />
          We aim to advance the understanding of air quality issues in
          sub-Saharan Africa through a multidisciplinary approach. By leveraging
          IoT and sensing technology, AI and machine learning, and temporal and
          spatial modeling, we strive to enhance air quality management across
          the continent.
        </motion.p>
      </MotionSection>

      <Divider className="bg-[#E9F7EF]" />

      {/* Collaboration Section */}
      <MotionSection className="space-y-16">
        {/* Industrial consultation */}
        <motion.div
          className="flex flex-col lg:flex-row gap-8 items-center relative"
          variants={animations.item}
        >
          {/* Text Content */}
          <motion.div className="lg:w-1/2 space-y-4" variants={animations.item}>
            <h3 className="text-2xl lg:text-[32px]">
              Automating data access for reference grade monitors
            </h3>
            <p className="text-lg text-gray-700">
              Our ongoing partnership with the United Nations Environment
              Programme (UNEP) aims to support African cities with air quality
              management to accelerate the implementation of the{' '}
              <a
                href="https://documents-dds-ny.un.org/doc/UNDOC/GEN/K18/002/22/PDF/K1800222.pdf?OpenElement"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600"
              >
                UN resolution UNEA Res 3/8
              </a>
              .
            </p>
            <div className="space-y-4">
              {[
                'Through this collaboration, we are growing the data infrastructure and facilitating knowledge and experience sharing to advance air quality management in African Cities.',
                'Recognizing the critical need for open access to high-quality datasets from regulatory-grade air quality monitors, we have developed a data logger, a unique microprocessor-based solution.',
                'This groundbreaking initiative promotes remote access to reference monitor data, continues to lower the cost of operating air quality networks, and enhances open access to regulatory-grade datasets for actionable insights across African cities.',
              ].map((text, index) => (
                <p key={index} className="text-lg text-gray-700">
                  {text}
                </p>
              ))}
            </div>
          </motion.div>

          {/* Images Grid */}
          <motion.div
            className="relative flex flex-col lg:flex-row gap-4 items-center lg:items-start"
            variants={animations.item}
          >
            <motion.div
              className="flex flex-col gap-4"
              variants={animations.item}
            >
              {CONTENT.images.consultation.slice(0, 2).map((src, index) => (
                <Image
                  key={index}
                  src={src}
                  alt={`Industrial Consultation ${index + 1}`}
                  width={250}
                  height={250}
                  className="rounded-lg object-cover w-full lg:w-auto"
                />
              ))}
            </motion.div>
            <motion.div
              className="flex-1 h-full hidden lg:flex max-h-[450px]"
              variants={animations.item}
            >
              <Image
                src={CONTENT.images.consultation[2]}
                alt="Industrial Consultation 3"
                width={262}
                height={450}
                className="object-cover rounded-lg w-full lg:w-auto h-[410px]"
              />
            </motion.div>
          </motion.div>

          {/* Blob Overlay */}
          <motion.div
            className="absolute top-52 -z-50 lg:top-[-8px] lg:left-[27rem] w-[650px] h-[300px] lg:max-w-[630px] lg:max-h-[400px] flex items-center justify-center"
            variants={animations.item}
          >
            <Image
              src={CONTENT.images.blob}
              alt="Blob Overlay"
              width={657}
              height={360}
              className="object-cover rounded-lg w-full h-full"
            />
          </motion.div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          className="mt-16 relative"
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
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto px-4">
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
        <section className="bg-[#e8f5e9] py-16">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-2xl font-bold tracking-tighter sm:text-3xl mb-6">
              Platform interoperability/compatibility/Integration
            </h2>
            <div className="grid gap-6">
              {[
                'The AirQo Analytics Platform can seamlessly integrate third-party datasets, expanding its digital capabilities and creating a comprehensive and accurate picture of air quality in major African cities.',
                'The platform can effectively support data integration from various air quality sensor manufacturers and networks. This integration provides a holistic view of air quality across African cities, ensuring access to more comprehensive and reliable air quality data.',
                'By integrating advanced technologies and fostering international collaborations, we are committed to pioneering solutions that drive sustainable air quality management in Africa.',
              ].map((text, index) => (
                <p key={index} className="text-gray-600">
                  {text}
                </p>
              ))}
            </div>
          </div>
        </section>

        {/* Fellowship Section */}
        <section className="py-16">
          <div className="max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-bold">
                  Visiting Fellowship Program
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  The AirQo Visiting Fellowship Program is open to scholars and
                  practitioners eager to contribute to our impactful social
                  initiatives. We welcome individuals from a wide range of
                  disciplines, including public health, environmental sciences,
                  computer sciences, mathematics, engineering, communications,
                  and public policy.
                </p>
                <h3 className="text-xl font-semibold mb-4">
                  Priority Technical areas:
                </h3>
                <ul className="list-disc pl-5 mb-6 space-y-2">
                  {CONTENT.researchAreas.map((area, i) => (
                    <li key={i} className="text-gray-600">
                      {area}
                    </li>
                  ))}
                </ul>
                <CustomButton
                  onClick={() => {
                    window.open(
                      'https://docs.google.com/forms/d/e/1FAIpQLSfCP91gYXNAdpQ4kStJH7ZnFdXpiRElJuOttZkS7SQhmsESaQ/viewform',
                      '_blank',
                    );
                  }}
                  className="w-full sm:w-auto bg-[#E9F7EF] text-black hover:bg-green-100 transition rounded-none"
                >
                  Apply for the AirQo visiting fellowship programme
                </CustomButton>
              </CardContent>
            </Card>
          </div>
        </section>
      </MotionSection>

      {/* Publications Section */}
      <MotionSection className="bg-[#E9F7EF] py-16 px-16 rounded-lg">
        <motion.div className="space-y-4" variants={animations.item}>
          <h4 className="text-[#0CE87E] uppercase text-[20px]">Publications</h4>
          <h2 className="text-3xl lg:text-[40px] leading-[48px]">
            Managing the Environment for Climate Resilient Livelihoods and
            Sustainable Economic Development.
          </h2>
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Created by </span>
            <span>National Environment Management Authority(NEMA)</span>
          </p>
          <p className="text-lg text-gray-700">
            <span className="font-semibold">Supported by </span>
            <span>AirQo and Makerere University</span>
          </p>
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
      </MotionSection>

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
