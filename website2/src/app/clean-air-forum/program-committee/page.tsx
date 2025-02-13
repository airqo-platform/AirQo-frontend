'use client';
import DOMPurify from 'dompurify';
import React, { useMemo, useState } from 'react';

import { Divider, MemberCard, Pagination } from '@/components/ui/';
import { useForumData } from '@/context/ForumDataContext';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/Forum/SectionDisplay';

const Page: React.FC = () => {
  const data = useForumData();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const membersPerPage = 6;
  const defaultMessage = 'No details available yet.';

  // Memoize committee members.
  const committeeMembers = useMemo(
    () =>
      data?.persons?.filter(
        (person: any) =>
          person.category === 'Committee Member' ||
          person.category === 'Committee Member and Key Note Speaker' ||
          person.category === 'Speaker and Committee Member',
      ) || [],
    [data?.persons],
  );

  // Calculate total pages.
  const totalPages = useMemo(
    () => Math.ceil(committeeMembers.length / membersPerPage),
    [committeeMembers.length],
  );

  // Get members for the current page.
  const displayedMembers = useMemo(() => {
    const startIdx = (currentPage - 1) * membersPerPage;
    const endIdx = startIdx + membersPerPage;
    return committeeMembers.slice(startIdx, endIdx);
  }, [currentPage, committeeMembers]);

  // Render main committee text.
  const committeeHTML = renderContent(data?.committee_text_section || '');
  const showCommitteeMain =
    committeeHTML.trim() !== '' && !committeeHTML.includes(defaultMessage);

  // Filter extra sections assigned to the "committee" page.
  const committeeSections = useMemo(() => {
    return (
      data?.sections?.filter((section: any) => {
        if (!section.pages.includes('committee')) return false;
        const sectionHTML = renderContent(section.content);
        return (
          sectionHTML.trim() !== '' && !sectionHTML.includes(defaultMessage)
        );
      }) || []
    );
  }, [data?.sections]);

  if (!data) {
    return null;
  }

  const handlePageChange = (newPage: number) => setCurrentPage(newPage);

  return (
    <div className="px-4 lg:px-0 flex flex-col gap-6">
      <Divider className="bg-black p-0 m-0 h-[1px] w-full" />

      {/* Program Committee Text Section */}
      <div className="py-4">
        <h2 className="text-2xl font-bold">Program Committee</h2>
        {showCommitteeMain && (
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(committeeHTML),
            }}
          />
        )}
      </div>

      {/* Extra Committee Sections using SectionDisplay */}
      {committeeSections.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          {committeeSections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}

      {/* Member Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
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

export default Page;
