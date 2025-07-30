"use client";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

const propsTable = (
  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
    <thead className="bg-gray-50 dark:bg-gray-900">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Prop
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Type
        </th>
        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
          Default
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
      <tr>
        <td className="px-6 py-4 text-sm">size</td>
        <td className="px-6 py-4 text-sm">number | string</td>
        <td className="px-6 py-4 text-sm">24</td>
      </tr>
      <tr>
        <td className="px-6 py-4 text-sm">color</td>
        <td className="px-6 py-4 text-sm">string</td>
        <td className="px-6 py-4 text-sm">currentColor</td>
      </tr>
      <tr>
        <td className="px-6 py-4 text-sm">className</td>
        <td className="px-6 py-4 text-sm">string</td>
        <td className="px-6 py-4 text-sm">-</td>
      </tr>
    </tbody>
  </table>
);

export default function APIReferenceSection() {
  return (
    <DocSection id="api-reference" title="📋 API Reference">
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        All icons accept these props:
      </p>
      <CodeBlock
        title="TypeScript Interface"
        code={`interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  color?: string;
}`}
        language="typescript"
      />
      {propsTable}
    </DocSection>
  );
}
