'use client';
import DOMPurify from 'dompurify';
import React from 'react';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { isValidHTMLContent } from '@/utils/htmlValidator';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/Forum/SectionDisplay';

const LogisticsPage = () => {
  const data = useForumData();

  if (!data) {
    return null;
  }

  // Render static content from the event model.
  const vaccinationHTML = renderContent(
    data.travel_logistics_vaccination_details,
  );
  const visaHTML = renderContent(data.travel_logistics_visa_details);

  const showVaccination = isValidHTMLContent(vaccinationHTML);
  const showVisa = isValidHTMLContent(visaHTML);

  // Filter extra sections assigned to the "logistics" page.
  const logisticsSections = data.sections?.filter(
    (section: any) =>
      section.pages.includes('logistics') &&
      isValidHTMLContent(renderContent(section.content)),
  );

  return (
    <div className="px-4 prose max-w-none lg:px-0">
      {/* Render static Vaccination Section if content exists */}
      {showVaccination && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />

          <div className="py-6">
            <div className="flex flex-col md:flex-row md:space-x-8">
              <div className="md:w-1/3 mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-900">
                  Vaccination
                </h2>
              </div>
              <div
                className="md:w-2/3 space-y-4"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(vaccinationHTML),
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Render static Visa Invitation Letter Section if content exists */}
      {showVisa && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:space-x-8">
              <div className="md:w-1/3 mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-900">
                  Visa invitation letter
                </h2>
              </div>
              <div
                className="md:w-2/3 space-y-4"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(visaHTML),
                }}
              />
            </div>
          </div>
        </>
      )}

      {/* Render additional section data for Logistics using SectionDisplay */}
      {logisticsSections && logisticsSections.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          {logisticsSections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}
    </div>
  );
};

export default LogisticsPage;
