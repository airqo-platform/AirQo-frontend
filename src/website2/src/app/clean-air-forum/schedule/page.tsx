'use client';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

import { Divider } from '@/components/ui';
import { useForumData } from '@/context/ForumDataContext';
import { renderContent } from '@/utils/quillUtils';

const AccordionItem: React.FC<any> = ({
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
          {sessions?.map((item: any, index: any) => (
            <div className="flex flex-col gap-4" key={index}>
              <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />
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

// Page Component that renders Accordion Items
const Page = () => {
  const data = useForumData();

  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const handleToggle = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  if (!data) {
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 lg:px-0 flex flex-col gap-6">
      {/* Schedule Section */}
      <div className="py-4">
        <h2 className="text-2xl font-bold">Schedule</h2>
        <div
          dangerouslySetInnerHTML={{
            __html: renderContent(data?.schedule_details),
          }}
        />
      </div>

      {/* Programs Accordion */}
      {data?.programs?.map((program: any) => (
        <AccordionItem
          key={program.id}
          title={program.title}
          subText={program.sub_text}
          sessions={program.sessions}
          isOpen={openAccordion === program.id}
          onToggle={() => handleToggle(program.id)}
        />
      ))}

      <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />

      {/* Registration Section */}
      <div>
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <h2 className="text-2xl font-bold">Registration</h2>
          </div>
          <div
            className="md:w-2/3 space-y-4"
            dangerouslySetInnerHTML={{
              __html: renderContent(data?.registration_details),
            }}
          />
        </div>
      </div>

      <Divider className="bg-black p-0 m-0 h-[1px] w-full max-w-5xl mx-auto" />

      {/* Sponsorship Section */}
      <div>
        <div className="flex flex-col md:flex-row md:space-x-8">
          <div className="md:w-1/3 mb-4 md:mb-0">
            <h2 className="text-2xl font-bold">Sponsorship opportunities</h2>
          </div>
          <div
            className="md:w-2/3 space-y-4"
            dangerouslySetInnerHTML={{
              __html: renderContent(data?.sponsorship_opportunities_schedule),
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default Page;
