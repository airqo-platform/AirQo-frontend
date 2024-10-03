'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Section1 from '@/public/assets/images/section1.png';
import Section2 from '@/public/assets/images/section2.png';
import Section3 from '@/public/assets/images/section3.png';

const HelpPage = () => {
  return (
    <div className="space-y-8">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="w-full py-4 px-4 border border-gray-300 rounded-xl bg-white dark:bg-gray-800 dark:border-gray-700 shadow-sm">
        <BreadcrumbList>
          <BreadcrumbItem>
            <Link href="/home" className="text-blue-600 hover:underline">
              Home
            </Link>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Help</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="min-h-screen bg-white dark:bg-gray-800 text-gray-900 rounded-xl border border-gray-300 dark:text-white p-6">
        <div className="space-y-10">
          {/* Page Title */}
          <h1 className="text-3xl font-bold text-center">
            How to Generate a Report
          </h1>

          {/* Video Walkthrough Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Video Walkthrough</h2>
            <p className="text-lg">
              Watch this video to get a step-by-step guide on how to generate
              your air quality report using the AQ Report tool.
            </p>
            <div className="w-full h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow-sm">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                title="Report Generation Walkthrough"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Step-by-Step Guide Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">
              Step-by-Step Guide with Screenshots
            </h2>

            {/* Step 1 */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-xl font-medium">
                Step 1: Enter Report Details
              </h3>
              <p>
                Start by filling in the report title, selecting the report
                template, and specifying the location for which you want to
                generate the report.
              </p>
              <div className="w-full mt-4 rounded-xl overflow-hidden">
                <Image
                  src={Section1}
                  alt="Enter Report Details"
                  layout="responsive"
                  className="w-full object-contain"
                  priority
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-xl font-medium">Step 2: Select Date Range</h3>
              <p>
                Choose the desired date range to generate the report for. You
                can also use shortcuts for common ranges such as "Last 7 days",
                "This Month", or "Last Quarter".
              </p>
              <div className="w-full mt-4 rounded-xl overflow-hidden">
                <Image
                  src={Section2}
                  alt="Select Date Range"
                  layout="responsive"
                  className="w-full object-contain"
                  priority
                />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-gray-700 rounded-xl shadow-sm p-6 space-y-4">
              <h3 className="text-xl font-medium">Step 3: Generate Report</h3>
              <p>
                Finally, click the "Generate Report" button to generate your air
                quality report. You can also clear the form if you need to start
                over.
              </p>
              <div className="w-full mt-4 rounded-xl overflow-hidden">
                <Image
                  src={Section3}
                  alt="Generate Report"
                  layout="responsive"
                  className="w-full object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Still Need Help?</h2>
            <p className="text-lg">
              If you have any questions or encounter any issues, feel free to
              reach out to our support team.
            </p>
            <div className="bg-blue-100 dark:bg-gray-700 p-6 rounded-xl shadow-sm">
              <p className="text-lg">
                <strong>Email:</strong>{' '}
                <Link href="mailto:support@airqo.net">
                  <span className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@airqo.net
                  </span>
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpPage;
