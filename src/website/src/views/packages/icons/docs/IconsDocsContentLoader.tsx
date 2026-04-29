'use client';

import dynamic from 'next/dynamic';
import { useState } from 'react';
import { FiBookOpen, FiCode, FiPlayCircle } from 'react-icons/fi';

const IconsDocsContent = dynamic(() => import('./IconsDocsContent'), {
  ssr: false,
  loading: () => (
    <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-12 lg:flex-row">
        <div className="hidden w-64 flex-shrink-0 lg:block">
          <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className="h-9 animate-pulse rounded-md bg-slate-100"
              />
            ))}
          </div>
        </div>
        <div className="flex-1 space-y-8">
          {Array.from({ length: 5 }, (_, index) => (
            <div
              key={index}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="h-8 w-48 animate-pulse rounded bg-slate-100" />
              <div className="mt-4 space-y-3">
                <div className="h-4 animate-pulse rounded bg-slate-100" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
                <div className="h-48 animate-pulse rounded-xl bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
});

export default function IconsDocsContentLoader() {
  const [isDocsEnabled, setIsDocsEnabled] = useState(false);

  if (!isDocsEnabled) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mx-auto max-w-3xl text-center space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
              <FiBookOpen className="h-4 w-4" />
              Full Documentation
            </div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Load the interactive docs when you want the full code examples
            </h2>
            <p className="text-base text-gray-600">
              The full documentation includes multiple syntax-highlighted code
              samples, framework guides, and API sections. Open it on demand to
              keep the first render fast.
            </p>
            <button
              type="button"
              onClick={() => setIsDocsEnabled(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <FiPlayCircle className="h-4 w-4" />
              Open Documentation
            </button>
            <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
              <FiCode className="h-4 w-4" />
              Syntax highlighting and copyable examples load after this step.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <IconsDocsContent />;
}
