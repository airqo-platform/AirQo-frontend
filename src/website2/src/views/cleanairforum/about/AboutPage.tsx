'use client';

import DOMPurify from 'dompurify';
import React from 'react';

import { Divider, ForumLoading, NoData } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { isValidHTMLContent } from '@/utils/htmlValidator';
import logger from '@/utils/logger';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/cleanairforum/SectionDisplay';

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

const AboutPage = () => {
  const { selectedEvent } = useForumData();

  // Log only when there's an issue with missing event data
  React.useEffect(() => {
    if (!selectedEvent) {
      logger.warn('Clean Air Forum About page: No event data available', {
        eventId: null,
        hasEvent: false,
        component: 'AboutPage',
      });
    }
  }, [selectedEvent]);

  if (!selectedEvent) {
    // Log missing event data
    logger.warn('No selectedEvent found in AboutPage', {
      component: 'AboutPage',
      context: 'ForumDataContext',
    });
    return <ForumLoading message="Loading Clean Air Forum information..." />;
  }

  try {
    // Process Introduction with error handling
    const introductionHTML = renderContent(selectedEvent.introduction || '');
    const validIntroduction = isValidHTMLContent(introductionHTML);

    // Process Objectives (if any) with error handling
    const objectives = selectedEvent.engagement?.objectives || [];
    const validObjectives = objectives.filter((objective: any) => {
      try {
        return isValidHTMLContent(objective.details);
      } catch (error) {
        logger.error('Error processing objective details', error as Error, {
          objectiveId: objective.id,
          objectiveTitle: objective.title,
        });
        return false;
      }
    });

    const renderObjectives = () => {
      if (validObjectives.length === 0) return null;
      return (
        <section className="space-y-6">
          <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />
          <h2 className="text-2xl font-bold text-left">Objectives</h2>
          <div className="divide-y divide-gray-200">
            {validObjectives.map((objective: any) => (
              <SectionRow key={objective.id} title={objective.title}>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(objective.details),
                  }}
                />
              </SectionRow>
            ))}
          </div>
        </section>
      );
    };

    // Process Sponsorship Opportunities with error handling
    const sponsorshipOpportunitiesHTML = renderContent(
      selectedEvent.sponsorship_opportunities_about || '',
    );
    const validSponsorshipOpportunities = isValidHTMLContent(
      sponsorshipOpportunitiesHTML,
    );

    // Process Sponsorship Packages with error handling
    const sponsorshipPackagesHTML = renderContent(
      selectedEvent.sponsorship_packages || '',
    );
    const validSponsorshipPackages = isValidHTMLContent(
      sponsorshipPackagesHTML,
    );

    // Process About Sections with error handling
    const aboutSections = selectedEvent.sections?.filter((section: any) => {
      try {
        if (!section.pages.includes('about')) return false;
        const sectionHTML = renderContent(section.content);
        return isValidHTMLContent(sectionHTML);
      } catch (error) {
        logger.error('Error processing about section', error as Error, {
          sectionId: section.id,
          sectionTitle: section.title,
        });
        return false;
      }
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

          {/* Dynamic About Sections */}
          {aboutSections && aboutSections.length > 0 && (
            <>
              {aboutSections.map((section: any) => (
                <SectionDisplay key={section.id} section={section} />
              ))}
            </>
          )}

          {/* No Content Fallback */}
          {!validIntroduction &&
            validObjectives.length === 0 &&
            !validSponsorshipOpportunities &&
            !validSponsorshipPackages &&
            (!aboutSections || aboutSections.length === 0) && (
              <NoData message="No about information available for this event." />
            )}
        </div>
      </div>
    );
  } catch (error) {
    // Log any unexpected errors in the component
    logger.error('Unexpected error in AboutPage component', error as Error, {
      component: 'AboutPage',
      eventId: selectedEvent?.id,
      eventTitle: selectedEvent?.title,
    });

    return (
      <div className="w-full px-6 lg:px-0 bg-white">
        <div className="max-w-5xl mx-auto py-8">
          <NoData message="Error loading about information. Please try again later." />
        </div>
      </div>
    );
  }
};

export default AboutPage;
