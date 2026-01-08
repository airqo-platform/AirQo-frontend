// components/docs/TypeScriptSection.tsx
import React from "react";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

export default function TypeScriptSection() {
  return (
    <DocSection id="typescript" title="🔧 TypeScript Support">
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Full TypeScript support is built-in. Leverage types for props and create
        type-safe components.
      </p>
      <CodeBlock
        code={`import type { ComponentProps } from 'react';
import { AqHome01 } from '@airqo/icons-react';

// Type for icon props
type IconProps = ComponentProps<typeof AqHome01>;

// Type-safe custom component
interface ButtonWithIconProps {
  icon: React.ComponentType<ComponentProps<'svg'>>; // Accept any icon component
  children: React.ReactNode;
}

function ButtonWithIcon({ icon: Icon, children }: ButtonWithIconProps) {
  return (
    <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
      <Icon size={20} />
      <span>{children}</span>
    </button>
  );
}

// Usage
<ButtonWithIcon icon={AqHome01}>Home</ButtonWithIcon>`}
        language="tsx"
      />
    </DocSection>
  );
}
