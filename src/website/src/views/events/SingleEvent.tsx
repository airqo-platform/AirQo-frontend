'use client';

import { format, isSameMonth, parse } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FaLink, FaShareAlt } from 'react-icons/fa';
import {
  FiCalendar,
  FiClock,
  FiDownload,
  FiExternalLink,
  FiMail,
  FiMapPin,
} from 'react-icons/fi';
import { HiArrowSmallLeft, HiArrowSmallRight } from 'react-icons/hi2';
import { RiFacebookFill, RiLinkedinFill, RiTwitterXFill } from 'react-icons/ri';

import {
  Accordion,
  CustomButton,
  Dialog,
  DialogContent,
  DialogTitle,
  NoData,
} from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useEventDetails } from '@/hooks/useApiHooks';
import {
  type CalendarEvent,
  combineDateAndTime,
  downloadIcsFile,
  getGoogleCalendarUrl,
  getOfficeCalendarUrl,
  getOutlookCalendarUrl,
  getYahooCalendarUrl,
} from '@/utils/calendarUtils';
import { convertDeltaToHtml } from '@/utils/quillUtils';

interface SideEventItem {
  public_identifier: string;
  api_url: string;
  title: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  location_name: string;
  location_link: string;
  event_image_url?: string;
  event_category: string;
  event_category_display: string;
  event_status: string;
  label: string;
  order: number;
}

const SideEventsCarousel: React.FC<{
  sideEvents: SideEventItem[];
  parentEventTitle: string;
}> = ({ sideEvents, parentEventTitle }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const getCardsPerView = useCallback(() => {
    if (typeof window === 'undefined') return 3;
    if (window.innerWidth < 640) return 1;
    if (window.innerWidth < 1024) return 2;
    return 3;
  }, []);

  const maxIndex = Math.max(0, sideEvents.length - getCardsPerView());

  const scrollToIndex = useCallback(
    (index: number) => {
      if (!scrollRef.current) return;
      const container = scrollRef.current;
      const cardWidth = container.scrollWidth / sideEvents.length;
      container.scrollTo({
        left: cardWidth * index,
        behavior: 'smooth',
      });
      setCurrentIndex(Math.min(index, maxIndex));
    },
    [sideEvents.length, maxIndex],
  );

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev >= maxIndex ? 0 : prev + 1;
      scrollToIndex(next);
      return next;
    });
  }, [maxIndex, scrollToIndex]);

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev <= 0 ? maxIndex : prev - 1;
      scrollToIndex(next);
      return next;
    });
  }, [maxIndex, scrollToIndex]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    autoPlayRef.current = setInterval(nextSlide, 5000);
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [isAutoPlaying, nextSlide]);

  // Pause on hover
  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  // Handle scroll to update currentIndex
  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const cardWidth = container.scrollWidth / sideEvents.length;
    const newIndex = Math.round(container.scrollLeft / cardWidth);
    setCurrentIndex(Math.min(newIndex, maxIndex));
  }, [sideEvents.length, maxIndex]);

  // Touch support
  const touchStartX = useRef(0);
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
  };

  return (
    <section
      className="px-4 lg:px-0 py-8 border-t border-gray-200"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-semibold">Side events</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={prevSlide}
            className="p-2 rounded-lg border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-colors"
            aria-label="Previous side events"
          >
            <HiArrowSmallLeft className="w-5 h-5" />
          </button>
          <button
            onClick={nextSlide}
            className="p-2 rounded-lg border border-gray-300 hover:border-blue-600 hover:text-blue-600 transition-colors"
            aria-label="Next side events"
          >
            <HiArrowSmallRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory scroll-smooth pb-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {sideEvents.map((sideEvent: SideEventItem) => (
          <a
            key={sideEvent.public_identifier}
            href={`/events/${sideEvent.public_identifier}`}
            className="group flex-shrink-0 w-[300px] sm:w-[350px] lg:w-[calc((100%-48px)/3)] snap-start bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"
          >
            <div className="relative h-48 overflow-hidden bg-gray-100">
              {sideEvent.event_image_url ? (
                <Image
                  src={sideEvent.event_image_url}
                  alt={sideEvent.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
                  <span className="text-blue-400 text-sm">No image</span>
                </div>
              )}
            </div>
            <div className="p-5 flex flex-col flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="inline-block w-3 h-3 bg-blue-500 rounded-sm"></span>
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {sideEvent.label || 'Side Event'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {sideEvent.title}
              </h3>
              <div className="space-y-2 text-sm text-gray-600 mt-auto">
                {sideEvent.start_date && (
                  <div className="flex items-center gap-2">
                    <FiCalendar className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>
                      {format(new Date(sideEvent.start_date), 'd MMMM, yyyy')}
                    </span>
                  </div>
                )}
                {sideEvent.start_time && sideEvent.end_time && (
                  <div className="flex items-center gap-2">
                    <FiClock className="w-4 h-4 text-gray-400 shrink-0" />
                    <span>
                      {format(
                        parse(sideEvent.start_time, 'HH:mm:ss', new Date()),
                        'HH:mm',
                      )}{' '}
                      -{' '}
                      {format(
                        parse(sideEvent.end_time, 'HH:mm:ss', new Date()),
                        'HH:mm',
                      )}{' '}
                      (London)
                    </span>
                  </div>
                )}
                {sideEvent.location_name && (
                  <div className="flex items-center gap-2">
                    <FiMapPin className="w-4 h-4 text-gray-400 shrink-0" />
                    <span className="line-clamp-1">
                      {sideEvent.location_name}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="px-5 py-3 bg-blue-50 border-t border-gray-100">
              <p className="text-sm text-gray-600 line-clamp-2">
                Side event of {parentEventTitle}
              </p>
            </div>
          </a>
        ))}
      </div>

      {/* Pagination Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {Array.from({ length: maxIndex + 1 }).map((_, index) => (
          <button
            key={index}
            onClick={() => scrollToIndex(index)}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex
                ? 'bg-blue-600'
                : 'bg-gray-300 hover:bg-gray-400'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
};

const AddToCalendarButton: React.FC<{
  title: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  url?: string;
}> = ({
  title,
  description,
  location,
  startDate,
  endDate,
  startTime,
  endTime,
  url,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!startDate || !endDate) return null;

  const calendarEvent: CalendarEvent = {
    title,
    description: description || '',
    location: location || '',
    startDate: combineDateAndTime(startDate, startTime),
    endDate: combineDateAndTime(endDate, endTime),
    url,
  };

  const handleCalendarOption = (type: string) => {
    setIsOpen(false);
    switch (type) {
      case 'google':
        window.open(getGoogleCalendarUrl(calendarEvent), '_blank');
        break;
      case 'yahoo':
        window.open(getYahooCalendarUrl(calendarEvent), '_blank');
        break;
      case 'outlook':
        window.open(getOutlookCalendarUrl(calendarEvent), '_blank');
        break;
      case 'office':
        window.open(getOfficeCalendarUrl(calendarEvent), '_blank');
        break;
      case 'ical':
        downloadIcsFile(calendarEvent);
        break;
    }
  };

  const options = [
    { key: 'google', label: 'Google' },
    { key: 'yahoo', label: 'Yahoo!' },
    { key: 'outlook', label: 'Outlook.com' },
    { key: 'office', label: 'Office.com' },
    { key: 'ical', label: 'iCal / MS Outlook' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-50 transition-colors"
      >
        <span>Add to Calendar</span>
        <span className="border-l border-blue-300 h-5 mx-1"></span>
        <FiCalendar className="w-4 h-4" />
      </button>

      {isOpen && (
        <div className="absolute z-50 left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => handleCalendarOption(option.key)}
              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors text-gray-700 hover:text-gray-900 border-b border-gray-100 last:border-b-0"
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const ShareModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  url: string;
  title: string;
}> = ({ isOpen, onClose, url, title }) => {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = [
    {
      key: 'facebook',
      label: 'Facebook share',
      icon: <RiFacebookFill className="w-3.5 h-3.5" />,
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    },
    {
      key: 'twitter',
      label: 'Twitter',
      icon: <RiTwitterXFill className="w-3.5 h-3.5" />,
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    },
    {
      key: 'linkedin',
      label: 'LinkedIn',
      icon: <RiLinkedinFill className="w-3.5 h-3.5" />,
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
  ];

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy URL', err);
    }
  };

  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Check out: ${title}`);
    const body = encodeURIComponent(
      `I thought you might be interested in this event: ${url}`,
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-5 sm:p-6 mx-4" hideClose>
        <DialogTitle className="text-lg font-bold text-gray-900 mb-1">
          SHARE
        </DialogTitle>
        <div className="w-10 h-0.5 bg-blue-600 mb-5"></div>

        <div className="grid grid-cols-3 gap-2.5 mb-3">
          {shareLinks.map((link) => (
            <a
              key={link.key}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1.5 px-2 py-2.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              {link.icon}
              <span className="text-center leading-tight">{link.label}</span>
            </a>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleCopyUrl}
            className="flex items-center justify-center gap-2 px-3 py-2 border border-blue-600 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            <span>{copied ? 'Copied!' : 'Copy URL'}</span>
            <FaLink className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={handleEmailShare}
            className="flex items-center justify-center gap-2 px-3 py-2 border border-blue-600 text-blue-600 text-xs font-medium rounded-lg hover:bg-blue-50 transition-colors"
          >
            <span>Email</span>
            <FiMail className="w-3 h-3" />
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close share dialog"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </DialogContent>
    </Dialog>
  );
};

const ShareButton: React.FC<{
  url: string;
  title: string;
  className?: string;
  variant?: 'solid' | 'outline';
}> = ({ url, title, className = '', variant = 'outline' }) => {
  const [isOpen, setIsOpen] = useState(false);

  const baseStyles =
    'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all';

  const variantStyles =
    variant === 'outline'
      ? 'border-2 border-white text-white hover:bg-white hover:text-gray-900'
      : 'bg-white text-gray-800 hover:bg-gray-100 shadow-sm';

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`${baseStyles} ${variantStyles} ${className}`}
      >
        <span>Share</span>
        <span
          className={`border-l ${
            variant === 'outline' ? 'border-white/50' : 'border-gray-300'
          } h-4 mx-1`}
        ></span>
        <FaShareAlt className="w-3.5 h-3.5" />
      </button>

      <ShareModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        url={url}
        title={title}
      />
    </>
  );
};

const SingleEvent: React.FC<{ slug: string }> = ({ slug }) => {
  const router = useRouter();

  // Fetch event detail via v2 API. The endpoint may return a paginated response
  // or a single object. Normalize to a single object.
  const { data, isLoading, error: isError } = useEventDetails(slug);

  const eventDetails = useMemo(() => {
    if (!data) return null;
    // If paginated, take the first result; otherwise assume it's the object
    if (Array.isArray((data as any).results)) {
      return (data as any).results[0] || null;
    }
    return data;
  }, [data]);

  // Function to format the date range based on whether the months are the same
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isSameMonth(start, end)) {
      return `${format(start, 'do')} - ${format(end, 'do MMMM yyyy')}`;
    } else {
      return `${format(start, 'MMMM do, yyyy')} - ${format(
        end,
        'MMMM do, yyyy',
      )}`;
    }
  };

  if (isLoading) {
    return (
      <div className="w-full">
        {/* Loading Skeleton */}
        <section className="relative h-[400px] bg-gray-300 animate-pulse flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-300"></div>
          <div className="relative z-10 max-w-5xl text-center px-4">
            <div className="h-12 bg-gray-400 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-400 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-400 rounded w-1/4 mx-auto mt-4"></div>
          </div>
        </section>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <p className="text-red-500 text-lg">
          Failed to load event details. Please try again later.
        </p>
      </div>
    );
  }

  if (!eventDetails) {
    return <NoData />;
  }

  const event = eventDetails as any;
  const eventDetailsHtml = event.event_details
    ? convertDeltaToHtml(event.event_details)
    : '';

  const heroImage =
    event.background_image_url ||
    event.background_image ||
    event.event_image_url ||
    (typeof event.event_image === 'string'
      ? event.event_image
      : event.event_image?.url) ||
    null;

  return (
    <div className="w-full">
      {/* Header / Banner Section */}
      <section
        className="relative min-h-[300px] sm:h-[250px] lg:h-[400px] bg-cover bg-center flex items-center justify-center text-white"
        style={heroImage ? { backgroundImage: `url(${heroImage})` } : {}}
      >
        <div
          className={`absolute inset-0 ${
            heroImage
              ? 'bg-black opacity-50'
              : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 opacity-90'
          }`}
        ></div>
        <div
          className={`relative z-10 ${mainConfig.containerClass} w-full space-y-4 sm:space-y-6 text-start px-4 pt-8 sm:pt-0`}
        >
          <nav className="hidden sm:flex items-start text-sm">
            <button
              type="button"
              onClick={() => router.push('/events')}
              className="text-white hover:text-gray-200"
            >
              Events
            </button>
            <span className="mx-2">{'>'}</span>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-200 line-clamp-1"
            >
              {event.title}
            </button>
          </nav>
          <h1 className="text-xl sm:text-2xl lg:text-[40px] font-bold mb-2 line-clamp-3 sm:line-clamp-none">
            {event.title}
          </h1>
          {event.title_subtext && (
            <p className="text-sm sm:text-base lg:text-lg mb-2 sm:mb-4 line-clamp-2 sm:line-clamp-3">
              {event.title_subtext}
            </p>
          )}
          <ShareButton
            url={typeof window !== 'undefined' ? window.location.href : ''}
            title={event.title || 'Event'}
            variant="outline"
          />
        </div>
      </section>

      {/* Partner Logos Section */}
      {event.partner_logos?.length > 0 && (
        <section className="py-12 bg-gray-100">
          <div
            className={`${mainConfig.containerClass} grid grid-cols-2 md:grid-cols-4 gap-8`}
          >
            {event.partner_logos.map((partner: any) => (
              <div
                key={partner.id}
                className="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
              >
                <Image
                  src={partner.partner_logo_url}
                  alt={partner.name}
                  width={150}
                  height={100}
                  className="object-contain mix-blend-multiply"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>
      )}

      <div className={`${mainConfig.containerClass}`}>
        <div className="flex flex-col lg:flex-row gap-8 px-4 lg:px-0 py-8">
          {/* Main Content */}
          <div className="flex-1">
            {/* Event Details Section */}
            {eventDetailsHtml && (
              <section className="mb-8">
                <h2 className="text-3xl font-semibold mb-6 pb-2">
                  Event Details
                </h2>
                <div className="flex justify-between w-full items-center border-b-2 py-4 mb-6">
                  <div className="flex flex-col gap-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="text-gray-500 w-5 h-5" />
                      <p className="text-gray-600">
                        {event.start_date && event.end_date
                          ? formatDateRange(event.start_date, event.end_date)
                          : 'Date to be announced'}
                      </p>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FiClock className="text-gray-500 w-5 h-5" />
                      <p className="text-gray-600">
                        {event.start_time && event.end_time
                          ? `${format(
                              parse(event.start_time, 'HH:mm:ss', new Date()),
                              'HH:mm',
                            )} - ${format(
                              parse(event.end_time, 'HH:mm:ss', new Date()),
                              'HH:mm',
                            )}`
                          : 'Time to be announced'}
                      </p>
                    </div>

                    {event.location_name && (
                      <div className="flex items-center space-x-2">
                        <FiMapPin className="text-gray-500 w-5 h-5" />
                        {event.location_link ? (
                          <a
                            href={event.location_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {event.location_name}
                          </a>
                        ) : (
                          <p className="text-gray-600">{event.location_name}</p>
                        )}
                      </div>
                    )}
                  </div>
                  {event.registration_link && (
                    <CustomButton
                      type="button"
                      onClick={() => window.open(event.registration_link)}
                      className="text-white"
                    >
                      Register Now
                    </CustomButton>
                  )}
                </div>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: eventDetailsHtml || 'Event details coming soon.',
                  }}
                ></div>
              </section>
            )}

            {/* Event Program Section */}
            {event.programs?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-3xl font-semibold mb-6 border-b-2 pb-2">
                  Event Schedule
                </h2>
                {event.programs.map((program: any) => (
                  <Accordion
                    key={program.id}
                    title={format(new Date(program.date), 'MMMM do, yyyy')}
                  >
                    <div className="p-6 bg-blue-50 rounded-lg shadow-sm space-y-4">
                      {program.sessions?.length > 0 ? (
                        program.sessions.map((session: any) => (
                          <div
                            key={session.id}
                            className="border-b pb-4 last:border-none"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-500">
                                {format(
                                  new Date(`1970-01-01T${session.start_time}`),
                                  'h:mm a',
                                )}{' '}
                                -{' '}
                                {format(
                                  new Date(`1970-01-01T${session.end_time}`),
                                  'h:mm a',
                                )}
                              </span>
                              {session.venue && (
                                <span className="text-sm text-gray-500">
                                  {session.venue}
                                </span>
                              )}
                            </div>
                            <h3 className="text-xl font-semibold mt-2">
                              {session.session_title}
                            </h3>
                            <div className="text-gray-700 mt-1">
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: session.session_details,
                                }}
                              ></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No sessions available.</p>
                      )}
                    </div>
                  </Accordion>
                ))}
              </section>
            )}

            {/* Inquiry Section */}
            {event.inquiries?.length > 0 && (
              <section className="mb-8 bg-gray-50 rounded-lg shadow p-6">
                <h2 className="text-3xl font-semibold mb-6 border-b-2 pb-2">
                  For any inquiries and clarifications:
                </h2>
                <div className="space-y-6">
                  {event.inquiries.map((inquiry: any) => (
                    <div
                      key={inquiry.id}
                      className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-300"
                    >
                      <p className="text-lg font-medium">{inquiry.inquiry}</p>
                      {inquiry.role && (
                        <p className="text-gray-600">{inquiry.role}</p>
                      )}
                      <a
                        href={`mailto:${inquiry.email}`}
                        className="text-blue-500 hover:underline"
                      >
                        {inquiry.email}
                      </a>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Resources Section */}
            {event.resources?.length > 0 && (
              <section className="mb-8">
                <h2 className="text-3xl font-semibold mb-6 border-b-2 pb-2">
                  Access the Event Resources here:
                </h2>
                <div className="space-y-4">
                  {event.resources.map((resource: any) => (
                    <div
                      key={resource.id}
                      className="flex justify-between items-center p-4 bg-gray-50 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200"
                    >
                      <div>
                        <h3 className="text-xl font-semibold mb-2 text-gray-800">
                          {resource.title}
                        </h3>
                        <div className="flex space-x-4">
                          {resource.link && (
                            <a
                              href={resource.link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-blue-600 hover:underline font-medium"
                            >
                              <FiExternalLink className="mr-2" /> View Link
                            </a>
                          )}
                          {resource.resource_url && (
                            <a
                              href={resource.resource_url}
                              download
                              className="inline-flex items-center text-blue-600 hover:underline font-medium"
                            >
                              <FiDownload className="mr-2" /> Download
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-full lg:w-80 shrink-0">
            {/* Parent Event (Side Event Of) */}
            {event.is_side_event && event.side_event_of && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Side Event Of
                </h3>
                <div className="border-t border-gray-200 pt-3">
                  <a
                    href={`/events/${event.side_event_of.public_identifier}`}
                    className="text-lg font-semibold text-gray-800 hover:text-blue-600 transition-colors"
                  >
                    {event.side_event_of.title}
                  </a>
                </div>
              </div>
            )}

            {/* Organizers */}
            {event.organizers?.length > 0 && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Organizers
                </h3>
                <div className="border-t border-gray-200 pt-3 space-y-4">
                  {event.organizers.map((orgLink: any) => (
                    <div key={orgLink.id} className="flex items-center gap-3">
                      {orgLink.organizer.logo_url && (
                        <Image
                          src={orgLink.organizer.logo_url}
                          alt={orgLink.organizer.name}
                          width={40}
                          height={40}
                          className="rounded-full object-contain"
                        />
                      )}
                      <div>
                        {orgLink.organizer.website_url ? (
                          <a
                            href={orgLink.organizer.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                          >
                            {orgLink.organizer.name}
                          </a>
                        ) : (
                          <span className="font-medium text-gray-800">
                            {orgLink.organizer.name}
                          </span>
                        )}
                        {orgLink.role_display &&
                          orgLink.role !== 'organizer' && (
                            <p className="text-xs text-gray-500">
                              {orgLink.role_display}
                            </p>
                          )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Partners */}
            {event.partners?.length > 0 && (
              <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Partners
                </h3>
                <div className="border-t border-gray-200 pt-3 space-y-4">
                  {event.partners.map((partnerLink: any) => (
                    <div
                      key={partnerLink.id}
                      className="flex items-center gap-3"
                    >
                      {partnerLink.partner.logo_url && (
                        <Image
                          src={partnerLink.partner.logo_url}
                          alt={partnerLink.partner.name}
                          width={40}
                          height={40}
                          className="rounded-full object-contain"
                        />
                      )}
                      <div>
                        {partnerLink.partner.website_url ? (
                          <a
                            href={partnerLink.partner.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-800 hover:text-blue-600 transition-colors"
                          >
                            {partnerLink.partner.name}
                          </a>
                        ) : (
                          <span className="font-medium text-gray-800">
                            {partnerLink.partner.name}
                          </span>
                        )}
                        {partnerLink.role_display && (
                          <p className="text-xs text-gray-500">
                            {partnerLink.role_display}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Add to Calendar */}
            <div className="mb-6">
              <AddToCalendarButton
                title={event.title || 'Event'}
                description={eventDetailsHtml}
                location={event.location_name}
                startDate={event.start_date}
                endDate={event.end_date}
                startTime={event.start_time}
                endTime={event.end_time}
                url={
                  typeof window !== 'undefined'
                    ? window.location.href
                    : undefined
                }
              />
            </div>
          </div>
        </div>

        {/* Side Events Section */}
        {event.side_events?.length > 0 && (
          <SideEventsCarousel
            sideEvents={event.side_events}
            parentEventTitle={event.title}
          />
        )}
      </div>
    </div>
  );
};

export default SingleEvent;
