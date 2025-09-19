'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FiCalendar, FiClock, FiMapPin } from 'react-icons/fi';

import { CustomButton } from '@/components/ui';
import ForumListSkeleton from '@/components/ui/ForumListSkeleton';
import { useInfiniteForumEvents } from '@/services/hooks/endpoints';
import { ForumEvent } from '@/services/types/api';

const ForumEventsPage: React.FC<{ skipHero?: boolean }> = ({ skipHero }) => {
  const router = useRouter();

  const {
    results: forumEvents,
    isLoadingInitialData,
    isLoadingMore,
    error,
    isReachingEnd,
    size,
    setSize,
  } = useInfiniteForumEvents({ page_size: 12 });

  const handleEventClick = (event: ForumEvent) => {
    router.push(`/clean-air-forum/${event.unique_title}`);
  };

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (startDate === endDate) {
      return format(start, 'MMMM d, yyyy');
    }

    return `${format(start, 'MMMM d')} - ${format(end, 'd, yyyy')}`;
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'upcoming':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'ongoing':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'past':
        return `${baseClasses} bg-gray-100 text-gray-600`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-600`;
    }
  };

  if (isLoadingInitialData) {
    return <ForumListSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Unable to Load Forum Events
          </h2>
          <p className="text-gray-600 mb-6">
            We encountered an issue while fetching the forum events. Please try
            again.
          </p>
          <CustomButton
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2"
          >
            Try Again
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Optional Hero Section is rendered by page wrapper when needed */}
      {!skipHero && (
        <section className="bg-[#F2F1F6] px-4 lg:px-0 py-16">
          <div className="max-w-5xl mx-auto">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                Forum Events
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto">
                Explore our collection of Clean Air Forum events bringing
                together communities of practice to foster knowledge sharing and
                cross-border partnerships across Africa
              </p>
            </div>
          </div>
        </section>
      )}
      {/* Events Section */}
      <section className="py-16 bg-white">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          {forumEvents.length === 0 ? (
            <div className="text-center py-20">
              <FiCalendar className="w-16 h-16 text-gray-300 mx-auto mb-6" />
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                No Events Available
              </h3>
              <p className="text-gray-600 max-w-md mx-auto">
                We&apos;re currently preparing exciting forum events. Check back
                soon for updates.
              </p>
            </div>
          ) : (
            <>
              {/* Events Grid - 2 columns as requested */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {forumEvents.map((event) => (
                  <div
                    key={event.unique_title}
                    className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer group h-[400px] flex flex-col"
                    onClick={() => handleEventClick(event)}
                  >
                    {/* Event Image - Fixed height for consistency */}
                    <div className="relative h-48 overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          event.background_image_url ||
                          '/assets/images/placeholder.webp'
                        }
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                      <div className="absolute top-3 left-3">
                        <span className={getStatusBadge(event.event_status)}>
                          {event.event_status.charAt(0).toUpperCase() +
                            event.event_status.slice(1)}
                        </span>
                      </div>
                    </div>

                    {/* Event Content - Flexible height */}
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-gray-700 transition-colors duration-300">
                        {event.title}
                      </h3>

                      {event.title_subtext && (
                        <p className="text-gray-600 mb-4 text-sm line-clamp-2 flex-1">
                          {event.title_subtext.length > 120
                            ? `${event.title_subtext.substring(0, 120)}...`
                            : event.title_subtext}
                        </p>
                      )}

                      {/* Event Details - Fixed positioning at bottom */}
                      <div className="space-y-2 mt-auto">
                        <div className="flex items-center text-gray-500 text-sm">
                          <FiCalendar className="w-4 h-4 mr-2 text-gray-600" />
                          <span>
                            {formatDateRange(event.start_date, event.end_date)}
                          </span>
                        </div>

                        {event.start_time && event.end_time && (
                          <div className="flex items-center text-gray-500 text-sm">
                            <FiClock className="w-4 h-4 mr-2 text-gray-600" />
                            <span>
                              {format(
                                new Date(`2000-01-01T${event.start_time}`),
                                'HH:mm',
                              )}{' '}
                              -{' '}
                              {format(
                                new Date(`2000-01-01T${event.end_time}`),
                                'HH:mm',
                              )}
                            </span>
                          </div>
                        )}

                        {event.location_name && (
                          <div className="flex items-center text-gray-500 text-sm">
                            <FiMapPin className="w-4 h-4 mr-2 text-gray-600" />
                            <span className="line-clamp-1">
                              {event.location_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Load More Button */}
              {!isReachingEnd && (
                <div className="text-center mt-12">
                  <CustomButton
                    onClick={() => setSize(size + 1)}
                    disabled={isLoadingMore}
                    className="px-8 py-3 bg-gray-800 text-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-md font-medium transition-colors duration-300"
                  >
                    {isLoadingMore ? (
                      <div className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Loading...
                      </div>
                    ) : (
                      'Load More Events'
                    )}
                  </CustomButton>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};
export default ForumEventsPage;
