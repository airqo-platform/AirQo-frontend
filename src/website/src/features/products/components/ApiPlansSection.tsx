'use client';

import { FiCheck } from 'react-icons/fi';

import { API_CONSOLE_SUBSCRIPTION_URL } from '@/config/console.config';
import mainConfig from '@/config/site.config';
import { getExternalLinkProps } from '@/lib/security/safeExternalLink';
import { cn } from '@/lib/utils';

type ApiPlan = {
  name: string;
  price: string;
  allowance: string;
  features: string[];
  ctaLabel: string;
  href: string;
  highlighted?: boolean;
  badge?: string;
};

const API_PLANS: ApiPlan[] = [
  {
    name: 'Free',
    price: '$0',
    allowance: 'Up to 10,000 requests per month',
    features: [
      'Calibrated measurements from the past 7 days',
      'Filter by site, device, cohort, or grid',
      'Spatial heatmaps',
      'Community support',
    ],
    ctaLabel: 'Choose Free',
    href: API_CONSOLE_SUBSCRIPTION_URL,
  },
  {
    name: 'Standard',
    price: '$50/month',
    allowance: 'Up to 50,000 requests per month',
    features: [
      'Everything in Free',
      'Up to one year of historical data',
      'Raw sensor data and daily aggregates',
      'Paginated bulk data export',
      'Email support',
    ],
    ctaLabel: 'Choose Standard',
    href: API_CONSOLE_SUBSCRIPTION_URL,
    highlighted: true,
    badge: 'Most popular',
  },
  {
    name: 'Premium',
    price: '$150/month',
    allowance: 'Up to 200,000 requests per month',
    features: [
      'Everything in Standard',
      'Seven-day hourly and daily forecasts',
      'Health recommendations with forecast context',
      'Priority API access and higher limits',
      'Priority support',
    ],
    ctaLabel: 'Choose Premium',
    href: API_CONSOLE_SUBSCRIPTION_URL,
  },
];

const ApiPlansSection = () => {
  return (
    <section
      className="bg-white px-4 py-16"
      aria-labelledby="api-plans-heading"
      id="api-plans"
    >
      <div className={cn(mainConfig.containerClass, 'space-y-10')}>
        <div className="max-w-2xl">
          <h2
            id="api-plans-heading"
            className="text-[32px] leading-tight font-semibold text-gray-900 lg:text-[40px]"
          >
            Choose your API plan
          </h2>
          <p className="mt-4 text-lg text-gray-700">
            Start free, then scale request volume and data access as your
            product grows.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {API_PLANS.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex h-full flex-col rounded-xl bg-white p-6 shadow-sm',
                plan.highlighted
                  ? 'border-2 border-blue-700 shadow-lg ring-1 ring-blue-700/20'
                  : 'border border-slate-200',
              )}
            >
              {plan.badge ? (
                <span className="absolute -top-3 left-6 rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                  {plan.badge}
                </span>
              ) : null}

              <h3 className="text-xl font-semibold text-gray-900">
                {plan.name}
              </h3>
              <p className="mt-4 text-4xl font-bold text-gray-900">
                {plan.price}
              </p>
              <p className="mt-2 text-sm font-semibold text-blue-700">
                {plan.allowance}
              </p>

              <ul className="mt-6 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="flex items-start gap-3 text-sm leading-6 text-gray-700"
                  >
                    <FiCheck
                      className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-700"
                      aria-hidden="true"
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8">
                <a
                  href={plan.href}
                  {...getExternalLinkProps(plan.href)}
                  className={cn(
                    'inline-flex w-full items-center justify-center px-6 py-4 text-sm font-medium shadow-none transition-transform duration-300 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2',
                    plan.highlighted
                      ? 'bg-blue-700 text-white hover:bg-blue-800'
                      : 'border border-gray-300 bg-transparent text-gray-800 hover:bg-gray-100',
                  )}
                >
                  {plan.ctaLabel}
                </a>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-600">
          Manage or cancel your plan anytime in the AirQo Console.
        </p>
      </div>
    </section>
  );
};

export default ApiPlansSection;
