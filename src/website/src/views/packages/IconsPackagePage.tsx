'use client';
import type { IconMetadata } from '@airqo/icons-react';
import {
  AirQOIconsUtils,
  AqBox,
  AqDownload01,
  AqGlobe02,
  AqSettings01,
  useIconSearch,
} from '@airqo/icons-react';
import React, { useEffect, useMemo, useState } from 'react';
import { Toaster } from 'react-hot-toast';

import BackButton from '@/components/common/BackButton';
import GroupFilter from '@/components/packages/GroupFilter';
import IconGrid from '@/components/packages/IconGrid';
import IconPreviewDialog from '@/components/packages/IconPreviewDialog';
import SearchBar from '@/components/packages/SearchBar';
import StatCard from '@/components/packages/StatCard';

export default function IconsPackagePage() {
  const [query, setQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<IconMetadata | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allIcons, setAllIcons] = useState<IconMetadata[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [groups, setGroups] = useState<
    Array<{ name: string; displayName?: string; count: number }>
  >([]);

  // Load all icons on mount
  useEffect(() => {
    try {
      const icons = AirQOIconsUtils.getAllIcons();
      setAllIcons(icons);

      // Get groups with counts
      const allGroups = AirQOIconsUtils.getAllGroups();
      const groupsWithCounts = allGroups.map((group) => ({
        name: group.name,
        displayName: group.displayName,
        count: icons.filter((icon) => icon.group === group.name).length,
      }));
      setGroups(groupsWithCounts);
    } catch (error) {
      console.error('Error loading icons:', error);
    } finally {
      setIsLoadingAll(false);
    }
  }, []);

  // Use search hook
  const { results: searchResults, isLoading: isSearching } = useIconSearch(
    query,
    { maxResults: 2000 },
  );

  // Filter results
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

      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
        {/* Top sticky header removed - banner contains back button */}

        {/* Hero Section */}
        <div className="bg-gradient-to-r from-[#1651C6] to-[#0D388E] text-white py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-6">
              <BackButton
                fallbackUrl="/packages"
                label="Back to Packages"
                className="text-white hover:text-white"
              />
            </div>
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold">
                AirQo Icon Library
              </h1>
              <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                1,383+ beautiful icons for React, Vue, and Flutter. Fully
                customizable with TypeScript support.
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={<AqBox className="w-6 h-6" />}
              label="Total Icons"
              value="1,383+"
            />
            <StatCard
              icon={<AqSettings01 className="w-6 h-6" />}
              label="Categories"
              value="22"
            />
            <StatCard
              icon={<AqGlobe02 className="w-6 h-6" />}
              label="Frameworks"
              value="3"
              description="React, Vue, Flutter"
            />
            <StatCard
              icon={<AqDownload01 className="w-6 h-6" />}
              label="Weekly Downloads"
              value="36+"
            />
          </div>
        </div>

        {/* Search and Filter */}
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

        {/* Icon Grid */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <IconGrid
            icons={filteredResults}
            isLoading={isSearching || isLoadingAll}
            onSelectIcon={handleSelectIcon}
          />
        </div>

        {/* Icon Preview Dialog */}
        <IconPreviewDialog
          icon={selectedIcon}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
        />
      </div>
    </>
  );
}
