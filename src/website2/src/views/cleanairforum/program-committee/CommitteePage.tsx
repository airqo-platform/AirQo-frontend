/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import DOMPurify from 'dompurify';
import React, { useMemo, useState } from 'react';

import { Divider, MemberCard, Pagination } from '@/components/ui/';
import { useForumData } from '@/context/ForumDataContext';
import { isValidHTMLContent } from '@/utils/htmlValidator';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/cleanairforum/SectionDisplay';

const CommitteePage = () => {
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
        person.category === 'Speaker and Committee Member' ||
        person.category === 'Plenary and Committee Member',
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
      {/* Program Committee Text Section */}
      {showCommitteeMain && (
        <>
          <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />
          <section className="py-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Program Committee
            </h2>
            <div
              className="prose-headings:text-gray-900 prose-p:text-gray-700"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(committeeHTML),
              }}
            />
          </section>
        </>
      )}

      {/* Extra Committee Sections using SectionDisplay */}
      {committeeSections.length > 0 && (
        <>
          <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />
          {committeeSections.map((section: any) => (
            <section key={section.id} className="py-10">
              <SectionDisplay section={section} />
            </section>
          ))}
        </>
      )}

      {/* Member Cards Grid */}
      {committeeMembers.length > 0 && (
        <>
          <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />
          <section className="py-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {displayedMembers.map((person: any) => (
                <MemberCard
                  key={person.id}
                  member={person}
                  btnText="Read Bio"
                  cardClassName="bg-gray-100 p-4 rounded-md shadow-sm hover:shadow-md transition-shadow duration-200"
                />
              ))}
            </div>
            {/* Pagination Component */}
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  totalPages={totalPages}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default CommitteePage;
