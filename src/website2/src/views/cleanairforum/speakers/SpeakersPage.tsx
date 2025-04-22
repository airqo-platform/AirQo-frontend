'use client';

import DOMPurify from 'dompurify';
import React, { useState } from 'react';

import { Divider, MemberCard, Pagination } from '@/components/ui/';
import { useForumData } from '@/context/ForumDataContext';
import { isValidHTMLContent } from '@/utils/htmlValidator';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/cleanairforum/SectionDisplay';

interface Section {
  id: string;
  pages: string[];
  content: string;
  [key: string]: any; // For other properties of a section
}

const SpeakersPage = () => {
  // Now we use the selectedEvent from context
  const { selectedEvent } = useForumData();
  const membersPerPage = 6;
  const [currentKeyNotePage, setCurrentKeyNotePage] = useState<number>(1);
  const [currentSpeakersPage, setCurrentSpeakersPage] = useState<number>(1);

  if (!selectedEvent) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Event Not Selected
        </h2>
        <p className="text-gray-500">
          Please select an event to view speakers information.
        </p>
      </div>
    );
  }

  // Filter keynote speakers and speakers from selectedEvent.persons.
  // (Adjust your filtering logic as needed.)
  const keyNoteSpeakers: any[] =
    selectedEvent.persons?.filter(
      (person: any) =>
        person.category === 'Key Note Speaker' ||
        person.category === 'Committee Member and Key Note Speaker',
    ) || [];
  const speakers: any[] =
    selectedEvent.persons?.filter(
      (person: any) =>
        person.category === 'Speaker' ||
        person.category === 'Speaker and Committee Member',
    ) || [];

  // Pagination calculations for Keynote Speakers.
  const totalKeyNotePages = Math.ceil(keyNoteSpeakers.length / membersPerPage);
  const startKeyNoteIdx = (currentKeyNotePage - 1) * membersPerPage;
  const displayedKeyNoteSpeakers = keyNoteSpeakers.slice(
    startKeyNoteIdx,
    startKeyNoteIdx + membersPerPage,
  );

  // Pagination calculations for Speakers.
  const totalSpeakersPages = Math.ceil(speakers.length / membersPerPage);
  const startSpeakersIdx = (currentSpeakersPage - 1) * membersPerPage;
  const displayedSpeakers = speakers.slice(
    startSpeakersIdx,
    startSpeakersIdx + membersPerPage,
  );

  // Handlers for page changes.
  const handleKeyNotePageChange = (newPage: number) =>
    setCurrentKeyNotePage(newPage);
  const handleSpeakersPageChange = (newPage: number) =>
    setCurrentSpeakersPage(newPage);

  // Validate the main speakers text section.
  const mainSpeakersHTML = renderContent(selectedEvent.speakers_text_section);
  const showMainSpeakers = isValidHTMLContent(mainSpeakersHTML);

  // Filter extra sections assigned to the "speakers" page.
  const speakersExtraSections = selectedEvent.sections?.filter(
    (section: Section) => {
      if (!section.pages.includes('speakers')) return false;
      const sectionHTML = renderContent(section.content);
      return isValidHTMLContent(sectionHTML);
    },
  );

  // Check if we have any content at all
  const hasNoContent =
    !showMainSpeakers &&
    keyNoteSpeakers.length === 0 &&
    speakers.length === 0 &&
    (!speakersExtraSections || speakersExtraSections.length === 0);

  if (hasNoContent) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Speakers Coming Soon!
        </h2>
        <p className="text-gray-500">
          We&apos;re finalizing our speakers lineup. Please check back later.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 prose max-w-none lg:px-0">
      <Divider className="bg-black p-0 m-0 h-[1px] w-full" />

      {/* Speakers Text Section */}
      {showMainSpeakers && (
        <div className="py-4">
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(mainSpeakersHTML),
            }}
          />
        </div>
      )}

      {/* Keynote Speakers Section */}
      <h1 className="text-2xl font-bold">Keynote Speakers</h1>

      {keyNoteSpeakers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 py-6">
            {displayedKeyNoteSpeakers.map((person: any) => (
              <MemberCard
                key={person.id}
                member={person}
                btnText="Read Bio"
                cardClassName="bg-gray-100 p-2 rounded-md"
              />
            ))}
          </div>
          {totalKeyNotePages > 1 && (
            <div className="py-6">
              <Pagination
                totalPages={totalKeyNotePages}
                currentPage={currentKeyNotePage}
                onPageChange={handleKeyNotePageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg my-4">
          <p className="text-lg text-gray-600">Keynote Speakers Coming Soon!</p>
          <p className="text-sm text-gray-500 mt-2">
            We&apos;re in the process of confirming our keynote lineup.
          </p>
        </div>
      )}

      <Divider className="bg-black p-0 m-0 h-[1px] w-full" />

      {/* Speakers Section */}
      <h2 className="text-2xl font-bold">Speakers</h2>

      {speakers.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 py-6">
            {displayedSpeakers.map((person: any) => (
              <MemberCard
                key={person.id}
                member={person}
                btnText="Read Bio"
                cardClassName="bg-gray-100 p-2 rounded-md"
              />
            ))}
          </div>
          {totalSpeakersPages > 1 && (
            <div className="py-6">
              <Pagination
                totalPages={totalSpeakersPages}
                currentPage={currentSpeakersPage}
                onPageChange={handleSpeakersPageChange}
              />
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-lg my-4">
          <p className="text-lg text-gray-600">Speakers To Be Announced</p>
          <p className="text-sm text-gray-500 mt-2">
            Our speaker lineup is being finalized. Check back soon for updates.
          </p>
        </div>
      )}

      {/* Extra Speakers Sections */}
      {speakersExtraSections && speakersExtraSections.length > 0 && (
        <>
          {speakersExtraSections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}
    </div>
  );
};

export default SpeakersPage;
