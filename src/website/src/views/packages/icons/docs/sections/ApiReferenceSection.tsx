'use client';
import React from 'react';

export default function ApiReferenceSection() {
  return (
    <section id="api-reference" className="scroll-mt-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">API Reference</h2>
      <p className="text-gray-600 mb-6">
        All icons accept these common props, extending standard SVG attributes:
      </p>

      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800 mb-6">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-gray-100 mb-3">
            TypeScript Interface
          </h3>
          <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
            <code>{`interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string; // Icon size (default: 24)
  className?: string;     // CSS classes
  color?: string;         // Icon color (default: currentColor)
  // ... all standard SVG props (onClick, onMouseOver, etc.)
}`}</code>
          </pre>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prop
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Default
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                size
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                  number | string
                </code>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                24
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                Sets the width and height of the icon.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                color
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                  string
                </code>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                currentColor
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                Sets the fill/stroke color of the icon.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                className
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                  string
                </code>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                -
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                Applies custom CSS classes.
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                ...props
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">
                  SVGProps
                </code>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                -
              </td>
              <td className="px-6 py-4 text-sm text-gray-600">
                All standard SVG attributes are supported.
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100 flex gap-3">
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
          Tree-shaking ensures only imported icons are bundled, keeping your app
          lightweight across all frameworks.
        </p>
      </div>
    </section>
  );
}
