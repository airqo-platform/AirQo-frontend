'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import React, { useState } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { FiBox, FiCheckCircle, FiDownload, FiTerminal } from 'react-icons/fi';

import FrameworkTabs from '@/components/packages/FrameworkTabs';
import StatCard from '@/components/packages/StatCard';
import { getAllPackages, Package } from '@/config/packages.config';
import { cn } from '@/lib/utils';

const packageActionClassName =
  'inline-flex items-center px-6 py-4 text-sm font-medium transition-transform duration-300 active:scale-95 bg-blue-600 text-white shadow-none focus:outline-none';

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

const isInternalPackage = (pkg: Package) => pkg.id === 'icons';

const getUsageExample = (pkg: Package, framework: string) => {
  if (pkg.type === 'cli') return pkg.usageExample;

  switch (framework) {
    case 'Vue':
      return `import { AqHome01 } from '@airqo/icons-vue';

<AqHome01 :size="24" color="#0284C7" />`;
    case 'Flutter':
      return `import 'package:airqo_icons_flutter/...';

AqIcon.home01(size: 24, color: ...)`;
    default:
      return pkg.usageExample;
  }
};

export default function PackagesPage() {
  const packages = getAllPackages();
  const [activePackageId, setActivePackageId] = useState(packages[0]?.id ?? '');
  const [activeFramework, setActiveFramework] = useState('React');

  if (packages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[#71717a]">No packages available.</p>
      </div>
    );
  }

  const activePackage =
    packages.find((pkg) => pkg.id === activePackageId) ?? packages[0];
  const frameworks = activePackage.frameworks ?? [];
  const allFrameworks = new Set(
    packages.flatMap((pkg) => (pkg.frameworks ?? []).map((f) => f.name)),
  );
  const packageIsInternal = isInternalPackage(activePackage);
  const packageHref = packageIsInternal
    ? `/packages/${activePackage.id}`
    : activePackage.npmPackage;
  const installCommand =
    frameworks.find((framework) => framework.name === activeFramework)
      ?.installCommand ?? activePackage.installCommand;
  const usageExample = getUsageExample(activePackage, activeFramework);

  const copyToClipboard = (text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => toast.success('Copied to clipboard!'))
      .catch(() => toast.error('Failed to copy'));
  };

  return (
    <>
      <Toaster position="bottom-right" containerStyle={{ zIndex: 40000 }} />

      <div className="min-h-screen bg-white">
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
                Open-source packages and developer tools for building modern air
                quality and IoT applications.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                {packageIsInternal ? (
                  <Link
                    href={packageHref}
                    prefetch={false}
                    className={cn(
                      packageActionClassName,
                      'px-5 py-3 text-[13px] bg-white text-blue-600 hover:bg-blue-50',
                    )}
                  >
                    Explore {activePackage.displayName}
                  </Link>
                ) : (
                  <a
                    href={packageHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      packageActionClassName,
                      'px-5 py-3 text-[13px] bg-white text-blue-600 hover:bg-blue-50',
                    )}
                  >
                    View {activePackage.displayName} on npm
                  </a>
                )}
                {activePackage.repository && (
                  <a
                    href={activePackage.repository}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      packageActionClassName,
                      'px-5 py-3 text-[13px] bg-blue-700 text-white hover:bg-blue-800',
                    )}
                  >
                    View on GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

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
                label="Published packages"
                value={packages.length}
                description="Libraries and developer tools"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<FiDownload className="w-5 h-5" />}
                label="Weekly downloads"
                value={activePackage.weeklyDownloads}
                description={activePackage.displayName}
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatCard
                icon={<FiCheckCircle className="w-5 h-5" />}
                label={
                  activePackage.type === 'cli'
                    ? 'Package type'
                    : 'Framework support'
                }
                value={
                  activePackage.type === 'cli' ? 'CLI' : `${frameworks.length}+`
                }
                description={
                  activePackage.type === 'cli'
                    ? 'Interactive app scaffolding'
                    : Array.from(allFrameworks).join(', ')
                }
              />
            </motion.div>
          </div>
        </motion.div>

        <motion.section
          className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-8"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
        >
          <motion.div variants={itemVariants}>
            <div className="mb-4">
              <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#18181b]">
                Available packages
              </h2>
              <p className="text-[14px] text-[#71717a] mt-1">
                Choose a package to view its quick start guide.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {packages.map((pkg) => {
                const isActive = pkg.id === activePackage.id;
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setActivePackageId(pkg.id)}
                    className={cn(
                      'text-left rounded-lg border p-4 transition-colors',
                      isActive
                        ? 'border-blue-600 bg-blue-50/60'
                        : 'border-[#e4e4e7] hover:border-[#a1a1aa]',
                    )}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-md bg-white border border-[#e4e4e7] flex items-center justify-center text-[#52525b] shrink-0">
                          {pkg.type === 'cli' ? (
                            <FiTerminal className="w-4 h-4" />
                          ) : (
                            <FiBox className="w-4 h-4" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <h3 className="text-[14px] font-semibold text-[#18181b] truncate">
                            {pkg.displayName}
                          </h3>
                          <p className="text-[12px] text-[#71717a] mt-0.5">
                            {pkg.tagline ?? pkg.description}
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] text-[#71717a] shrink-0">
                        v{pkg.version}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.section>

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
              <div className="p-6 lg:p-8">
                <span className="inline-block px-2 py-0.5 bg-[#eff6ff] text-[#1e40af] text-[11px] font-medium rounded mb-3">
                  {activePackage.type === 'cli' ? 'Developer tool' : 'Package'}
                </span>
                <h2 className="text-[20px] font-semibold tracking-[-0.02em] text-[#18181b] mb-2">
                  {activePackage.displayName}
                </h2>
                <p className="text-[14px] text-[#71717a] mb-5">
                  {activePackage.description}
                </p>
                <div className="space-y-2 mb-6">
                  {activePackage.features.slice(0, 4).map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <FiCheckCircle className="w-4 h-4 text-[#059669] shrink-0 mt-0.5" />
                      <span className="text-[13px] text-[#52525b]">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                {packageIsInternal ? (
                  <Link
                    href={packageHref}
                    prefetch={false}
                    className={cn(
                      packageActionClassName,
                      'px-5 py-3 text-[13px]',
                    )}
                  >
                    Explore package
                  </Link>
                ) : (
                  <a
                    href={packageHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      packageActionClassName,
                      'px-5 py-3 text-[13px]',
                    )}
                  >
                    View package on npm
                  </a>
                )}
              </div>

              <div className="bg-[#18181b] p-6 lg:p-8 text-white border-l border-[#27272a]">
                <h3 className="text-[15px] font-semibold mb-4">Quick Start</h3>

                {frameworks.length > 0 ? (
                  <div className="mb-6">
                    <FrameworkTabs
                      frameworks={frameworks}
                      activeFramework={activeFramework}
                      onSelectFramework={setActiveFramework}
                    />
                  </div>
                ) : (
                  <div className="mb-6 rounded-md bg-white/10 px-3 py-2 text-[12px] text-[#d4d4d8]">
                    Command-line app scaffolding
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-[12px] text-[#a1a1aa] mb-2">
                      {activePackage.type === 'cli' ? 'Run' : 'Installation'}
                    </label>
                    <div className="relative">
                      <pre className="bg-black/30 rounded-md p-4 overflow-x-auto">
                        <code className="text-[13px]">{installCommand}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(installCommand)}
                        className="absolute top-2 right-2 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium rounded transition-colors"
                      >
                        Copy
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[12px] text-[#a1a1aa] mb-2">
                      {activePackage.type === 'cli'
                        ? 'What to expect'
                        : 'Usage'}
                    </label>
                    <div className="bg-black/30 rounded-md p-4 overflow-x-auto">
                      <code className="text-[13px] whitespace-pre-wrap">
                        {usageExample}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 mt-6">
                  {packageIsInternal ? (
                    <Link
                      href="/packages/icons/docs"
                      prefetch={false}
                      className="flex-1 text-center px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-[12px] font-medium"
                    >
                      Docs
                    </Link>
                  ) : (
                    <a
                      href={activePackage.docsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-[12px] font-medium"
                    >
                      Docs
                    </a>
                  )}
                  <a
                    href={activePackage.npmPackage}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 text-center px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-[12px] font-medium"
                  >
                    npm
                  </a>
                  {activePackage.repository && (
                    <a
                      href={activePackage.repository}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-center px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors text-[12px] font-medium"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

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
              className={cn(packageActionClassName, 'px-5 py-3 text-[13px]')}
            >
              Follow on GitHub
            </a>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
