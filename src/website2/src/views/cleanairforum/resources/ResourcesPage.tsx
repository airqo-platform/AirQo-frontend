'use client';

import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp, FaFilePdf } from 'react-icons/fa';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';

interface ResourceFile {
  id: string;
  resource_summary: string;
  file_url: string;
}

interface ResourceSession {
  id: string;
  session_title: string;
  resource_files?: ResourceFile[];
}

interface ForumResource {
  id: string;
  resource_title: string;
  resource_sessions?: ResourceSession[];
}

interface AccordionItemProps {
  session: ResourceSession;
  isOpen: boolean;
  toggleAccordion: () => void;
}

const getFileNameFromUrl = (url: string | null | undefined): string | null => {
  if (!url || typeof url !== 'string') {
    console.error('Invalid URL:', url);
    return null;
  }
  const segments = url.split('/');
  return segments.pop() || null;
};

const AccordionItem: React.FC<AccordionItemProps> = ({
  session,
  isOpen,
  toggleAccordion,
}) => {
  const hasFiles = session.resource_files && session.resource_files.length > 0;

  return (
    <div className="bg-gray-100 rounded-lg shadow-sm py-2 px-4 mb-4 hover:bg-gray-50 transition-colors">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={toggleAccordion}
      >
        <h3 className="text-lg font-semibold text-blue-700">
          {session.session_title}
        </h3>
        <span className="text-gray-600">
          {isOpen ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>
      {isOpen && (
        <div className="mt-4">
          {hasFiles ? (
            session.resource_files?.map((file) => (
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
                      className="text-red-600 flex items-center hover:text-red-700 transition-colors"
                    >
                      <FaFilePdf className="mr-2" />
                      {getFileNameFromUrl(file.file_url)}
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600 italic pl-4">
              No files available for this session
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const ResourcesPage: React.FC = () => {
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
  ): void => {
    setOpenAccordions((prevState) => ({
      ...prevState,
      [resourceIndex]: {
        ...prevState[resourceIndex],
        [sessionIndex]: !prevState[resourceIndex]?.[sessionIndex],
      },
    }));
  };

  const handleExpandAll = (): void => {
    setAllExpanded(true);
    const expandedAccordions: {
      [key: number]: { [key: number]: boolean };
    } = {};

    selectedEvent.forum_resources?.forEach(
      (resource: ForumResource, resourceIndex: number) => {
        expandedAccordions[resourceIndex] = {};
        resource.resource_sessions?.forEach(
          (_session: ResourceSession, sessionIndex: number) => {
            expandedAccordions[resourceIndex][sessionIndex] = true;
          },
        );
      },
    );

    setOpenAccordions(expandedAccordions);
  };

  const handleCollapseAll = (): void => {
    setAllExpanded(false);
    setOpenAccordions({});
  };

  const hasResources =
    selectedEvent.forum_resources && selectedEvent.forum_resources.length > 0;

  return (
    <div className="px-4 prose max-w-none lg:px-0">
      {hasResources ? (
        <>
          <div className="flex justify-end space-x-4 mb-4">
            <button
              onClick={handleExpandAll}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={handleCollapseAll}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
            >
              Collapse All
            </button>
          </div>

          {selectedEvent.forum_resources?.map(
            (resource: ForumResource, resourceIndex: number) => (
              <div key={resource.id} className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {resource.resource_title}
                </h2>
                {resource.resource_sessions?.map(
                  (session: ResourceSession, sessionIndex: number) => (
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
                {resource.resource_sessions?.length ? (
                  <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
                ) : null}
              </div>
            ),
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            No Resources Available
          </h2>
          <p className="text-gray-600">
            Resources for this event will be available soon.
          </p>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;
