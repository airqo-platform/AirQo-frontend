import React from 'react';
import { FiBox, FiDownload, FiGlobe, FiSettings } from 'react-icons/fi';

import BackButton from '@/components/common/BackButton';
import StatCard from '@/components/packages/StatCard';
import IconsPackageBrowserLoader from '@/views/packages/IconsPackageBrowserLoader';

export default function IconsPackagePage() {
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Top sticky header removed - banner contains back button */}

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#1651C6] to-[#0D388E] text-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <BackButton
                fallbackUrl="/packages"
                label="Back to Packages"
                className="text-white hover:text-white"
              />
            </div>
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                AirQo Icon Library
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                1,383+ beautiful icons for React, Vue, and Flutter. Fully
                customizable with TypeScript support.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<FiBox className="w-6 h-6" />}
              label="Total Icons"
              value="1,383+"
            />
            <StatCard
              icon={<FiSettings className="w-6 h-6" />}
              label="Categories"
              value="22"
            />
            <StatCard
              icon={<FiGlobe className="w-6 h-6" />}
              label="Frameworks"
              value="3"
              description="React, Vue, Flutter"
            />
            <StatCard
              icon={<FiDownload className="w-6 h-6" />}
              label="Weekly Downloads"
              value="100+"
            />
          </div>
        </div>

        <IconsPackageBrowserLoader />
      </div>
    </>
  );
}
