import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

export default function InstallationSection() {
  return (
    <DocSection id="installation" title="🚀 Installation">
      <p className="text-gray-600 dark:text-gray-300">
        Install AirQO Icons using your preferred package manager:
      </p>
      <div className="grid gap-4">
        <CodeBlock title="npm" code="npm install @airqo/icons-react" />
        <CodeBlock title="yarn" code="yarn add @airqo/icons-react" />
        <CodeBlock title="pnpm" code="pnpm add @airqo/icons-react" />
      </div>
    </DocSection>
  );
}
