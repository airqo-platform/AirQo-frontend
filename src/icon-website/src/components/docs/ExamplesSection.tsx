"use client";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

export default function ExamplesSection() {
  return (
    <DocSection id="examples" title="💡 Examples">
      <CodeBlock
        title="Custom Component"
        code={`interface Props {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label?: string;
}
const ButtonWithIcon = ({ icon: Icon, label }: Props) => (
  <button className="flex items-center space-x-2">
    <Icon size={20} />
    {label && <span>{label}</span>}
  </button>
);`}
      />
    </DocSection>
  );
}
