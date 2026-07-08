import React from 'react';
import { FiBox, FiDownload, FiGlobe, FiSettings } from 'react-icons/fi';

import BackButton from '@/components/common/BackButton';
import StatCard from '@/components/packages/StatCard';
import IconsPackageBrowserLoader from '@/features/packages/IconsPackageBrowserLoader';

export default function IconsPackagePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-blue-600">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="mb-4">
            <BackButton
              fallbackUrl="/packages"
              label="Back to Packages"
              className="text-blue-200 hover:text-white"
            />
          </div>
          <div className="max-w-2xl">
            <h1 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.025em] text-white leading-[1.2]">
              AirQo Icon Library
            </h1>
            <p className="mt-3 text-[16px] text-blue-100 leading-[1.5] max-w-lg">
              1,383+ beautiful icons for React, Vue, and Flutter. Fully
              customizable with TypeScript support.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            icon={<FiBox className="w-5 h-5" />}
            label="Total Icons"
            value="1,383+"
          />
          <StatCard
            icon={<FiSettings className="w-5 h-5" />}
            label="Categories"
            value="22"
          />
          <StatCard
            icon={<FiGlobe className="w-5 h-5" />}
            label="Frameworks"
            value="3"
            description="React, Vue, Flutter"
          />
          <StatCard
            icon={<FiDownload className="w-5 h-5" />}
            label="Weekly Downloads"
            value="100+"
          />
        </div>
      </div>

      <IconsPackageBrowserLoader />
    </div>
  );
}
