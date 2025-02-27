'use client';

import PlayIcon from '@public/assets/icons/playIcon.png';
import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { trackEvent } from '@/components/GoogleAnalytics';
import mainConfig from '@/configs/mainConfigs';
import { useDispatch } from '@/hooks';
import { openModal } from '@/store/slices/modalSlice';

import { CustomButton } from '../../components/ui';

// Dynamically import ReactPlayer with forwardRef
const ReactPlayer = dynamic(
  () =>
    import('react-player/lazy').then((mod) => {
      const PlayerWithRef = React.forwardRef<any, any>((props, ref) => (
        <mod.default {...props} ref={ref} />
      ));
      PlayerWithRef.displayName = 'ReactPlayer';
      return PlayerWithRef;
    }),
  { ssr: false },
);

ReactPlayer.displayName = 'ReactPlayer';

const animations = {
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  modal: {
    hidden: { opacity: 0, scale: 0.75 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.75 },
  },
};

interface VideoState {
  isModalOpen: boolean;
  isBackgroundVideoPlaying: boolean;
}

const TextSection: React.FC<{
  onExploreData: () => void;
  onGetInvolved: () => void;
}> = React.memo(({ onExploreData, onGetInvolved }) => (
  <div className="lg:w-1/2 w-full flex flex-col justify-center gap-1">
    <h1 className="text-[32px] lg:text-[56px] font-semibold leading-tight">
      Clean air for all African cities
    </h1>
    <p className="text-base mb-6 max-w-[390px]">
      <span className="text-lg text-blue-600 font-medium">
        &quot;9 out of 10 people breathe polluted air&quot;
      </span>
      <br />
      We empower communities with accurate, hyperlocal and timely air quality
      data to drive air pollution mitigation actions.
    </p>
    <div className="flex gap-4">
      <CustomButton onClick={onExploreData}>Explore data</CustomButton>
      <CustomButton
        onClick={onGetInvolved}
        className="bg-blue-50 text-blue-600"
      >
        Get involved
      </CustomButton>
    </div>
  </div>
));

TextSection.displayName = 'TextSection';

const VideoSection: React.FC<{
  videoRef: React.RefObject<HTMLVideoElement>;
  onPlay: () => void;
}> = React.memo(({ videoRef, onPlay }) => (
  <div className="lg:w-1/2 w-full relative flex items-center justify-center">
    <div className="w-full h-[250px] sm:h-[300px] md:h-[400px] lg:h-[450px] rounded-lg overflow-hidden relative">
      <video
        ref={videoRef}
        src="https://res.cloudinary.com/dbibjvyhm/video/upload/v1716038850/website/videos/opening_jtpafn.mov"
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover"
      />
      <motion.button
        onClick={onPlay}
        className="absolute inset-0 flex items-center justify-center hover:scale-110 focus:outline-none transition-transform duration-300"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Play Video"
      >
        <Image
          src={PlayIcon || '/placeholder.svg'}
          alt="Play Icon"
          width={65}
          height={65}
        />
      </motion.button>
    </div>
  </div>
));

VideoSection.displayName = 'VideoSection';

const VideoModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  playerRef: React.RefObject<any>;
}> = React.memo(({ isOpen, onClose, playerRef }) => (
  <motion.div
    className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center"
    variants={animations.backdrop}
    initial="hidden"
    animate="visible"
    exit="hidden"
    transition={{ duration: 0.3, ease: 'easeInOut' }}
    onClick={onClose}
  >
    <motion.div
      className="bg-white rounded-lg overflow-hidden w-full max-w-3xl p-4 relative"
      variants={animations.modal}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 focus:outline-none z-10"
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

      <div className="relative pb-[56.25%]">
        <ReactPlayer
          ref={playerRef}
          url="https://res.cloudinary.com/dbibjvyhm/video/upload/v1728162527/website/videos/Final_1_qttrg3.mp4"
          playing={isOpen}
          controls
          width="100%"
          height="100%"
          className="absolute top-0 left-0"
          onEnded={onClose}
        />
      </div>

      <CustomButton
        onClick={onClose}
        className="mt-4 bg-blue-600 text-white px-6 py-2 hover:bg-blue-700 transition-colors"
      >
        Close
      </CustomButton>
    </motion.div>
  </motion.div>
));

VideoModal.displayName = 'VideoModal';

const HomePlayerSection: React.FC = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const [videoState, setVideoState] = useState<VideoState>({
    isModalOpen: false,
    isBackgroundVideoPlaying: true,
  });

  const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);
  const modalPlayerRef = useRef<any>(null);

  const handlePlayButtonClick = useCallback(() => {
    trackEvent({
      action: 'video_play',
      category: 'video',
      label: 'home_page_video',
    });
    setVideoState((prev) => ({ ...prev, isModalOpen: true }));
  }, []);

  const handleCloseModal = useCallback(() => {
    if (modalPlayerRef.current) {
      modalPlayerRef.current.seekTo(0);
    }
    setVideoState((prev) => ({ ...prev, isModalOpen: false }));
  }, []);

  useEffect(() => {
    const bgVideo = backgroundVideoRef.current;
    if (bgVideo) {
      if (videoState.isModalOpen) {
        bgVideo.pause();
      } else if (videoState.isBackgroundVideoPlaying) {
        bgVideo.play();
      }
    }
  }, [videoState.isModalOpen, videoState.isBackgroundVideoPlaying]);

  const handleExploreData = useCallback(() => {
    trackEvent({
      action: 'button_click',
      category: 'navigation',
      label: 'explore_data',
    });
    router.push('/explore-data');
  }, [router]);

  const handleGetInvolved = useCallback(() => {
    trackEvent({
      action: 'button_click',
      category: 'engagement',
      label: 'get_involved',
    });
    dispatch(openModal());
  }, [dispatch]);

  return (
    <div
      className={`flex flex-col-reverse px-4 lg:flex-row items-center justify-between ${mainConfig.containerClass} mt-8 gap-8`}
    >
      <TextSection
        onExploreData={handleExploreData}
        onGetInvolved={handleGetInvolved}
      />
      <VideoSection
        videoRef={backgroundVideoRef}
        onPlay={handlePlayButtonClick}
      />
      <AnimatePresence>
        {videoState.isModalOpen && (
          <VideoModal
            isOpen={videoState.isModalOpen}
            onClose={handleCloseModal}
            playerRef={modalPlayerRef}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

HomePlayerSection.displayName = 'HomePlayerSection';

export default HomePlayerSection;
