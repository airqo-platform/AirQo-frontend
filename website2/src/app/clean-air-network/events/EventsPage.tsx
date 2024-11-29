'use client';

import { format, isAfter, isBefore } from 'date-fns';
import Image from 'next/image';
import React, { useEffect, useMemo, useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import EventCard from '@/components/sections/CleanAir/EventCard';
import EventSkeleton from '@/components/sections/CleanAir/EventSkeleton';
import RegisterBanner from '@/components/sections/CleanAir/RegisterBanner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Pagination,
} from '@/components/ui';
import { getCleanAirEvents } from '@/services/apiService';

const months = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

const categories = [
  {
    name: 'All Categories',
    value: '',
  },
  {
    name: 'Webinar',
    value: 'webinar',
  },
  {
    name: 'Workshop',
    value: 'workshop',
  },
  {
    name: 'Marathon',
    value: 'marathon',
  },
  {
    name: 'Conference',
    value: 'conference',
  },
  {
    name: 'Summit',
    value: 'summit',
  },
  {
    name: 'Commemoration',
    value: 'commemoration',
  },
  {
    name: 'In-Person',
    value: 'in-person',
  },
  {
    name: 'Hybrid',
    value: 'hybrid',
  },
];

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showUpcoming, setShowUpcoming] = useState(true);
  const [showPast, setShowPast] = useState(true);
  const [currentUpcomingPage, setCurrentUpcomingPage] = useState(1);
  const [currentPastPage, setCurrentPastPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const itemsPerPage = 4;
  console.log(error);

  const currentDate = useMemo(() => new Date(), []);

  // Fetch events on component mount
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await getCleanAirEvents();
        setEvents(fetchedEvents);
        setFilteredEvents(fetchedEvents);
      } catch (err) {
        setError('Failed to load events. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // Handle month selection
  const handleMonthChange = (month: string) => {
    setSelectedMonth(month);
  };

  // Handle category selection
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  // Apply filters whenever selectedMonth or selectedCategory changes
  useEffect(() => {
    let tempEvents = [...events];

    // Filter by month
    if (selectedMonth) {
      tempEvents = tempEvents.filter((event) => {
        const eventDate = new Date(event.start_date);
        return format(eventDate, 'MMMM') === selectedMonth;
      });
    }

    // Filter by category
    if (selectedCategory) {
      tempEvents = tempEvents.filter(
        (event) => event.event_category === selectedCategory,
      );
    }

    setFilteredEvents(tempEvents);
    setCurrentUpcomingPage(1);
    setCurrentPastPage(1);
  }, [selectedMonth, selectedCategory, events]);

  // Split events into upcoming and past based on date comparison
  const upcomingEvents = useMemo(
    () =>
      filteredEvents.filter((event) =>
        event.start_date
          ? isAfter(new Date(event.start_date), currentDate)
          : false,
      ),
    [filteredEvents, currentDate],
  );

  const pastEvents = useMemo(
    () =>
      filteredEvents.filter((event) =>
        event.start_date
          ? isBefore(new Date(event.start_date), currentDate)
          : false,
      ),
    [filteredEvents, currentDate],
  );

  // Pagination logic
  const totalUpcomingPages = Math.ceil(upcomingEvents.length / itemsPerPage);
  const totalPastPages = Math.ceil(pastEvents.length / itemsPerPage);

  const paginatedUpcomingEvents = useMemo(
    () =>
      upcomingEvents.slice(
        (currentUpcomingPage - 1) * itemsPerPage,
        currentUpcomingPage * itemsPerPage,
      ),
    [upcomingEvents, currentUpcomingPage, itemsPerPage],
  );

  const paginatedPastEvents = useMemo(
    () =>
      pastEvents.slice(
        (currentPastPage - 1) * itemsPerPage,
        currentPastPage * itemsPerPage,
      ),
    [pastEvents, currentPastPage, itemsPerPage],
  );

  return (
    <div className="py-8 space-y-16">
      {/* Main banner section */}
      <section className="max-w-5xl mx-auto w-full">
        <div className="py-8 px-4 lg:px-0 flex flex-col items-center space-y-6 md:space-y-8">
          {/* Image */}
          <div className="w-full">
            <Image
              src="https://res.cloudinary.com/dbibjvyhm/image/upload/v1728132391/website/cleanAirForum/images/events_gfnscv.webp"
              alt="Air Quality Management Banner"
              width={800}
              height={400}
              className="rounded-lg object-cover w-full"
            />
          </div>

          {/* Text */}
          <div className="text-left">
            <p className="text-xl lg:text-[24px] text-gray-700 mb-4">
              The CLEAN-Air Network provides a platform for facilitating
              engagement activities including conferences, webinars, workshops,
              training, and community campaigns.
            </p>
            <p className="text-xl lg:text-[24px] text-gray-700">
              Partners will have access to shared resources in the form of
              social media toolkits, press release templates, digital banners,
              etc. that can be customized to suit every activity.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-blue-50 py-16">
        <div className="max-w-5xl mx-auto w-full px-4 lg:px-0 flex flex-col gap-8">
          {/* Filter Section */}
          <div className="flex justify-end py-8 items-center">
            <div className="flex space-x-4">
              {/* Date Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-4 py-2 bg-gray-200 rounded-lg focus:outline-none">
                    Date
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => setSelectedMonth(null)}
                    className="font-semibold"
                  >
                    All Months
                  </DropdownMenuItem>
                  {months.map((month) => (
                    <DropdownMenuItem
                      key={month}
                      onClick={() => handleMonthChange(month)}
                    >
                      {month}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Category Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="px-4 py-2 bg-gray-200 rounded-lg focus:outline-none">
                    Category
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem
                    onClick={() => setSelectedCategory(null)}
                    className="font-semibold"
                  >
                    All Categories
                  </DropdownMenuItem>
                  {categories.map((category) => (
                    <DropdownMenuItem
                      key={category.value}
                      onClick={() => handleCategoryChange(category.value)}
                    >
                      {category.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Upcoming Events Section */}
          <div>
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowUpcoming(!showUpcoming)}
            >
              <h2 className="text-2xl font-semibold">Upcoming Events</h2>
              {showUpcoming ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {showUpcoming && (
              <div className="space-y-4 mt-4">
                {loading ? (
                  // Display skeletons
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <EventSkeleton key={index} />
                  ))
                ) : paginatedUpcomingEvents.length > 0 ? (
                  paginatedUpcomingEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <p className="text-gray-600">No upcoming events</p>
                )}

                {/* Pagination for upcoming events */}
                {!loading && upcomingEvents.length > itemsPerPage && (
                  <Pagination
                    totalPages={totalUpcomingPages}
                    currentPage={currentUpcomingPage}
                    onPageChange={setCurrentUpcomingPage}
                  />
                )}
              </div>
            )}
          </div>

          <div className="w-full h-px bg-gray-300"></div>

          {/* Past Events Section */}
          <div>
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => setShowPast(!showPast)}
            >
              <h2 className="text-2xl font-semibold">Past Events</h2>
              {showPast ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            {showPast && (
              <div className="space-y-4 mt-4">
                {loading ? (
                  // Display skeletons
                  Array.from({ length: itemsPerPage }).map((_, index) => (
                    <EventSkeleton key={index} />
                  ))
                ) : paginatedPastEvents.length > 0 ? (
                  paginatedPastEvents.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))
                ) : (
                  <p className="text-gray-600">No past events</p>
                )}

                {/* Pagination for past events */}
                {!loading && pastEvents.length > itemsPerPage && (
                  <Pagination
                    totalPages={totalPastPages}
                    currentPage={currentPastPage}
                    onPageChange={setCurrentPastPage}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      <RegisterBanner />
    </div>
  );
};

export default EventsPage;
