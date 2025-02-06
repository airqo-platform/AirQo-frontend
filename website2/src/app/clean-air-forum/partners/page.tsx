'use client';
import React from 'react';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { renderContent } from '@/utils/quillUtils';
import PaginatedSection from '@/views/cleanairforum/PaginatedSection';

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

  // Filter Funding Partners (if available)
  const fundingPartners = data.partners
    ?.filter((partner: any) => partner.category === 'Funding Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  return (
    <div className="px-4 lg:px-0 flex flex-col gap-6">
      {/* Partners Text Section */}
      <div className="py-4">
        <h2 className="text-2xl font-bold">Partners</h2>
        <div
          dangerouslySetInnerHTML={{
            __html: renderContent(data.partners_text_section),
          }}
        />
      </div>

      {/* Convening Partners Section */}
      {conveningPartners?.length > 0 && (
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
      {hostPartners?.length > 0 && (
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

      {/* Funding Partners Section */}
      {fundingPartners?.length > 0 && (
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
