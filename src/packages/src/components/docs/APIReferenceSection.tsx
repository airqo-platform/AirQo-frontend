// components/docs/APIReferenceSection.tsx
import React from "react";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

// Define the props table data
const propsData = [
  {
    prop: "size",
    type: "number | string",
    default: "24",
    description: "Sets the width and height of the icon.",
  },
  {
    prop: "color",
    type: "string",
    default: "currentColor",
    description: "Sets the fill/stroke color of the icon.",
  },
  {
    prop: "className",
    type: "string",
    default: "-",
    description: "Applies custom CSS classes.",
  },
  {
    prop: "...props",
    type: "SVGProps<SVGSVGElement>",
    default: "-",
    description:
      "All standard SVG attributes are supported (e.g., onClick, onMouseOver).",
  },
];

export default function APIReferenceSection() {
  return (
    <DocSection id="api-reference" title="📋 API Reference">
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        All icons accept these common props, extending standard SVG attributes:
      </p>
      <CodeBlock
        title="TypeScript Interface"
        code={`interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string; // Icon size (default: 24)
  className?: string;     // CSS classes
  color?: string;         // Icon color (default: currentColor)
  // ... all standard SVG props (onClick, onMouseOver, etc.)
}`}
        language="typescript"
      />

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prop
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Default
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {propsData.map((row, index) => (
              <tr
                key={index}
                className={
                  index % 2 === 0
                    ? "bg-white dark:bg-gray-800"
                    : "bg-gray-50 dark:bg-gray-900"
                }
              >
                <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                  {row.prop}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 font-mono">
                  {row.type}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {row.default}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                  {row.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DocSection>
  );
}
