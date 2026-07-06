'use client';

import type { IconMetadata } from '@airqo/icons-react';
import { AirQOIconsUtils, useIconSearch } from '@airqo/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';

import GroupFilter from '@/components/packages/GroupFilter';
import IconGrid from '@/components/packages/IconGrid';
import IconPreviewDialog from '@/components/packages/IconPreviewDialog';
import SearchBar from '@/components/packages/SearchBar';

export default function IconsPackageBrowser() {
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<IconMetadata | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allIcons, setAllIcons] = useState<IconMetadata[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [groups, setGroups] = useState<
    Array<{ name: string; displayName?: string; count: number }>
  >([]);
  const [iconsLoadError, setIconsLoadError] = useState<string | null>(null);

  const loadIcons = async () => {
    setIsLoadingAll(true);
    setIconsLoadError(null);
    try {
      const icons = AirQOIconsUtils.getAllIcons();
      setAllIcons(icons);

      const allGroups = AirQOIconsUtils.getAllGroups();
      const groupsWithCounts = allGroups.map((group) => ({
        name: group.name,
        displayName: group.displayName,
        count: icons.filter((icon) => icon.group === group.name).length,
      }));
      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error loading icons:', error);
      setIconsLoadError(
        error instanceof Error ? error.message : 'Failed to load icons',
      );
    } finally {
      setIsLoadingAll(false);
    }
  };

  useEffect(() => {
    loadIcons();
  }, []);

  const { results: searchResults, isLoading: isSearching } = useIconSearch(
    query,
    { maxResults: 2000 },
  );

  const filteredResults = useMemo(() => {
    const iconsToFilter = query ? searchResults : allIcons;

    if (selectedGroup) {
      return iconsToFilter.filter((icon) => icon.group === selectedGroup);
    }

    return iconsToFilter;
  }, [searchResults, selectedGroup, query, allIcons]);

  const handleSelectIcon = (icon: IconMetadata) => {
    setSelectedIcon(icon);
    setIsDialogOpen(true);
  };

  return (
    <>
      <Toaster position="bottom-right" containerStyle={{ zIndex: 40000 }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <SearchBar
            value={query}
            onChange={setQuery}
            resultCount={filteredResults.length}
          />
          <GroupFilter
            groups={groups}
            selectedGroup={selectedGroup}
            onSelectGroup={setSelectedGroup}
          />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {iconsLoadError ? (
          <div className="rounded-xl border bg-white p-6 text-center">
            <p className="mb-4 text-sm text-red-600">
              Failed to load icons: {iconsLoadError}
            </p>
            <button
              type="button"
              onClick={() => loadIcons()}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        ) : (
          <IconGrid
            icons={filteredResults}
            isLoading={isSearching || isLoadingAll}
            onSelectIcon={handleSelectIcon}
          />
        )}
      </div>

      <IconPreviewDialog
        icon={selectedIcon}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </>
  );
}
