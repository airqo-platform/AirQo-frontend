// components/docs/UtilitiesAndHooksSection.tsx
import React from "react";
import DocSection from "./DocSection";
import CodeBlock from "./CodeBlock";

export default function UtilitiesAndHooksSection() {
  return (
    <DocSection id="utilities-hooks" title="🧰 Utilities & Hooks">
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        The package provides powerful utilities and React hooks for advanced
        icon management.
      </p>

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">
        Utility Class:{" "}
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
          AirQOIconsUtils
        </code>
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-3">
        Static methods for programmatic icon access and manipulation.
      </p>
      <CodeBlock
        code={`import { AirQOIconsUtils } from '@airqo/icons-react';

// Get all registered icons
const allIcons = AirQOIconsUtils.getAllIcons();

// Search icons by name, group, or tags
const searchResults = AirQOIconsUtils.searchIcons('chart', {
  maxResults: 10,
  groupFilter: ['Charts', 'General'],
});

// Intelligent search with suggestions
const intelligentResults = AirQOIconsUtils.intelligentSearch('user');
console.log(intelligentResults.exactMatches);
console.log(intelligentResults.fuzzyMatches);
console.log(intelligentResults.suggestions);

// Get all icon groups
const groups = AirQOIconsUtils.getAllGroups();

// Get icons by group
const chartIcons = AirQOIconsUtils.getIconsByGroup('Charts');

// Get icon metadata by name
const homeIcon = AirQOIconsUtils.getIcon('AqHome01');

// Get popular icons
const popularIcons = AirQOIconsUtils.getPopularIcons(20);`}
        language="tsx"
      />

      <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-8 mb-3">
        React Hooks
      </h3>
      <p className="text-gray-600 dark:text-gray-300 mb-3">
        Convenient hooks for integrating icons into your React components.
      </p>

      <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-4 mb-2">
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
          useIconSearch
        </code>
      </h4>
      <CodeBlock
        code={`import { useIconSearch } from '@airqo/icons-react';
import { useState } from 'react';

function IconBrowser() {
  const [query, setQuery] = useState('');
  const { results, isLoading } = useIconSearch(query, {
    maxResults: 50,
    debounceMs: 300, // Wait 300ms after typing stops before searching
  });

  return (
    <div>
      <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search icons..." />
      {isLoading ? <div>Searching...</div> : (
        <div className="grid grid-cols-6 gap-4">
          {results.map((icon) => (
            <div key={icon.name} className="text-center">
              <icon.component size={32} />
              <span className="text-sm">{icon.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}`}
        language="tsx"
      />

      <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-2">
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
          useIconGroups
        </code>{" "}
        &{" "}
        <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
          useIconsByGroup
        </code>
      </h4>
      <CodeBlock
        code={`import { useIconGroups, useIconsByGroup } from '@airqo/icons-react';
import { useState } from 'react';

function GroupedIconBrowser() {
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const { groups } = useIconGroups(); // Get all groups
  const { icons: groupIcons } = useIconsByGroup(selectedGroup || '', 'name'); // Get icons for selected group

  return (
    <div>
       <select onChange={(e) => setSelectedGroup(e.target.value || null)} value={selectedGroup || ''}>
        <option value="">All Groups</option>
        {groups.map(group => (
          <option key={group.name} value={group.name}>{group.displayName || group.name}</option>
        ))}
      </select>
      <div className="grid grid-cols-6 gap-4 mt-4">
        {groupIcons.map((icon) => (
          <div key={icon.name} className="text-center">
            <icon.component size={32} />
            <span className="text-sm">{icon.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}`}
        language="tsx"
      />

      <h4 className="text-md font-semibold text-gray-700 dark:text-gray-300 mt-6 mb-2">
        Other Useful Hooks
      </h4>
      <ul className="list-disc pl-5 space-y-1 text-gray-600 dark:text-gray-300">
        <li>
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
            useIcon(iconName: string)
          </code>{" "}
          - Fetch a single icon&apos;s metadata.
        </li>
        <li>
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
            usePopularIcons(limit?: number)
          </code>{" "}
          - Get a list of popular icons.
        </li>
        <li>
          <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-sm">
            useSimilarIcons(iconName: string, limit?: number)
          </code>{" "}
          - Find icons similar to a given one.
        </li>
      </ul>
    </DocSection>
  );
}
