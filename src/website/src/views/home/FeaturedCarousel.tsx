'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiArrowSmallLeft, HiArrowSmallRight } from 'react-icons/hi2';

import mainConfig from '@/configs/mainConfigs';
import { useHighlights } from '@/hooks/useApiHooks';

const FeaturedCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [allHighlights, setAllHighlights] = useState<any[]>([]);
  const [hasMorePages, setHasMorePages] = useState(true);

  const { data: highlights, isLoading } = useHighlights({
    page: currentPage,
    page_size: 4,
  });

  // Accumulate highlights when new data loads
  useEffect(() => {
    if (highlights?.results && highlights.results.length > 0) {
      setAllHighlights((prev) => {
        // Avoid duplicates by checking if we already have these items
        const existingIds = new Set(prev.map((item) => item.id));
        const newItems = highlights.results.filter(
          (item: any) => !existingIds.has(item.id),
        );
        return [...prev, ...newItems];
      });

      // Check if there are more pages
      setHasMorePages(!!highlights.next);
    }
  }, [highlights]);

  // Reset when highlights change significantly
  useEffect(() => {
    if (!isLoading && allHighlights.length === 0 && highlights?.results) {
      setAllHighlights(highlights.results);
      setHasMorePages(!!highlights.next);
    }
  }, [highlights, isLoading, allHighlights.length]);

  const nextSlide = () => {
    if (isLoading) return;

    if (currentIndex < allHighlights.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (hasMorePages) {
      // Load next page
      setCurrentPage((prev) => prev + 1);
    } else {
      // Loop back to start when no more pages
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (isLoading) return;

    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(allHighlights.length > 0 ? allHighlights.length - 1 : 0);
    }
  };

  const formatItemTags = (item: any) =>
    item.tag_names?.join(', ') ||
    (item.tags || []).map((t: any) => t.name).join(', ');

  if (isLoading) {
    return (
      <section className="w-full min-h-[40rem] bg-[#F0F4FA] py-16 md:min-h-[34rem] md:py-24 overflow-hidden">
        <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
          <div className="animate-pulse">
            <div className="flex flex-col gap-8 md:flex-row md:gap-16">
              <div className="md:w-1/2">
                <div className="aspect-[4/3] rounded-2xl bg-gray-300" />
              </div>
              <div className="md:w-1/2 space-y-4 md:flex md:flex-col md:justify-center">
                <div className="h-8 w-40 rounded-full bg-white" />
                <div className="h-12 rounded-lg bg-gray-300" />
                <div className="h-12 rounded-lg bg-gray-300" />
                <div className="h-6 rounded-lg bg-gray-300" />
                <div className="h-6 w-5/6 rounded-lg bg-gray-300" />
                <div className="h-8 w-1/3 rounded-lg bg-gray-300" />
              </div>
            </div>
            <div className="mt-8 h-10 w-40 rounded-full bg-gray-300" />
          </div>
        </div>
      </section>
    );
  }

  if (!allHighlights || allHighlights.length === 0) return null;

  return (
    <section className="w-full min-h-[40rem] bg-[#F0F4FA] py-16 md:min-h-[34rem] md:py-24 overflow-hidden">
      <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
        <div className="relative">
          <div className="mb-4" />

          {/* Carousel Track */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {allHighlights.map((item: any) => (
              <div
                key={item.id}
                className="w-full flex-shrink-0 flex flex-col md:flex-row gap-8 md:gap-16"
              >
                <div className="md:w-1/2">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <Image
                      src={item.image_url || '/placeholder.svg'}
                      alt={item.title}
                      fill
                      className="object-cover w-full h-full transition-transform duration-500 ease-in-out transform hover:scale-110 cursor-pointer"
                      priority
                    />
                  </div>
                </div>

                <div className="md:w-1/2 flex flex-col justify-center">
                  <div className="flex gap-3 mb-4">
                    <span className="text-blue-600 bg-white rounded-full px-2 py-1 text-sm font-medium">
                      {formatItemTags(item)}
                    </span>
                  </div>

                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                    {item.title}
                  </h2>

                  <Link
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 font-medium flex items-center group"
                  >
                    <span className="mr-2">
                      {item.link_title || 'Learn More'}
                    </span>
                    <HiArrowSmallRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Controls */}
          <div className="mt-8 flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>
              <span className="text-gray-400">
                / {String(allHighlights.length).padStart(2, '0')}
                {hasMorePages && (
                  <span className="text-xs text-gray-500 ml-1">+</span>
                )}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full border border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-colors"
                aria-label="Previous slide"
                disabled={isLoading}
              >
                <HiArrowSmallLeft className="w-5 h-5" />
              </button>

              <button
                onClick={nextSlide}
                className="p-2 rounded-full border border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-colors"
                aria-label="Next slide"
                disabled={isLoading}
              >
                <HiArrowSmallRight className="w-5 h-5" />
                {isLoading && currentIndex === allHighlights.length - 1 && (
                  <span className="ml-1 text-xs">Loading...</span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
