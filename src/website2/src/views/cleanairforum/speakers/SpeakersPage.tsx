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
  const [currentPlenaryPage, setCurrentPlenaryPage] = useState<number>(1);

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

  const plenarySpeakers: any[] =
    selectedEvent.persons?.filter(
      (person: any) =>
        person.category === 'Plenary Speaker' ||
        person.category === 'Plenary and Committee Member',
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

  // Pagination calculations for Plenary Speakers
  const totalPlenaryPages = Math.ceil(plenarySpeakers.length / membersPerPage);
  const startPlenaryIdx = (currentPlenaryPage - 1) * membersPerPage;
  const displayedPlenarySpeakers = plenarySpeakers.slice(
    startPlenaryIdx,
    startPlenaryIdx + membersPerPage,
  );

  // Pagination calculations for Speakers.
  const totalSpeakersPages = Math.ceil(speakers.length / membersPerPage);
  const startSpeakersIdx = (currentSpeakersPage - 1) * membersPerPage;
  const displayedSpeakers = speakers.slice(
    startSpeakersIdx,
    startSpeakersIdx + membersPerPage,
  );

  // Handlers for page changes
  const handleKeyNotePageChange = (newPage: number) =>
    setCurrentKeyNotePage(newPage);
  const handlePlenaryPageChange = (newPage: number) =>
    setCurrentPlenaryPage(newPage);
  const handleSpeakersPageChange = (newPage: number) =>
    setCurrentSpeakersPage(newPage);

  // Validate the main speakers text section
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
    plenarySpeakers.length === 0 &&
    speakers.length === 0 &&
    (!speakersExtraSections || speakersExtraSections.length === 0);

  if (hasNoContent) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Speakers Coming Soon!
        </h2>
        <p className="text-gray-500">
          We&apos;re currently finalizing our exciting lineup of speakers.
          Please check back later for updates.
        </p>
      </div>
    );
  }

  const hasAnySpeakers =
    keyNoteSpeakers.length > 0 ||
    plenarySpeakers.length > 0 ||
    speakers.length > 0;

  return (
    <div className="px-4 prose max-w-none lg:px-0">
      {/* Speakers Text Section */}
      {showMainSpeakers && (
        <>
          <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />
          <section className="mt-3 pb-10">
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(mainSpeakersHTML),
              }}
            />
          </section>
        </>
      )}

      {!hasAnySpeakers ? (
        <>
          <section className="mt-3 pb-10">
            <div className="flex flex-col items-center justify-center py-8 bg-gray-50 rounded-lg">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">
                Speaker Lineup Coming Soon!
              </h2>
              <p className="text-gray-600 text-center max-w-2xl">
                We&apos;re in the process of confirming our distinguished
                speakers for this event. Check back soon to discover the
                inspiring voices that will be joining us.
              </p>
            </div>
          </section>
        </>
      ) : (
        <>
          {/* Keynote Speakers Section */}
          {keyNoteSpeakers.length > 0 && (
            <>
              <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />
              <section className="py-10">
                <h1 className="text-2xl font-bold mb-6">Keynote Speakers</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {' '}
                  {displayedKeyNoteSpeakers.map((person: any) => (
                    <MemberCard
                      key={person.id}
                      member={person}
                      btnText="Read Bio"
                      cardClassName="bg-gray-100 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                    />
                  ))}
                </div>
                {totalKeyNotePages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      totalPages={totalKeyNotePages}
                      currentPage={currentKeyNotePage}
                      onPageChange={handleKeyNotePageChange}
                    />
                  </div>
                )}
              </section>
            </>
          )}

          {/* Plenary Speakers Section */}
          {plenarySpeakers.length > 0 && (
            <>
              <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />
              <section className="mt-3 pb-10">
                <h2 className="text-2xl font-bold mb-6">Plenary Speakers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {' '}
                  {displayedPlenarySpeakers.map((person: any) => (
                    <MemberCard
                      key={person.id}
                      member={person}
                      btnText="Read Bio"
                      cardClassName="bg-gray-100 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                    />
                  ))}
                </div>
                {totalPlenaryPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      totalPages={totalPlenaryPages}
                      currentPage={currentPlenaryPage}
                      onPageChange={handlePlenaryPageChange}
                    />
                  </div>
                )}
              </section>
            </>
          )}

          {/* Regular Speakers Section */}
          {speakers.length > 0 && (
            <>
              <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />{' '}
              <section className="mt-3 pb-10">
                <h2 className="text-2xl font-bold mb-6">Speakers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {' '}
                  {displayedSpeakers.map((person: any) => (
                    <MemberCard
                      key={person.id}
                      member={person}
                      btnText="Read Bio"
                      cardClassName="bg-gray-100 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                    />
                  ))}
                </div>
                {totalSpeakersPages > 1 && (
                  <div className="mt-8">
                    <Pagination
                      totalPages={totalSpeakersPages}
                      currentPage={currentSpeakersPage}
                      onPageChange={handleSpeakersPageChange}
                    />
                  </div>
                )}
              </section>
            </>
          )}
        </>
      )}

      {/* Extra Speakers Sections with consistent styling */}
      {speakersExtraSections && speakersExtraSections.length > 0 && (
        <>
          {speakersExtraSections.map((section: any, index: number) => (
            <React.Fragment key={section.id}>
              <section className="py-10">
                <SectionDisplay section={section} />
              </section>
              {index < speakersExtraSections.length - 1 && (
                <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
              )}
            </React.Fragment>
          ))}
        </>
      )}
    </div>
  );
};

export default SpeakersPage;
