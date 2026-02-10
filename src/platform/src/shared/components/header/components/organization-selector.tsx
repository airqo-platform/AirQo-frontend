'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Avatar } from '@/shared/components/ui/avatar';
import { SearchField } from '@/shared/components/ui/search-field';
import Dialog from '@/shared/components/ui/dialog';
import { useUserActions } from '@/shared/hooks';
import { AqGrid01, AqLogOut02 } from '@airqo/icons-react';
import { useLeaveGroup } from '@/shared/hooks';
import { toast } from '@/shared/components/ui/toast';
import { Tooltip } from 'flowbite-react';

export function OrganizationSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLeaveConfirmDialog, setShowLeaveConfirmDialog] = useState(false);
  const [groupToLeave, setGroupToLeave] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const router = useRouter();
  const { groups, activeGroup, switchGroupById } = useUserActions();
  const leaveGroup = useLeaveGroup();

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleLeaveGroup = (
    e: React.MouseEvent,
    groupId: string,
    groupTitle: string
  ) => {
    e.stopPropagation();
    // Check if it's the AirQo default group
    const group = groups.find(g => g.id === groupId);
    const isAirQoGroup =
      group?.title?.toLowerCase() === 'airqo' ||
      group?.organizationSlug?.toLowerCase() === 'airqo' ||
      !group?.organizationSlug;

    if (isAirQoGroup) {
      toast.error('You cannot leave the default AirQo organization');
      return;
    }

    // Close the organizations dialog first to avoid dialog stacking
    setIsOpen(false);
    setGroupToLeave({ id: groupId, title: groupTitle });
    setShowLeaveConfirmDialog(true);
  };

  const confirmLeaveGroup = async () => {
    if (!groupToLeave) return;

    try {
      await leaveGroup.trigger({ groupId: groupToLeave.id });
      toast.success(`You have successfully left ${groupToLeave.title}`);
      
      // Close the confirmation dialog
      setShowLeaveConfirmDialog(false);
      setGroupToLeave(null);

      // Reload the page to refresh all data and group memberships
      setTimeout(() => {
        window.location.reload();
      }, 500); // Small delay to show the success toast
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to leave group';
      toast.error(errorMessage);
      setShowLeaveConfirmDialog(false);
      setGroupToLeave(null);
    }
  };

  // Utility function to clean up display text
  // const cleanDisplayText = (text: string | undefined): string => {
  //   if (!text) return '';
  //   return text
  //     .replace(/_/g, ' ') // Replace underscores with spaces
  //     .split(' ')
  //     .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
  //     .join(' '); // Capitalize each word
  // };

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

  // const filteredGroups = useMemo(() => {
  //   if (!searchTerm.trim()) return groups;
  //   return groups.filter(
  //     group =>
  //       group.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
  //       group.organizationSlug
  //         ?.toLowerCase()
  //         .includes(searchTerm.toLowerCase()) ||
  //       cleanDisplayText(group.title)
  //         .toLowerCase()
  //         .includes(searchTerm.toLowerCase())
  //   );
  // }, [groups, searchTerm]);

  // Hide component if loading or no groups available
  // if (isLoading || groups.length === 0) {
  //   return null;
  // }

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
          {activeGroup?.title || 'AIRQO'}
        </span>
        <AqGrid01 className="w-4 h-4 flex-shrink-0" />
      </button>

      <Dialog
        isOpen={isOpen}
        onClose={handleClose}
        title="Organizations"
        size="lg"
        subtitle={`${groups.length} of ${groups.length} available`}
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
            {groups.length > 0 ? (
              groups.map(group => {
                const isAirQoGroup =
                  group.title?.toLowerCase() === 'airqo' ||
                  group.organizationSlug?.toLowerCase() === 'airqo' ||
                  !group.organizationSlug;

                return (
                  <div
                    key={group.id}
                    className={`w-full text-left px-3 py-2.5 rounded-md transition-colors duration-150 flex items-center justify-between group relative ${
                      activeGroup?.id === group.id
                        ? 'bg-primary/10 border border-primary/20 shadow-sm'
                        : 'hover:bg-muted border border-transparent'
                    }`}
                  >
                    <button
                      onClick={() => handleGroupSwitch(group.id)}
                      className="flex items-center gap-3 min-w-0 flex-1"
                    >
                      <Avatar
                        src={undefined}
                        fallback={group.title?.charAt(0)?.toUpperCase() || 'A'}
                        size="sm"
                        className="flex-shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm text-foreground truncate uppercase">
                            {group.title}
                          </div>
                        </div>
                      </div>
                    </button>
                    {!isAirQoGroup && (
                      <Tooltip content="Leave organization" placement="left">
                        <button
                          onClick={(e) => handleLeaveGroup(e, group.id, group.title)}
                          className="ml-2 p-1.5 rounded-md text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                          aria-label={`Leave ${group.title}`}
                        >
                          <AqLogOut02 size={16} />
                        </button>
                      </Tooltip>
                    )}
                  </div>
                );
              })
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

      {/* Leave Group Confirmation Dialog */}
      <Dialog
        isOpen={showLeaveConfirmDialog}
        onClose={() => {
          if (!leaveGroup.isMutating) {
            setShowLeaveConfirmDialog(false);
            setGroupToLeave(null);
          }
        }}
        title="Leave Organization"
        primaryAction={{
          label: 'Leave Organization',
          onClick: confirmLeaveGroup,
          disabled: leaveGroup.isMutating,
        }}
        secondaryAction={{
          label: 'Cancel',
          onClick: () => {
            setShowLeaveConfirmDialog(false);
            setGroupToLeave(null);
          },
          disabled: leaveGroup.isMutating,
          variant: 'outlined',
        }}
      >
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Are you sure you want to leave{' '}
            <span className="font-semibold text-foreground">
              {groupToLeave?.title}
            </span>
            ?
          </p>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong>Note:</strong> You will lose access to all organization
              resources, data, and settings. This action cannot be undone.
            </p>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default OrganizationSelector;
