'use client';
import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  value: string;
  onChange: (q: string) => void;
}

export default function IconSearchBar({ value, onChange }: Props) {
  return (
    <section className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 sticky top-16 z-40">
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
          <input
            type="text"
            placeholder="Search icons..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500"
            aria-label="Search icons"
          />
        </div>
      </div>
    </section>
  );
}
