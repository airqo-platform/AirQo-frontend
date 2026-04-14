'use client';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function BackButton({
  label = 'Back',
  className = '',
  fallbackUrl = '/',
}: {
  label?: string;
  className?: string;
  fallbackUrl?: string;
}) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackUrl);
    }
  };

  return (
    <button
      onClick={handleBack}
      className={`inline-flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors ${className}`}
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
      {label}
    </button>
  );
}
