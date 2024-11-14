'use client';
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaFilePdf } from 'react-icons/fa';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';

// Helper function to extract the file name from the URL
const getFileNameFromUrl = (url: string) => {
  return url.split('/').pop();
};

// Accordion Item Component (for each session inside a resource)
const AccordionItem = ({ session, isOpen, toggleAccordion }: any) => {
  return (
    <div className="bg-gray-100 rounded-lg shadow-sm p-4 mb-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleAccordion}
      >
        <h3 className="text-lg font-semibold text-blue-700">
          {session.session_title}
        </h3>

        {/* Toggle Icon */}
        <span>{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </div>

      {/* Accordion Content Section */}
      {isOpen && (
        <div className="mt-4">
          {session.resource_files.map((file: any) => (
            <div key={file.id} className="mb-4">
              <div className="flex items-start space-x-2 pl-4">
                {/* Add indentation */}
                {/* Bullet Point */}
                <span className="text-gray-700">•</span>
                {/* Resource Summary */}
                <div>
                  <p className="text-sm text-gray-900 font-semibold">
                    {file.resource_summary}
                  </p>

                  {/* File Download Link */}
                  <a
                    href={file.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-red-600 flex items-center"
                  >
                    <FaFilePdf className="mr-2" />
                    {getFileNameFromUrl(file.file_url)}
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Page Component
const Page = () => {
  const data = useForumData();
  const [openAccordions, setOpenAccordions] = useState<{
    [resourceIndex: number]: { [sessionIndex: number]: boolean };
  }>({});
  const [allExpanded, setAllExpanded] = useState(false);

  if (!data) {
    return null;
  }

  // Toggle a specific accordion for a specific resource and session
  const handleToggleAccordion = (
    resourceIndex: number,
    sessionIndex: number,
  ) => {
    setOpenAccordions((prevState) => ({
      ...prevState,
      [resourceIndex]: {
        ...prevState[resourceIndex],
        [sessionIndex]: !prevState[resourceIndex]?.[sessionIndex],
      },
    }));
  };

  // Expand all accordions
  const handleExpandAll = () => {
    setAllExpanded(true);
    const expandedAccordions: any = {};
    data.forum_resources.forEach((resource: any, resourceIndex: number) => {
      expandedAccordions[resourceIndex] = {};
      resource.resource_sessions.forEach((_: any, sessionIndex: number) => {
        expandedAccordions[resourceIndex][sessionIndex] = true;
      });
    });
    setOpenAccordions(expandedAccordions);
  };

  // Collapse all accordions
  const handleCollapseAll = () => {
    setAllExpanded(false);
    setOpenAccordions({});
  };

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-0 py-6 gap-6 flex flex-col">
      {/* Buttons for Expand/Collapse All */}
      <div className="flex justify-end space-x-4 mb-4">
        <button
          onClick={handleExpandAll}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Expand All
        </button>
        <button
          onClick={handleCollapseAll}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          Collapse All
        </button>
      </div>

      {data.forum_resources.map((resource: any, resourceIndex: number) => (
        <div key={resource.id} className="mb-8">
          {/* Section Title (Resource Title) */}
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {resource.resource_title}
          </h2>

          {/* Accordion Items for Each Session */}
          {resource.resource_sessions.map(
            (session: any, sessionIndex: number) => (
              <AccordionItem
                key={session.id}
                session={session}
                isOpen={
                  allExpanded ||
                  openAccordions[resourceIndex]?.[sessionIndex] ||
                  false
                }
                toggleAccordion={() =>
                  handleToggleAccordion(resourceIndex, sessionIndex)
                }
              />
            ),
          )}

          <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />
        </div>
      ))}
    </div>
  );
};

export default Page;
