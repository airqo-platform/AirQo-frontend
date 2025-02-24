/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import DOMPurify from 'dompurify';
import React, { useMemo, useState } from 'react';

import { Divider, MemberCard, Pagination } from '@/components/ui/';
import { useForumData } from '@/context/ForumDataContext';
import { isValidHTMLContent } from '@/utils/htmlValidator';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/Forum/SectionDisplay';

const CommitteePage: React.FC = () => {
  // Always call useForumData to get the selectedEvent.
  const { selectedEvent } = useForumData();

  // Instead of conditionally calling hooks based on selectedEvent,
  // extract fallback values unconditionally.
  const persons = selectedEvent?.persons || [];
  const sections = selectedEvent?.sections || [];
  const committeeText = selectedEvent?.committee_text_section || '';

  // Local state for pagination.
  const [currentPage, setCurrentPage] = useState<number>(1);
  const membersPerPage = 6;

  // Memoize committee members using a fallback empty array.
  const committeeMembers = useMemo(() => {
    return persons.filter(
      (person: any) =>
        person.category === 'Committee Member' ||
        person.category === 'Committee Member and Key Note Speaker' ||
        person.category === 'Speaker and Committee Member',
    );
  }, [persons]);

  // Calculate total pages.
  const totalPages = useMemo(() => {
    return Math.ceil(committeeMembers.length / membersPerPage);
  }, [committeeMembers, membersPerPage]);

  // Get members for the current page.
  const displayedMembers = useMemo(() => {
    const startIdx = (currentPage - 1) * membersPerPage;
    return committeeMembers.slice(startIdx, startIdx + membersPerPage);
  }, [currentPage, committeeMembers, membersPerPage]);

  // Render main committee text.
  const committeeHTML = renderContent(committeeText);
  const showCommitteeMain = isValidHTMLContent(committeeHTML);

  // Filter extra sections assigned to the "committee" page.
  const committeeSections = useMemo(() => {
    return sections.filter((section: any) => {
      if (!section.pages.includes('committee')) return false;
      const sectionHTML = renderContent(section.content);
      return isValidHTMLContent(sectionHTML);
    });
  }, [sections]);

  const handlePageChange = (newPage: number) => setCurrentPage(newPage);

  // If selectedEvent is still not available, you might render a loading indicator.
  if (!selectedEvent) {
    return null;
  }

  return (
    <div className="px-4 prose max-w-none lg:px-0">
      <Divider className="bg-black p-0 m-0 h-[1px] w-full" />

      {/* Program Committee Text Section */}
      <div>
        {showCommitteeMain && (
          <>
            <h2 className="text-2xl font-bold">Program Committee</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(committeeHTML),
              }}
            />
          </>
        )}
      </div>

      {/* Extra Committee Sections using SectionDisplay */}
      {committeeSections.length > 0 && (
        <>
          {committeeSections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4 py-6">
        {displayedMembers.map((person: any) => (
          <MemberCard
            key={person.id}
            member={person}
            btnText="Read Bio"
            cardClassName="bg-gray-100 p-2 rounded-md"
          />
        ))}
      </div>

      {/* Pagination Component */}
      {totalPages > 1 && (
        <div className="py-6">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
};

export default CommitteePage;
