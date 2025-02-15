'use client';

import DOMPurify from 'dompurify';
import Link from 'next/link';
import React from 'react';

import Loading from '@/components/loading';
import { Divider } from '@/components/ui';
import { NoData } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { ForumEvent } from '@/types/forum';
import { isValidGlossaryContent } from '@/utils/glossaryValidator';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/Forum/SectionDisplay';

const GlossaryPage: React.FC = () => {
  // Access data from the context.
  const { selectedEvent, eventTitles } = useForumData();

  // If either is not available, show a loading state.
  if (!selectedEvent || !eventTitles) {
    return <Loading />;
  }

  // Extract the events list from eventTitles.
  // If eventTitles is an array, use it directly; otherwise, assume it's a ForumTitlesResponse.
  const eventsList: ForumEvent[] = Array.isArray(eventTitles)
    ? eventTitles
    : eventTitles.forum_events;

  if (eventsList.length === 0) {
    return <NoData message="No events found" />;
  }

  // Render the main glossary content using the selected event.
  const glossaryHTML = renderContent(selectedEvent.glossary_details);
  const showGlossaryMain = isValidGlossaryContent(glossaryHTML);

  return (
    <div className="px-4 lg:px-0 prose max-w-none flex flex-col gap-6">
      <Divider className="bg-black p-0 m-0 h-[1px] w-full" />

      {/* Clean Air Forum Events Section (Sidebar) */}
      <div className="flex flex-col md:flex-row py-6 md:space-x-8">
        {/* Left column: Heading */}
        <div className="md:w-1/3 mb-4 md:mb-0">
          <h3 className="text-xl font-semibold">Clean Air Forum Events</h3>
        </div>
        {/* Right column: List of event links */}
        <div className="md:w-2/3">
          <ul className="space-y-2">
            {eventsList.map((event) => {
              // Use the unique_title directly in the link.
              const href = `/clean-air-forum/about?slug=${encodeURIComponent(
                event.unique_title,
              )}`;
              return (
                <li key={event.id}>
                  <Link
                    href={href}
                    target="_blank"
                    className="text-blue-600 hover:underline"
                  >
                    {event.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Clean Air Glossary Section */}
      {showGlossaryMain && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div className="flex flex-col py-6 md:flex-row md:space-x-8">
            {/* Left column: Heading */}
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">
                Clean Air Glossary
              </h2>
            </div>
            {/* Right column: Glossary content */}
            <div
              className="md:w-2/3"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(glossaryHTML),
              }}
            ></div>
          </div>
        </>
      )}

      {/* Additional Glossary Sections (if any) */}
      {selectedEvent.sections && selectedEvent.sections.length > 0 && (
        <>
          {selectedEvent.sections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}
    </div>
  );
};

export default GlossaryPage;
