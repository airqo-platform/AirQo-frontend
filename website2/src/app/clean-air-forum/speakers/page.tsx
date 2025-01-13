'use client';
import React, { useState } from 'react';

import { Divider, MemberCard, Pagination } from '@/components/ui/';
import { useForumData } from '@/context/ForumDataContext';
import { renderContent } from '@/utils/quillUtils';

const Page = () => {
  const data = useForumData();
  const membersPerPage = 6;

  // Separate pagination states for Keynote Speakers and Speakers
  const [currentKeyNotePage, setCurrentKeyNotePage] = useState(1);
  const [currentSpeakersPage, setCurrentSpeakersPage] = useState(1);

  if (!data) {
    return null;
  }

  // Filter keynote speakers and speakers
  const KeyNoteSpeakers = data.persons.filter(
    (person: any) =>
      person.category === 'Key Note Speaker' ||
      person.category === 'Committee Member and Key Note Speaker',
  );

  const Speakers = data.persons.filter(
    (person: any) =>
      person.category === 'Speaker' ||
      person.category === 'Speaker and Committee Member',
  );

  // Pagination calculations for keynote speakers
  const totalKeyNotePages = Math.ceil(KeyNoteSpeakers.length / membersPerPage);
  const startKeyNoteIdx = (currentKeyNotePage - 1) * membersPerPage;
  const endKeyNoteIdx = startKeyNoteIdx + membersPerPage;
  const displayedKeyNoteSpeakers = KeyNoteSpeakers.slice(
    startKeyNoteIdx,
    endKeyNoteIdx,
  );

  // Pagination calculations for speakers
  const totalSpeakersPages = Math.ceil(Speakers.length / membersPerPage);
  const startSpeakersIdx = (currentSpeakersPage - 1) * membersPerPage;
  const endSpeakersIdx = startSpeakersIdx + membersPerPage;
  const displayedSpeakers = Speakers.slice(startSpeakersIdx, endSpeakersIdx);

  // Handle page changes
  const handleKeyNotePageChange = (newPage: number) => {
    setCurrentKeyNotePage(newPage);
  };

  const handleSpeakersPageChange = (newPage: number) => {
    setCurrentSpeakersPage(newPage);
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col px-4 lg:px-0 gap-6">
      <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />

      <div className="py-4">
        <div
          dangerouslySetInnerHTML={{
            __html: renderContent(data.speakers_text_section),
          }}
        />
      </div>

      {/* Keynote Speakers Section */}
      <h2 className="text-2xl font-bold">Keynote Speakers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
        {displayedKeyNoteSpeakers?.map((person: any) => (
          <MemberCard
            key={person.id}
            member={person}
            btnText="Read Bio"
            cardClassName="bg-gray-100 p-2 rounded-md"
          />
        ))}
      </div>

      {/* Pagination for Keynote Speakers */}
      {totalKeyNotePages > 1 && (
        <div className="py-6">
          <Pagination
            totalPages={totalKeyNotePages}
            currentPage={currentKeyNotePage}
            onPageChange={handleKeyNotePageChange}
          />
        </div>
      )}

      <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />

      {/* Speakers Section */}
      <h2 className="text-2xl font-bold">Speakers</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto px-4">
        {displayedSpeakers?.map((person: any) => (
          <MemberCard
            key={person.id}
            member={person}
            btnText="Read Bio"
            cardClassName="bg-gray-100 p-2 rounded-md"
          />
        ))}
      </div>

      {/* Pagination for Speakers */}
      {totalSpeakersPages > 1 && (
        <div className="py-6">
          <Pagination
            totalPages={totalSpeakersPages}
            currentPage={currentSpeakersPage}
            onPageChange={handleSpeakersPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default Page;
