// components/docs/StylingSection.tsx
import React from "react";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

export default function StylingSection() {
  return (
    <DocSection id="styling" title="🎨 Styling Examples">
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        Style icons using props or CSS classes for maximum flexibility.
      </p>

      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mt-4 mb-2">
        Using Props
      </h4>
      <CodeBlock
        code={`<AqHome01 size={32} color="#3B82F6" />
<AqSettings01 size="2rem" className="text-purple-500 hover:text-purple-700" />`}
        language="tsx"
      />

      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">
        CSS Classes & Tailwind
      </h4>
      <CodeBlock
        code={`<AqUser01 className="w-8 h-8 text-blue-500 drop-shadow-md" />
<AqSearchLg className="w-6 h-6 text-gray-400 hover:text-gray-600 transition-colors" />`}
        language="tsx"
      />

      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">
        CSS Modules
      </h4>
      <CodeBlock
        title="styles.module.css"
        code={`.icon {
  color: #3b82f6;
  transition: color 0.2s ease;
}
.icon:hover {
  color: #1d4ed8;
}`}
        language="css"
      />
      <CodeBlock
        title="Component.tsx"
        code={`import styles from './styles.module.css';
import { AqHome01 } from '@airqo/icons-react';

<AqHome01 className={styles.icon} />`}
        language="tsx"
      />

      <h4 className="text-md font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-2">
        Styled Components
      </h4>
      <CodeBlock
        code={`import styled from 'styled-components';
import { AqHome01 } from '@airqo/icons-react';

const StyledIcon = styled(AqHome01)\`
  color: \${props => props.theme.primary};
  transition: color 0.2s ease;
  &:hover {
    color: \${props => props.theme.primaryDark};
  }
\`;`}
        language="tsx"
      />
    </DocSection>
  );
}
