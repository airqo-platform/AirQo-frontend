'use client';
import { format, isSameMonth } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { FiCalendar } from 'react-icons/fi';

import { CustomButton, Pagination } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useAirQoEvents } from '@/hooks/useApiHooks';
import { EventV2 } from '@/services/types/api';
import EventCardsSection from '@/views/events/EventCardsSection';

const EventPage: React.FC = () => {
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState('upcoming');
  const [upcomingPage, setUpcomingPage] = useState(1);
  const [pastPage, setPastPage] = useState(1);

  // Get events based on selected tab with pagination
  const {
    data: eventsData,
    isLoading: isLoadingEvents,
    error: eventsError,
  } = useAirQoEvents({
    page: selectedTab === 'upcoming' ? upcomingPage : pastPage,
    page_size: 6,
    event_status: selectedTab,
  });

  // Extract events array from paginated response
  const currentEvents = Array.isArray(eventsData?.results)
    ? eventsData.results
    : [];

  // Featured events are selected from upcoming events (look for featured tag or just use first upcoming event)
  const featuredEvents = currentEvents.filter(
    (event: EventV2) =>
      selectedTab === 'upcoming' &&
      ((event.event_tag || '').toLowerCase() === 'featured' ||
        (event.tags || []).some(
          (tag: string) => tag.toLowerCase() === 'featured',
        )),
  );

  // If no featured events, use the first upcoming event as featured
  const firstFeaturedEvent =
    selectedTab === 'upcoming' && featuredEvents.length > 0
      ? featuredEvents[0]
      : selectedTab === 'upcoming' && currentEvents.length > 0
        ? currentEvents[0]
        : null;

  // Function to format the date range based on whether the months are the same
  const formatDateRange = (startDate?: string, endDate?: string) => {
    if (!startDate && !endDate) return 'Date to be announced';
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    if (start && end) {
      if (isSameMonth(start, end)) {
        return `${format(start, 'do')} - ${format(end, 'do MMMM yyyy')}`;
      }
      return `${format(start, 'MMMM do, yyyy')} - ${format(end, 'MMMM do, yyyy')}`;
    }
    if (start && !end) return format(start, 'MMMM do, yyyy');
    if (!start && end) return format(end, 'MMMM do, yyyy');
    return 'Date to be announced';
  };

  const handleTabClick = (tab: string) => {
    setSelectedTab(tab);
    // Reset page when switching tabs
    if (tab === 'upcoming') {
      setUpcomingPage(1);
    } else {
      setPastPage(1);
    }
  };

  // const handleLoadMore = () => {
  //   setSize(size + 1);
  // };

  // Determine loading and error states
  const isHeaderLoading = selectedTab === 'upcoming' && isLoadingEvents;
  const hasHeaderError = selectedTab === 'upcoming' && eventsError;

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header Section */}
      {isHeaderLoading ? (
        <div className="mb-12 bg-[#F2F1F6] py-4 lg:py-16">
          <div
            className={`${mainConfig.containerClass} w-full px-4 lg:px-0 flex flex-col-reverse lg:flex-row lg:space-x-12 items-center`}
          >
            <div className="flex-1 mb-8 lg:mb-0">
              <div className="h-6 bg-gray-300 w-1/2 rounded mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-300 w-3/4 rounded mb-6 animate-pulse"></div>
              <div className="flex flex-wrap gap-4 lg:items-center mb-6">
                <div className="h-4 bg-gray-300 w-32 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-300 w-20 rounded animate-pulse"></div>
              </div>
              <div className="bg-blue-100 px-6 py-4 text-blue-700 rounded-lg w-32 h-10 animate-pulse"></div>
            </div>
            <div className="flex-1 w-full mb-6 lg:mb-0">
              <div className="w-full h-60 bg-gray-300 rounded-lg shadow-md animate-pulse"></div>
            </div>
          </div>
        </div>
      ) : hasHeaderError ? (
        <div className="mb-12 bg-[#F2F1F6] py-4 lg:py-16">
          <div
            className={`${mainConfig.containerClass} w-full px-4 lg:px-0 text-center`}
          >
            <h1 className="text-4xl font-bold mb-4">Error Loading Events</h1>
            <p className="text-lg text-gray-600">
              We couldn&apos;t fetch the events at this time. Please try again
              later.
            </p>
          </div>
        </div>
      ) : (
        firstFeaturedEvent && (
          <section className="mb-12 bg-[#F2F1F6] py-4 lg:py-16">
            <div
              className={`${mainConfig.containerClass} w-full px-4 lg:px-0 flex flex-col-reverse lg:flex-row lg:space-x-12 items-center`}
            >
              <div className="flex-1 mb-8 lg:mb-0">
                <h1 className="text-4xl font-bold mb-4">
                  {firstFeaturedEvent?.title}
                </h1>
                {/* {firstFeaturedEvent?.title_subtext && (
                  <p className="text-lg text-gray-600 mb-6">
                    {firstFeaturedEvent.title_subtext}
                  </p>
                )} */}
                <div className="flex flex-col flex-wrap gap-4 mb-6">
                  <div className="flex items-center space-x-2">
                    <FiCalendar className="text-gray-500 w-5 h-5" />
                    <p className="text-gray-600">
                      {formatDateRange(
                        firstFeaturedEvent?.start_date,
                        firstFeaturedEvent?.end_date,
                      )}
                    </p>
                  </div>
                  {/* {firstFeaturedEvent?.start_time &&
                    firstFeaturedEvent?.end_time && (
                      <div className="flex items-center space-x-2">
                        <FiClock className="text-gray-500 w-5 h-5" />
                        <p className="text-gray-600">
                          {`${format(
                            parse(
                              firstFeaturedEvent.start_time,
                              'HH:mm:ss',
                              new Date(),
                            ),
                            'HH:mm',
                          )} - ${format(
                            parse(
                              firstFeaturedEvent.end_time,
                              'HH:mm:ss',
                              new Date(),
                            ),
                            'HH:mm',
                          )}`}
                        </p>
                      </div>
                    )} */}
                </div>
                <CustomButton
                  onClick={() =>
                    router.push(
                      `/events/${
                        (firstFeaturedEvent as any)?.public_identifier ||
                        firstFeaturedEvent?.id
                      }`,
                    )
                  }
                  className="bg-blue-100 text-blue-700 px-6 py-4"
                >
                  Read more
                </CustomButton>
              </div>
              <div className="flex justify-center items-center flex-1 w-full mb-6 lg:mb-0">
                {(firstFeaturedEvent as any)?.event_image_url && (
                  <Image
                    src={(firstFeaturedEvent as any).event_image_url}
                    alt={firstFeaturedEvent.title || ''}
                    width={800}
                    height={600}
                    sizes="(min-width: 1024px) 500px, (min-width: 768px) 70vw, 100vw"
                    priority
                    className="rounded-lg shadow-md w-full max-h-[400px] max-w-[500px] object-cover h-auto transition-transform duration-500 ease-in-out transform lg:hover:scale-110 cursor-pointer"
                    style={{ objectFit: 'cover' }}
                  />
                )}
              </div>
            </div>
          </section>
        )
      )}

      {/* Tabs Section */}
      <section
        className={`${mainConfig.containerClass} w-full px-4 lg:px-0 mb-8`}
      >
        <div className="flex space-x-8 border-b border-gray-300">
          <button
            onClick={() => handleTabClick('upcoming')}
            className={`pb-2 text-lg ${
              selectedTab === 'upcoming'
                ? 'text-black border-b-2 border-black font-semibold'
                : 'text-gray-500'
            } transition-colors duration-300`}
          >
            Upcoming Events
          </button>
          <button
            onClick={() => handleTabClick('past')}
            className={`pb-2 text-lg ${
              selectedTab === 'past'
                ? 'text-black border-b-2 border-black font-semibold'
                : 'text-gray-500'
            } transition-colors duration-300`}
          >
            Past Events
          </button>
        </div>
      </section>

      {/* Event Cards Section */}
      {isLoadingEvents ? (
        <div
          className={`${mainConfig.containerClass} w-full px-4 lg:px-0 mb-8`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, idx) => (
              <div
                key={idx}
                className="bg-gray-300 rounded-lg shadow-md animate-pulse h-80"
              >
                <div className="h-44 bg-gray-400 rounded-t-lg"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-400 rounded mb-2"></div>
                  <div className="h-3 bg-gray-400 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <EventCardsSection
          selectedTab={selectedTab}
          events={currentEvents as EventV2[]}
          error={eventsError}
        />
      )}

      {/* Pagination controls */}
      <div
        className={`${mainConfig.containerClass} w-full px-4 lg:px-0 mb-8 mt-6`}
      >
        {eventsData && eventsData.total_pages > 1 && (
          <Pagination
            totalPages={eventsData.total_pages}
            currentPage={selectedTab === 'upcoming' ? upcomingPage : pastPage}
            onPageChange={
              selectedTab === 'upcoming' ? setUpcomingPage : setPastPage
            }
            scrollToTop={true}
          />
        )}
      </div>
    </div>
  );
};

export default EventPage;
