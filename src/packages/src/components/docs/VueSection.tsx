// components/docs/VueSection.tsx
import React from "react";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

const modernBlue = "#0A84FF";

export default function VueSection() {
  return (
    <DocSection id="vue" title="🖖 Vue 3 Package">
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        AirQo Icons provides full Vue 3 support with Composition API and
        TypeScript integration.
      </p>

      {/* Installation */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Installation
        </h3>
        <CodeBlock
          title="Install Vue Package"
          code={`npm install @airqo/icons-vue`}
          language="bash"
        />
      </div>

      {/* Basic Usage */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Basic Usage
        </h3>
        <CodeBlock
          title="Single File Component"
          code={`<template>
  <div class="flex items-center gap-4">
    <AqHome01 :size="24" class="text-blue-600" />
    <AqBarChart01 :size="32" color="#10b981" />
    <AqUganda :size="20" class="border rounded" />
  </div>
</template>

<script setup>
import { AqHome01, AqBarChart01, AqUganda } from '@airqo/icons-vue';
</script>`}
          language="vue"
        />
      </div>

      {/* Props API */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Props API
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          All Vue icon components accept these props:
        </p>
        <CodeBlock
          title="Props Interface"
          code={`interface IconProps {
  size?: number | string; // Default: 24
  color?: string; // Default: 'currentColor'
  class?: string; // CSS classes
}`}
          language="typescript"
        />
      </div>

      {/* Advanced Examples */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Advanced Examples
        </h3>

        <div className="space-y-6">
          {/* Dynamic Icons */}
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              Dynamic Icons
            </h4>
            <CodeBlock
              title="Dynamic Component"
              code={`<template>
  <component 
    :is="iconComponent" 
    :size="24" 
    :color="iconColor" 
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import { AqHome01, AqSettings01, AqUser01 } from '@airqo/icons-vue';

const iconName = ref('home');
const iconColor = ref('#6366f1');

const iconComponent = computed(() => {
  const iconMap = {
    home: AqHome01,
    settings: AqSettings01,
    user: AqUser01,
  };
  return iconMap[iconName.value] || AqHome01;
});
</script>`}
              language="vue"
            />
          </div>

          {/* Theme-aware Icons */}
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              Theme-aware Icons
            </h4>
            <CodeBlock
              title="Responsive Theme"
              code={`<template>
  <AqSun 
    :size="iconSize" 
    :color="isDark ? '#fbbf24' : '#f59e0b'" 
    class="transition-colors duration-200"
  />
</template>

<script setup>
import { ref, computed } from 'vue';
import { AqSun } from '@airqo/icons-vue';

const isDark = ref(false);
const iconSize = computed(() => window.innerWidth > 600 ? 32 : 24);
</script>`}
              language="vue"
            />
          </div>
        </div>
      </div>

      {/* Framework Integration */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">
          Framework Integration
        </h3>

        <div className="space-y-4">
          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nuxt.js
            </h4>
            <CodeBlock
              title="pages/index.vue"
              code={`<template>
  <div>
    <h1 class="flex items-center gap-2">
      <AqAirqo :size="32" />
      Air Quality Dashboard
    </h1>
    <AqBarChart01 :size="48" class="text-blue-500" />
  </div>
</template>

<script setup>
import { AqAirqo, AqBarChart01 } from '@airqo/icons-vue';
</script>`}
              language="vue"
            />
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vite + Vue 3
            </h4>
            <CodeBlock
              title="main.ts"
              code={`import { createApp } from 'vue';
import App from './App.vue';

const app = createApp(App);
app.mount('#app');`}
              language="typescript"
            />
          </div>
        </div>
      </div>

      {/* Performance Notes */}
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
        <h4 className="text-sm font-semibold text-green-800 dark:text-green-300 mb-2">
          Performance Notes
        </h4>
        <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
          <li>• Bundle size: ~6.4MB total, ~4-6KB per icon</li>
          <li>• Tree-shakable: Import only what you need</li>
          <li>• SSR compatible: Works with Nuxt.js and SSR frameworks</li>
          <li>• Vue 3.3+ with Composition API support</li>
        </ul>
      </div>

      <div className="mt-6">
        <a
          href="https://www.npmjs.com/package/@airqo/icons-vue"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 text-white rounded-lg shadow hover:shadow-md transition-shadow"
          style={{ backgroundColor: modernBlue }}
        >
          View on npm
        </a>
      </div>
    </DocSection>
  );
}
