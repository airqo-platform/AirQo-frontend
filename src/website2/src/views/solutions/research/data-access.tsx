'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';

const animations = {
  container: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
      },
    },
  },
};

const CONTENT = {
  images: {
    blob: 'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248677/website/photos/Solutions/AirQo_blob_fill_ro37jv.svg',
    consultation: [
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1737011992/website/photos/Solutions/6T9B9239_ksveld.jpg',
    ],
  },
};

export default function DataAccessSection() {
  return (
    <section className="max-w-5xl mx-auto px-4 lg:px-0">
      <motion.div
        className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]"
        variants={animations.container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Text Content */}
        <motion.div className="space-y-6" variants={animations.item}>
          <motion.h3
            className="text-2xl lg:text-[32px] font-semibold"
            variants={animations.item}
          >
            Automating data access for reference grade monitors
          </motion.h3>
          <motion.p
            className="text-lg text-gray-700"
            variants={animations.item}
          >
            Our ongoing partnership with the United Nations Environment
            Programme (UNEP) aims to support African cities with air quality
            management to accelerate the implementation of the{' '}
            <a
              href="https://documents-dds-ny.un.org/doc/UNDOC/GEN/K18/002/22/PDF/K1800222.pdf?OpenElement"
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-blue-600 hover:text-blue-800"
            >
              UN resolution UNEA Res 3/8
            </a>
            .
          </motion.p>
          <motion.div className="space-y-4" variants={animations.item}>
            {[
              'Through this collaboration, we are growing the data infrastructure and facilitating knowledge and experience sharing to advance air quality management in African Cities.',
              'Recognizing the critical need for open access to high-quality datasets from regulatory-grade air quality monitors, we have developed a data logger, a unique microprocessor-based solution.',
              'This groundbreaking initiative promotes remote access to reference monitor data, continues to lower the cost of operating air quality networks, and enhances open access to regulatory-grade datasets for actionable insights across African cities.',
            ].map((text, index) => (
              <motion.p
                key={index}
                className="text-lg text-gray-700"
                variants={animations.item}
              >
                {text}
              </motion.p>
            ))}
          </motion.div>
        </motion.div>

        {/* Single Tall Image Container */}
        <motion.div
          className="relative flex items-center justify-center h-full min-h-[600px]"
          variants={animations.item}
        >
          <motion.div
            className="relative w-full h-[600px] rounded-xl overflow-hidden shadow-lg"
            variants={animations.item}
          >
            <Image
              src={CONTENT.images.consultation[0] || '/placeholder.svg'}
              alt="Air Quality Monitoring Equipment"
              fill
              className="object-cover hover:scale-105 transition-transform duration-300"
              priority
            />
          </motion.div>

          {/* Blob Overlay */}
          <motion.div
            className="absolute hidden md:block -z-10 top-1/4 left-1/4 transform -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%]"
            variants={animations.item}
          >
            <Image
              src={CONTENT.images.blob || '/placeholder.svg'}
              alt="Blob Overlay"
              fill
              className="object-contain opacity-50"
            />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
