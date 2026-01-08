"use client";
import React, { useState, useRef, useEffect } from "react";
import { Search, Filter, X } from "lucide-react";
import { useIconGroups } from "@airqo/icons-react";

interface Props {
  value: string;
  onChange: (q: string) => void;
  selectedGroup: string | null;
  onGroupChange: (group: string | null) => void;
  onClearSearch?: () => void;
}

export default function IconSearchAndFilterBar({
  value,
  onChange,
  selectedGroup,
  onGroupChange,
  onClearSearch,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { groups, isLoading: groupsLoading } = useIconGroups();
  const filterRef = useRef<HTMLDivElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        filterRef.current &&
        !filterRef.current.contains(event.target as Node)
      ) {
        setIsFilterOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGroupSelect = (groupName: string | null) => {
    onGroupChange(groupName);
    setSearchTerm("");
    setIsFilterOpen(false);
  };

  const clearSelection = () => {
    onGroupChange(null);
  };

  const clearSearchField = () => {
    onChange("");
    if (onClearSearch) onClearSearch();
  };

  const currentGroup = groups.find((g) => g.name === selectedGroup);

  // Filter groups based on search term
  const filteredGroups = groups.filter(
    (group) =>
      group.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <section
      className={`bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 z-40 transition-all duration-300 sticky top-16 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="mx-auto max-w-7xl px-4 py-4">
        <div className="relative flex items-center gap-2">
          {/* Search Input */}
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search icons..."
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              aria-label="Search icons"
            />
            {value && (
              <button
                onClick={clearSearchField}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                aria-label="Clear search"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Filter Button */}
          <div className="relative" ref={filterRef}>
            <div
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-1 px-3 py-2 text-sm rounded-md border cursor-pointer ${
                selectedGroup
                  ? "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
              }`}
              aria-haspopup="true"
              aria-expanded={isFilterOpen}
            >
              <Filter className="h-4 w-4" />
              <span className="truncate max-w-[120px]">
                {currentGroup
                  ? currentGroup.displayName || currentGroup.name
                  : "All Groups"}
              </span>
              {selectedGroup && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    clearSelection();
                  }}
                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  aria-label="Clear filter"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Filter Dropdown */}
            {isFilterOpen && (
              <div className="absolute right-0 z-50 mt-1 w-64 origin-top-right rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                {/* Search input inside dropdown */}
                <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="Search groups..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                      aria-label="Search groups"
                      onClick={(e) => e.stopPropagation()}
                      autoFocus
                    />
                  </div>
                </div>

                {/* Scrollable group list */}
                <div className="max-h-60 overflow-y-auto">
                  <button
                    onClick={() => handleGroupSelect(null)}
                    className={`block w-full text-left px-4 py-2 text-sm ${
                      !selectedGroup
                        ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Groups
                  </button>

                  {groupsLoading ? (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      Loading groups...
                    </div>
                  ) : filteredGroups.length === 0 ? (
                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                      No groups found
                    </div>
                  ) : (
                    filteredGroups.map((group) => (
                      <button
                        key={group.name}
                        onClick={() => handleGroupSelect(group.name)}
                        className={`block w-full text-left px-4 py-2 text-sm truncate ${
                          selectedGroup === group.name
                            ? "bg-blue-100 text-blue-900 dark:bg-blue-900/30 dark:text-blue-200"
                            : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                        }`}
                      >
                        {group.displayName || group.name}
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
