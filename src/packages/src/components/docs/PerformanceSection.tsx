// components/docs/PerformanceSection.tsx
import React from "react";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

export default function PerformanceSection() {
  return (
    <DocSection id="performance" title="⚡ Performance & Optimization">
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Designed for optimal performance in modern web applications.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
        Tree-Shaking
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-3">
        Import only the icons you need to minimize bundle size.
      </p>
      <CodeBlock
        code={`// ✅ Recommended - Tree shakable
import { AqHome01, AqSettings01 } from '@airqo/icons-react';

// ❌ Avoid - Imports entire library (~6MB)
// import * as Icons from '@airqo/icons-react';`}
        language="tsx"
      />

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">
        Bundle Size
      </h3>
      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300 mb-4">
        <li>
          <strong>Full package:</strong> ~6MB (Avoid direct full imports)
        </li>
        <li>
          <strong>Per icon:</strong> ~2-4KB (when tree-shaken)
        </li>
        <li>
          <strong>Typical usage (10-20 icons):</strong> ~50-100KB
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">
        Code Splitting (Advanced)
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-3">
        For very large applications, lazy-load icons dynamically.
      </p>
      <CodeBlock
        code={`import { lazy, Suspense } from 'react';

const AqHome01 = lazy(() => import('@airqo/icons-react').then((mod) => ({ default: mod.AqHome01 })));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AqHome01 size={32} />
    </Suspense>
  );
}`}
        language="tsx"
      />
    </DocSection>
  );
}
