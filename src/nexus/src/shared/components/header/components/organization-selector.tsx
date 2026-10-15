'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { usePostHog } from 'posthog-js/react';
import { Avatar } from '@/shared/components/ui/avatar';
import { SearchField } from '@/shared/components/ui/search-field';
import Dialog from '@/shared/components/ui/dialog';
import { useUser } from '@/shared/hooks/useUser';
import { useUserActions } from '@/shared/hooks/useUserActions';
import {
  useDiscoverGroups,
  useRequestGroupAccess,
} from '@/shared/hooks/useGroups';
import {
  isDefaultAirQoGroup,
  mergeOrganizationOptions,
} from '@/shared/utils/groupUtils';
import { normalizeDiscoveredGroups } from '@/shared/utils/userUtils';
import type { NormalizedGroup } from '@/shared/utils/userUtils';
import { startPendingGroupSwitch } from '@/shared/store/userSlice';
import { AqGrid01 } from '@airqo/icons-react';
import { capturePostHogEvent } from '@/shared/utils/analytics';
import { ANALYTICS_EVENTS } from '@/shared/utils/analyticsConstants';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';

const REQUEST_ACCESS_FALLBACK_MESSAGE =
  'We couldn’t submit your request right now. Please try again.';

const ORGANIZATION_SELECTOR_BADGE_STORAGE_KEY =
  'airqo.nexus.organization-selector-new-badge.v1';
const ORGANIZATION_SELECTOR_BADGE_DURATION_MS = 14 * 24 * 60 * 60 * 1000;

const getOrganizationSelectorBadgeVisibility = (): {
  isVisible: boolean;
  remainingMs: number;
} => {
  const now = Date.now();

  try {
    const storedFirstSeenAt = window.localStorage.getItem(
      ORGANIZATION_SELECTOR_BADGE_STORAGE_KEY
    );
    const firstSeenAt = Number(storedFirstSeenAt);

    if (
      !storedFirstSeenAt ||
      !Number.isFinite(firstSeenAt) ||
      firstSeenAt <= 0
    ) {
      window.localStorage.setItem(
        ORGANIZATION_SELECTOR_BADGE_STORAGE_KEY,
        String(now)
      );
      return {
        isVisible: true,
        remainingMs: ORGANIZATION_SELECTOR_BADGE_DURATION_MS,
      };
    }

    const elapsedMs = now - firstSeenAt;
    const remainingMs = ORGANIZATION_SELECTOR_BADGE_DURATION_MS - elapsedMs;

    return {
      isVisible: remainingMs > 0,
      remainingMs: Math.max(0, remainingMs),
    };
  } catch {
    // Storage can be unavailable in privacy-restricted browser contexts. Keep
    // the announcement useful for the current session in that case.
    return {
      isVisible: true,
      remainingMs: ORGANIZATION_SELECTOR_BADGE_DURATION_MS,
    };
  }
};

const getRequestAccessErrorMessage = (error: unknown): string => {
  const message = getUserFriendlyErrorMessage(error);
  return /internal server error|cannot read properties of undefined/i.test(
    message
  )
    ? REQUEST_ACCESS_FALLBACK_MESSAGE
    : message;
};

export function OrganizationSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewBadge, setShowNewBadge] = useState(false);
  const [requestedIds, setRequestedIds] = useState<string[]>([]);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const router = useRouter();
  const dispatch = useDispatch();
  const posthog = usePostHog();
  const { user, groups, activeGroup } = useUser();
  const { switchGroup } = useUserActions();
  const safeGroups = React.useMemo(
    () => (Array.isArray(groups) ? groups : []),
    [groups]
  );

  const {
    data: discoverData,
    error: discoverError,
    isLoading: isDiscovering,
  } = useDiscoverGroups(isOpen, user?.id);
  const requestAccess = useRequestGroupAccess(user?.id);

  React.useEffect(() => {
    const { isVisible, remainingMs } = getOrganizationSelectorBadgeVisibility();
    setShowNewBadge(isVisible);

    if (!isVisible) return;

    const timeoutId = window.setTimeout(
      () => setShowNewBadge(false),
      remainingMs
    );
    return () => window.clearTimeout(timeoutId);
  }, []);

  const discoveredGroups = React.useMemo(
    () => (discoverError ? [] : normalizeDiscoveredGroups(discoverData)),
    [discoverData, discoverError]
  );

  React.useEffect(() => {
    setRequestedIds([]);
    setRequestingId(null);
  }, [user?.id]);

  const organizationOptions = React.useMemo(
    () =>
      mergeOrganizationOptions<NormalizedGroup>(safeGroups, discoveredGroups),
    [safeGroups, discoveredGroups]
  );

  const handleRequestAccess = async (group: NormalizedGroup) => {
    if (!user?.id || requestingId || requestedIds.includes(group.id)) return;
    setRequestingId(group.id);
    try {
      await requestAccess.trigger({ groupId: group.id });
      toast.success(
        'Request sent',
        'Your organization access request has been submitted.'
      );
      setRequestedIds(prev => [...prev, group.id]);
      capturePostHogEvent(
        posthog,
        ANALYTICS_EVENTS.ORGANIZATION_ACCESS_REQUESTED,
        {
          organization_id: group.id,
          organization_slug: group.organizationSlug,
        }
      );
    } catch (error) {
      toast.error('Request failed', getRequestAccessErrorMessage(error));
    } finally {
      setRequestingId(null);
    }
  };

  const handleOpen = () => {
    capturePostHogEvent(
      posthog,
      ANALYTICS_EVENTS.ORGANIZATION_SELECTOR_OPENED,
      {
        available_organization_count: safeGroups.length,
      }
    );
    setIsOpen(true);
  };
  const handleClose = () => setIsOpen(false);

  const handleGroupSwitch = (groupId: string) => {
    const selectedGroup = safeGroups.find(g => g.id === groupId);
    if (!selectedGroup || selectedGroup.id === activeGroup?.id) return;
    const organizationSlug = selectedGroup.organizationSlug?.trim();
    const isIndividualDestination =
      isDefaultAirQoGroup(selectedGroup) || !organizationSlug;
    capturePostHogEvent(posthog, ANALYTICS_EVENTS.ORGANIZATION_SELECTED, {
      available_organization_count: safeGroups.length,
      selection_type: isIndividualDestination ? 'individual' : 'organization',
    });
    const destinationPath = isIndividualDestination
      ? '/user/home'
      : `/org/${encodeURIComponent(organizationSlug)}/dashboard`;

    // Close dialog first
    handleClose();

    dispatch(
      startPendingGroupSwitch({
        targetGroupId: selectedGroup.id,
        targetGroupName:
          selectedGroup.title ||
          selectedGroup.organizationSlug ||
          'organization',
        destinationPath,
        startedAt: new Date().toISOString(),
      })
    );

    // Switch group context (updates Redux + invalidates group-scoped SWR/RQ caches)
    // before navigating so that when the new page mounts, group context is already
    // correct and ActiveGroupGuard doesn't need to re-sync.
    switchGroup(selectedGroup);

    router.push(destinationPath);
  };

  const filteredOptions = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return organizationOptions;
    return organizationOptions.filter(({ group }) => {
      const title = (group.title || '').toLowerCase();
      const slug = (group.organizationSlug || '').toLowerCase();
      return title.includes(q) || slug.includes(q);
    });
  }, [organizationOptions, searchTerm]);

  /**
   * Shared avatar + title markup used by both the member (switchable) and
   * non-member (request-access) rows.
   */
  const GroupRowIdentity = ({ group }: { group: NormalizedGroup }) => (
    <>
      <Avatar
        src={undefined}
        fallback={group.title?.charAt(0)?.toUpperCase() || 'A'}
        size="sm"
        className="flex-shrink-0"
      />
      <div className="min-w-0 flex-1">
        <div className="font-medium text-sm text-foreground truncate uppercase">
          {group.title}
        </div>
      </div>
    </>
  );

  // Hide component if loading or no groups available
  // if (isLoading || groups.length === 0) {
  //   return null;
  // }

  return (
    <div className="relative flex items-center">
      {showNewBadge && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-0 top-0 z-10 -translate-y-1/2 rounded-full border border-background bg-primary px-1.5 py-0.5 text-[9px] font-bold uppercase leading-none tracking-wide text-primary-foreground shadow-sm"
        >
          New
        </span>
      )}
      <button
        type="button"
        onClick={handleOpen}
        aria-label={
          showNewBadge ? 'Open organizations (new)' : 'Open organizations'
        }
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
        subtitle={`${filteredOptions.length} of ${organizationOptions.length} available`}
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
              onClear={() => setSearchTerm('')}
              className="w-full"
            />
          </div>

          {isDiscovering && organizationOptions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Loading organizations...
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto space-y-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(({ group, isMember }) => {
                  const isCurrent = activeGroup?.id === group.id;
                  const hasRequested = requestedIds.includes(group.id);
                  const isRequesting = requestingId === group.id;

                  if (isMember) {
                    return (
                      <button
                        key={group.id}
                        type="button"
                        onClick={() => handleGroupSwitch(group.id)}
                        aria-label={`Switch to ${group.title || 'organization'}`}
                        className={`w-full text-left px-3 py-2.5 rounded-md transition-colors duration-150 flex items-center gap-3 ${
                          isCurrent
                            ? 'bg-primary/10 border border-primary/20 shadow-sm'
                            : 'hover:bg-muted border border-transparent'
                        }`}
                      >
                        <GroupRowIdentity group={group} />
                        <span
                          className={`flex-shrink-0 text-xs font-medium ${
                            isCurrent ? 'text-primary' : 'text-muted-foreground'
                          }`}
                        >
                          {isCurrent ? 'Current' : 'Member'}
                        </span>
                      </button>
                    );
                  }

                  return (
                    <div
                      key={group.id}
                      className="w-full text-left px-3 py-2.5 rounded-md flex items-center gap-3 border border-transparent"
                    >
                      <GroupRowIdentity group={group} />
                      <button
                        type="button"
                        onClick={() => handleRequestAccess(group)}
                        disabled={hasRequested || isRequesting}
                        className="flex-shrink-0 text-xs font-medium px-3 py-1 rounded-md border border-primary/40 text-primary hover:bg-primary/5 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                      >
                        {hasRequested
                          ? 'Requested'
                          : isRequesting
                            ? 'Requesting...'
                            : 'Request Access'}
                      </button>
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
          )}
        </div>
      </Dialog>
    </div>
  );
}

export default OrganizationSelector;
