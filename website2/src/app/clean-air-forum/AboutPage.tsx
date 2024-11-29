'use client';
import React from 'react';

import { Divider, NoData } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { renderContent } from '@/utils/quillUtils';

const AboutPage = () => {
  const data = useForumData();

  if (!data || !data.introduction) {
    return <NoData />;
  }

  // Render the objectives list
  const renderObjectives = () => (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold text-gray-900">
        {data?.engagements?.title || 'Objectives'}
      </h2>
      <div>
        {data?.engagements?.objectives?.map((objective: any, index: number) => (
          <p key={index}>{objective.details || ''}</p>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full px-6 lg:px-0 bg-white">
      <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto space-y-12 py-8">
        {/* Introduction */}
        <div
          dangerouslySetInnerHTML={{
            __html: renderContent(data.introduction),
          }}
        />

        {/* Objectives Section */}
        {renderObjectives()}

        <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />

        {/* Split Section - Sponsorship Opportunities */}
        <div>
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">
                Sponsorship Opportunities
              </h2>
            </div>
            <div
              className="md:w-2/3"
              dangerouslySetInnerHTML={{
                __html: renderContent(
                  data?.sponsorship_opportunities_about || '',
                ),
              }}
            />
          </div>
        </div>

        <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />

        {/* Split Section - Sponsorship Packages */}
        <div>
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">
                Sponsorship Packages
              </h2>
            </div>
            <div
              className="md:w-2/3 space-y-4"
              dangerouslySetInnerHTML={{
                __html: renderContent(data?.sponsorship_packages || ''),
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
