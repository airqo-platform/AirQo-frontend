'use client';

import PlayIcon from '@public/assets/icons/playIcon.png';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { useDispatch } from '@/hooks';
import { openModal } from '@/store/slices/modalSlice';

import { CustomButton } from '../../ui';

// Dynamically import ReactPlayer to avoid SSR issues
const ReactPlayer = dynamic(() => import('react-player/lazy'), { ssr: false });

// Define motion variants for the modal
const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.75 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.75 },
};

const HomePlayerSection = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handlePlayButtonClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col-reverse px-4 lg:flex-row items-center justify-between max-w-5xl mx-auto mt-8 gap-8">
      {/* Text Section */}
      <div className="lg:w-1/2 w-full flex flex-col justify-center gap-4">
        <h1 className="text-[32px] lg:text-[56px] font-semibold">
          Clean air for all African cities
        </h1>
        <p className="text-lg text-blue-600 font-medium">
          &quot;9 out of 10 people breathe polluted air&quot;
        </p>
        <p className="text-base mb-6 max-w-[390px]">
          We empower communities with accurate, hyperlocal and timely air
          quality data to drive air pollution mitigation actions.
        </p>
        <div className="flex gap-4">
          <CustomButton onClick={() => router.push('/explore-data')}>
            Explore data
          </CustomButton>
          <CustomButton
            onClick={() => dispatch(openModal())}
            className="bg-blue-50 text-blue-600"
          >
            Get involved
          </CustomButton>
        </div>
      </div>

      {/* Video Section */}
      <div className="lg:w-1/2 w-full relative flex items-center justify-center">
        <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[450px] rounded-lg overflow-hidden relative">
          {/* Looping Video using HTML video tag */}
          <video
            src="https://res.cloudinary.com/dbibjvyhm/video/upload/v1716038850/website/videos/opening_jtpafn.mov"
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          ></video>

          {/* Play Button with Framer Motion Animation */}
          <motion.button
            onClick={handlePlayButtonClick}
            className="absolute inset-0 flex items-center justify-center hover:scale-110 focus:outline-none transition-transform duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label="Play Video"
          >
            <Image src={PlayIcon} alt="Play Icon" width={65} height={65} />
          </motion.button>
        </div>
      </div>

      {/* Video Modal with Framer Motion Animations */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            onClick={handleCloseModal}
          >
            <motion.div
              className="bg-white overflow-hidden w-full max-w-3xl p-4 relative"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close Modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* ReactPlayer */}
              <div className="relative pb-[56.25%]">
                <ReactPlayer
                  url="https://res.cloudinary.com/dbibjvyhm/video/upload/v1728162527/website/videos/Final_1_qttrg3.mp4"
                  playing
                  controls
                  width="100%"
                  height="100%"
                  className="absolute top-0 left-0"
                />
              </div>

              {/* Close Button */}
              <CustomButton
                onClick={handleCloseModal}
                className="mt-4 bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 transition-colors"
              >
                Close
              </CustomButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HomePlayerSection;
