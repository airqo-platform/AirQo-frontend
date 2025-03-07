'use client';
import SuccessImage from '@public/assets/images/success/successImage.png';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

import { CustomButton } from '@/components/ui';

const SuccessPage: React.FC = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(10);

  // Countdown and redirect effect
  useEffect(() => {
    if (countdown === 0) {
      router.push('/');
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown, router]);

  // Animation variants for the image and text
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  const buttonVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: 0.3, duration: 0.4, ease: 'easeOut' },
    },
    hover: { scale: 1.05, transition: { duration: 0.3 } },
    tap: { scale: 0.95 },
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center w-full h-[calc(100vh-85px)] bg-[#F9FAFB] p-8"
      style={{ height: 'calc(100vh - 132px)' }}
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Success Image */}
      <motion.div
        className="flex items-center justify-center mb-8"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Image
          src={SuccessImage}
          alt="Success"
          width={250}
          height={250}
          className="mb-4"
        />
      </motion.div>

      {/* Success Message */}
      <motion.h1
        className="text-2xl font-bold text-gray-800 mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        Thank you for reaching out!
      </motion.h1>
      <motion.p
        className="text-gray-600 mb-8 text-center max-w-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        We have received your message and our team will get back to you as soon
        as possible.
      </motion.p>

      {/* Back Button */}
      <motion.div
        variants={buttonVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        whileTap="tap"
      >
        <CustomButton
          onClick={() => router.push('/')}
          className="bg-blue-600 text-white px-8 py-4 hover:bg-blue-700 transition-colors mb-4"
        >
          Back to Home
        </CustomButton>
      </motion.div>

      {/* Countdown Timer */}
      <motion.p
        className="text-gray-500 text-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        You will be redirected to the home page in {countdown} seconds.
      </motion.p>
    </motion.div>
  );
};

export default SuccessPage;
