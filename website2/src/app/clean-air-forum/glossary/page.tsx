'use client';
import DOMPurify from 'dompurify';
import Link from 'next/link';
import React from 'react';

import { Divider } from '@/components/ui';
import { useSelector } from '@/hooks/reduxHooks';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/Forum/SectionDisplay';

const Page: React.FC = () => {
  // Retrieve forum events and the selected event index from Redux.
  const { events, selectedEventIndex } = useSelector((state) => state.forum);

  if (events.length === 0) {
    return null;
  }

  const selectedEvent = events[selectedEventIndex];

  // Utility function to create a slug from the event title.
  const createSlug = (title: string) => {
    return title.split(',')[0].trim().toLowerCase().replace(/\s+/g, '-');
  };

  // Define what you consider a default "empty" message.
  const defaultMessage = 'No details available yet.';

  // Render the main glossary content.
  const glossaryHTML = renderContent(selectedEvent.glossary_details);
  const showGlossaryMain =
    glossaryHTML.trim() !== '' && !glossaryHTML.includes(defaultMessage);

  // Filter extra sections assigned to the "glossary" page
  // and filter out those with no meaningful content.
  const glossarySections = selectedEvent.sections?.filter((section: any) => {
    if (!section.pages.includes('glossary')) return false;
    const sectionHTML = renderContent(section.content);
    return sectionHTML.trim() !== '' && !sectionHTML.includes(defaultMessage);
  });

  return (
    <div className="px-4 lg:px-0 flex flex-col gap-6">
      <Divider className="bg-black p-0 m-0 h-[1px] w-full" />

      {/* Clean Air Forum Events Section */}
      <div className="flex flex-col md:flex-row md:space-x-8">
        {/* Left column: Heading */}
        <div className="md:w-1/3 mb-4 md:mb-0">
          <h3 className="text-xl font-semibold">Clean Air Forum Events</h3>
        </div>
        {/* Right column: List of events */}
        <div className="md:w-2/3">
          <ul className="space-y-2">
            {events.map((event, index) => {
              const slug = createSlug(event.title);
              const href = `/clean-air-forum/about?slug=${encodeURIComponent(slug)}`;
              return (
                <li key={event.id}>
                  <Link
                    href={href}
                    target="_blank"
                    onClick={(e) => {
                      e.preventDefault();
                      // Open the event page in a new tab.
                      window.open(href, '_blank');
                    }}
                    className={`text-blue-600 hover:underline ${
                      selectedEventIndex === index ? 'font-bold' : ''
                    }`}
                  >
                    {event.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      {/* Clear Air Glossary Section */}
      {showGlossaryMain && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div className="flex flex-col md:flex-row md:space-x-8">
            {/* Left column: Heading */}
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">
                Clear Air Glossary
              </h2>
            </div>
            {/* Right column: Glossary content */}
            <div
              className="md:w-2/3 space-y-4"
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
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          {glossarySections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}
    </div>
  );
};

export default Page;
