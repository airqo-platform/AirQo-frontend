'use client';
import React, { useState } from 'react';
import toast from 'react-hot-toast';

export default function QuickStartSection() {
  const [activeTab, setActiveTab] = useState<'react' | 'vue'>('react');

  const codeSnippets = {
    react: `import { AqHome01 } from '@airqo/icons-react';

export default function App() {
  return (
    <AqHome01 
      size={24} 
      color="#0284C7" 
    />
  );
}`,
    vue: `<script setup>
import { AqHome01 } from '@airqo/icons-vue';
</script>

<template>
  <AqHome01 
    :size="24" 
    color="#0284C7" 
  />
</template>`,
  };

  const copyCode = () => {
    navigator.clipboard.writeText(codeSnippets[activeTab]);
    toast.success('Code copied!');
  };

  return (
    <section id="quick-start" className="scroll-mt-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Start</h2>
      <p className="text-gray-600 mb-6">
        Import icons directly from the package. The icons are named with an
        <code className="mx-1 bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 text-sm font-mono">
          Aq
        </code>
        prefix followed by the icon name in PascalCase.
      </p>

      <div className="bg-gray-900 rounded-xl overflow-hidden shadow-lg border border-gray-800">
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setActiveTab('react')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'react'
                ? 'bg-gray-800 text-white border-b-2 border-blue-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            React
          </button>
          <button
            onClick={() => setActiveTab('vue')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'vue'
                ? 'bg-gray-800 text-white border-b-2 border-green-500'
                : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
            }`}
          >
            Vue 3
          </button>
        </div>
        <div className="p-6 relative group">
          <pre className="text-gray-300 font-mono text-sm overflow-x-auto">
            <code>{codeSnippets[activeTab]}</code>
          </pre>
          <button
            onClick={copyCode}
            className="absolute top-4 right-4 p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-all border border-gray-700 hover:border-gray-600"
          >
            <span className="text-xs font-medium">Copy</span>
          </button>
        </div>
      </div>
    </section>
  );
}
