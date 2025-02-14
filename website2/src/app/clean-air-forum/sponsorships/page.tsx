'use client';
import DOMPurify from 'dompurify';
import React from 'react';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { isValidHTMLContent } from '@/utils/htmlValidator';
import { renderContent } from '@/utils/quillUtils';
import PaginatedSection from '@/views/cleanairforum/PaginatedSection';
import SectionDisplay from '@/views/Forum/SectionDisplay';

const SponsorshipPage = () => {
  const data = useForumData();

  if (!data) {
    return null;
  }

  // Prepare Sponsor Partner data for the sponsors section.
  const sponsorPartner = data.partners
    ?.filter((partner: any) => partner.category === 'Sponsor Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  // Filter sections that have the "sponsorships" page and meaningful content.
  const sponsorshipSections = data.sections?.filter((section: any) => {
    if (!section.pages.includes('sponsorships')) return false;
    const html = renderContent(section.content);
    return isValidHTMLContent(html);
  });

  // Check main text section.
  const mainSponsorshipHTML = renderContent(
    data.sponsorship_opportunities_partners,
  );
  const showMainSponsorship = isValidHTMLContent(mainSponsorshipHTML);

  return (
    <div className="px-4 prose max-w-none lg:px-0">
      {/* Sponsorship Opportunities Text Section */}
      {showMainSponsorship && (
        <div>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div>
            <h2 className="text-2xl font-bold">Sponsorship opportunities</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(mainSponsorshipHTML),
              }}
            />
          </div>
        </div>
      )}

      {/* Additional Section Data for Sponsorship Page */}
      {sponsorshipSections && sponsorshipSections.length > 0 && (
        <>
          {sponsorshipSections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}

      {/* Sponsors Section */}
      {sponsorPartner && sponsorPartner.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div>
            <div className="flex flex-col md:flex-row md:space-x-8">
              <div className="md:w-1/3 mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-900">Sponsors</h2>
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
