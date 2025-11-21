'use client';

import DOMPurify from 'dompurify';
import Link from 'next/link';
import React from 'react';

import Loading from '@/components/loading';
import { Divider } from '@/components/ui';
import { NoData } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { useForumEvents } from '@/hooks/useApiHooks';
import { ForumEvent as ApiForumEvent } from '@/services/types/api';
import { isValidGlossaryContent } from '@/utils/glossaryValidator';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/cleanairforum/SectionDisplay';

const GlossaryPage = () => {
  // Access data from the context.
  const { selectedEvent } = useForumData();

  // Fetch event titles for the sidebar
  const { data: eventTitlesData } = useForumEvents();

  // If either is not available, show a loading state.
  if (!selectedEvent) {
    return <Loading />;
  }

  // Extract the events list from eventTitles.
  const eventsList: ApiForumEvent[] = eventTitlesData?.results ?? [];

  if (eventsList.length === 0) {
    return <NoData message="No events found" />;
  }

  // Render the main glossary content using the selected event.
  const glossaryHTML = renderContent(selectedEvent.glossary_details);
  const showGlossaryMain = isValidGlossaryContent(glossaryHTML);

  const glossarySections = selectedEvent.sections?.filter((section: any) => {
    if (!section.pages.includes('glossary')) return false;
    const html = renderContent(section.content);
    return html.trim().length > 0;
  });

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto px-4 lg:px-0">
        <div className="prose max-w-none flex flex-col gap-6">
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />

          {/* Clean Air Forum Events Section (Sidebar) */}
          <div className="flex flex-col md:flex-row py-6 md:space-x-8">
            {/* Left column: Heading */}
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h1 className="text-2xl mt-4 font-semibold">
                Clean Air Forum Events
              </h1>
            </div>
            {/* Right column: List of event links */}
            <div className="md:w-2/3">
              <ul className="space-y-2">
                {eventsList.map((event) => {
                  // Use the unique_title directly in the link.
                  const href = `/clean-air-forum/${encodeURIComponent(
                    event.unique_title,
                  )}/about`;
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
                  <h1 className="text-2xl mt-4 font-bold text-gray-900">
                    Clean Air Glossary
                  </h1>
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
          {glossarySections && glossarySections.length > 0 && (
            <>
              {glossarySections.map((section: any) => (
                <SectionDisplay key={section.id} section={section} />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlossaryPage;
