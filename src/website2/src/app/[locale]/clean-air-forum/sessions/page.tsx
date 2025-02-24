'use client';

import { format } from 'date-fns';
import DOMPurify from 'dompurify';
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { isValidHTMLContent } from '@/utils/htmlValidator';
import { renderContent } from '@/utils/quillUtils';
import SectionDisplay from '@/views/Forum/SectionDisplay';

interface AccordionItemProps {
  title: string;
  subText: string;
  sessions: any[];
  isOpen: boolean;
  onToggle: () => void;
}

const AccordionItem: React.FC<AccordionItemProps> = ({
  title,
  subText,
  sessions,
  isOpen,
  onToggle,
}) => {
  const formatTime = (time: string) => {
    try {
      return format(new Date(`1970-01-01T${time}Z`), 'p');
    } catch (error) {
      console.error(error);
      return time;
    }
  };

  return (
    <div className="bg-gray-100 rounded-lg shadow-sm py-2 px-4 mb-4">
      <div
        className="flex justify-between items-center cursor-pointer"
        onClick={onToggle}
      >
        <div>
          <h2 className="text-lg font-bold">{title}</h2>
          <div
            className="text-sm text-gray-600"
            dangerouslySetInnerHTML={{ __html: renderContent(subText) }}
          />
        </div>
        <span>{isOpen ? <FaChevronUp /> : <FaChevronDown />}</span>
      </div>
      {isOpen && (
        <div className="mt-4 pt-4">
          {sessions?.map((item: any, index: number) => (
            <div className="flex flex-col gap-4" key={index}>
              <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
              <div className="grid grid-cols-12 gap-4 mb-4">
                <div className="col-span-2 text-sm font-semibold">
                  {formatTime(item.start_time)}
                </div>
                <div className="col-span-10">
                  <h3 className="font-bold">{item.session_title}</h3>
                  <div
                    className="text-sm"
                    dangerouslySetInnerHTML={{
                      __html: renderContent(item.session_details),
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ProgramsPage: React.FC = () => {
  const { selectedEvent } = useForumData();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  if (!selectedEvent) {
    return null;
  }

  const scheduleHTML = renderContent(selectedEvent.schedule_details);
  const showSchedule = isValidHTMLContent(scheduleHTML);

  const registrationHTML = renderContent(selectedEvent.registration_details);
  const showRegistration = isValidHTMLContent(registrationHTML);

  const sessionSections = selectedEvent.sections?.filter((section: any) => {
    if (!section.pages.includes('session')) return false;
    const sectionHTML = renderContent(section.content);
    return isValidHTMLContent(sectionHTML);
  });

  const handleToggle = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="px-4 prose max-w-none lg:px-0">
      {showSchedule && (
        <div className="py-4">
          <h1 className="text-2xl font-bold">Schedule</h1>
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(scheduleHTML),
            }}
          />
        </div>
      )}

      {sessionSections && sessionSections.length > 0 && (
        <>
          {sessionSections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}

      <>
        {selectedEvent.programs?.map((program: any) => (
          <AccordionItem
            key={program.id}
            title={program.title}
            subText={program.sub_text}
            sessions={program.sessions}
            isOpen={openAccordion === program.id}
            onToggle={() => handleToggle(program.id)}
          />
        ))}
      </>

      {showRegistration && (
        <div>
          <Divider className="bg-black p-0 mb-4 h-[1px] w-full" />
          <div className="flex flex-col md:flex-row md:space-x-8 py-6">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h1 className="text-2xl mt-4 pt-0 font-bold">Registration</h1>
            </div>
            <div
              className="md:w-2/3 space-y-4"
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(registrationHTML),
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProgramsPage;
