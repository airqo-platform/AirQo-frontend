'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function InstallationSection() {
  const [activeTab, setActiveTab] = useState<'npm' | 'yarn' | 'pnpm'>('npm');

  const commands = {
    npm: 'npm install @airqo/icons-react',
    yarn: 'yarn add @airqo/icons-react',
    pnpm: 'pnpm add @airqo/icons-react',
  };

  const copyCommand = async () => {
    try {
      await navigator.clipboard.writeText(commands[activeTab]);
      toast.success('Command copied!');
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy command');
    }
  };

  return (
    <section id="installation" className="scroll-mt-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Installation</h2>
      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
        <div className="flex border-b border-gray-800">
          {(['npm', 'yarn', 'pnpm'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="p-6 relative group">
          <code className="text-green-400 font-mono text-sm block">
            {commands[activeTab]}
          </code>
          <button
            onClick={copyCommand}
            className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all"
            aria-label="Copy command"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </button>
        </div>
      </div>
      <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
        <svg
          className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-sm text-blue-800">
          For Vue usage, install{' '}
          <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-900 font-semibold">
            @airqo/icons-vue
          </code>{' '}
          instead.
        </p>
      </div>
    </section>
  );
}
