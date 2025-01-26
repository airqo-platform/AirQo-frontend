'use client';
import React, { useMemo, useState } from 'react';

import { Divider, MemberCard, Pagination } from '@/components/ui/';
import { useForumData } from '@/context/ForumDataContext';
import { renderContent } from '@/utils/quillUtils';

const Page: React.FC = () => {
  const data = useForumData();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const membersPerPage = 6;

  // Memoize filtered committee members to avoid recalculations on every render
  const committeeMembers = useMemo(
    () =>
      data?.persons?.filter(
        (person: any) =>
          person.category === 'Committee Member' ||
          person.category === 'Committee Member and Key Note Speaker' ||
          person.category === 'Speaker and Committee Member',
      ),
    [data?.persons],
  );

  // Calculate the total number of pages
  const totalPages = useMemo(
    () => Math?.ceil(committeeMembers?.length / membersPerPage),
    [committeeMembers?.length],
  );

  // Get the members to display for the current page
  const displayedMembers = useMemo(() => {
    const startIdx = (currentPage - 1) * membersPerPage;
    const endIdx = startIdx + membersPerPage;
    return committeeMembers?.slice(startIdx, endIdx);
  }, [currentPage, committeeMembers]);

  if (!data) {
    return null;
  }

  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  return (
    <div className="px-4 lg:px-0 gap-6">
      <Divider className="bg-black p-0 m-0 h-[1px] w-full" />

      <div className="py-4">
        <h2 className="text-2xl font-bold">Program Committee</h2>
        <div
          dangerouslySetInnerHTML={{
            __html: renderContent(data.committee_text_section),
          }}
        />
      </div>

      {/* Member Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 px-4">
        {displayedMembers?.map((person: any) => (
          <MemberCard
            key={person.id}
            member={person}
            btnText="Read Bio"
            cardClassName="bg-gray-100 p-2 rounded-md"
          />
        ))}
      </div>

      {/* Pagination Component: Only show if there are more than one page */}
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
