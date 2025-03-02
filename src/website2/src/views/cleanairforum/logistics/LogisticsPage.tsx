'use client';

import DOMPurify from 'dompurify';
import React from 'react';

import Loading from '@/components/loading';
import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { isValidHTMLContent } from '@/utils/htmlValidator';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/cleanairforum/SectionDisplay';

const LogisticsPage = () => {
  // Destructure the selected event from the context.
  const { selectedEvent } = useForumData();

  // If selectedEvent is not available, show a loading state.
  if (!selectedEvent) {
    return <Loading />;
  }

  // Render static content from the event model.
  const vaccinationHTML = renderContent(
    selectedEvent.travel_logistics_vaccination_details,
  );
  const visaHTML = renderContent(selectedEvent.travel_logistics_visa_details);

  const showVaccination = isValidHTMLContent(vaccinationHTML);
  const showVisa = isValidHTMLContent(visaHTML);

  // Filter extra sections assigned to the "logistics" page.
  const logisticsSections = selectedEvent.sections?.filter(
    (section: any) =>
      section.pages.includes('logistics') &&
      isValidHTMLContent(renderContent(section.content)),
  );

  return (
    <div className="px-4 prose max-w-none lg:px-0">
      {/* Render Vaccination Section if content exists */}
      {showVaccination && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:space-x-8">
              <div className="md:w-1/3 mb-4 md:mb-0">
                <h1 className="text-2xl mt-4 font-bold text-gray-900">
                  Vaccination
                </h1>
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

      {/* Render Visa Invitation Letter Section if content exists */}
      {showVisa && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div className="py-6">
            <div className="flex flex-col md:flex-row md:space-x-8">
              <div className="md:w-1/3 mb-4 md:mb-0">
                <h1 className="text-2xl mt-4 font-bold text-gray-900">
                  Visa invitation letter
                </h1>
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

      {/* Render additional Logistics Sections, if any */}
      {logisticsSections && logisticsSections.length > 0 && (
        <>
          {logisticsSections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}
    </div>
  );
};

export default LogisticsPage;
