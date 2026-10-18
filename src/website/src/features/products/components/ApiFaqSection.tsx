'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

import mainConfig from '@/config/site.config';
import { cn } from '@/lib/utils';

type ApiFaq = {
  question: string;
  answer: string;
};

const API_FAQS: ApiFaq[] = [
  {
    question: 'What counts toward my request limit?',
    answer:
      "Every call to an API endpoint counts as one request toward your plan's monthly allowance, whether it returns real-time, historical, or forecast data.",
  },
  {
    question: 'How do I switch plans?',
    answer:
      'Open your API plan in the AirQo Console and choose the plan you want. Your subscription is updated from the console.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer:
      'You can switch or cancel anytime from the AirQo Console, under your API plan.',
  },
  {
    question: 'Where do I manage API clients and tokens?',
    answer:
      'API clients, access tokens, usage, and plans are all managed in the AirQo Console.',
  },
  {
    question: 'Is pricing monthly in USD?',
    answer:
      'Yes. Every plan is priced monthly in US dollars: the Free plan is $0, Standard is $50/month, and Premium is $150/month.',
  },
];

const ApiFaqSection = () => {
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  const toggleFaq = (question: string) => {
    setOpenFaq((currentOpenFaq) =>
      currentOpenFaq === question ? null : question,
    );
  };

  return (
    <section
      className="bg-slate-50 px-4 py-16"
      aria-labelledby="api-faq-heading"
      id="api-faq"
    >
      <div className={cn(mainConfig.containerClass, 'space-y-8')}>
        <div className="max-w-2xl">
          <h2
            id="api-faq-heading"
            className="text-[32px] leading-tight font-semibold text-gray-900 lg:text-[40px]"
          >
            Frequently asked questions
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            Answers about limits, plans, and access.
          </p>
        </div>

        <div className="w-full space-y-3">
          {API_FAQS.map((faq, index) => {
            const isOpen = openFaq === faq.question;
            const answerId = `api-faq-answer-${index}`;

            return (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-colors hover:border-blue-200"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.question)}
                  aria-expanded={isOpen}
                  aria-controls={answerId}
                  className="flex w-full items-center justify-between gap-4 p-6 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-600"
                >
                  <span className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </span>
                  {isOpen ? (
                    <FiChevronUp
                      className="h-5 w-5 flex-shrink-0 text-blue-700"
                      aria-hidden="true"
                    />
                  ) : (
                    <FiChevronDown
                      className="h-5 w-5 flex-shrink-0 text-gray-500"
                      aria-hidden="true"
                    />
                  )}
                </button>

                <div
                  id={answerId}
                  aria-hidden={!isOpen}
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-6 text-base leading-7 text-gray-700">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ApiFaqSection;
