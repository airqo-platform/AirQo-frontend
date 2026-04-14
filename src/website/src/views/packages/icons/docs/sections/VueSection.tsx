'use client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function VueSection() {
  return (
    <section id="vue" className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🎨 Vue Package
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          AirQo Icons provides components for Vue 3 users. Ensure your project
          uses Vue 3.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Installation
          </h3>
          <SyntaxHighlighter
            language="bash"
            style={vscDarkPlus}
            className="rounded-lg"
          >
            {`npm install @airqo/icons-vue
# or
yarn add @airqo/icons-vue`}
          </SyntaxHighlighter>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Basic Usage
          </h3>
          <SyntaxHighlighter
            language="html"
            style={vscDarkPlus}
            className="rounded-lg"
          >
            {`<template>
  <div class="icon-wrapper">
    <AqHome01 />
    <!-- With custom props -->
    <AqCloud01 :size="32" color="#1652DA" />
  </div>
</template>

<script setup>
import { AqHome01, AqCloud01 } from '@airqo/icons-vue';
</script>`}
          </SyntaxHighlighter>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Props Reference
          </h3>
          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
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
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    size
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    Number | String
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    24
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Width and height of the icon
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    color
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    String
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    &quot;currentColor&quot;
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Fill color (accepts hex, rgb, or CSS color names)
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                    class
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    String
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    -
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    CSS classes
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}
