import { format } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

import { CustomButton } from '@/components/ui';

import TabNavigation from './TabNavigation';

const BannerSection = ({ data }: { data: any }) => {
  if (!data) {
    return null;
  }

  return (
    <div className="w-full pt-10 bg-white relative">
      <div className="max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center px-4 lg:px-0 justify-between gap-6">
        {/* Text Section */}
        <div className="md:w-[40%] prose max-w-none h-full">
          <h1 className="text-3xl md:text-5xl mb-4 font-bold text-gray-900">
            {data.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-700">
            {data.title_subtext}
          </p>

          {/* Conditionally render the Link if registration_link exists */}
          {data.registration_link && (
            <Link href={data.registration_link}>
              <CustomButton className="text-white ">Register here</CustomButton>
            </Link>
          )}
        </div>

        {/* Image Section */}
        <div className="flex justify-center items-center md:w-1/2 h-[350px] w-full">
          <Image
            src={data.background_image_url}
            alt="Forum Image"
            width={600}
            height={350}
            className="rounded-lg object-cover w-full h-full max-w-[500px] transition-transform duration-500 ease-in-out transform lg:hover:scale-110 cursor-pointer"
          />
        </div>
      </div>

      {/* Navigation Links */}
      <TabNavigation />

      {/* Data Date, Time, and Location */}
      <div className="max-w-5xl mx-auto space-y-4 pb-4">
        <div className="flex flex-wrap items-center space-x-4 text-gray-700 text-sm">
          <div className="flex items-center space-x-2">
            <FaCalendarAlt />
            <span>
              {`${format(new Date(data.start_date), 'do MMMM, yyyy')} - ${format(
                new Date(data.end_date),
                'do MMMM, yyyy',
              )}`}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaClock />
            <span>
              {`${format(new Date(`1970-01-01T${data.start_time}`), 'HH:mm')} - ${format(
                new Date(`1970-01-01T${data.end_time}`),
                'HH:mm',
              )}`}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <FaMapMarkerAlt />
            <span>{data.location_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BannerSection;
