'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import type React from 'react';
import { useEffect, useState } from 'react';
import { FiCalendar, FiClock } from 'react-icons/fi';

import { CustomButton } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { getCleanAirEvents } from '@/services/apiService';

const FeaturedEvent: React.FC = () => {
  const t = useTranslations('featuredEvent');
  const locale = useLocale();
  const router = useRouter();
  const [featuredEvent, setFeaturedEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events on component mount
  useEffect(() => {
    const fetchFeaturedEvent = async () => {
      try {
        const events = await getCleanAirEvents();
        if (events.length > 0) {
          const featured = events.filter(
            (event: any) => event.event_tag === 'Featured',
          );

          setFeaturedEvent(featured);
        } else {
          setError(t('errors.noEvents'));
        }
      } catch (err) {
        setError(t('errors.failedToLoad'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedEvent();
  }, [t]);

  const firstFeaturedEvent =
    featuredEvent?.length > 0 ? featuredEvent[0] : null;

  // Loading Skeleton Component
  const LoadingSkeleton = () => (
    <section
      className={`${mainConfig.containerClass} w-full mt-16 bg-blue-50 rounded-lg shadow-sm p-6 lg:px-8 lg:py-12 flex flex-col lg:flex-row items-center gap-6 animate-pulse`}
    >
      {/* Image Skeleton */}
      <div className="w-full lg:w-1/2">
        <div className="relative flex justify-center w-auto lg:w-[416px] lg:h-[518px] items-center">
          <div className="w-full h-full bg-gray-300 rounded-lg"></div>
        </div>
      </div>

      {/* Content Skeleton */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-start h-full space-y-4">
        <div className="h-6 bg-gray-300 rounded w-24 mb-3"></div>
        <div className="h-8 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
        <div className="h-10 bg-gray-300 rounded w-32"></div>
      </div>
    </section>
  );

  // Error Message Component
  const ErrorMessage = ({ message }: { message: string }) => (
    <section
      className={`${mainConfig.containerClass} w-full mt-16 bg-blue-50 rounded-lg shadow-sm p-6 lg:px-8 lg:py-12 flex flex-col lg:flex-row items-center gap-6`}
    >
      <div className="w-full lg:w-1/2 flex justify-center items-center">
        <div className="w-full h-full bg-gray-300 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">{message}</p>
        </div>
      </div>
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-start h-full space-y-4">
        <p className="text-red-500">{message}</p>
      </div>
    </section>
  );

  // Main Content Component
  const Content = () => {
    if (!firstFeaturedEvent) return null;

    const {
      title,
      title_subtext,
      end_date,
      start_time,
      end_time,
      event_image_url,
      event_category,
      id,
    } = firstFeaturedEvent;

    // Format date based on current locale
    const formattedDate = end_date
      ? new Date(end_date).toLocaleDateString(locale, {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      : t('dateTBA');

    // Format time based on current locale
    const formattedTime =
      start_time && end_time
        ? `${new Date(`1970-01-01T${start_time}`).toLocaleTimeString(locale, {
            hour: '2-digit',
            minute: '2-digit',
          })} - ${new Date(`1970-01-01T${end_time}`).toLocaleTimeString(
            locale,
            {
              hour: '2-digit',
              minute: '2-digit',
            },
          )}`
        : t('timeTBA');

    return (
      <section className="max-w-5xl mx-auto w-full mt-16 bg-blue-50 rounded-lg shadow-sm p-6 lg:px-8 lg:py-12 flex flex-col lg:flex-row items-center gap-6">
        {/* Image Section */}
        <div className="w-full lg:w-1/2">
          <div className="relative flex justify-center w-auto lg:w-[416px] lg:h-[518px] items-center">
            <Image
              src={event_image_url || '/placeholder.svg'}
              alt={title}
              width={416}
              height={518}
              layout="responsive"
              objectFit="cover"
              className="rounded-lg max-w-[600px] max-h-[518px]"
            />
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-start h-full space-y-4">
          {event_category && (
            <span className="text-sm text-gray-600 bg-white px-2 py-1 rounded-full inline-block mb-3">
              {event_category.charAt(0).toUpperCase() + event_category.slice(1)}{' '}
              {t('eventLabel')}
            </span>
          )}
          <h2 className="text-4xl font-bold text-gray-800 mb-4">{title}</h2>
          {title_subtext && (
            <p className="text-2xl text-gray-600 mb-4">{title_subtext}</p>
          )}

          {/* Date and Time */}
          <div className="flex flex-col items-start gap-4 text-gray-600 mb-4">
            <div className="flex items-center space-x-1">
              <FiCalendar className="w-5 h-5" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center space-x-1">
              <FiClock className="w-5 h-5" />
              <span>{formattedTime}</span>
            </div>
          </div>

          {/* Action Button */}
          <CustomButton
            onClick={() => router.push(`/clean-air-network/events/${id}`)}
            className="text-white"
          >
            {t('readMore')} →
          </CustomButton>
        </div>
      </section>
    );
  };

  if (!loading && !featuredEvent) {
    return null;
  }

  return (
    <>
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorMessage message={error} />
      ) : (
        featuredEvent && <Content />
      )}
    </>
  );
};

export default FeaturedEvent;
