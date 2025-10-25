'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/shared/components/ui/avatar';
import { SearchField } from '@/shared/components/ui/search-field';
import Dialog from '@/shared/components/ui/dialog';
import { useUserActions } from '@/shared/hooks';
import { AqGrid01 } from '@airqo/icons-react';

export const OrganizationSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();
  const { groups, activeGroup, switchGroupById, isLoading } = useUserActions();

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  // Utility function to clean up display text
  const cleanDisplayText = (text: string | undefined): string => {
    if (!text) return '';
    return text
      .replace(/_/g, ' ') // Replace underscores with spaces
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' '); // Capitalize each word
  };

  const handleGroupSwitch = (groupId: string) => {
    const selectedGroup = groups.find(g => g.id === groupId);
    if (!selectedGroup) return;

    // Determine navigation target based on group type BEFORE switching
    // AIRQO group detection: check multiple conditions for robustness
    const isAirQoGroup =
      // Check if title matches AIRQO (case insensitive)
      selectedGroup.title?.toLowerCase() === 'airqo' ||
      // Check if organization slug is airqo
      selectedGroup.organizationSlug?.toLowerCase() === 'airqo' ||
      // Check if no organization slug (default user flow)
      !selectedGroup.organizationSlug ||
      // Fallback: check if title contains airqo
      selectedGroup.title?.toLowerCase().includes('airqo');

    // Switch the group first
    switchGroupById(groupId);

    // Close dialog
    handleClose();

    // Navigate based on group type
    if (isAirQoGroup) {
      router.push('/user/home');
    } else {
      const orgSlug = selectedGroup.organizationSlug;
      if (orgSlug) {
        router.push(`/org/${orgSlug}/dashboard`);
      }
    }
  };

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups;
    return groups.filter(
      group =>
        group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        group.organizationSlug
          ?.toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        cleanDisplayText(group.title)
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
    );
  }, [groups, searchTerm]);

  // Hide component if loading or no groups available
  if (isLoading || groups.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center">
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Open organizations"
        className="inline-flex items-center gap-2 px-3 py-1 text-sm font-medium border border-primary/30 bg-transparent rounded-md transition-all duration-200 hover:bg-primary/5 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Avatar
          src={undefined}
          fallback={activeGroup?.title?.charAt(0)?.toUpperCase() || 'A'}
          size="sm"
          className="flex-shrink-0"
        />
        <span className="hidden sm:inline uppercase font-medium truncate max-w-[120px]">
          {cleanDisplayText(activeGroup?.title) || 'AIRQO'}
        </span>
        <AqGrid01 className="w-4 h-4 flex-shrink-0" />
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={handleClose}
        title="Organizations"
        size="lg"
        subtitle={`${filteredGroups.length} of ${groups.length} available`}
        primaryAction={{
          label: 'Request New Organization',
          onClick: () => {
            router.push('/request-organization');
          },
        }}
        secondaryAction={{ label: 'Close', onClick: handleClose }}
        contentAreaClassName="px-4 py-2"
        maxHeight="max-h-[60vh]"
      >
        <div className="space-y-4">
          <div>
            <SearchField
              placeholder="Search organizations..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="max-h-80 overflow-y-auto space-y-1">
            {filteredGroups.length > 0 ? (
              filteredGroups.map(group => (
                <button
                  key={group.id}
                  onClick={() => handleGroupSwitch(group.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-md transition-colors duration-150 flex items-center justify-between group relative ${
                    activeGroup?.id === group.id
                      ? 'bg-primary/10 border border-primary/20 shadow-sm'
                      : 'hover:bg-muted border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <Avatar
                      src={undefined}
                      fallback={group.title?.charAt(0)?.toUpperCase() || 'A'}
                      size="sm"
                      className="flex-shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm text-foreground truncate uppercase">
                          {cleanDisplayText(group.title)}
                        </div>
                        <span
                          className={`px-1.5 py-0.5 rounded text-xs font-medium ml-2 flex-shrink-0 ${
                            group.status === 'active'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {group.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <div className="text-sm font-medium mb-1">
                  No organizations found
                </div>
                <div className="text-xs">Try adjusting your search terms</div>
              </div>
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default OrganizationSelector;
