"use client";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

const modernBlue = "#0A84FF";

export default function FlutterSection() {
  return (
    <DocSection id="flutter" title="📱 Flutter Package">
      <CodeBlock
        title="pubspec.yaml"
        code={`dependencies:
  airqo_icons_flutter: ^0.1.0`}
        language="yaml"
      />

      <CodeBlock
        title="Usage"
        code={`Icon(
  AirqoIcons.home,
  size: 32.0,
  color: Color(0xFF0A84FF),
)`}
        language="dart"
      />
      <div>
        <a
          href="https://pub.dev/packages/airqo_icons_flutter"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-white rounded-lg"
          style={{ backgroundColor: modernBlue }}
        >
          View on pub.dev
        </a>
      </div>
    </DocSection>
  );
}
