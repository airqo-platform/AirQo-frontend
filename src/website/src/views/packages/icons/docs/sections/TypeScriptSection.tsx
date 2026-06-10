'use client';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export default function TypeScriptSection() {
  return (
    <section id="typescript" className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          🔧 TypeScript Support
        </h2>
        <p className="text-lg text-gray-600 mb-6">
          Full TypeScript support is built-in. Leverage types for props and
          create type-safe components.
        </p>
      </div>

      <div className="space-y-8">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Type-safe Component Usage
          </h3>
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            className="rounded-lg"
          >
            {`import type { ComponentProps } from 'react';
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
    <button className="flex items-center space-x-2 p-2 hover:bg-gray-100 rounded">
      <Icon size={20} />
      <span>{children}</span>
    </button>
  );
}

// Usage
<ButtonWithIcon icon={AqHome01}>Home</ButtonWithIcon>`}
          </SyntaxHighlighter>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Interface Definition
          </h3>
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            className="rounded-lg"
          >
            {`interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string; // Icon size (default: 24)
  className?: string;     // CSS classes
  color?: string;         // Icon color (default: currentColor)
  // ... all standard SVG props (onClick, onMouseOver, etc.)
}`}
          </SyntaxHighlighter>
        </div>

        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Dynamic Icon Selection with Types
          </h3>
          <SyntaxHighlighter
            language="typescript"
            style={vscDarkPlus}
            className="rounded-lg"
          >
            {`import { AqHome01, AqUser01, AqSettings01 } from '@airqo/icons-react';
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
          </SyntaxHighlighter>
        </div>
      </div>
    </section>
  );
}
