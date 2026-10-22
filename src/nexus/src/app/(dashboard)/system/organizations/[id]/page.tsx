'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  AqChevronLeft,
  AqEdit05,
  AqRefreshCw05,
  AqTrash01,
} from '@airqo/icons-react';
import {
  Button,
  Card,
  Dialog,
  ErrorBanner,
  LoadingState,
  toast,
} from '@/shared/components/ui';
import SelectField from '@/shared/components/ui/select';
import { PermissionGuard } from '@/shared/components';
import { AccessDenied } from '@/shared/components/AccessDenied';
import {
  useGroupDetails,
  useRBAC,
  useRolesByGroup,
  useSetGroupManager,
} from '@/shared/hooks';
import {
  useDeleteOrganization,
  useOrganizationAssignedUsers,
  useUnassignUsersFromGroup,
  useUpdateOrganizationDetails,
} from '@/shared/hooks/useOrganizations';
import {
  getUserFriendlyErrorMessage,
  isForbiddenError,
  isNotFoundError,
} from '@/shared/utils/errorMessages';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import DeleteOrganizationDialog from '@/modules/system-organizations/components/DeleteOrganizationDialog';
import EditOrganizationDialog from '@/modules/system-organizations/components/EditOrganizationDialog';
import OrganizationAvatar from '@/modules/system-organizations/components/OrganizationAvatar';
import OrganizationMembersCard from '@/modules/system-organizations/components/OrganizationMembersCard';
import StatusBadge from '@/modules/system-organizations/components/StatusBadge';
import {
  ORGANIZATIONS_PATH,
  isProtectedOrganization,
} from '@/modules/system-organizations/utils';
import type {
  GroupDetails,
  UpdateGroupDetailsRequest,
} from '@/shared/types/api';

/** `grp_manager` is an object on group details but a bare id on some payloads. */
const resolveManagerId = (
  manager: GroupDetails['grp_manager'] | string | null | undefined
): string => {
  if (!manager) return '';
  if (typeof manager === 'string') return manager;
  return manager._id ?? '';
};

const DetailItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div>
    <label className="text-sm font-medium text-muted-foreground">{label}</label>
    <p className="mt-1 break-words text-sm">{value}</p>
  </div>
);

/**
 * System → Organizations detail: profile overview, manager assignment,
 * members (bulk unassign), read-only roles and — for deletable organizations
 * only — the delete card.
 *
 * Content child of PermissionGuard: every hook (and therefore every API
 * read) lives here, so a non-admin deep link never issues a request — the
 * guard decides whether this component mounts at all.
 */
const OrganizationDetailContent: React.FC<{ groupId: string }> = ({
  groupId,
}) => {
  const router = useRouter();

  // RBAC first: MEMBER_VIEW gates the assigned-users request itself (a null
  // SWR key means "no request"), so it must be known before that hook runs.
  const { hasAnyPermission } = useRBAC();

  const canViewMembers = hasAnyPermission(['MEMBER_VIEW']);
  const canUpdate = hasAnyPermission(['ORG_UPDATE']);
  // Unassigning members is its own backend permission — not ORG_UPDATE, and
  // only meaningful while the member list itself is visible.
  const canRemoveMembers =
    canViewMembers && hasAnyPermission(['MEMBER_REMOVE']);
  // Deletion is reserved for super admins who also hold ORG_DELETE.
  const canDelete =
    hasAnyPermission(['SUPER_ADMIN']) && hasAnyPermission(['ORG_DELETE']);

  const {
    data: groupResponse,
    isLoading,
    error,
    mutate,
  } = useGroupDetails(groupId || null);
  const {
    users,
    error: usersError,
    isLoading: usersLoading,
    mutate: mutateAssignedUsers,
  } = useOrganizationAssignedUsers(canViewMembers && groupId ? groupId : null);
  const {
    data: rolesResponse,
    isLoading: rolesLoading,
    error: rolesError,
    mutate: mutateRoles,
  } = useRolesByGroup(groupId || undefined);

  const setManager = useSetGroupManager();
  const unassignUsers = useUnassignUsersFromGroup();
  const deleteOrganization = useDeleteOrganization();
  const updateDetails = useUpdateOrganizationDetails();

  const group = groupResponse?.group;
  const managerId = resolveManagerId(group?.grp_manager);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Array<string | number>>([]);
  const [unassignTarget, setUnassignTarget] = useState<string[] | null>(null);
  const [managerChoice, setManagerChoice] = useState('');

  useEffect(() => {
    setManagerChoice(managerId);
  }, [managerId]);

  const roles = useMemo(() => rolesResponse?.roles ?? [], [rolesResponse]);
  const isProtected = isProtectedOrganization(group);
  const showDeleteCard = canDelete && !isProtected;

  const handleRefresh = useCallback(async () => {
    try {
      await mutate();
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err));
    }
  }, [mutate]);

  const handleRetryAssignedUsers = useCallback(async () => {
    try {
      await mutateAssignedUsers();
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err));
    }
  }, [mutateAssignedUsers]);

  const handleRetryRoles = useCallback(async () => {
    try {
      await mutateRoles();
    } catch (err) {
      toast.error(getUserFriendlyErrorMessage(err));
    }
  }, [mutateRoles]);

  const handleSaveManager = useCallback(async () => {
    if (!groupId || !managerChoice || managerChoice === managerId) return;
    try {
      await setManager.trigger({ groupId, userId: managerChoice });
      toast.success('Organization manager updated');
      await Promise.all([mutate(), mutateAssignedUsers()]);
    } catch (err) {
      toast.error('Failed to update manager', getUserFriendlyErrorMessage(err));
    }
  }, [
    groupId,
    managerChoice,
    managerId,
    mutate,
    mutateAssignedUsers,
    setManager,
  ]);

  const handleConfirmUnassign = useCallback(async () => {
    // Defence in depth: the members card hides selection without
    // MEMBER_REMOVE, but the confirm handler must refuse on its own too.
    if (!canRemoveMembers || !groupId || !unassignTarget?.length) return;
    try {
      const result = await unassignUsers.trigger({
        groupId,
        user_ids: unassignTarget,
      });
      toast.success(result?.message || 'Members unassigned');
      setUnassignTarget(null);
      setSelectedIds([]);
      await Promise.all([mutateAssignedUsers(), mutate()]);
    } catch (err) {
      toast.error(
        'Failed to unassign members',
        getUserFriendlyErrorMessage(err)
      );
    }
  }, [
    canRemoveMembers,
    groupId,
    mutate,
    mutateAssignedUsers,
    unassignTarget,
    unassignUsers,
  ]);

  const handleConfirmDelete = useCallback(async () => {
    // Defence in depth: the card is hidden/disabled without these, but the
    // confirm handler must refuse on its own too.
    if (!groupId || !canDelete || isProtected) return;
    setDeleteError(null);
    try {
      await deleteOrganization.trigger({ groupId });
      toast.success('Organization deleted');
      setIsDeleteOpen(false);
      router.push(ORGANIZATIONS_PATH);
    } catch (err) {
      // Keep the dialog open and surface the backend message (staging answers
      // 501 "Group deletion temporarily disabled").
      setDeleteError(getUserFriendlyErrorMessage(err));
    }
  }, [canDelete, deleteOrganization, groupId, isProtected, router]);

  const handleEditSubmit = useCallback(
    async (details: UpdateGroupDetailsRequest) => {
      if (!groupId) return;
      try {
        await updateDetails.trigger({ groupId, details });
        toast.success('Organization details updated');
        setIsEditOpen(false);
        await mutate();
      } catch (err) {
        toast.error(
          'Failed to update organization',
          getUserFriendlyErrorMessage(err)
        );
      }
    },
    [groupId, mutate, updateDetails]
  );

  const backLink = (
    <div className="flex justify-start">
      <Link
        href={ORGANIZATIONS_PATH}
        className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <AqChevronLeft className="h-4 w-4" />
        Back to Organizations
      </Link>
    </div>
  );

  return (
    <>
      {isLoading ? (
        <LoadingState
          className="h-[calc(100vh-220px)]"
          text="Loading organization..."
        />
      ) : isForbiddenError(error) ? (
        <div className="space-y-6">
          {backLink}
          <AccessDenied
            title="Access Denied"
            message="You do not have the required permissions to view this organization."
          />
        </div>
      ) : error ? (
        <div className="space-y-6">
          {backLink}
          <Card className="p-6">
            <ErrorBanner
              title="Failed to load organization"
              message={
                isNotFoundError(error)
                  ? 'Organization not found. It may have been removed.'
                  : getUserFriendlyErrorMessage(error)
              }
              actions={
                isNotFoundError(error) ? undefined : (
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={handleRefresh}
                    Icon={AqRefreshCw05}
                  >
                    Retry
                  </Button>
                )
              }
            />
          </Card>
        </div>
      ) : !group ? (
        <div className="space-y-6">
          {backLink}
          <Card className="p-6">
            <ErrorBanner
              title="Organization not found"
              message="This organization does not exist or has been removed."
            />
          </Card>
        </div>
      ) : (
        <div className="min-w-0 space-y-6">
          {backLink}

          {/* Header */}
          <Card className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 items-start gap-4">
                <OrganizationAvatar
                  title={group.grp_title}
                  imageUrl={group.grp_profile_picture || group.grp_image}
                  size="lg"
                />
                <div className="min-w-0">
                  <h1 className="truncate text-2xl font-semibold">
                    {group.grp_title}
                  </h1>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-2">
                    <span className="text-sm text-muted-foreground">
                      {group.organization_slug || 'No slug'}
                    </span>
                    <StatusBadge status={group.grp_status} />
                    <span className="text-sm text-muted-foreground">
                      {group.numberOfGroupUsers ?? 0} members
                    </span>
                  </div>
                  <Link
                    href={`/system/activity-log?group_id=${encodeURIComponent(
                      groupId
                    )}`}
                    className="mt-2 inline-flex items-center text-sm font-medium text-primary hover:underline"
                  >
                    View activity log
                  </Link>
                </div>
              </div>

              <div className="flex shrink-0 gap-2">
                <Button
                  variant="outlined"
                  Icon={AqEdit05}
                  onClick={() => setIsEditOpen(true)}
                  disabled={!canUpdate}
                >
                  Edit
                </Button>
              </div>
            </div>
          </Card>

          {/* Members load/permission failure (e.g. 403) — surface it once and
              skip the manager select and members table rather than showing
              them as misleadingly empty. Only possible when the members
              request itself was allowed (MEMBER_VIEW). */}
          {canViewMembers && usersError && (
            <Card className="p-6">
              <ErrorBanner
                title="Failed to load organization members"
                message={getUserFriendlyErrorMessage(usersError)}
                actions={
                  <Button
                    variant="outlined"
                    size="sm"
                    onClick={handleRetryAssignedUsers}
                    loading={usersLoading}
                    Icon={AqRefreshCw05}
                  >
                    Retry
                  </Button>
                }
              />
            </Card>
          )}

          {/* Overview + manager */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card className="p-6 lg:col-span-2">
              <div className="mb-6">
                <h3 className="text-lg font-semibold">Overview</h3>
                <p className="text-sm text-muted-foreground">
                  Profile and settings for this organization
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <DetailItem
                  label="Country"
                  value={group.grp_country || 'Not specified'}
                />
                <DetailItem
                  label="Industry"
                  value={group.grp_industry || 'Not specified'}
                />
                <DetailItem
                  label="Timezone"
                  value={group.grp_timezone || 'Not specified'}
                />
                <DetailItem
                  label="Website"
                  value={group.grp_website || 'Not specified'}
                />
                <DetailItem
                  label="Created"
                  value={
                    group.createdAt
                      ? formatWithPattern(group.createdAt, 'MMM dd, yyyy')
                      : 'Unknown'
                  }
                />
                <DetailItem label="Organization ID" value={group._id} />
              </div>

              <div className="mt-4">
                <label className="text-sm font-medium text-muted-foreground">
                  Description
                </label>
                <p className="mt-1 text-sm leading-6">
                  {group.grp_description || 'No description provided.'}
                </p>
              </div>
            </Card>

            {/* Manager select needs the member list, so it is gated by
                MEMBER_VIEW; without it a neutral note replaces both the
                select and the members table. */}
            {!canViewMembers ? (
              <Card className="p-6">
                <p className="text-sm text-muted-foreground">
                  You do not have permission to view organization members.
                </p>
              </Card>
            ) : usersError ? null : (
              <Card className="p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Manager</h3>
                  <p className="text-sm text-muted-foreground">
                    The manager is excluded from member unassignment.
                  </p>
                </div>

                {usersLoading ? (
                  <p className="text-sm text-muted-foreground">
                    Loading members...
                  </p>
                ) : users.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No members are assigned yet.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <SelectField
                      label="Organization manager"
                      id="org_manager"
                      name="org_manager"
                      value={managerChoice}
                      onChange={event =>
                        setManagerChoice(String(event.target.value))
                      }
                      disabled={setManager.isMutating}
                      searchable
                      searchPlaceholder="Search members..."
                      noOptionsMessage="No members match"
                    >
                      <option value="">Select a member</option>
                      {users.map(user => (
                        <option
                          key={user._id}
                          value={user._id}
                          data-search={user.email}
                        >
                          {user.firstName} {user.lastName} ({user.email})
                        </option>
                      ))}
                    </SelectField>

                    <div className="flex justify-end">
                      <Button
                        variant="outlined"
                        onClick={handleSaveManager}
                        disabled={
                          setManager.isMutating ||
                          !managerChoice ||
                          managerChoice === managerId
                        }
                        loading={setManager.isMutating}
                      >
                        Save manager
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Members — skipped without MEMBER_VIEW (never fetched) and while
              the assigned-users request has failed, so the table never
              renders a misleading "No members yet". */}
          {canViewMembers && !usersError && (
            <OrganizationMembersCard
              users={users}
              managerId={managerId}
              canRemove={canRemoveMembers}
              isLoading={usersLoading}
              selectedIds={selectedIds}
              onSelectedChange={setSelectedIds}
              onRequestUnassign={setUnassignTarget}
            />
          )}

          {/* Roles (read-only) + delete */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <Card
              className={`p-6 ${showDeleteCard ? 'lg:col-span-2' : 'lg:col-span-3'}`}
            >
              <div className="mb-4">
                <h3 className="text-lg font-semibold">Roles</h3>
                <p className="text-sm text-muted-foreground">
                  Roles defined for this organization (read-only)
                </p>
              </div>

              {rolesLoading ? (
                <p className="text-sm text-muted-foreground">
                  Loading roles...
                </p>
              ) : rolesError ? (
                <ErrorBanner
                  title="Failed to load organization roles"
                  message={getUserFriendlyErrorMessage(rolesError)}
                  actions={
                    <Button
                      variant="outlined"
                      size="sm"
                      onClick={handleRetryRoles}
                      loading={rolesLoading}
                      Icon={AqRefreshCw05}
                    >
                      Retry
                    </Button>
                  }
                />
              ) : roles.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  No roles configured for this organization.
                </p>
              ) : (
                <ul className="divide-y divide-border">
                  {roles.map(role => (
                    <li
                      key={role._id}
                      className="flex items-center justify-between gap-4 py-3"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {role.role_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {role.role_permissions?.length ?? 0} permissions ·{' '}
                          {role.user_count ?? 0} users
                        </p>
                      </div>
                      <StatusBadge
                        status={role.role_status}
                        fallback="ACTIVE"
                        className="shrink-0"
                      />
                    </li>
                  ))}
                </ul>
              )}
            </Card>

            {showDeleteCard && (
              <Card className="border-destructive/40 p-6">
                <div className="mb-4">
                  <h3 className="text-lg font-semibold">Delete organization</h3>
                  <p className="text-sm text-muted-foreground">
                    Permanently remove this organization along with its members,
                    roles and settings. This action cannot be undone.
                  </p>
                </div>
                <Button
                  variant="danger"
                  fullWidth
                  Icon={AqTrash01}
                  onClick={() => {
                    setDeleteError(null);
                    setIsDeleteOpen(true);
                  }}
                >
                  Delete organization
                </Button>
              </Card>
            )}
          </div>

          {/* Dialogs */}
          {group && (
            <EditOrganizationDialog
              isOpen={isEditOpen}
              group={group}
              isSaving={updateDetails.isMutating}
              onClose={() => setIsEditOpen(false)}
              onSubmit={handleEditSubmit}
            />
          )}

          {/* Only mounted when the delete card is visible — a user without
              ORG_DELETE/SUPER_ADMIN (or on a protected organization) never
              has the dialog in the tree. */}
          {showDeleteCard && (
            <DeleteOrganizationDialog
              isOpen={isDeleteOpen}
              groupTitle={group.grp_title}
              isDeleting={deleteOrganization.isMutating}
              error={deleteError}
              onClose={() => {
                setIsDeleteOpen(false);
                setDeleteError(null);
              }}
              onConfirm={handleConfirmDelete}
            />
          )}

          <Dialog
            isOpen={unassignTarget !== null}
            onClose={() => setUnassignTarget(null)}
            title="Unassign members"
            subtitle={`${unassignTarget?.length ?? 0} member${
              (unassignTarget?.length ?? 0) === 1 ? '' : 's'
            } selected`}
            size="md"
            preventBackdropClose={unassignUsers.isMutating}
            primaryAction={{
              label: 'Unassign',
              variant: 'danger',
              onClick: handleConfirmUnassign,
              disabled: unassignUsers.isMutating,
              loading: unassignUsers.isMutating,
            }}
            secondaryAction={{
              label: 'Cancel',
              onClick: () => setUnassignTarget(null),
              disabled: unassignUsers.isMutating,
            }}
          >
            <div className="space-y-3 text-sm">
              <p>
                The selected members will lose their access to this
                organization. Their accounts and roles elsewhere are not
                affected.
              </p>
              <p className="text-muted-foreground">
                The organization manager cannot be unassigned and is excluded
                from this request.
              </p>
            </div>
          </Dialog>
        </div>
      )}
    </>
  );
};

/**
 * Guard shell: reads the route param and defers every data hook to
 * OrganizationDetailContent, which mounts only when PermissionGuard allows
 * it — a non-admin deep link to /system/organizations/:id issues no reads.
 */
const OrganizationDetailPage: React.FC = () => {
  const params = useParams();
  const rawGroupId = params?.id;
  const groupId = typeof rawGroupId === 'string' ? rawGroupId : '';

  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administrator permissions to manage this organization."
    >
      <OrganizationDetailContent groupId={groupId} />
    </PermissionGuard>
  );
};

export default OrganizationDetailPage;
