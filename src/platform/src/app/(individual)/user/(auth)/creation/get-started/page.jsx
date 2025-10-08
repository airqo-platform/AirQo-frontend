'use client';
import React from 'react';
import Link from 'next/link';
import CardWrapper from '@/common/components/CardWrapper';

const IndividualAccountCreationSuccess = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 px-4">
      <CardWrapper
        className="max-w-md w-full mx-auto shadow-xl border-0"
        padding="p-8 md:p-10"
        rounded
        background="bg-white dark:bg-gray-900"
      >
        <div className="flex flex-col items-center text-center">
          <span className="text-6xl mb-4">🎉</span>
          <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Congratulations!
          </h3>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            You&apos;ve successfully created your AirQo Analytics account
          </p>
          <Link href="/user/analytics" passHref legacyBehavior>
            <a className="inline-block w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg px-8 py-3 transition-colors duration-200 shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2">
              Let&apos;s get started
            </a>
          </Link>
        </div>
      </CardWrapper>
    </div>
  );
};

export default IndividualAccountCreationSuccess;
