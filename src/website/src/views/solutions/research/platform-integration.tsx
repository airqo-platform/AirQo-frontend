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
        staggerChildren: 0.3,
      },
    },
  },
  item: {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        duration: 0.6,
      },
    },
  },
  image: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        type: 'spring',
        stiffness: 100,
        damping: 20,
        duration: 0.8,
      },
    },
  },
};

export default function PlatformIntegration() {
  return (
    <section className="max-w-5xl mx-auto px-4 lg:px-0 py-16">
      <motion.div
        className="flex flex-col lg:flex-row gap-16 items-center"
        variants={animations.container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        {/* Text Content */}
        <motion.div className="lg:w-1/2 space-y-8" variants={animations.item}>
          <motion.h2
            className="text-2xl lg:text-[32px] font-medium text-gray-900 tracking-tight leading-tight"
            variants={animations.item}
          >
            Air Quality Data Integration
          </motion.h2>

          <motion.div className="space-y-6" variants={animations.item}>
            <motion.p
              className="text-lg text-gray-600 leading-relaxed"
              variants={animations.item}
            >
              The AirQo Analytics Platform seamlessly integrates air quality
              data from various air quality sensor manufacturers and networks
              providing a comprehensive and accurate picture of air quality in
              major African cities. This integration provides a holistic view of
              air quality across African cities, ensuring access to more
              comprehensive and reliable air quality data.
            </motion.p>

            <motion.p
              className="text-lg text-gray-600 leading-relaxed"
              variants={animations.item}
            >
              By integrating advanced technologies and fostering international
              collaborations, we are committed to pioneering solutions that
              drive sustainable air quality management in Africa.
            </motion.p>
          </motion.div>
        </motion.div>

        {/* Image */}
        <motion.div className="lg:w-1/2 relative" variants={animations.image}>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1737012325/website/photos/Solutions/unnamed_v5i87v.png"
              alt="Air Quality Data Integration"
              width={800}
              height={600}
              className="object-cover hover:scale-105 transition-transform duration-700"
              priority
            />
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
