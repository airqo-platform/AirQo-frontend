'use client';

import DOMPurify from 'dompurify';
import React from 'react';

import { Divider, NoData } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { isValidHTMLContent } from '@/utils/htmlValidator';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/cleanAirForum/SectionDisplay';

type SectionRowProps = {
  title: string;
  children: React.ReactNode;
};

const SectionRow: React.FC<SectionRowProps> = ({ title, children }) => (
  <>
    <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />
    <div className="py-4 flex flex-col md:flex-row items-start transition duration-150 ease-in-out hover:bg-gray-50 rounded">
      <div className="w-full md:w-1/3">
        <h1 className="text-2xl mt-0 pt-0 font-bold"> {title}</h1>
      </div>

      <div className="md:w-2/3 text-left space-y-4">{children}</div>
    </div>
  </>
);

const AboutPage: React.FC = () => {
  const { selectedEvent } = useForumData();

  if (!selectedEvent) {
    return <NoData message="No event found" />;
  }

  // Process Introduction
  const introductionHTML = renderContent(selectedEvent.introduction || '');
  const validIntroduction = isValidHTMLContent(introductionHTML);

  // Process Objectives (if any)
  const objectives = selectedEvent.engagement?.objectives || [];
  // Filter objectives that have valid details.
  const validObjectives = objectives.filter((objective: any) =>
    isValidHTMLContent(objective.details),
  );
  const renderObjectives = () => {
    if (validObjectives.length === 0) return null;
    return (
      <section className="space-y-6">
        <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />
        <h2 className="text-2xl font-bold text-left">Objectives</h2>
        <div className="divide-y divide-gray-200">
          {validObjectives.map((objective: any) => (
            <SectionRow key={objective.id} title={objective.title}>
              {objective.details}
            </SectionRow>
          ))}
        </div>
      </section>
    );
  };

  // Process Sponsorship Opportunities
  const sponsorshipOpportunitiesHTML = renderContent(
    selectedEvent.sponsorship_opportunities_about || '',
  );
  const validSponsorshipOpportunities = isValidHTMLContent(
    sponsorshipOpportunitiesHTML,
  );

  // Process Sponsorship Packages
  const sponsorshipPackagesHTML = renderContent(
    selectedEvent.sponsorship_packages || '',
  );
  const validSponsorshipPackages = isValidHTMLContent(sponsorshipPackagesHTML);

  const aboutSections = selectedEvent.sections?.filter((section: any) => {
    if (!section.pages.includes('about')) return false;
    const sectionHTML = renderContent(section.content);
    return isValidHTMLContent(sectionHTML);
  });

  return (
    <div className="w-full px-6 lg:px-0 bg-white">
      <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />

      <div className="max-w-5xl mx-auto space-y-12 py-8">
        {/* Introduction Section */}
        {validIntroduction && (
          <section className="space-y-6">
            <h2 className="text-2xl font-bold text-left">Introduction</h2>
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(introductionHTML),
              }}
            />
          </section>
        )}

        {/* Objectives Section */}
        {renderObjectives()}

        {/* Sponsorship Opportunities Section */}
        {validSponsorshipOpportunities && (
          <SectionRow title="Sponsorship Opportunities">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(sponsorshipOpportunitiesHTML),
              }}
            />
          </SectionRow>
        )}

        {/* Sponsorship Packages Section */}
        {validSponsorshipPackages && (
          <SectionRow title="Sponsorship Packages">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(sponsorshipPackagesHTML),
              }}
            />
          </SectionRow>
        )}

        {aboutSections && aboutSections.length > 0 && (
          <>
            {aboutSections.map((section: any) => (
              <SectionDisplay key={section.id} section={section} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};

export default AboutPage;
