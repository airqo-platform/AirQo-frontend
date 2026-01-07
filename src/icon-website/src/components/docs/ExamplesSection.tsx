// components/docs/ExamplesSection.tsx
import React from "react";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

export default function ExamplesSection() {
  return (
    <DocSection id="examples" title="💡 Examples">
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Practical examples demonstrating common use cases.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
        Reusable Icon Wrapper
      </h3>
      <CodeBlock
        title="Custom Icon Component"
        code={`import type { ComponentProps } from 'react';
import { AqHome01 } from '@airqo/icons-react'; // Example base icon

interface CustomIconProps extends ComponentProps<'svg'> {
  icon: React.ComponentType<ComponentProps<'svg'>>; // Accept any icon component
  label?: string;
}

function CustomIcon({ icon: Icon, label, ...props }: CustomIconProps) {
  return (
    <span className="inline-flex items-center">
      <Icon {...props} />
      {label && <span className="ml-2">{label}</span>}
    </span>
  );
}

// Usage
<CustomIcon icon={AqHome01} label="Home" size={24} color="#3B82F6" />`}
        language="tsx"
      />

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-2">
        Dynamic Icon Selection
      </h3>
      <CodeBlock
        title="Conditional Icon Rendering"
        code={`import { AqHome01, AqUser01, AqSettings01 } from '@airqo/icons-react';
import type { ComponentProps } from 'react';

type IconName = 'home' | 'user' | 'settings';
const iconMap: Record<IconName, React.ComponentType<ComponentProps<'svg'>>> = {
  home: AqHome01,
  user: AqUser01,
  settings: AqSettings01,
};

interface DynamicIconProps extends ComponentProps<'svg'> {
  name: IconName;
}

function DynamicIcon({ name, ...props }: DynamicIconProps) {
  const IconComponent = iconMap[name];
  if (!IconComponent) {
    console.warn(\`Icon '\${name}' not found\`);
    return null; // Or a fallback icon
  }
  return <IconComponent {...props} />;
}

// Usage
<DynamicIcon name="home" size={24} />
<DynamicIcon name="user" size={20} className="text-blue-500" />`}
        language="tsx"
      />

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-2">
        Animated Icons
      </h3>
      <CodeBlock
        title="Using Framer Motion"
        code={`import { AqRefreshCw } from '@airqo/icons-react';
import { motion } from 'framer-motion';

const spinTransition = {
  loop: Infinity,
  ease: "linear",
  duration: 1
};

<motion.div
  animate={{ rotate: 360 }}
  transition={spinTransition}
>
  <AqRefreshCw />
</motion.div>`}
        language="tsx"
      />
    </DocSection>
  );
}
