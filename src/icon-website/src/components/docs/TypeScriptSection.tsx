"use client";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

export default function TypeScriptSection() {
  return (
    <DocSection id="typescript" title="🔧 TypeScript Support">
      <CodeBlock
        code={`import type { ComponentProps } from 'react';
import { Home01 } from '@airqo/icons-react';
type IconProps = ComponentProps<typeof Home01>;`}
      />
    </DocSection>
  );
}
