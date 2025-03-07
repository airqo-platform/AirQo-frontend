'use client';
import React, { useEffect } from 'react';

const PP_Page = () => {
  useEffect(() => {
    // Add smooth scrolling behavior
    if (typeof window !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }, []);

  const sections = [
    {
      id: 'intro',
      title: 'Introduction',
      content: (
        <>
          <p>
            This Privacy Policy describes our policies and procedures on the
            collection, use and disclosure of information in connection with the
            use of all services provided by AirQo. We &quot;AirQo&quot; are
            committed to respecting and protecting your privacy and ensuring
            responsible use of the information that we collect.
          </p>
          <p>
            We build a range of products and services to help individuals and
            decision makers access timely air quality information and help drive
            action to mitigate and reduce air pollution in cities and other
            spaces. Our products and services include, without limitation, air
            quality sensing technologies, digital air quality platforms and
            tools, web and mobile apps for accessing, understanding and
            interpreting air quality.
          </p>
        </>
      ),
    },
    {
      id: 'collect',
      title: 'Information we collect and how we use it',
      content: (
        <>
          <p>
            When you use our services, we may collect information to help us
            improve and customize our products to better meet the needs of our
            users. We may collect this information explicitly or automatically
            using available third-party tools. AirQo is committed to ensuring
            the responsible use of the information that we collect.
          </p>
          <p>
            This policy was developed to help you understand the information we
            collect and the measures we put in place to ensure privacy.
          </p>
          <p>
            When you sign up to use our air quality digital platforms including
            mobile and website apps and platform analytics, we ask you to
            provide certain information such as name, phone number, email
            address and password. The information collected is used to set up
            and manage the user&apos;s account on our digital platforms. We use
            contact information such as phone and email to communicate with you.
          </p>
          <p>
            When you agree to be a host of air quality monitoring devices, we
            may collect personal information such as name and phone number.
            Additionally, we may also collect metadata including photos’
            demographic and description of the site as well as geolocation
            information. We use this information to support the maintenance and
            management of the air quality network. Our air quality monitoring
            devices collect location information which helps us to associate air
            quality measurements with specific locations.
          </p>
          <p>
            We may also collect data through voluntary surveys to understand
            user experiences and inform improvements. We may commission studies
            and surveys to collect data to help us understand users&apos;
            perceptions and behavior on air quality management. We use this
            information to help link air quality information to action and
            policies to help improve air quality. We also use this data to
            measure our impact. We aggregate the information from surveys to
            remove any personal identifying data.
          </p>
          <p>
            When you use our digital tools including website, web and
            mobile-based apps, we may collect information on your interaction
            with our services. We may use Third party tools such as Google
            Analytics, iOS and Android analytics. This information helps us to
            understand usage patterns and inform refinements and improvements of
            our products.
          </p>
          <p>
            Our products and services may collect technical logs to support the
            troubleshooting of errors or bugs in our products. For example,
            understanding the devices where our app crashes can help us fix bugs
            and improve performance resulting in a better user experience.
          </p>
        </>
      ),
    },
    {
      id: 'cookies',
      title: 'Cookies',
      content: (
        <>
          <p>
            We use cookies on websites and web-based platforms. First, let us
            define what a cookie is. A &quot;cookie&quot; is a small data file
            that can be placed on your computing device when you visit certain
            websites. We may use cookies to collect, store, and sometimes track
            information for authentication and session management. We may use
            cookies for statistical purposes to help us better operate and
            improve our services.
          </p>
          <p>
            We may use a cookie to save your personal settings and to provide
            customizable and personalized services. If you are concerned about
            cookies, you may change your browser&apos;s settings to reject all
            cookies. Just keep in mind that some of our services rely on cookies
            to function properly so rejecting them may affect their operations.
          </p>
        </>
      ),
    },
    {
      id: 'retention',
      title: 'Retention of your personal data',
      content: (
        <>
          <p>
            We will retain your personal data only for as long as is necessary
            for the purposes set out in this Privacy Policy. We will retain and
            use your personal data to the extent necessary to comply with our
            legal obligations (for example, if we are required to retain your
            data to comply with applicable laws), resolve disputes, and enforce
            our legal agreements and policies.
          </p>
          <p>
            We will also retain usage data for internal analysis purposes. Usage
            Data is generally retained for a shorter period of time, except when
            this data is used to strengthen the security or to improve the
            functionality of our services, or we are legally obligated to retain
            this data for longer time periods.
          </p>
        </>
      ),
    },
    {
      id: 'security',
      title: 'Security of your personal data',
      content: (
        <p>
          The security of your personal data is important to us, but remember
          that no method of transmission over the Internet, or method of
          electronic storage is 100% secure. While we strive to use industry
          acceptable means to protect your personal data, we cannot guarantee
          its absolute security.
        </p>
      ),
    },
    {
      id: 'children',
      title: "Children's Privacy",
      content: (
        <>
          <p>
            Our services do not address anyone under the age of 13. We do not
            knowingly collect personally identifiable information from anyone
            under the age of 13. If you are a parent or guardian and you are
            aware that your child has provided us with personal data, please
            contact us.
          </p>
          <p>
            If we become aware that we have collected personal data from anyone
            under the age of 13 without verification of parental consent, We
            take steps to remove that information from our storage systems.
          </p>
        </>
      ),
    },
    {
      id: 'external',
      title: 'Links to external services',
      content: (
        <p>
          Our services may contain links to external services that we do not
          operate. If you click on a third-party link, you will be directed to
          that third party&apos;s service. We advise you to review the Privacy
          Policy of every external link that you visit. We have no control over
          and assume no responsibility for the content, privacy policies, or
          practices of any third party sites or services.
        </p>
      ),
    },
    {
      id: 'changes',
      title: 'Changes to this Privacy Policy',
      content: (
        <p>
          We may change this Privacy Policy from time to time. When we do, we
          will post the changes to the Privacy Policy on this page. You are
          advised to review this Privacy Policy periodically for any changes.
          Changes to this Privacy Policy are effective when they are posted on
          this page or platform.
        </p>
      ),
    },
    {
      id: 'consent',
      title: 'Your consent',
      content: (
        <p>
          By using our services, you agree to the collection and use of the
          information in accordance with this Privacy Policy.
        </p>
      ),
    },
    {
      id: 'contact',
      title: 'Contact us',
      content: (
        <p>
          If you have any questions about this Privacy Policy, You can contact
          our designated Data Protection Officer through:{' '}
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
        <h1 className="text-3xl font-bold mb-6">AirQo Privacy Policy</h1>
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

export default PP_Page;
