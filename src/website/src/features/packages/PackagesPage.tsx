'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FiBox, FiCheckCircle, FiDownload } from 'react-icons/fi';

import FrameworkTabs from '@/components/packages/FrameworkTabs';
import StatCard from '@/components/packages/StatCard';
import { CustomButton } from '@/components/ui';
import { getAllPackages } from '@/config/packages.config';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, duration: 0.5, ease: 'easeOut' },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

export default function PackagesPage() {
  const packages = getAllPackages();
  const [activeFramework, setActiveFramework] = useState<string>(
    packages[0]?.frameworks[0]?.name || 'React',
  );

  if (!packages || packages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#71717a]">No packages available.</p>
      </div>
    );
  }

  const activePackage = packages[0];
  const totalPackages = packages.length;

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
    if (!framework) return 'npm install @airqo/icons-react';
    return framework.installCommand;
  };

  return (
    <>
      <Toaster position="bottom-right" containerStyle={{ zIndex: 40000 }} />

      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="bg-blue-600">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
            <div className="max-w-2xl">
              <span className="text-[11px] font-medium uppercase tracking-[0.06em] text-blue-200 mb-3 block">
                Open Source
              </span>
              <h1 className="text-[28px] md:text-[32px] font-semibold tracking-[-0.025em] text-white leading-[1.2]">
                AirQo Packages
              </h1>
              <p className="mt-3 text-[16px] text-blue-100 leading-[1.5] max-w-lg">
                Open-source packages for building modern applications.
              </p>
              <div className="mt-6 flex gap-3">
                <Link href={`/packages/${activePackage.id}`} prefetch={false}>
                  <CustomButton className="px-5 py-3 text-[13px] bg-white text-blue-600 hover:bg-blue-50">
                    Explore {activePackage.displayName}
                  </CustomButton>
                </Link>
                <a
                  href={activePackage.repository}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <CustomButton className="px-5 py-3 text-[13px] bg-blue-700 text-white hover:bg-blue-800">
                    View on GitHub
                  </CustomButton>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Overview */}
        <motion.div
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<FiBox className="w-5 h-5" />}
                label="Total Libraries"
                value={totalPackages}
                description={
                  totalPackages === 1
                    ? 'More coming soon'
                    : 'Production-ready packages'
                }
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<FiDownload className="w-5 h-5" />}
                label="Total Downloads"
                value={activePackage.totalDownloads}
                description="For this package"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<FiCheckCircle className="w-5 h-5" />}
                label="Framework Support"
                value={`${allFrameworks.size}+`}
                description={Array.from(allFrameworks).join(', ')}
              />
            </motion.div>
          </div>
        </motion.div>

        {/* Main Package Showcase */}
        <motion.div
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            className="bg-white border border-[#e4e4e7] rounded-lg overflow-hidden"
          >
            <div className="grid lg:grid-cols-2 gap-0">
              {/* Left: Info */}
              <div className="p-6 lg:p-8">
                <span className="inline-block px-2 py-0.5 bg-[#eff6ff] text-[#1e40af] text-[11px] font-medium rounded mb-3">
                  Featured
                </span>
                <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#18181b] mb-2">
                  {activePackage.displayName}
                </h2>
                <p className="text-[14px] text-[#71717a] mb-5">
                  {activePackage.description}
                </p>
                <div className="space-y-2 mb-6">
                  {activePackage.features.slice(0, 4).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2.5">
                      <FiCheckCircle className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <span className="text-[13px] text-[#52525b]">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <Link href={`/packages/${activePackage.id}`} prefetch={false}>
                  <CustomButton className="px-5 py-3 text-[13px]">
                    Explore package
                  </CustomButton>
                </Link>
              </div>

              {/* Right: Quick Start */}
              <div className="bg-[#18181b] p-6 lg:p-8 text-white border-l border-[#27272a]">
                <h3 className="text-[15px] font-semibold mb-4">Quick Start</h3>

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
                    <label className="block text-[12px] text-[#a1a1aa] mb-2">
                      Installation
                    </label>
                    <div className="relative">
                      <pre className="bg-black/30 rounded-md p-4 overflow-x-auto">
                        <code className="text-[13px]">
                          {getInstallCommand()}
                        </code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(getInstallCommand())}
                        className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  {/* Usage Example */}
                  <div>
                    <label className="block text-[12px] text-[#a1a1aa] mb-2">
                      Usage
                    </label>
                    <div className="bg-black/30 rounded-md p-4 overflow-x-auto">
                      <code className="text-[13px]">
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
                <div className="flex gap-2 mt-6">
                  <Link
                    href="/packages/icons/docs"
                    prefetch={false}
                    className="flex-1 text-center px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-[12px] font-medium"
                  >
                    Docs
                  </Link>
                  <a
                    href={activePackage.npmPackage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-[12px] font-medium"
                  >
                    npm
                  </a>
                  <a
                    href={activePackage.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-[12px] font-medium"
                  >
                    GitHub
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* More Coming Soon */}
        <motion.div
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-16"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.div
            variants={itemVariants}
            className="bg-[#fafafa] border border-[#e4e4e7] rounded-lg p-8 text-center"
          >
            <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#18181b] mb-2">
              More Packages Coming Soon
            </h2>
            <p className="text-[14px] text-[#71717a] max-w-lg mx-auto mb-6">
              We&apos;re working on additional developer tools and libraries.
              Follow us on GitHub to stay updated with new releases.
            </p>
            <a
              href="https://github.com/airqo-platform"
              target="_blank"
              rel="noopener noreferrer"
            >
              <CustomButton className="px-5 py-3 text-[13px]">
                Follow on GitHub
              </CustomButton>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
