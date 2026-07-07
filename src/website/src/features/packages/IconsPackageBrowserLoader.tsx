'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { FiGrid, FiSearch } from 'react-icons/fi';

const IconsPackageBrowser = dynamic(() => import('./IconsPackageBrowser'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="h-11 w-full animate-pulse rounded-lg bg-slate-100" />
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: 8 }, (_, index) => (
            <div
              key={index}
              className="h-8 w-24 animate-pulse rounded-full bg-slate-100"
            />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 2xl:grid-cols-12">
        {Array.from({ length: 48 }, (_, index) => (
          <div
            key={index}
            className="aspect-square animate-pulse rounded-xl border border-gray-200 bg-white"
          />
        ))}
      </div>
    </div>
  ),
});

export default function IconsPackageBrowserLoader() {
  const [isBrowserEnabled, setIsBrowserEnabled] = useState(false);

  if (!isBrowserEnabled) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <FiGrid className="h-4 w-4" />
              Interactive Browser
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Load the searchable icon catalog on demand
            </h2>
            <p className="text-base text-gray-600">
              The full browser includes live search, category filters, previews,
              and code snippets for 1,383+ icons. Load it only when you need to
              explore the library.
            </p>
            <button
              type="button"
              onClick={() => setIsBrowserEnabled(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <FiSearch className="h-4 w-4" />
              Browse Icons
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <IconsPackageBrowser />;
}
