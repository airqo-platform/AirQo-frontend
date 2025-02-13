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

  // If title is empty, simply render the content.
  if (!section.title.trim()) {
    return (
      <div className="my-8">
        <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
      </div>
    );
  }

  if (section.section_type === 'split') {
    return (
      <>
        <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
        <div className="flex flex-col md:flex-row gap-4 my-8">
          {/* 
              For split sections, we use conditional order classes.
              - If reverse_order is false: title is first (left) and content second (right).
              - If reverse_order is true: content is first (left) and title second (right).
           */}
          <div
            className={`w-full md:w-1/3 ${section.reverse_order ? 'order-2' : 'order-1'}`}
          >
            <h2 className="text-xl font-bold">{section.title}</h2>
          </div>
          <div
            className={`w-full md:w-2/3 text-left space-y-4 ${section.reverse_order ? 'order-1' : 'order-2'}`}
          >
            <div dangerouslySetInnerHTML={{ __html: contentHTML }} />
          </div>
        </div>
      </>
    );
  } else {
    // For "column" type, render the title above the content with a small gap.
    return (
      <div className="my-8">
        <h2 className="text-2xl font-bold">{section.title}</h2>
        <div
          className="mt-2"
          dangerouslySetInnerHTML={{ __html: contentHTML }}
        />
      </div>
    );
  }
};

export default SectionDisplay;
