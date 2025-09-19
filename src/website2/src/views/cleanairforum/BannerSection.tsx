import { format, isValid } from 'date-fns';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { FaCalendarAlt, FaClock, FaMapMarkerAlt } from 'react-icons/fa';

import { CustomButton } from '@/components/ui';

import TabNavigation from './TabNavigation';

// Helper: safely format a date range (start - end). Returns a string or 'TBD'.
const formatDateRange = (start?: any, end?: any) => {
  try {
    const toDate = (v: any) => {
      if (!v) return null;
      // If it's already a Date
      if (v instanceof Date) return isValid(v) ? v : null;
      // Try constructing a Date from the value (handles ISO, Date strings, timestamps)
      const d = new Date(v);
      return isValid(d) ? d : null;
    };

    const s = toDate(start);
    const e = toDate(end);

    if (s && e) {
      return `${format(s, 'do MMMM, yyyy')} - ${format(e, 'do MMMM, yyyy')}`;
    }

    if (s) return format(s, 'do MMMM, yyyy');
    if (e) return format(e, 'do MMMM, yyyy');
  } catch {
    // Fall through to TBD
  }
  return 'TBD';
};

// Helper: safely format a time range (HH:mm - HH:mm) using a base date. Returns a string or 'TBD'.
const formatTimeRange = (startTime?: any, endTime?: any) => {
  try {
    if (!startTime && !endTime) return 'TBD';

    const parseTime = (t: any) => {
      if (!t) return null;
      // Try several common time formats by constructing a Date against epoch
      const asString = String(t).trim();
      // If the time already includes a date component, try directly
      let candidate = new Date(asString);
      if (!isValid(candidate)) {
        candidate = new Date(`1970-01-01T${asString}`);
      }
      return isValid(candidate) ? candidate : null;
    };

    const s = parseTime(startTime);
    const e = parseTime(endTime);

    if (s && e) return `${format(s, 'HH:mm')} - ${format(e, 'HH:mm')}`;
    if (s) return format(s, 'HH:mm');
    if (e) return format(e, 'HH:mm');
  } catch {
    // Fall through
  }
  return 'TBD';
};

const BannerSection = ({ data }: { data: any }) => {
  const router = useRouter();
  if (!data) {
    return null;
  }

  return (
    <div className="w-full pt-10 relative">
      <div className="max-w-5xl mx-auto flex flex-col-reverse md:flex-row items-center px-4 lg:px-0 justify-between gap-6">
        {/* Text Section */}
        <div className="md:w-[40%] prose max-w-none h-full">
          {/* Back button for detail pages */}
          <div className="flex w-full justify-start mb-4">
            <button
              onClick={() => router.push('/clean-air-forum')}
              className="inline-flex items-center px-3 py-2 bg-white rounded-md shadow-sm text-sm text-gray-700 hover:bg-gray-50"
            >
              ← Back
            </button>
          </div>
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
      <div className="max-w-5xl mx-auto px-4 lg:px-0">
        <TabNavigation />
      </div>

      {/* Data Date, Time, and Location */}
      <div className="max-w-5xl mx-auto space-y-4 pb-4 px-4 lg:px-0">
        <div className="flex flex-wrap items-center space-x-4 text-gray-700 text-sm">
          <div className="flex items-center space-x-2">
            <FaCalendarAlt />
            <span>{formatDateRange(data.start_date, data.end_date)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <FaClock />
            <span>{formatTimeRange(data.start_time, data.end_time)}</span>
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
