'use client';
import React, { useEffect } from 'react';

const storageItems = [
  {
    category: 'Strictly Necessary',
    key: 'next-auth.session-token',
    purpose: 'Maintains your secure session and keeps you logged in.',
    duration: 'Session',
  },
  {
    category: 'Functional',
    key: 'LAST_ACTIVE_MODULE',
    purpose: 'Remembers which part of the platform you were last using.',
    duration: 'Persistent',
  },
  {
    category: 'Functional',
    key: 'LAST_ACTIVE_GROUP_ID',
    purpose: 'Remembers your selected organization or group context.',
    duration: 'Persistent',
  },
  {
    category: 'Performance',
    key: 'react-query',
    purpose: 'Stores recently viewed data locally so pages load instantly.',
    duration: 'Persistent',
  },
  {
    category: 'Analytics',
    key: 'session_quality',
    purpose: 'Helps us understand platform performance and engagement.',
    duration: 'Session',
  },
];

const CookiesPolicyPage = () => {
  useEffect(() => {
    // Add smooth scrolling behavior
    if (typeof window !== 'undefined') {
      document.documentElement.style.scrollBehavior = 'smooth';
    }
  }, []);

  const sections = [
    {
      id: 'intro',
      title: '1. What are Cookies and Local Storage?',
      content: (
        <>
          <p>
            Cookies are small text files sent by us to your computer or mobile
            device. They are unique to your account or your browser.
            Session-based cookies last only while your browser is open and are
            automatically deleted when you close your browser. Persistent
            cookies last until you or your browser delete them or until they
            expire.
          </p>
          <p>
            Local Storage is a modern technology similar to cookies but allows
            for more data to be stored. Unlike cookies, this data is not sent to
            the server with every request, making the application faster and
            more efficient.
          </p>
        </>
      ),
    },
    {
      id: 'why-we-use-them',
      title: '2. Why do we use them?',
      content: (
        <>
          <p>
            We use these technologies to make our services work better for you.
            Specifically:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Authentication</strong>: To keep you signed in as you move
              between pages.
            </li>
            <li>
              <strong>Preferences</strong>: To remember your settings, like your
              last active module or organization.
            </li>
            <li>
              <strong>Performance</strong>: To speed up the application by
              storing data locally so it does not have to be fetched every time.
            </li>
            <li>
              <strong>Analytics</strong>: To understand how you use the platform
              so we can improve the experience.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'cookies-and-storage',
      title: '3. The Cookies and Storage we use',
      content: (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 text-left text-sm">
            <thead className="bg-blue-50">
              <tr>
                <th className="border border-gray-200 px-3 py-2 font-semibold">
                  Category
                </th>
                <th className="border border-gray-200 px-3 py-2 font-semibold">
                  Key/Name
                </th>
                <th className="border border-gray-200 px-3 py-2 font-semibold">
                  Purpose
                </th>
                <th className="border border-gray-200 px-3 py-2 font-semibold">
                  Duration
                </th>
              </tr>
            </thead>
            <tbody>
              {storageItems.map((item) => (
                <tr key={item.key}>
                  <td className="border border-gray-200 px-3 py-2">
                    {item.category}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 font-mono text-xs">
                    {item.key}
                  </td>
                  <td className="border border-gray-200 px-3 py-2">
                    {item.purpose}
                  </td>
                  <td className="border border-gray-200 px-3 py-2">
                    {item.duration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ),
    },
    {
      id: 'third-party-services',
      title: '4. Third-Party Services',
      content: (
        <>
          <p>
            We partner with trusted third parties to provide certain features:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Google Auth</strong>: We use Google for secure sign-in.
              Google may set cookies to manage the authentication process.
            </li>
            <li>
              <strong>Mapbox</strong>: Our interactive maps use Mapbox, which
              may store technical data to ensure maps load correctly and
              remember your zoom/position preferences.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'your-choices',
      title: '5. Your Choices',
      content: (
        <>
          <p>
            You have the power to control how cookies and local storage are
            used:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li>
              <strong>Browser Settings</strong>: Most browsers allow you to
              manage cookies through their settings. You can block or delete
              them, though some parts of AirQo may not work correctly if you do.
            </li>
            <li>
              <strong>Platform Settings</strong>: You can clear your local
              preferences at any time by logging out or clearing your
              browser&apos;s site data.
            </li>
          </ul>
        </>
      ),
    },
    {
      id: 'updates',
      title: '6. Updates to this Policy',
      content: (
        <p>
          We may update this policy from time to time as our platform evolves.
          We recommend checking this page occasionally to stay informed about
          how we use these technologies.
        </p>
      ),
    },
    {
      id: 'contact',
      title: 'Contact Information',
      content: (
        <p>
          For any questions regarding this policy, please contact us at{' '}
          <a href="mailto:support@airqo.net">support@airqo.net</a>.
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
        <h1 className="text-3xl font-bold mb-6">
          AirQo Cookies &amp; Local Storage Policy
        </h1>
        <p className="mb-6 text-justify">
          At AirQo, we believe in being clear and open about how we collect and
          use data related to you. In the spirit of transparency, this policy
          provides detailed information about how and when we use cookies and
          local storage on our platform.
        </p>
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
        <p className="text-sm text-gray-600">Last Updated: May 11, 2026</p>
      </main>
    </div>
  );
};

export default CookiesPolicyPage;
