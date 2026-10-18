'use client';

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
            Quick answers about request limits, plans, and managing your API
            subscription.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {API_FAQS.map((faq) => (
            <div
              key={faq.question}
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                {faq.question}
              </h3>
              <p className="mt-3 text-base leading-7 text-gray-700">
                {faq.answer}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ApiFaqSection;
