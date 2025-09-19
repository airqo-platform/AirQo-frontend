'use client';
import { format } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FiCalendar } from 'react-icons/fi';

import { CustomButton, NoData } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { EventV2 } from '@/services/types/api';

const EventCardsSection: React.FC<{
  selectedTab: string;
  events: EventV2[];
  error?: any;
}> = ({ selectedTab, events }) => {
  const router = useRouter();

  // Function to truncate text
  const truncateText = (text: string | undefined | null, maxLength: number) => {
    const t = text || '';
    return t.length > maxLength ? `${t.substring(0, maxLength)}...` : t;
  };

  const formatDate = (date?: string | null) => {
    if (!date) return 'Date to be announced';
    try {
      return format(new Date(date), 'MMMM d, yyyy');
    } catch {
      return date;
    }
  };

  // Determine the events based on the selected tab - now we just use the events passed in
  const eventsToShow = events || [];
  const noEventsMessage =
    selectedTab === 'upcoming' ? (
      <NoData message="No Upcoming Events" />
    ) : (
      <NoData message="No Past Events" />
    );

  return (
    <section
      className={`${mainConfig.containerClass} w-full mb-8 px-4 lg:px-0`}
    >
      {/* If there are no events to display */}
      {eventsToShow.length === 0 ? (
        noEventsMessage
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {eventsToShow.map((event: EventV2) => {
            const status = ((event as any).event_status || '').toLowerCase();
            const isVirtual = !!(event as any).is_virtual;
            const location = (event as any).location_name || '';
            const imageSrc =
              event.event_image_url || '/assets/images/placeholder.webp';

            const descriptionText =
              event.title_subtext || event.description || '';
            const displayDate = event.end_date || event.start_date;

            return (
              <div
                key={event.public_identifier || event.id}
                className="flex flex-col rounded-lg transition-shadow bg-white overflow-hidden max-w-[350px] mx-auto"
                style={{ maxHeight: '450px' }}
              >
                {/* Event Image */}
                <div className="relative w-full rounded-t-lg h-[200px] mb-4 flex justify-center items-center overflow-hidden bg-gray-100">
                  <Image
                    src={imageSrc}
                    alt={event.title || 'Event image'}
                    layout="fill"
                    objectFit="cover"
                    objectPosition="center"
                    className="rounded-t-lg transition-transform duration-500 ease-in-out transform hover:scale-110 cursor-pointer"
                  />

                  {/* Status badge */}
                  {status && (
                    <span
                      className={`absolute top-3 left-3 text-xs font-semibold px-2 py-1 rounded ${
                        status === 'past'
                          ? 'bg-gray-200 text-gray-800'
                          : 'bg-blue-600 text-white'
                      }`}
                    >
                      {status}
                    </span>
                  )}
                </div>

                {/* Event Content */}
                <div className="flex flex-col space-y-3 p-4">
                  {/* Event Title */}
                  <h2 className="text-xl font-semibold">
                    {truncateText(event.title, 50)}
                  </h2>

                  {/* Event Description */}
                  <p className="text-gray-600">
                    {truncateText(descriptionText, 100)}
                  </p>

                  {/* Event Date and Location */}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center space-x-2 text-gray-500">
                      <FiCalendar className="w-5 h-5" />
                      <span>{formatDate(displayDate)}</span>
                    </div>

                    <div className="text-sm text-gray-500">
                      {isVirtual ? 'Online' : location || 'Location TBA'}
                    </div>
                  </div>

                  {/* Read More Button */}
                  <CustomButton
                    onClick={() =>
                      router.push(
                        `/events/${event.public_identifier || event.id}`,
                      )
                    }
                    className="text-blue-600 text-left p-0 bg-transparent mt-4"
                  >
                    Read more →
                  </CustomButton>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default EventCardsSection;
