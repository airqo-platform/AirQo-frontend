'use client';
import DOMPurify from 'dompurify';
import React from 'react';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { renderContent } from '@/utils/quillUtils';

const Page = () => {
  const data = useForumData();

  if (!data) {
    return null;
  }
  return (
    <div className="px-4 lg:px-0 flex flex-col gap-6">
      <Divider className="bg-black p-0 m-0 h-[1px] w-full" />

      {/* Split Section - Vaccination */}
      <div>
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-900">Vaccination</h2>
          </div>
          <div
            className="md:w-2/3 space-y-4"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                renderContent(data.travel_logistics_vaccination_details),
              ),
            }}
          ></div>
        </div>
      </div>

      <Divider className="bg-black p-0 m-0 h-[1px] w-full" />

      {/* Split Section - Vaccination */}
      <div>
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <h2 className="text-2xl font-bold text-gray-900">
              Visa invitation letter
            </h2>
          </div>
          <div
            className="md:w-2/3 space-y-4"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(
                renderContent(data.travel_logistics_visa_details),
              ),
            }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default Page;
