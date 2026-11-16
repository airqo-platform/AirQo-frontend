'use client';

import { AnimatePresence, motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import React, { useCallback, useRef, useState } from 'react';
import { FiArrowRight, FiArrowUpRight, FiPlay } from 'react-icons/fi';

import { trackEvent } from '@/components/GoogleAnalytics';
import mainConfig from '@/config/site.config';
import { optimizeCloudinaryUrl } from '@/services/external/cloudinary.service';

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

const HOME_FULL_VIDEO = 'https://www.youtube.com/watch?v=2NebAd1F8x8';

const HERO_IMAGE = optimizeCloudinaryUrl(
  'https://res.cloudinary.com/dbibjvyhm/image/upload/v1743546958/website/photos/OurProducts/Monitor/Two_members_in_field_knwffk.jpg',
  { width: 1600 },
);

const HERO_STATS = [
  { value: '16', label: 'Cities' },
  { value: '500+', label: 'Monitors' },
  { value: '9', label: 'Countries' },
] as const;

const animations = {
  backdrop: {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
  },
  modal: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.25, ease: 'easeOut' },
    },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
  },
};

const VideoModal = React.forwardRef<
  HTMLDivElement,
  {
    isOpen: boolean;
    onClose: () => void;
    playerRef: React.RefObject<any>;
  }
>(({ isOpen, onClose, playerRef }, ref) => (
  <motion.div
    ref={ref}
    className="fixed inset-0 z-[10000] flex items-center justify-center bg-ink/70 p-4"
    variants={animations.backdrop}
    initial="hidden"
    animate="visible"
    exit="hidden"
    onClick={onClose}
  >
    <motion.div
      className="relative w-full max-w-3xl rounded-md bg-white p-4"
      variants={animations.modal}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Close video"
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
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

      <div className="relative aspect-video overflow-hidden rounded-md bg-ink">
        <ReactPlayer
          ref={playerRef}
          url={HOME_FULL_VIDEO}
          playing={isOpen}
          controls
          width="100%"
          height="100%"
          className="absolute left-0 top-0"
          onEnded={onClose}
        />
      </div>

      <button
        type="button"
        onClick={onClose}
        className="mt-4 inline-flex items-center justify-center rounded-md bg-brand px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
      >
        Close
      </button>
    </motion.div>
  </motion.div>
));

VideoModal.displayName = 'VideoModal';

const HomePlayerSection: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const modalPlayerRef = useRef<any>(null);

  const handlePlayFilm = useCallback(() => {
    trackEvent({
      action: 'video_play',
      category: 'video',
      label: 'home_page_video',
    });
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    if (modalPlayerRef.current) {
      modalPlayerRef.current.seekTo(0);
    }
    setIsModalOpen(false);
  }, []);

  return (
    <section className="bg-white">
      <div
        className={`${mainConfig.containerClass} px-4 py-10 sm:px-6 sm:py-14 lg:px-8 lg:py-16`}
      >
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="min-w-0 lg:col-span-7">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-slate-600">
              Air quality data for African cities
            </p>
            <h1 className="mt-4 max-w-2xl text-balance text-[40px] font-semibold leading-[1.05] tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl">
              The air African cities breathe, made visible.
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-gray-600">
              AirQo builds and calibrates monitors in Africa, then turns their
              data into open information for communities, cities, and
              researchers.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <a
                href="https://ai.airqo.net/map"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="See live air quality map (opens in a new tab)"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-brand px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                See live air quality
                <FiArrowUpRight aria-hidden="true" className="h-4 w-4" />
              </a>
              <Link
                href="/products"
                className="inline-flex items-center justify-center gap-2 rounded-md border border-ink bg-white px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              >
                Explore products
                <FiArrowRight aria-hidden="true" className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-3 border-t border-line pt-6">
              {HERO_STATS.map((stat, index) => (
                <div
                  key={stat.label}
                  className={
                    index === 0
                      ? 'min-w-0 pr-4 sm:pr-6'
                      : 'min-w-0 border-l border-line pl-4 sm:pl-6'
                  }
                >
                  <p className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                    {stat.value}
                  </p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-slate-600 sm:text-[11px]">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="min-w-0 lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md border border-line bg-surface-muted">
              <Image
                src={HERO_IMAGE}
                alt="AirQo field engineers installing a Binos monitor in Kampala, Uganda"
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover"
              />
            </div>
            <div className="mt-3 flex items-start justify-between gap-4">
              <p className="text-sm leading-6 text-gray-500">
                AirQo field engineers installing a Binos monitor in Kampala,
                Uganda.
              </p>
              <button
                type="button"
                onClick={handlePlayFilm}
                className="inline-flex shrink-0 items-center gap-2 rounded-sm text-sm font-semibold text-brand transition-colors hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <FiPlay aria-hidden="true" className="h-3.5 w-3.5" />
                Watch the film
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <VideoModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            playerRef={modalPlayerRef}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

HomePlayerSection.displayName = 'HomePlayerSection';

export default HomePlayerSection;
