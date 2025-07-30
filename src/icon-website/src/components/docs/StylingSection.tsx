"use client";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

export default function StylingSection() {
  return (
    <DocSection id="styling" title="🎨 Styling Examples">
      <CodeBlock
        code={`// Colors & sizes
<Home01 className="text-blue-500 w-6 h-6" />
<Home01 className="drop-shadow-lg" />`}
      />
    </DocSection>
  );
}
