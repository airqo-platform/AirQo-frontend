import React, { useState, useEffect } from 'react';

const Section = ({ id, title, content }) => (
  <div id={id} className="section">
    <h2>{title}</h2>
    <div className="content">{content}</div>
  </div>
);

const Sidebar = ({ sections, activeSection, setActiveSection }) => (
  <div className="sidebar">
    <nav>
      {sections.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          className={activeSection === section.id ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            setActiveSection(section.id);
            document.getElementById(section.id).scrollIntoView({ behavior: 'smooth' });
          }}>
          {section.title}
        </a>
      ))}
    </nav>
  </div>
);

const AirQo_Payments = () => {
  const [activeSection, setActiveSection] = useState('refund-policy');

  const sections = [
    {
      id: 'refund-policy',
      title: '1. Refund Policy',
      content: (
        <p>
          At AirQo, we are dedicated to providing high-quality air quality data and analytics
          services. Please review our Refund Policy carefully.
        </p>
      )
    },
    {
      id: 'non-refundable',
      title: '2. Non-Refundable Payments',
      content: (
        <>
          <p>
            Payments for AirQo API subscriptions are non-refundable. Once a subscription is
            purchased, the fees are considered final.
          </p>
          <p className="mt-4">
            If you believe there is an error in the billing, you must contact AirQo Support within
            30 days of the charge. AirQo will review the dispute and may provide a refund if the
            charge is found to be incorrect.
          </p>
        </>
      )
    },
    {
      id: 'pricing-changes',
      title: '3. Changes to the Pricing Models and Rates',
      content: (
        <p>
          AirQo reserves the right to change its pricing and billing rates. Users will be notified
          of any changes, and it is advisable to review the pricing information regularly to stay
          informed about any adjustments.
        </p>
      )
    },
    {
      id: 'customer-satisfaction',
      title: '4. Customer Satisfaction',
      content: (
        <>
          <p>
            AirQo strives to ensure our users are satisfied with our services. If for any reason you
            are unhappy with your experience at AirQo, we encourage you to reach out to us.
          </p>
          <h3 className="text-lg font-semibold mt-4">How to Contact Us:</h3>
          <p>
            Please contact us via <a href="mailto:admin@airqo.net">admin@airqo.net</a> or submit a
            request through our contact us form on the website.
          </p>
          <h3 className="text-lg font-semibold mt-4">Feedback:</h3>
          <p>
            Provide us with a detailed account of your experience, including any issues you
            encountered. Our team will work with you to address your concerns and ensure you have
            the best experience possible.
          </p>
        </>
      )
    },
    {
      id: 'modifications',
      title: '5. Modifications to the Terms',
      content: (
        <p>
          AirQo reserves the right to modify this Refund Policy at any time. Any changes will be
          communicated through our website, and we encourage you to review the policy periodically
          for updates.
        </p>
      )
    },
    {
      id: 'contact-info',
      title: '6. Contact Information',
      content: (
        <p>
          If you have any questions about these Terms, please contact us at{' '}
          <a href="mailto:info@airqo.net">info@airqo.net</a>.
        </p>
      )
    }
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (!sections || sections.length === 0) return;

      const sectionElements = sections
        .map((section) => document.getElementById(section.id))
        .filter((element) => element !== null); // Filter out null elements

      if (sectionElements.length === 0) return;

      const currentSection = sectionElements.find((element) => {
        const rect = element.getBoundingClientRect();
        return rect.top <= 100 && rect.bottom > 100;
      });

      if (currentSection && currentSection.id !== activeSection) {
        setActiveSection(currentSection.id);
      }
    };

    window.addEventListener('scroll', handleScroll);

    // Clean up event listener on component unmount
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [sections, activeSection]);

  return (
    <div className="airqo-data">
      <div className="container">
        <div className="content-wrapper">
          <Sidebar
            sections={sections}
            activeSection={activeSection}
            setActiveSection={setActiveSection}
          />
          <div className="main-content">
            <h1>AirQo Payment Terms</h1>

            {sections.map((section) => (
              <Section key={section.id} {...section} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AirQo_Payments;
