'use client';
import React from 'react';

import PaginatedSection from '@/components/sections/CleanAir/PaginatedSection';
import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { renderContent } from '@/utils/quillUtils';

const Page = () => {
  const data = useForumData();

  if (!data) {
    return null;
  }

  // Filter Co-Convening Partners
  const conveningPartners = data.partners
    ?.filter((partner: any) => partner.category === 'Co-Convening Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  // Filter Host Partners
  const hostPartners = data.partners
    ?.filter((partner: any) => partner.category === 'Host Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  const sponsorPartner = data.partners
    ?.filter((partner: any) => partner.category === 'Sponsor Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  // Filter Funding Partners (if available)
  const fundingPartners = data.partners
    ?.filter((partner: any) => partner.category === 'Funding Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-0 flex flex-col gap-6">
      <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />

      {/* Partners Text Section */}
      <div className="py-4">
        <h2 className="text-2xl font-bold">Partners</h2>
        <div
          dangerouslySetInnerHTML={{
            __html: renderContent(data.partners_text_section),
          }}
        />
      </div>

      {/* Sponsorship Opportunities Text Section */}
      <div className="py-4">
        <h2 className="text-2xl font-bold">Sponsorship opportunities</h2>
        <div
          dangerouslySetInnerHTML={{
            __html: renderContent(data.sponsorship_opportunities_partners),
          }}
        />
      </div>

      {/* Convening Partners Section */}
      {conveningPartners?.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />
          <div>
            <div className="flex flex-col md:flex-row md:space-x-8">
              <div className="md:w-1/3 mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-900">
                  Convening partners
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
      {hostPartners?.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />
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

      {/* Sponsors Section */}
      {sponsorPartner?.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />
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

      {/* Funding Partners Section */}
      {fundingPartners?.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />
          <div>
            <div className="flex flex-col md:flex-row md:space-x-8">
              <div className="md:w-1/3 mb-4 md:mb-0">
                <h2 className="text-2xl font-bold text-gray-900">
                  Funding partners
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
