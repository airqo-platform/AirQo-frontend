"use client";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

export default function UtilitiesSection() {
  return (
    <DocSection id="utilities" title="🧰 Utilities & Hooks">
      <CodeBlock
        code={`import { AirQOIconsUtils, useIconSearch } from '@airqo/icons-react';

// Utils
const allIcons = AirQOIconsUtils.getAllIcons();
const search   = AirQOIconsUtils.searchIcons('user');

// Hook
const icons = useIconSearch('user');`}
      />
    </DocSection>
  );
}
