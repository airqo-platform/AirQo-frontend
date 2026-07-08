'use client';
import React from 'react';

export default function StylingSection() {
  return (
    <section id="styling" className="scroll-mt-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Styling</h2>
      <p className="text-gray-600 mb-6">
        Icons inherit the current text color by default, but you can customize
        them using props or CSS classes (Tailwind).
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Using Props</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <code className="text-sm text-gray-800">
              {'<AqHome01 size={32} color="#DC2626" />'}
            </code>
          </div>
          <p className="text-sm text-gray-600">
            Directly set size (number) and color (hex/rgb string).
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Using Tailwind</h3>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <code className="text-sm text-gray-800">
              {'<AqHome01 className="w-8 h-8 text-red-600" />'}
            </code>
          </div>
          <p className="text-sm text-gray-600">
            Apply utility classes via the className prop.
          </p>
        </div>
      </div>
    </section>
  );
}
