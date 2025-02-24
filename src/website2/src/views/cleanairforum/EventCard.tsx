'use client';

import { format } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React from 'react';

import { CustomButton } from '@/components/ui';

const EventCard = ({ event, key }: any) => {
  const router = useRouter();

  return (
    <div
      key={key}
      className="flex flex-col lg:flex-row bg-white rounded-xl p-4 shadow-md"
    >
      <div className="w-full flex justify-center items-center lg:w-1/4">
        <Image
          src={event.event_image_url}
          alt={event.title}
          width={231}
          height={204}
          loading="eager"
          className="rounded-lg object-cover"
        />
      </div>
      <div className="ml-0 flex flex-col justify-center gap-2 lg:ml-4 w-full lg:w-3/4 mt-4 lg:mt-0">
        <h3 className="text-xl lg:text-[32px] font-semibold">{event.title}</h3>
        {event.title_subtext && (
          <p className="text-gray-600 lg:text-[20px]">{event.title_subtext}</p>
        )}
        <p className="mt-2 text-lg font-semibold">
          {format(new Date(event.start_date), 'dd MMMM, yyyy')}
          {event.end_date && (
            <> - {format(new Date(event.end_date), 'dd MMMM, yyyy')}</>
          )}
        </p>

        {event.description && (
          <p className="mt-2 text-gray-700">
            {event.description.length > 100
              ? `${event.description.substring(0, 100)}...`
              : event.description}
          </p>
        )}

        <div>
          <CustomButton
            onClick={() => router.push(`/clean-air-network/events/${event.id}`)}
            className="text-blue-700 p-0 m-0 bg-transparent border-none"
          >
            Read more
          </CustomButton>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
