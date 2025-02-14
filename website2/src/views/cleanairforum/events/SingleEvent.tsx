'use client';

import { format, isSameMonth, parse } from 'date-fns';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  FiCalendar,
  FiClock,
  FiDownload,
  FiExternalLink,
} from 'react-icons/fi';

import { Accordion, CustomButton } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { getEventDetails } from '@/services/apiService';
import { convertDeltaToHtml } from '@/utils/quillUtils';

const SingleEvent: React.FC<any> = ({ id }) => {
  const router = useRouter();
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        const response = await getEventDetails(id);
        setEvent(response);
      } catch (err) {
        console.error('Error fetching event details:', err);
        setError('Failed to load event details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetails();
  }, [id]);

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

  if (loading) {
    return (
      <div className="w-full">
        {/* Header Skeleton */}
        <section className="relative h-[400px] bg-gray-300 animate-pulse flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-300"></div>
          <div className="relative z-10 max-w-5xl text-center px-4">
            <div className="h-12 bg-gray-400 rounded w-1/2 mx-auto mb-4"></div>
            <div className="h-6 bg-gray-400 rounded w-1/3 mx-auto"></div>
            <div className="h-4 bg-gray-400 rounded w-1/4 mx-auto mt-4"></div>
          </div>
        </section>

        {/* Partner Logos Skeleton */}
        <section className="py-12 bg-gray-100">
          <div
            className={`${mainConfig.containerClass} grid grid-cols-2 md:grid-cols-4 gap-8`}
          >
            {[...Array(4)].map((_, index) => (
              <div key={index} className="flex items-center justify-center">
                <div className="w-36 h-24 bg-gray-300 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </section>
        <div className={`${mainConfig.containerClass}`}>
          {/* Event Details Skeleton */}
          <section className="px-4 py-8">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-6 animate-pulse"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="h-4 bg-gray-300 rounded animate-pulse"
                ></div>
              ))}
            </div>
          </section>

          {/* Event Program Skeleton */}
          <section className="px-4 py-8">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-6 animate-pulse"></div>
            {[...Array(3)].map((_, index) => (
              <div key={index} className="mb-4">
                <div className="h-4 bg-gray-300 rounded w-1/4 mb-2 animate-pulse"></div>
                <div className="space-y-2">
                  {[...Array(3)].map((_, idx) => (
                    <div
                      key={idx}
                      className="h-4 bg-gray-300 rounded animate-pulse"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </section>

          {/* Inquiry Skeleton */}
          <section className="px-4 py-8">
            <div className="h-6 bg-gray-300 rounded w-1/3 mb-6 animate-pulse"></div>
            {[...Array(2)].map((_, index) => (
              <div key={index} className="mb-4 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3 animate-pulse"></div>
                <div className="h-3 bg-gray-300 rounded w-1/2 animate-pulse"></div>
              </div>
            ))}
          </section>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <p className="text-red-500 text-lg">{error}</p>
      </div>
    );
  }

  // Use the utility function directly with the event details (JSON string)
  const eventDetailsHtml = event?.event_details
    ? convertDeltaToHtml(event.event_details)
    : '';

  return (
    <div className="w-full">
      {/* Header Section */}
      {event.background_image_url && (
        <section
          className="relative h-[250px] lg:h-[400px] bg-cover bg-center flex items-center justify-center text-white"
          style={{
            backgroundImage: `url(${event.background_image_url})`,
          }}
        >
          <div className="absolute inset-0 bg-black opacity-50"></div>
          <div
            className={`relative z-10 ${mainConfig.containerClass} w-full space-y-6 text-start px-4`}
          >
            {/* bread crumb */}

            <nav className="flex items-start text-sm">
              <button
                type="button"
                onClick={() => router.back()}
                className="text-white hover:text-gray-200"
              >
                Event
              </button>
              <span className="mx-2">{'>'}</span>
              <button
                type="button"
                className="text-gray-400 hover:text-gray-200"
              >
                {event.title}
              </button>
            </nav>
            <h1 className="text-2xl lg:text-[40px] font-bold mb-2">
              {event.title}
            </h1>
            {event.title_subtext && (
              <p className="text-lg mb-4">{event.title_subtext}</p>
            )}
          </div>
        </section>
      )}

      {/* Partner Logos Section */}
      {event?.partner_logos && event?.partner_logos?.length > 0 && (
        <section className="py-12 bg-gray-100">
          <div
            className={`${mainConfig.containerClass} grid grid-cols-2 md:grid-cols-4 gap-8`}
          >
            {event?.partner_logos?.map((partner: any) => (
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
        {/* Event Details Section */}
        {eventDetailsHtml && (
          <section className="px-4 lg:px-0 py-8">
            <h2 className="text-3xl font-semibold mb-6 pb-2">Event Details</h2>
            <div className="flex justify-between w-full items-center border-b-2 py-4 mb-6">
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <FiCalendar className="text-gray-500 w-5 h-5" />
                  <p className="text-gray-600">
                    {event?.start_date && event?.end_date
                      ? formatDateRange(event?.start_date, event?.end_date)
                      : 'Date to be announced'}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <FiClock className="text-gray-500 w-5 h-5" />
                  <p className="text-gray-600">
                    {event?.start_time && event?.end_time
                      ? `${format(
                          parse(event?.start_time, 'HH:mm:ss', new Date()),
                          'HH:mm',
                        )} - ${format(
                          parse(event?.end_time, 'HH:mm:ss', new Date()),
                          'HH:mm',
                        )}`
                      : 'Time to be announced'}
                  </p>
                </div>
              </div>
              {/* Registration Link Section */}
              {event?.registration_link && (
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
        {event.programs && event.programs.length > 0 && (
          <section className="px-4 py-8">
            <h2 className="text-3xl font-semibold mb-6 border-b-2 pb-2">
              Event Schedule
            </h2>
            {event.programs.map((program: any) => (
              <Accordion
                key={program.id}
                title={format(new Date(program.date), 'MMMM do, yyyy')}
              >
                <div className="p-6 bg-blue-50 rounded-lg shadow-sm space-y-4">
                  {program.sessions && program.sessions.length > 0 ? (
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
        {event.inquiries && event.inquiries.length > 0 && (
          <section className="px-4 py-8 bg-gray-50 rounded-lg shadow">
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
        {event.resources && event.resources.length > 0 && (
          <section className="px-4 lg:px-0 py-8">
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
    </div>
  );
};

export default SingleEvent;
