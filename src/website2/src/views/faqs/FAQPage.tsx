'use client';

import React from 'react';

import { Accordion, NoData } from '@/components/ui';
import mainConfig from '@/configs/mainConfigs';
import { useFAQs } from '@/hooks/useApiHooks';
import { FAQ } from '@/types';

const FAQPage: React.FC = () => {
  const { data: faqs, isLoading, isError } = useFAQs();

  // Filter active FAQs
  const activeFaqs = faqs.filter((faq: FAQ) => faq.is_active);

  // Skeleton Loader component
  const FAQSkeleton = () => (
    <div className="border-b border-gray-300 mb-4 animate-pulse">
      <div className="flex justify-between items-center py-4">
        <div className="w-3/4 h-6 bg-gray-300 rounded-md"></div>
        <div className="w-5 h-5 bg-gray-300 rounded-md"></div>
      </div>
    </div>
  );

  const renderFAQContent = (answerHtml: string) => {
    return (
      <div
        className="prose prose-sm max-w-none text-gray-600"
        dangerouslySetInnerHTML={{ __html: answerHtml }}
      />
    );
  };

  return (
    <div className="flex flex-col w-full h-full">
      {/* Header Section */}
      <section className="mb-12 bg-[#F2F1F6] px-4 lg:px-0 py-16">
        <div className={`${mainConfig.containerClass} w-full`}>
          <h1 className="text-4xl font-bold mb-2">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600">
            Find answers to common questions about AirQo and our services
          </p>
        </div>
      </section>

      {/* FAQs Section */}
      <section className={`${mainConfig.containerClass} px-4 lg:px-0 mb-16`}>
        {isLoading ? (
          // Display 5 skeletons when loading
          <div className="w-full max-w-4xl mx-auto">
            <FAQSkeleton />
            <FAQSkeleton />
            <FAQSkeleton />
            <FAQSkeleton />
            <FAQSkeleton />
          </div>
        ) : isError ? (
          <NoData message="Failed to load FAQs. Please try again later." />
        ) : activeFaqs.length > 0 ? (
          <div className="w-full max-w-4xl mx-auto">
            {activeFaqs.map((faq: FAQ) => (
              <Accordion key={faq.id} title={faq.question}>
                {renderFAQContent(faq.answer_html)}
              </Accordion>
            ))}
          </div>
        ) : (
          <NoData message="No FAQs available at the moment." />
        )}
      </section>
    </div>
  );
};

export default FAQPage;
