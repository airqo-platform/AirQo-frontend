'use client';
import React, { useEffect } from 'react';

const AirQoDataPage = () => {
  useEffect(() => {
    // Add smooth scrolling behavior
    if (typeof window !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }, []);

  const sections = [
    {
      id: 'intro',
      title: '1. Introduction',
      content: (
        <p>
          Welcome to AirQo! These Terms of Service (&quot;Terms&quot;) govern
          your access to and use of the data and services provided by AirQo. By
          accessing or using our data, or by purchasing and using AirQo devices,
          you agree to be bound by these Terms. If you do not agree to these
          Terms, you must not use our services or data.
        </p>
      ),
    },
    {
      id: 'license',
      title: '2. License for General Data Use',
      content: (
        <>
          <p>
            The data provided by AirQo is licensed under the Creative Commons{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Attribution 4.0 International License (CC BY 4.0)
            </a>
            . This means that you are free to:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Share</strong>: Copy and redistribute the material in any
              medium or format.
            </li>
            <li>
              <strong>Adapt</strong>: Remix, transform, and build upon the
              material.
            </li>
          </ul>
          <p className="mt-4">
            However, the above freedoms are subject to the following terms:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Attribution</strong>: You must give appropriate credit,
              provide a link to the license, and indicate if changes were made.
              You may do so in any reasonable manner, but not in any way that
              suggests the licensor endorses you or your use unless explicitly
              agreed in writing.
            </li>
            <li>
              <strong>Non-Commercial</strong>: You may not use the data for
              commercial purposes without obtaining prior written permission
              from AirQo.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'device-ownership',
      title: '3. Device Ownership and Data Rights',
      content: (
        <>
          <h3 className="text-xl font-semibold mt-4 mb-2">
            3.1 Data Co-Ownership
          </h3>
          <p>
            If you purchase an AirQo device, you retain co-ownership of the data
            generated by that device. As a co-owner, you have the right to:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Access</strong>: Retrieve and use the raw data generated
              by your AirQo device for personal purposes.
            </li>
            <li>
              <strong>Share</strong>: Distribute the data as you see fit,
              subject to these Terms.
            </li>
          </ul>
          <h3 className="text-xl font-semibold mt-4 mb-2">
            3.2 License Granted to AirQo
          </h3>
          <p>
            By using an AirQo device, you grant AirQo a non-exclusive,
            irrevocable, transferable, sub-licensable, royalty-free, worldwide
            license to:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Host, use, and distribute</strong> the data generated by
              your device.
            </li>
            <li>
              <strong>Modify and run</strong> the data for purposes such as
              analytics, research, and improvement of services.
            </li>
            <li>
              <strong>
                Copy, display, translate, and create derivative works
              </strong>{' '}
              based on the data.
            </li>
            <li>
              <strong>Publish</strong> the data in aggregate, anonymized form,
              ensuring that it cannot be traced back to any individual or
              specific device.
            </li>
          </ul>
          <p className="mt-4">
            This license allows AirQo to use the data to further our mission of
            improving air quality monitoring and research while maintaining your
            rights as a data co-owner.
          </p>
        </>
      ),
    },
    {
      id: 'rate-limiting',
      title: '4. Rate Limiting and Fair Use',
      content: (
        <>
          <p>
            To ensure equitable access to AirQo&apos;s data and to prevent
            misuse, the following rate limits are in place:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Fair Use</strong>: AirQo data is provided for the benefit
              of all users. Excessive or malicious use that disrupts service
              availability for others is prohibited. We reserve the right to
              monitor usage and take appropriate action, including limiting or
              terminating access to users who do not comply with these Terms.
            </li>
            <li>
              <strong>Request Limits</strong>: AirQo may implement variable rate
              limits on API requests based on factors such as server load,
              number of API requests, number of sites and network regions, the
              nature of your usage, and overall demand for the service. These
              limits are designed to ensure fair access for all users. Exceeding
              the applicable limit may result in temporary or permanent
              suspension of your access to the API.
            </li>
            <li>
              <strong>Non-Commercial</strong>: You may not use the data for
              commercial purposes without obtaining prior written permission
              from AirQo.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'restrictions',
      title: '5. Restrictions',
      content: (
        <>
          <p>
            While the data is openly licensed, the following restrictions apply:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>No Endorsement</strong>: You may not imply that AirQo
              endorses your use of the data or any derivative works.
            </li>
            <li>
              <strong>No Misuse</strong>: You may not use the data in any way
              that is illegal, harmful, or violates the rights of others.
            </li>
            <li>
              <strong>No Automated Data Scraping</strong>: Use of automated
              tools to scrape data at a rate exceeding the allowed limits is
              strictly prohibited.
            </li>
            <li>
              <strong>No Commercial Use</strong>: You may not use the data for
              commercial purposes without obtaining prior written permission
              from AirQo. This includes but is not limited to selling the data,
              using it in commercial products, or incorporating it into services
              that you charge for.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'disclaimer',
      title: '6. Disclaimer of Warranties',
      content: (
        <p>
          AirQo provides the data &quot;as is&quot; without any warranties of
          any kind, either express or implied. AirQo does not guarantee the
          accuracy, completeness, or availability of the data at all times.
        </p>
      ),
    },
    {
      id: 'liability',
      title: '7. Limitation of Liability',
      content: (
        <p>
          To the fullest extent permitted by law, AirQo shall not be liable for
          any damages, losses, or liabilities arising from your use of the data,
          including but not limited to direct, indirect, incidental, punitive,
          and consequential damages.
        </p>
      ),
    },
    {
      id: 'modifications',
      title: '8. Modifications to the Terms',
      content: (
        <p>
          AirQo reserves the right to modify these Terms at any time. Any
          changes will be effective immediately upon posting on our website.
          Your continued use of the data following the posting of changes
          constitutes your acceptance of those changes.
        </p>
      ),
    },
    {
      id: 'contact',
      title: '9. Contact Information',
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
        <h1 className="text-3xl font-bold mb-6">AirQo Data Terms of Service</h1>
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

export default AirQoDataPage;
