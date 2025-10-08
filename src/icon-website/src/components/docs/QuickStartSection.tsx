"use client";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

export default function QuickStartSection() {
  return (
    <DocSection id="quick-start" title="🎯 Quick Start">
      <p className="text-gray-600 dark:text-gray-300">
        Get up and running in seconds:
      </p>
      <CodeBlock
        title="Basic Usage"
        code={`import { Home01 } from '@airqo/icons-react';
<Home01 size={24} color="#0A84FF" />`}
      />
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Only the icons you import are bundled.
        </p>
      </div>
    </DocSection>
  );
}
