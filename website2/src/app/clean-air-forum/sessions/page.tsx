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
    <div className="bg-gray-100 rounded-lg shadow-sm p-4 mb-4">
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

const Page: React.FC = () => {
  const data = useForumData();
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  if (!data) {
    return null;
  }

  // Render and validate schedule_details.
  const scheduleHTML = renderContent(data.schedule_details);
  const showSchedule = isValidHTMLContent(scheduleHTML);

  // Render and validate registration_details.
  const registrationHTML = renderContent(data.registration_details);
  const showRegistration = isValidHTMLContent(registrationHTML);

  // Filter extra sections assigned to the "session" page and validate content.
  const sessionSections = data?.sections?.filter((section: any) => {
    if (!section.pages.includes('session')) return false;
    const sectionHTML = renderContent(section.content);
    return isValidHTMLContent(sectionHTML);
  });

  const handleToggle = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  return (
    <div className="px-4 lg:px-0 flex flex-col gap-6">
      {/* Schedule Section */}
      {showSchedule && (
        <div className="py-4">
          <h2 className="text-2xl font-bold">Schedule</h2>
          <div
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(scheduleHTML),
            }}
          />
        </div>
      )}

      {/* Extra Session Sections using SectionDisplay */}
      {sessionSections && sessionSections.length > 0 && (
        <>
          <Divider className="bg-black p-0 m-0 h-[1px] w-full" />
          {sessionSections.map((section: any) => (
            <SectionDisplay key={section.id} section={section} />
          ))}
        </>
      )}

      {/* Programs Accordion */}
      <>
        {data.programs?.map((program: any) => (
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

      {/* Registration Section */}
      {showRegistration && (
        <div>
          <Divider className="bg-black p-0 mb-4 h-[1px] w-full" />
          <div className="flex flex-col md:flex-row md:space-x-8">
            <div className="md:w-1/3 mb-4 md:mb-0">
              <h2 className="text-2xl font-bold">Registration</h2>
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

export default Page;
