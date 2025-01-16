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
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728248679/website/photos/Solutions/AirQo_Web_IMG06_nvv5xu.webp',
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1728255497/website/photos/Solutions/consult-2_lnfllz.webp',
      'https://res.cloudinary.com/dbibjvyhm/image/upload/v1737011992/website/photos/Solutions/6T9B9239_ksveld.jpg',
    ],
  },
};

export default function DataAccessSection() {
  return (
    <section className="max-w-5xl mx-auto px-4 lg:px-0 py-16">
      <motion.div
        className="flex flex-col lg:flex-row gap-8 items-center relative"
        variants={animations.container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Text Content */}
        <motion.div className="lg:w-1/2 space-y-4" variants={animations.item}>
          <motion.h3
            className="text-2xl lg:text-[32px]"
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
              className="underline text-blue-600"
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
              <motion.div key={index} variants={animations.item}>
                <Image
                  src={src || '/placeholder.svg'}
                  alt={`Industrial Consultation ${index + 1}`}
                  width={250}
                  height={250}
                  className="rounded-lg object-cover w-full lg:w-auto"
                />
              </motion.div>
            ))}
          </motion.div>
          <motion.div
            className="flex-1 h-full hidden lg:flex max-h-[450px]"
            variants={animations.item}
          >
            <Image
              src={CONTENT.images.consultation[2] || '/placeholder.svg'}
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
            src={CONTENT.images.blob || '/placeholder.svg'}
            alt="Blob Overlay"
            width={657}
            height={360}
            className="object-cover rounded-lg w-full h-full"
          />
        </motion.div>
      </motion.div>
    </section>
  );
}
