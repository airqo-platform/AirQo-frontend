'use client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function UtilitiesSection() {
  return (
    <section id="utilities" className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">🛠 Utilities</h2>
        <p className="text-lg text-gray-600 mb-6">
          Helper functions and utilities for working with AirQo Icons across
          different frameworks.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            React Hooks
          </h3>
          <p className="text-gray-600 mb-4">
            The react package exports specific hooks for easier integration.
          </p>
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            className="rounded-lg mb-4"
          >
            {`import { useIconSize } from '@airqo/icons-react';

function MyComponent() {
  const { size, isSmall, isLarge } = useIconSize('md');
  // ...
}`}
          </SyntaxHighlighter>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            SVG Optimization
          </h3>
          <p className="text-gray-600 mb-4">
            All icons are pre-optimized using SVGO to ensure minimal bundle size
            impact. The build process includes:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2 ml-4">
            <li>Removal of unnecessary metadata</li>
            <li>Path optimization and simplification</li>
            <li>Consistent viewBox standardization (24x24)</li>
            <li>Color attribute normalization (currentColor)</li>
          </ul>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Contributing
          </h3>
          <p className="text-gray-600 mb-4">
            To contribute new icons or fix existing ones:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <ol className="list-decimal list-inside space-y-3 text-gray-700">
              <li>
                Add raw SVG files to{' '}
                <code className="text-red-500 bg-red-50 px-1 py-0.5 rounded">
                  svg/
                </code>{' '}
                directory
              </li>
              <li>
                Run the generation script:{' '}
                <code className="text-blue-600">npm run generate</code>
              </li>
              <li>Verify the output in respective package folders</li>
              <li>Submit a PR with the changes</li>
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
