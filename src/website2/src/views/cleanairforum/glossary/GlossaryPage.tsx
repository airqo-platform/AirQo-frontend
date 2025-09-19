'use client';

import DOMPurify from 'dompurify';
import React from 'react';

import Loading from '@/components/loading';
import { Divider } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useForumData } from '@/context/ForumDataContext';
import { isValidGlossaryContent } from '@/utils/glossaryValidator';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/cleanairforum/SectionDisplay';

const GlossaryPage = () => {
  // Access data from the context.
  const { normalizedData } = useForumData();

  // If not available, show a loading state.
  if (!normalizedData) {
    return <Loading />;
  }

  const { glossary, sections } = normalizedData;

  // Render the main glossary content using the normalized data.
  const glossaryHTML = renderContent(glossary.glossaryDetails || '');
  const showGlossaryMain = isValidGlossaryContent(glossaryHTML);

  const glossarySections =
    sections?.filter((section: any) => {
      if (!section.pages.includes('glossary')) return false;
      const html = renderContent(section.content);
      return html.trim().length > 0;
    }) || [];

  return (
    <div className={`${mainConfig.containerClass} px-4 lg:px-0`}>
      <div className="prose max-w-none flex flex-col gap-6">
        <Divider className="bg-black p-0 m-0 h-[1px] w-full" />

        {/* Clean Air Glossary Section */}
        {showGlossaryMain && (
          <>
            <div className="flex flex-col py-6 md:flex-row md:space-x-8">
              {/* Left column: Heading */}
              <div className="md:w-1/3 mb-4 md:mb-0">
                <h1 className="text-2xl mt-4 font-bold text-gray-900">
                  Clean Air Glossary
                </h1>
              </div>
              {/* Right column: Glossary content */}
              <div
                className="md:w-2/3"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(glossaryHTML),
                }}
              ></div>
            </div>
          </>
        )}

        {/* Additional Glossary Sections (if any) */}
        {glossarySections && glossarySections.length > 0 && (
          <>
            {glossarySections.map((section: any) => (
              <SectionDisplay key={section.id} section={section} />
            ))}
          </>
        )}
      </div>
    </div>
  );
};
export default GlossaryPage;
