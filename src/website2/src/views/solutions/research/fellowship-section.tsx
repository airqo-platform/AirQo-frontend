'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const CONTENT = {
  researchAreas: [
    "Participating in scientific research and academic writing for projects aligned with AirQo's priorities and the fellow's technical expertise.",
    'Contributing to product development and deployment, such as applied machine learning in air quality or user experience research.',
    'Translating research into policy and impact.',
    'Conducting specific studies, such as examining the impact of air quality on particular population segments.',
  ],
};

const animations = {
  container: {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
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

export default function FellowshipSection() {
  return (
    <section className="max-w-5xl mx-auto px-4 lg:px-0 py-16">
      <motion.div
        variants={animations.container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
      >
        <Card className="overflow-hidden border-none">
          <CardHeader className="bg-[#E9F7EF] border-b border-green-200">
            <CardTitle className="text-3xl font-bold text-gray-800">
              Visiting Fellowship Program
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 bg-white">
            <motion.p
              className="text-lg text-gray-600 mb-8 leading-relaxed"
              variants={animations.item}
            >
              The AirQo Visiting Fellowship Program is open to scholars and
              practitioners eager to contribute to our impactful social
              initiatives. We welcome individuals from a wide range of
              disciplines, including public health, environmental sciences,
              computer sciences, mathematics, engineering, communications, and
              public policy.
            </motion.p>
            <motion.h3
              className="text-2xl font-semibold mb-6 text-gray-800"
              variants={animations.item}
            >
              Priority Technical Areas:
            </motion.h3>
            <motion.ul
              className="space-y-4 mb-10"
              variants={animations.container}
            >
              {CONTENT.researchAreas.map((area, i) => (
                <motion.li
                  key={i}
                  className="flex items-start"
                  variants={animations.item}
                >
                  <ChevronRight className="h-6 w-6 text-green-500 mr-2 flex-shrink-0 mt-1" />
                  <span className="text-gray-600">{area}</span>
                </motion.li>
              ))}
            </motion.ul>
            <motion.div variants={animations.item}>
              <Button
                onClick={() => {
                  window.open(
                    'https://docs.google.com/forms/d/e/1FAIpQLSfCP91gYXNAdpQ4kStJH7ZnFdXpiRElJuOttZkS7SQhmsESaQ/viewform',
                    '_blank',
                  );
                }}
                className="w-full sm:w-auto bg-[#0CE87E] text-black transition-colors hover:bg-[#0BD170]"
              >
                Apply for the AirQo visiting fellowship programme
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </section>
  );
}
