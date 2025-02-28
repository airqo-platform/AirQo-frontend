'use client';

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaFilePdf } from 'react-icons/fa';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';

const getFileNameFromUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== 'string') {
    console.error('Invalid URL:', url);
    return null;
  }
  const segments = url.split('/');
  return segments.pop() || null;
};

const AccordionItem = ({ session, isOpen, toggleAccordion }: any) => {
  return (
    <div className="bg-gray-100 rounded-lg shadow-sm py-2 px-4 mb-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleAccordion}
      >
        <h3 className="text-lg font-semibold text-blue-700">
          {session.session_title}
        </h3>
        <span>{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </div>
      {isOpen && (
        <div className="mt-4">
          {session?.resource_files?.map((file: any) => (
            <div key={file.id} className="mb-4">
              <div className="flex items-start space-x-2 pl-4">
                <div>
                  <p className="text-sm text-gray-900 font-semibold">
                    {file.resource_summary}
                  </p>
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

const ResourcesPage = () => {
  const { selectedEvent } = useForumData();
  const [openAccordions, setOpenAccordions] = useState<{
    [resourceIndex: number]: { [sessionIndex: number]: boolean };
  }>({});
  const [allExpanded, setAllExpanded] = useState(false);

  if (!selectedEvent) {
    return null;
  }

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

  const handleExpandAll = () => {
    setAllExpanded(true);
    const expandedAccordions: any = {};
    selectedEvent.forum_resources?.forEach(
      (resource: any, resourceIndex: number) => {
        expandedAccordions[resourceIndex] = {};
        resource.resource_sessions?.forEach((_: any, sessionIndex: number) => {
          expandedAccordions[resourceIndex][sessionIndex] = true;
        });
      },
    );
    setOpenAccordions(expandedAccordions);
  };

  const handleCollapseAll = () => {
    setAllExpanded(false);
    setOpenAccordions({});
  };

  return (
    <div className="px-4 prose max-w-none lg:px-0">
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

      {selectedEvent.forum_resources?.map(
        (resource: any, resourceIndex: number) => (
          <div key={resource.id} className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {resource.resource_title}
            </h2>
            {resource.resource_sessions?.map(
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
            <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          </div>
        ),
      )}
    </div>
  );
};

export default ResourcesPage;
