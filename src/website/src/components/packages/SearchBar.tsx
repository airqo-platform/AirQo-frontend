'use client';
import React from 'react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  resultCount?: number;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Search 1,383 icons...',
  resultCount,
}: SearchBarProps) {
  return (
    <div className="relative">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>
      {resultCount !== undefined && value && (
        <p className="mt-2 text-sm text-gray-600">
          Found {resultCount} icon{resultCount !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}
