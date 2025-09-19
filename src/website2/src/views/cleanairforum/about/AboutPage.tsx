'use client';

import DOMPurify from 'dompurify';
import React from 'react';

import { Divider, ForumLoading } from '@/components/ui';
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
  const { normalizedData } = useForumData();

  if (!normalizedData) {
    logger.warn('No normalizedData found in AboutPage', {
      component: 'AboutPage',
      context: 'ForumDataContext',
    });
    return <ForumLoading message="Loading Clean Air Forum information..." />;
  }

  try {
    const { about, sections } = normalizedData;

    // Process Introduction
    const introductionHTML = renderContent(about.introduction || '');
    const validIntroduction = isValidHTMLContent(introductionHTML);

    // Process Registration Details
    const registrationHTML = renderContent(about.registrationDetails || '');
    const validRegistration = isValidHTMLContent(registrationHTML);

    // Process Travel Logistics
    const vaccinationHTML = renderContent(
      about.travelDetails.vaccination || '',
    );
    const visaHTML = renderContent(about.travelDetails.visa || '');
    const accommodationHTML = renderContent(
      about.travelDetails.accommodation || '',
    );

    const hasVaccination = isValidHTMLContent(vaccinationHTML);
    const hasVisa = isValidHTMLContent(visaHTML);
    const hasAccommodation = isValidHTMLContent(accommodationHTML);

    // Filter sections for about page
    const aboutSections =
      sections?.filter((section: any) => {
        if (!section.pages.includes('about')) return false;
        const html = renderContent(section.content);
        return isValidHTMLContent(html);
      }) || [];

    return (
      <div className="px-4 prose max-w-none lg:px-0">
        {/* Introduction Section */}
        {validIntroduction && (
          <SectionRow title="Introduction">
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(introductionHTML),
              }}
            />
          </SectionRow>
        )}

        {/* Registration Section */}
        {validRegistration && (
          <SectionRow title="Registration">
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(registrationHTML),
              }}
            />
          </SectionRow>
        )}

        {/* Travel Logistics Section */}
        {(hasVaccination || hasVisa || hasAccommodation) && (
          <SectionRow title="Travel & Logistics">
            <div className="space-y-4">
              {hasVaccination && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Vaccination</h3>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(vaccinationHTML),
                    }}
                  />
                </div>
              )}
              {hasVisa && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Visa</h3>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(visaHTML),
                    }}
                  />
                </div>
              )}
              {hasAccommodation && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Accommodation</h3>
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(accommodationHTML),
                    }}
                  />
                </div>
              )}
            </div>
          </SectionRow>
        )}

        {/* Additional Sections */}
        {aboutSections.length > 0 && (
          <div>
            {aboutSections.map((section, index) => (
              <SectionDisplay key={section.id || index} section={section} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!validIntroduction &&
          !validRegistration &&
          !hasVaccination &&
          !hasVisa &&
          !hasAccommodation &&
          aboutSections.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No information available for this forum event.
              </p>
            </div>
          )}
      </div>
    );
  } catch (error) {
    logger.error('Error rendering AboutPage', error as Error, {
      component: 'AboutPage',
    });

    return (
      <div className="text-center py-12">
        <p className="text-red-500">
          Error loading forum information. Please try again later.
        </p>
      </div>
    );
  }
};

export default AboutPage;
