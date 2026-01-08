"use client";
import React, { useState, useMemo, useEffect } from "react";
import IconLibraryHeader from "@/components/icons/IconLibraryHeader";
import IconSearchAndFilterBar from "@/components/icons/IconSearchAndFilterBar";
import IconGrid from "@/components/icons/IconGrid";
import IconPreviewDialog from "@/components/icons/IconPreviewDialog";
import { useIconSearch, AirQOIconsUtils } from "@airqo/icons-react";
import type { IconMetadata } from "@airqo/icons-react";

export default function IconLibraryPage() {
  const [query, setQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [selectedIcon, setSelectedIcon] = useState<IconMetadata | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [allIcons, setAllIcons] = useState<IconMetadata[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);

  // Load all icons on mount
  useEffect(() => {
    const icons = AirQOIconsUtils.getAllIcons();
    setAllIcons(icons);
    setIsLoadingAll(false);
  }, []);

  // Use search hook
  const { results: searchResults, isLoading: isSearching } = useIconSearch(
    query,
    {
      maxResults: 2000, // Ensure we get enough results
    }
  );

  // Filter results
  const filteredResults = useMemo(() => {
    let iconsToFilter = allIcons;

    // If there is a search query, use search results
    if (query) {
      iconsToFilter = searchResults;
    }

    // If a group is selected, filter the current set of icons
    if (selectedGroup) {
      return iconsToFilter.filter((icon) => icon.group === selectedGroup);
    }

    return iconsToFilter;
  }, [searchResults, selectedGroup, query, allIcons]);

  const clearSearch = () => {
    setQuery("");
  };

  const isLoading = isSearching || (isLoadingAll && !query);

  return (
    <div className="flex flex-col min-h-screen overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <IconLibraryHeader />
      <IconSearchAndFilterBar
        value={query}
        onChange={setQuery}
        selectedGroup={selectedGroup}
        onGroupChange={setSelectedGroup}
        onClearSearch={clearSearch}
      />
      <IconGrid
        icons={filteredResults}
        isLoading={isLoading}
        selectedGroup={selectedGroup}
        onSelect={(icon) => {
          setSelectedIcon(icon);
          setIsDialogOpen(true);
        }}
      />
      <IconPreviewDialog
        icon={selectedIcon}
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
      />
    </div>
  );
}
