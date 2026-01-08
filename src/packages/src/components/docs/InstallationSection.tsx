// components/docs/InstallationSection.tsx
import React from "react";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

export default function InstallationSection() {
  return (
    <DocSection id="installation" title="🚀 Installation">
      <p className="text-gray-600 dark:text-gray-300 mb-6">
        AirQo Icons provides packages for React, Vue, and Flutter. Choose your
        framework:
      </p>

      {/* React Installation */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded text-sm">
            React
          </span>
          React Package
        </h3>
        <div className="grid gap-4">
          <CodeBlock
            title="npm"
            code={`npm install @airqo/icons-react`}
            language="bash"
          />
          <CodeBlock
            title="yarn"
            code={`yarn add @airqo/icons-react`}
            language="bash"
          />
          <CodeBlock
            title="pnpm"
            code={`pnpm add @airqo/icons-react`}
            language="bash"
          />
        </div>
      </div>

      {/* Vue Installation */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded text-sm">
            Vue
          </span>
          Vue 3 Package
        </h3>
        <div className="grid gap-4">
          <CodeBlock
            title="npm"
            code={`npm install @airqo/icons-vue`}
            language="bash"
          />
          <CodeBlock
            title="yarn"
            code={`yarn add @airqo/icons-vue`}
            language="bash"
          />
          <CodeBlock
            title="pnpm"
            code={`pnpm add @airqo/icons-vue`}
            language="bash"
          />
        </div>
      </div>

      {/* Flutter Installation */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
          <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded text-sm">
            Flutter
          </span>
          Flutter Package
        </h3>
        <CodeBlock
          title="pubspec.yaml"
          code={`dependencies:
  airqo_icons_flutter: ^1.0.1`}
          language="yaml"
        />
        <div className="mt-4">
          <CodeBlock
            title="Terminal"
            code={`flutter pub get`}
            language="bash"
          />
        </div>
      </div>

      {/* Optional Fuse.js Installation */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
          Advanced Search Dependencies (React/Vue only)
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          To use advanced search utilities like{" "}
          <code>AirQOIconsUtils.searchIcons</code> or <code>useIconSearch</code>
          , install <code>fuse.js</code>:
        </p>
        <CodeBlock title="npm" code={`npm install fuse.js`} language="bash" />
      </div>
    </DocSection>
  );
}
