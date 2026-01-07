// components/docs/QuickStartSection.tsx
import React, { useState } from "react";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

const frameworks = [
  {
    name: "React",
    code: `import { AqHome01, AqUganda, AqBarChart01 } from '@airqo/icons-react';

function App() {
  return (
    <div className="flex items-center space-x-4">
      <AqUganda size={32} className="text-green-600" />
      <AqHome01 size={24} className="text-blue-600" />
      <AqBarChart01 size={28} className="text-purple-600" />
    </div>
  );
}`,
    language: "tsx",
  },
  {
    name: "Vue",
    code: `<template>
  <div class="flex items-center space-x-4">
    <AqUganda :size="32" class="text-green-600" />
    <AqHome01 :size="24" class="text-blue-600" />
    <AqBarChart01 :size="28" class="text-purple-600" />
  </div>
</template>

<script setup>
import { AqHome01, AqUganda, AqBarChart01 } from '@airqo/icons-vue';
</script>`,
    language: "vue",
  },
  {
    name: "Flutter",
    code: `import 'package:airqo_icons_flutter/airqo_icons_flutter.dart';

class MyWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        AqUganda(size: 32, color: Colors.green),
        SizedBox(width: 16),
        AqHome01(size: 24, color: Colors.blue),
        SizedBox(width: 16),
        AqBarChart01(size: 28, color: Colors.purple),
      ],
    );
  }
}`,
    language: "dart",
  },
];

export default function QuickStartSection() {
  const [activeFramework, setActiveFramework] = useState(0);

  return (
    <DocSection id="quick-start" title="🎯 Quick Start">
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        Get up and running in seconds with your preferred framework:
      </p>

      {/* Framework Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1 mb-6 w-fit">
        {frameworks.map((framework, index) => (
          <button
            key={framework.name}
            onClick={() => setActiveFramework(index)}
            className={`px-4 py-2 rounded-md font-medium transition-all ${
              activeFramework === index
                ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            {framework.name}
          </button>
        ))}
      </div>

      <CodeBlock
        title={`${frameworks[activeFramework].name} Example`}
        code={frameworks[activeFramework].code}
        language={frameworks[activeFramework].language}
      />

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-4">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          ✅ Tree-shaking ensures only imported icons are bundled, keeping your
          app lightweight across all frameworks.
        </p>
      </div>
    </DocSection>
  );
}
