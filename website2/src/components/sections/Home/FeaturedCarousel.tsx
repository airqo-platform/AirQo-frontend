import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { HiArrowSmallLeft, HiArrowSmallRight } from 'react-icons/hi2';

import { getHighlights } from '@/services/apiService';

const FeaturedCarousel = () => {
  const [highlights, setHighlights] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHighlights = async () => {
      try {
        const data = await getHighlights();
        if (data.length > 0) {
          setHighlights(data);
        } else {
          setError('No highlights available.');
        }
      } catch (err) {
        setError('Failed to load highlights.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHighlights();
  }, []);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % highlights.length);
  };

  const prevSlide = () => {
    setCurrentIndex(
      (prev) => (prev - 1 + highlights.length) % highlights.length,
    );
  };

  // Display the skeleton loader while loading
  if (loading) {
    return (
      <section className="w-full bg-[#F0F4FA] py-16 md:py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-4 animate-pulse">
            <div className="w-1/2 h-64 bg-gray-300 rounded-lg"></div>
            <div className="w-1/2 space-y-4">
              <div className="h-12 bg-gray-300 rounded-lg"></div>
              <div className="h-6 bg-gray-300 rounded-lg"></div>
              <div className="h-6 bg-gray-300 rounded-lg"></div>
              <div className="w-1/3 h-8 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no highlights, do not display the section
  if (highlights.length === 0 && !loading) {
    return null;
  }

  // Display error message if something goes wrong
  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <section className="w-full bg-[#F0F4FA] py-16 md:py-24 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative">
          {/* Carousel Track */}
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {highlights.map((item) => (
              <div
                key={item.id}
                className="w-full flex-shrink-0 flex flex-col md:flex-row gap-8 md:gap-16"
              >
                {/* Image Container */}
                <div className="md:w-1/2">
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                    <Image
                      src={item.image_url}
                      alt={item.title}
                      fill
                      // include a scaling as user hovers over the image
                      className="object-cover w-full h-full transition-transform duration-500 ease-in-out transform hover:scale-110 cursor-pointer"
                      priority
                    />
                  </div>
                </div>

                {/* Content Container */}
                <div className="md:w-1/2 flex flex-col justify-center">
                  <div className="flex gap-3 mb-4">
                    <span className="text-blue-600 bg-white rounded-full px-2 py-1 text-sm font-medium">
                      {item.tags.map((tag: any) => tag.name).join(', ')}
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
