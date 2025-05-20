'use client';

import DOMPurify from 'dompurify';
import React from 'react';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { isValidHTMLContent } from '@/utils/htmlValidator';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/cleanairforum/SectionDisplay';
import PaginatedSection from '@/views/cleanAirNetwork/PaginatedSection';

const PartnersPage = () => {
  const { selectedEvent } = useForumData();
  if (!selectedEvent) return null;

  const conveningPartners = selectedEvent.partners
    ?.filter((partner: any) => partner.category === 'Co-Convening Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
      link: partner.website_link,
    }));

  const hostPartners = selectedEvent.partners
    ?.filter((partner: any) => partner.category === 'Host Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
      link: partner.website_link,
    }));

  const programPartners = selectedEvent.partners
    ?.filter((partner: any) => partner.category === 'Program Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
      link: partner.website_link,
    }));

  const fundingPartners = selectedEvent.partners
    ?.filter((partner: any) => partner.category === 'Funding Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
      link: partner.website_link,
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
      {(showMainPartners ||
        (partnersSections && partnersSections.length > 0) ||
        (conveningPartners && conveningPartners.length > 0) ||
        (hostPartners && hostPartners.length > 0) ||
        (programPartners && programPartners.length > 0) ||
        (fundingPartners && fundingPartners.length > 0)) && (
        <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />
      )}

      {showMainPartners && (
        <section className="py-8">
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h1 className="text-2xl font-bold text-gray-900">Partners</h1>
            </div>
            <div
              className="md:w-2/3 space-y-4 prose-headings:text-gray-900 prose-p:text-gray-700"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(mainPartnersHTML),
              }}
            />
          </div>
        </section>
      )}

      {partnersSections && partnersSections.length > 0 && (
        <>
          {partnersSections.map((section: any) => (
            <section key={section.id} className="py-8">
              <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />
              <SectionDisplay section={section} />
            </section>
          ))}
        </>
      )}

      {conveningPartners && conveningPartners.length > 0 && (
        <section className="py-8">
          <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">
                Convening partners and Collaborators
              </h2>
            </div>
            <div className="md:w-2/3">
              <PaginatedSection
                noClick={true}
                logos={conveningPartners}
                sectionClassName="grid grid-cols-1 lg:grid-cols-2 w-full"
              />
            </div>
          </div>
        </section>
      )}

      {hostPartners && hostPartners.length > 0 && (
        <section className="py-8">
          <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">
                Host partners
              </h2>
            </div>
            <div className="md:w-2/3">
              <PaginatedSection
                noClick={true}
                logos={hostPartners}
                sectionClassName="grid grid-cols-1 lg:grid-cols-2 w-full"
              />
            </div>
          </div>
        </section>
      )}

      {programPartners && programPartners.length > 0 && (
        <section className="py-8">
          <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">Exhibitors</h2>
            </div>
            <div className="md:w-2/3">
              <PaginatedSection
                noClick={true}
                logos={programPartners}
                sectionClassName="grid grid-cols-1 lg:grid-cols-2 w-full"
              />
            </div>
          </div>
        </section>
      )}

      {fundingPartners && fundingPartners.length > 0 && (
        <section className="py-8">
          <Divider className="bg-black/60 p-0 m-0 h-[1px] w-full" />
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold text-gray-900">
                Funding Partners and Sponsors
              </h2>
            </div>
            <div className="md:w-2/3">
              <PaginatedSection
                noClick={true}
                logos={fundingPartners}
                sectionClassName="grid grid-cols-1 lg:grid-cols-2 w-full"
              />
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default PartnersPage;
