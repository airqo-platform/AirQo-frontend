'use client';
import DOMPurify from 'dompurify';
import React from 'react';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { renderContent } from '@/utils/quillUtils';
import PaginatedSection from '@/views/cleanairforum/PaginatedSection';
import SectionDisplay from '@/views/Forum/SectionDisplay';

const Page: React.FC = () => {
  const data = useForumData();
  const defaultMessage = 'No details available yet.';

  if (!data) {
    return null;
  }

  // Filter partner groups by category.
  const conveningPartners = data.partners
    ?.filter((partner: any) => partner.category === 'Co-Convening Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  const hostPartners = data.partners
    ?.filter((partner: any) => partner.category === 'Host Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  const programPartners = data.partners
    ?.filter((partner: any) => partner.category === 'Program Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  const fundingPartners = data.partners
    ?.filter((partner: any) => partner.category === 'Funding Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  // Check the main partners text section.
  const mainPartnersHTML = renderContent(data.partners_text_section);
  const showMainPartners =
    mainPartnersHTML.trim() !== '' &&
    !mainPartnersHTML.includes(defaultMessage);

  // Filter extra sections assigned to the "partners" page.
  const partnersSections = data.sections?.filter((section: any) => {
    if (!section.pages.includes('partners')) return false;
    const sectionHTML = renderContent(section.content);
    return sectionHTML.trim() !== '' && !sectionHTML.includes(defaultMessage);
  });

  return (
    <div className="px-4 lg:px-0 flex flex-col gap-6">
      {/* Partners Text Section */}
      {showMainPartners && (
        <div className="py-4">
          <h2 className="text-2xl font-bold">Partners</h2>
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(mainPartnersHTML),
            }}
          />
        </div>
      )}

      {/* Additional Partners Sections using SectionDisplay */}
      {partnersSections && partnersSections.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          {partnersSections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}

      {/* Convening Partners Section */}
      {conveningPartners && conveningPartners.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div>
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
          </div>
        </>
      )}

      {/* Host Partners Section */}
      {hostPartners && hostPartners.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div>
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
          </div>
        </>
      )}

      {/* Program Partners (Exhibitors) Section */}
      {programPartners && programPartners.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div>
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
          </div>
        </>
      )}

      {/* Funding Partners Section */}
      {fundingPartners && fundingPartners.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          <div>
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
          </div>
        </>
      )}
    </div>
  );
};

export default Page;
