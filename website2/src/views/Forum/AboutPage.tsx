'use client';
import React from 'react';

import { Divider, NoData } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { renderContent } from '@/utils/quillUtils';

// Reusable component for a two-column row with a bold title on the left.
type SectionRowProps = {
  title: string;
  children: React.ReactNode;
};

const SectionRow: React.FC<SectionRowProps> = ({ title, children }) => (
  <div className="py-4 flex flex-col md:flex-row items-start transition duration-150 ease-in-out hover:bg-gray-50 rounded">
    <div className="md:w-1/3 mb-2 md:mb-0 text-left text-xl font-bold">
      {title}
    </div>
    <div className="md:w-2/3 text-left space-y-4">{children}</div>
  </div>
);

const AboutPage = () => {
  const data = useForumData();

  if (!data || !data.introduction) {
    return <NoData />;
  }

  // Objectives Section: Render each objective as a SectionRow
  const renderObjectives = () => {
    const objectives = data?.engagement?.objectives || [];
    return (
      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-left">Objectives</h2>
        <div className="divide-y divide-gray-200">
          {objectives.map((objective: any) => (
            <SectionRow key={objective.id} title={objective.title}>
              {objective.details}
            </SectionRow>
          ))}
        </div>
      </section>
    );
  };

  return (
    <div className="w-full px-6 lg:px-0 bg-white">
      <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />

      {/* Main Content */}
      <div className="max-w-5xl mx-auto space-y-12 py-8">
        {/* Introduction Section (kept out of the redesign) */}
        <section className="space-y-6">
          <h2 className="text-2xl font-bold text-left">Introduction</h2>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: renderContent(data.introduction),
            }}
          />
        </section>

        {/* Objectives Section */}
        {renderObjectives()}

        <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />

        {/* Sponsorship Opportunities Section */}
        <SectionRow title="Sponsorship Opportunities">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: renderContent(
                data?.sponsorship_opportunities_about || '',
              ),
            }}
          />
        </SectionRow>

        <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />

        {/* Sponsorship Packages Section */}
        <SectionRow title="Sponsorship Packages">
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{
              __html: renderContent(data?.sponsorship_packages || ''),
            }}
          />
        </SectionRow>
      </div>
    </div>
  );
};

export default AboutPage;
