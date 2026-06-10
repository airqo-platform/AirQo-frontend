import Link from 'next/link';
import React from 'react';

import { CustomButton } from '@/components/ui';

import IconsDocsContentLoader from './IconsDocsContentLoader';

export default function IconsDocsPage() {
  return (
    <>
      <div className="min-h-screen bg-gray-50/50">
        {/* Hero Section with Back Button */}
        <div className="bg-gradient-to-r from-[#1651C6] to-[#0D388E] text-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <Link
                href="/packages/icons"
                prefetch={false}
                className="inline-flex items-center text-white hover:text-blue-100 font-medium transition-colors"
              >
                <svg
                  className="w-5 h-5 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Previous Page
              </Link>
            </div>
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl font-bold mb-4">Documentation</h1>
                <p className="text-xl text-blue-100 max-w-2xl">
                  Everything you need to integrate AirQo icons into your
                  application.
                </p>
              </div>
              <Link href="/packages/icons" prefetch={false}>
                <CustomButton className="text-sm py-2 px-4 bg-white/10 text-white hover:bg-white/20">
                  Browse Icons
                </CustomButton>
              </Link>
            </div>
          </div>
        </div>
        <IconsDocsContentLoader />
      </div>
    </>
  );
}
