'use client';
import { AqBox, AqCheckCircle, AqDownload01 } from '@airqo/icons-react';
import Link from 'next/link';
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';

import FrameworkTabs from '@/components/packages/FrameworkTabs';
import StatCard from '@/components/packages/StatCard';
import { CustomButton } from '@/components/ui';
import { getAllPackages } from '@/configs/packagesConfig';

export default function PackagesPage() {
  const packages = getAllPackages();
  const [activeFramework, setActiveFramework] = useState<string>(
    packages[0]?.frameworks[0]?.name || 'React',
  );

  // Guard against empty packages array
  if (!packages || packages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">No packages available.</p>
      </div>
    );
  }

  // For now, use first package (icons). When more packages are added,
  // this can be made dynamic with a selector/tabs
  const activePackage = packages[0];

  // Calculate dynamic stats across all packages
  const totalPackages = packages.length;

  // Get unique frameworks across all packages
  const allFrameworks = new Set(
    packages.flatMap((pkg) => pkg.frameworks.map((f) => f.name)),
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  const getInstallCommand = () => {
    const framework = activePackage.frameworks.find(
      (f) => f.name === activeFramework,
    );
    if (!framework) return 'npm install @airqo/icons-react'; // Fallback
    return framework.installCommand;
  };

  return (
    <>
      <Toaster position="bottom-right" containerStyle={{ zIndex: 40000 }} />

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#1651C6] to-[#0D388E] text-white py-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-6">
              <div className="inline-block px-4 py-2 bg-white/10 rounded-full text-sm font-medium mb-4">
                Open Source Developer Tools
              </div>
              <h1 className="text-5xl md:text-6xl font-bold">AirQo Packages</h1>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Open-source packages for building modern applications.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href={`/packages/${activePackage.id}`}>
                  <CustomButton className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 px-6 sm:px-8 py-3">
                    Explore {activePackage.displayName}
                  </CustomButton>
                </Link>
                <a
                  href={activePackage.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CustomButton className="w-full sm:w-auto bg-blue-700 hover:bg-blue-800 text-white px-6 sm:px-8 py-3">
                    View on GitHub
                  </CustomButton>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
            <StatCard
              icon={<AqBox className="w-6 h-6" />}
              label="Total Libraries"
              value={totalPackages}
              description={
                totalPackages === 1
                  ? 'More coming soon'
                  : 'Production-ready packages'
              }
            />
            <StatCard
              icon={<AqDownload01 className="w-6 h-6" />}
              label="Total Downloads"
              value={activePackage.totalDownloads}
              description="Across all packages"
            />
            <StatCard
              icon={<AqCheckCircle className="w-6 h-6" />}
              label="Framework Support"
              value={`${allFrameworks.size}+`}
              description={Array.from(allFrameworks).join(', ')}
            />
          </div>
        </div>

        {/* Main Package Showcase */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left: Info */}
              <div className="p-6 sm:p-8 lg:p-12">
                <div className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
                  Featured Package
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {activePackage.displayName}
                </h2>
                <p className="text-lg text-gray-600 mb-6">
                  {activePackage.description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  {activePackage.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <AqCheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                <Link href={`/packages/${activePackage.id}`}>
                  <CustomButton className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3">
                    Explore More →
                  </CustomButton>
                </Link>
              </div>

              {/* Right: Quick Start */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 sm:p-8 lg:p-12 text-white">
                <h3 className="text-xl font-semibold mb-6">Quick Start</h3>

                {/* Framework Tabs */}
                <div className="mb-6">
                  <FrameworkTabs
                    frameworks={activePackage.frameworks}
                    activeFramework={activeFramework}
                    onSelectFramework={setActiveFramework}
                  />
                </div>

                {/* Installation */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Installation
                    </label>
                    <div className="relative">
                      <pre className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                        <code className="text-sm">{getInstallCommand()}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(getInstallCommand())}
                        className="absolute top-2 right-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Usage Example */}
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Usage
                    </label>
                    <div className="bg-black/30 rounded-lg p-4 overflow-x-auto">
                      <code className="text-sm">
                        {activeFramework === 'React' && (
                          <>
                            {`import { AqHome01 } from '@airqo/icons-react';`}
                            <br />
                            <br />
                            {`<AqHome01 size={24} color="#0284C7" />`}
                          </>
                        )}
                        {activeFramework === 'Vue' && (
                          <>
                            {`import { AqHome01 } from '@airqo/icons-vue';`}
                            <br />
                            <br />
                            {`<AqHome01 :size="24" color="#0284C7" />`}
                          </>
                        )}
                        {activeFramework === 'Flutter' && (
                          <>
                            {`import 'package:airqo_icons_flutter/...';`}
                            <br />
                            <br />
                            AqIcon.home01(size: 24, color: ...)
                          </>
                        )}
                      </code>
                    </div>
                  </div>
                </div>

                {/* Links */}
                <div className="flex gap-3 mt-6">
                  <Link
                    href="/packages/icons/docs"
                    className="flex-1 text-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                  >
                    Docs
                  </Link>
                  <a
                    href={activePackage.npmPackage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                  >
                    npm
                  </a>
                  <a
                    href={activePackage.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-sm font-medium"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* More Coming Soon */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-12 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              More Packages Coming Soon
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              We&apos;re working on additional developer tools and libraries.
              Follow us on GitHub to stay updated with new releases.
            </p>
            <a
              href="https://github.com/airqo-platform"
              target="_blank"
              rel="noopener noreferrer"
            >
              <CustomButton className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3">
                Follow on GitHub
              </CustomButton>
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
