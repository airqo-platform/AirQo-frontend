'use client';

import DOMPurify from 'dompurify';
import React from 'react';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/cleanAirForum/SectionDisplay';
import PaginatedSection from '@/views/cleanAirNetwork/PaginatedSection';

const SponsorshipPage: React.FC = () => {
  const { selectedEvent } = useForumData();
  if (!selectedEvent) return null;

  const sponsorPartner = selectedEvent.partners
    ?.filter((partner: any) => partner.category === 'Sponsor Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  const sponsorshipSections = selectedEvent.sections?.filter((section: any) => {
    if (!section.pages.includes('sponsorships')) return false;
    const html = renderContent(section.content);
    return html.trim().length > 0;
  });

  const mainSponsorshipHTML = renderContent(
    selectedEvent.sponsorship_opportunities_partners,
  );
  const showMainSponsorship = mainSponsorshipHTML.trim().length > 0;

  return (
    <div className="px-4 prose max-w-none lg:px-0">
      {showMainSponsorship && (
        <div>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div className="py-6">
            <h1 className="text-2xl font-bold">Sponsorship opportunities</h1>

            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(mainSponsorshipHTML),
              }}
            />
          </div>
        </div>
      )}

      {sponsorshipSections && sponsorshipSections.length > 0 && (
        <>
          {sponsorshipSections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}

      {sponsorPartner && sponsorPartner.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div>
            <div className="flex flex-col md:flex-row md:space-x-8 py-6">
              <div className="md:w-1/3 mb-4 md:mb-0">
                <h1 className="text-2xl mt-0 font-bold text-gray-900">
                  Sponsors
                </h1>
              </div>
              <PaginatedSection
                noClick={true}
                logos={sponsorPartner}
                sectionClassName="grid grid-cols-1 lg:grid-cols-2 w-full"
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SponsorshipPage;
