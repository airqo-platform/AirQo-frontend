'use client';

import DOMPurify from 'dompurify';
import React from 'react';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { isValidHTMLContent } from '@/utils/htmlValidator';
import { renderContent } from '@/utils/quillUtils';
import PaginatedSection from '@/views/cleanairforum/PaginatedSection';
import SectionDisplay from '@/views/Forum/SectionDisplay';

const PartnersPage: React.FC = () => {
  const { selectedEvent } = useForumData();
  if (!selectedEvent) return null;

  const conveningPartners = selectedEvent.partners
    ?.filter((partner: any) => partner.category === 'Co-Convening Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  const hostPartners = selectedEvent.partners
    ?.filter((partner: any) => partner.category === 'Host Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  const programPartners = selectedEvent.partners
    ?.filter((partner: any) => partner.category === 'Program Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  const fundingPartners = selectedEvent.partners
    ?.filter((partner: any) => partner.category === 'Funding Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  const mainPartnersHTML = renderContent(selectedEvent.partners_text_section);
  const showMainPartners = isValidHTMLContent(mainPartnersHTML);

  const partnersSections = selectedEvent.sections?.filter((section: any) => {
    if (!section.pages.includes('partners')) return false;
    const sectionHTML = renderContent(section.content);
    return isValidHTMLContent(sectionHTML);
  });

  return (
    <div className="px-4 prose max-w-none lg:px-0">
      {showMainPartners && (
        <div className="py-4">
          <h1 className="text-2xl font-bold">Partners</h1>
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(mainPartnersHTML),
            }}
          />
        </div>
      )}

      {partnersSections && partnersSections.length > 0 && (
        <>
          {partnersSections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}

      {conveningPartners && conveningPartners.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">
                Convening partners and Collaborators
              </h2>
            </div>
            <PaginatedSection
              noClick={true}
              logos={conveningPartners}
              sectionClassName="grid grid-cols-1 lg:grid-cols-2 w-full"
            />
          </div>
        </>
      )}

      {hostPartners && hostPartners.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">
                Host partners
              </h2>
            </div>
            <PaginatedSection
              noClick={true}
              logos={hostPartners}
              sectionClassName="grid grid-cols-1 lg:grid-cols-2 w-full"
            />
          </div>
        </>
      )}

      {programPartners && programPartners.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">Exhibitors</h2>
            </div>
            <PaginatedSection
              noClick={true}
              logos={programPartners}
              sectionClassName="grid grid-cols-1 lg:grid-cols-2 w-full"
            />
          </div>
        </>
      )}

      {fundingPartners && fundingPartners.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">
                Funding Partners and Sponsors
              </h2>
            </div>
            <PaginatedSection
              noClick={true}
              logos={fundingPartners}
              sectionClassName="grid grid-cols-1 lg:grid-cols-2 w-full"
            />
          </div>
        </>
      )}
    </div>
  );
};

export default PartnersPage;
