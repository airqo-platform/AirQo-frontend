'use client';

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

  // Check if we have any content at all
  const hasNoContent =
    !showVaccination &&
    !showVisa &&
    (!logisticsSections || logisticsSections.length === 0);

  if (hasNoContent) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">
          Logistics Information Coming Soon
        </h2>
        <p className="text-gray-500 text-center max-w-2xl">
          We&apos;re currently finalizing the logistics details for this event.
          Please check back later for updates.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 prose max-w-none lg:px-0">
      {/* Render additional Logistics Sections, if any */}
      {logisticsSections && logisticsSections.length > 0 && (
        <>
          {logisticsSections.map((section: any) => (
            <React.Fragment key={section.id}>
              <section className="py-8">
                <SectionDisplay section={section} />
              </section>
            </React.Fragment>
          ))}
        </>
      )}

      {/* Final divider */}
      <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
    </div>
  );
};

export default LogisticsPage;
