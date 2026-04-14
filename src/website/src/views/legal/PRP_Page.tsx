'use client';
import React, { useEffect } from 'react';

const PRP_Page = () => {
  useEffect(() => {
    // Add smooth scrolling behavior
    if (typeof window !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }, []);

  const sections = [
    {
      id: 'refund-policy',
      title: '1. Refund Policy',
      content: (
        <p>
          At AirQo, we are dedicated to providing high-quality air quality data
          and analytics services. Please review our Refund Policy carefully.
        </p>
      ),
    },
    {
      id: 'non-refundable',
      title: '2. Non-Refundable Payments',
      content: (
        <>
          <p>
            Payments for AirQo API subscriptions are non-refundable. Once a
            subscription is purchased, the fees are considered final.
          </p>
          <p className="mt-4">
            If you believe there is an error in the billing, you must contact
            AirQo Support within 30 days of the charge. AirQo will review the
            dispute and may provide a refund if the charge is found to be
            incorrect.
          </p>
        </>
      ),
    },
    {
      id: 'pricing-changes',
      title: '3. Changes to the Pricing Models and Rates',
      content: (
        <p>
          AirQo reserves the right to change its pricing and billing rates.
          Users will be notified of any changes, and it is advisable to review
          the pricing information regularly to stay informed about any
          adjustments.
        </p>
      ),
    },
    {
      id: 'customer-satisfaction',
      title: '4. Customer Satisfaction',
      content: (
        <>
          <p>
            AirQo strives to ensure our users are satisfied with our services.
            If for any reason you are unhappy with your experience at AirQo, we
            encourage you to reach out to us.
          </p>
          <h3 className="text-lg font-semibold mt-4">How to Contact Us:</h3>
          <p>
            Please contact us via{' '}
            <a href="mailto:admin@airqo.net">admin@airqo.net</a> or submit a
            request through our contact us form on the website.
          </p>
          <h3 className="text-lg font-semibold mt-4">Feedback:</h3>
          <p>
            Provide us with a detailed account of your experience, including any
            issues you encountered. Our team will work with you to address your
            concerns and ensure you have the best experience possible.
          </p>
        </>
      ),
    },
    {
      id: 'modifications',
      title: '5. Modifications to the Terms',
      content: (
        <p>
          AirQo reserves the right to modify this Refund Policy at any time. Any
          changes will be communicated through our website, and we encourage you
          to review the policy periodically for updates.
        </p>
      ),
    },
    {
      id: 'contact-info',
      title: '6. Contact Information',
      content: (
        <p>
          If you have any questions about these Terms, please contact us at{' '}
          <a href="mailto:info@airqo.net">info@airqo.net</a>.
        </p>
      ),
    },
  ];

  return (
    <div className="w-full flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 bg-blue-50 p-4 lg:sticky top-[124px] h-fit">
        <h2 className="text-xl font-semibold mb-4">Table of Contents</h2>
        <nav className="space-y-2">
          {sections.map((section: any) => (
            <a
              key={section.id}
              href={`#${section.id}`}
              className="text-blue-600 hover:underline block"
            >
              {section.title}
            </a>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="w-full md:w-3/4 p-4">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        {sections.map((section: any) => (
          <section
            key={section.id}
            id={section.id}
            className="mb-8 scroll-mt-[150px]"
          >
            <h2 className="text-2xl font-semibold mb-4">{section.title}</h2>
            <div className="text-justify space-y-2">{section.content}</div>
          </section>
        ))}
      </main>
    </div>
  );
};

export default PRP_Page;
