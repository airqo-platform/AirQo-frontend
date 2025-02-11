'use client';
import DOMPurify from 'dompurify';
import React from 'react';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { renderContent } from '@/utils/quillUtils';
import PaginatedSection from '@/views/cleanairforum/PaginatedSection';

const Page = () => {
  const data = useForumData();

  const sponsorPartner = data.partners
    ?.filter((partner: any) => partner.category === 'Sponsor Partner')
    .map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
    }));

  if (!data) {
    return null;
  }

  return (
    <div className="px-4 lg:px-0 flex flex-col gap-6">
      {/* Sponsorship Opportunities Text Section */}
      <div className="py-4">
        <h2 className="text-2xl font-bold">Sponsorship opportunities</h2>

        <div
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(
              renderContent(data.sponsorship_opportunities_partners),
            ),
          }}
        />
      </div>

      {/* Sponsors Section */}
      {sponsorPartner?.length > 0 && (
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

export default Page;
