'use client';

import DOMPurify from 'dompurify';
import React from 'react';

import LogoDisplay from '@/components/sections/LogoDisplay';
import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { isValidHTMLContent } from '@/utils/htmlValidator';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/cleanairforum/SectionDisplay';

const SponsorshipPage = () => {
  const { normalizedData } = useForumData();

  if (!normalizedData) return null;

  const { sponsorship, sections } = normalizedData;

  // Get sponsor partners from the normalized data
  const sponsorPartner =
    sponsorship.sponsorPartners?.map((partner: any) => ({
      id: partner.id,
      logoUrl: partner.partner_logo_url,
      link: partner.website_link,
    })) || [];

  // Filter sections for sponsorship page
  const sponsorshipSections =
    sections?.filter((section: any) => {
      if (!section.pages.includes('sponsorships')) return false;
      const html = renderContent(section.content);
      return isValidHTMLContent(html);
    }) || [];

  // Render sponsorship content from different fields
  const aboutHTML = renderContent(sponsorship.sponsorshipAbout || '');
  const scheduleHTML = renderContent(sponsorship.sponsorshipSchedule || '');
  const partnersHTML = renderContent(sponsorship.sponsorshipPartners || '');
  const packagesHTML = renderContent(sponsorship.sponsorshipPackages || '');

  const showAbout = isValidHTMLContent(aboutHTML);
  const showSchedule = isValidHTMLContent(scheduleHTML);
  const showPartners = isValidHTMLContent(partnersHTML);
  const showPackages = isValidHTMLContent(packagesHTML);

  return (
    <div className="w-full">
      <div className="max-w-5xl mx-auto px-4 lg:px-0">
        <div className="prose max-w-none">
          {/* Sponsorship About Section */}
          {showAbout && (
            <>
              <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
              <div className="py-6">
                <h1 className="text-2xl font-bold">About Sponsorship</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(aboutHTML),
                  }}
                />
              </div>
            </>
          )}

          {/* Sponsorship Packages Section */}
          {showPackages && (
            <>
              <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
              <div className="py-6">
                <h1 className="text-2xl font-bold">Sponsorship Packages</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(packagesHTML),
                  }}
                />
              </div>
            </>
          )}

          {/* Sponsorship Schedule Section */}
          {showSchedule && (
            <>
              <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
              <div className="py-6">
                <h1 className="text-2xl font-bold">Sponsorship Schedule</h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(scheduleHTML),
                  }}
                />
              </div>
            </>
          )}

          {/* Sponsorship Partners Section */}
          {showPartners && (
            <>
              <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
              <div className="py-6">
                <h1 className="text-2xl font-bold">
                  Sponsorship Opportunities
                </h1>
                <div
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(partnersHTML),
                  }}
                />
              </div>
            </>
          )}

          {/* Additional Sections */}
          {sponsorshipSections && sponsorshipSections.length > 0 && (
            <>
              {sponsorshipSections.map((section: any) => (
                <SectionDisplay key={section.id} section={section} />
              ))}
            </>
          )}

          {/* Sponsor Partners Display */}
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
                  <LogoDisplay
                    logos={sponsorPartner}
                    sectionClassName="grid grid-cols-1 lg:grid-cols-2 w-full"
                  />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default SponsorshipPage;
