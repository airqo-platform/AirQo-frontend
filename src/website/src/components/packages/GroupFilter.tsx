'use client';
import React from 'react';

interface GroupFilterProps {
  groups: Array<{ name: string; displayName?: string; count?: number }>;
  selectedGroup: string | null;
  onSelectGroup: (group: string | null) => void;
}

export default function GroupFilter({
  groups,
  selectedGroup,
  onSelectGroup,
}: GroupFilterProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700">
        Filter by Category
      </label>
      <select
        value={selectedGroup || ''}
        onChange={(e) => onSelectGroup(e.target.value || null)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
      >
        <option value="">
          All Categories ({groups.reduce((sum, g) => sum + (g.count || 0), 0)})
        </option>
        {groups.map((group) => (
          <option key={group.name} value={group.name}>
            {group.displayName || group.name}{' '}
            {group.count && `(${group.count})`}
          </option>
        ))}
      </select>
    </div>
  );
}
