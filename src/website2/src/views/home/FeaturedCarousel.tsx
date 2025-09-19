'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiArrowSmallLeft, HiArrowSmallRight } from 'react-icons/hi2';

import mainConfig from '@/configs/mainConfigs';
import { useHighlights } from '@/services/hooks/endpoints';

const FeaturedCarousel = () => {
  const [page, setPage] = useState(1);
  const pageSize = 6; // fixed page size for highlights
  const [currentIndex, setCurrentIndex] = useState(0);
  // when we change pages via the arrows we may want to land on a specific index
  // e.g. when going to previous page land on the last item of the loaded page.
  const [pendingIndex, setPendingIndex] = useState<number | null>(null);

  const { data: highlightsResponse, isLoading } = useHighlights({
    page,
    page_size: pageSize,
  });

  const highlights = highlightsResponse?.results || [];
  const totalPages = highlightsResponse?.total_pages ?? 1;

  useEffect(() => {
    // When highlights for a new page arrive, if there's a pending index requested
    // (for example -1 meaning "last item") apply it. Otherwise default to 0.
    if (pendingIndex !== null) {
      if (pendingIndex === -1) {
        setCurrentIndex(highlights.length > 0 ? highlights.length - 1 : 0);
      } else {
        setCurrentIndex(
          Math.min(
            Math.max(0, pendingIndex),
            Math.max(0, highlights.length - 1),
          ),
        );
      }
      setPendingIndex(null);
      return;
    }

    setCurrentIndex(0);
  }, [page, highlightsResponse?.current_page, highlights.length, pendingIndex]);

  const nextSlide = () => {
    if (isLoading) return;
    // advance within current page
    if (currentIndex < highlights.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    // we're at the end of the items on this page
    if (page < totalPages) {
      // load next page; when it arrives default effect will set currentIndex to 0
      setPage((p) => p + 1);
    } else {
      // wrap to first item on same page
      setCurrentIndex(0);
    }
  };

  const prevSlide = () => {
    if (isLoading) return;
    // move back within current page
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      return;
    }

    // at first item of current page
    if (page > 1) {
      // request previous page and then land on its last item (-1 sentinel)
      setPendingIndex(-1);
      setPage((p) => p - 1);
    } else {
      // already on first page and first item -> wrap to last item of current page
      setCurrentIndex(highlights.length > 0 ? highlights.length - 1 : 0);
    }
  };

  const formatItemTags = (item: any) =>
    item.tag_names?.join(', ') ||
    (item.tags || []).map((t: any) => t.name).join(', ');

  if (isLoading) {
    return (
      <section className="w-full bg-[#F0F4FA] py-16 md:py-24 overflow-hidden">
        <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
          <div className="flex space-x-4 animate-pulse">
            <div className="w-1/2 h-64 bg-gray-300 rounded-lg" />
            <div className="w-1/2 space-y-4">
              <div className="h-12 bg-gray-300 rounded-lg" />
              <div className="h-6 bg-gray-300 rounded-lg" />
              <div className="h-6 bg-gray-300 rounded-lg" />
              <div className="w-1/3 h-8 bg-gray-300 rounded-lg" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (!highlights || highlights.length === 0) return null;

  return (
    <section className="w-full bg-[#F0F4FA] py-16 md:py-24 overflow-hidden">
      <div className={`${mainConfig.containerClass} px-4 sm:px-6 lg:px-8`}>
        <div className="relative">
          <div className="mb-4" />

          {/* Carousel Track */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {highlights.map((item: any) => (
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
                / {String(highlights.length).padStart(2, '0')}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={prevSlide}
                className="p-2 rounded-full border border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-colors"
                aria-label="Previous slide"
              >
                <HiArrowSmallLeft className="w-5 h-5" />
              </button>

              <button
                onClick={nextSlide}
                className="p-2 rounded-full border border-gray-200 hover:border-blue-600 hover:text-blue-600 transition-colors"
                aria-label="Next slide"
              >
                <HiArrowSmallRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCarousel;
