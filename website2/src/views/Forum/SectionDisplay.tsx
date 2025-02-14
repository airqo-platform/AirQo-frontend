'use client';
import DOMPurify from 'dompurify';
import React from 'react';

import Divider from '@/components/ui/Divider';
import { renderContent } from '@/utils/quillUtils';

export interface SectionData {
  id: number;
  title: string;
  content: string;
  section_type: 'split' | 'column';
  reverse_order: boolean;
}

/**
 * Renders a section based on its type.
 *
 * - For a "split" section:
 *   - If reverse_order is false, the title appears on the left and the content on the right.
 *   - If reverse_order is true, the content appears on the left and the title on the right.
 * - For a "column" section, the title is rendered above the content.
 *   If the title is empty, only the content is displayed.
 */
const SectionDisplay: React.FC<{ section: SectionData }> = ({ section }) => {
  const contentHTML = DOMPurify.sanitize(renderContent(section.content));

  // If title is empty, just show the content in full width.
  if (!section.title.trim()) {
    return (
      <div className="my-8 prose max-w-none">
        {/* We apply prose + max-w-none here */}
        <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
      </div>
    );
  }

  // "split" type: side-by-side layout
  if (section.section_type === 'split') {
    return (
      <>
        <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
        {/* We remove .prose from this parent so it doesn't impose its max-width */}
        <div className="flex flex-col md:flex-row prose max-w-none gap-4 my-8">
          {/* Title column (left or right) */}
          <div
            className={`w-full md:w-1/3 ${
              section.reverse_order ? 'order-2' : 'order-1'
            }`}
          >
            <h2 className="text-xl font-bold">{section.title}</h2>
          </div>

          {/* Content column (left or right, with .prose max-w-none) */}
          <div
            className={`${
              section.reverse_order ? 'order-1' : 'order-2'
            } w-full md:w-2/3 text-left space-y-4`}
          >
            <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
          </div>
        </div>
      </>
    );
  }

  // "column" type: title above content
  return (
    <div className="my-8 prose max-w-none">
      <h2 className="text-2xl font-bold">{section.title}</h2>
      {/* .prose plus .max-w-none so it fills width */}
      <div className="mt-2" dangerouslySetInnerHTML={{ __html: contentHTML }} />
    </div>
  );
};

export default SectionDisplay;
