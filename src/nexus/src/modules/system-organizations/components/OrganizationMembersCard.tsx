'use client';

import React, { useCallback, useMemo } from 'react';
import { Button, Card, EmptyState } from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { toast } from '@/shared/components/ui/toast';
import { formatWithPattern } from '@/shared/utils/dateUtils';
import { getRemovableMemberIds } from '../utils';
import type { GroupAssignedUser } from '@/shared/types/api';

export interface OrganizationMembersCardProps {
  users: GroupAssignedUser[];
  /** Manager user id — never included in an unassign request. */
  managerId: string;
  /** False when the viewer lacks the permission to unassign members. */
  canRemove: boolean;
  isLoading: boolean;
  selectedIds: Array<string | number>;
  onSelectedChange: (ids: Array<string | number>) => void;
  /** Receives the removable (manager-free, de-duplicated) ids to confirm. */
  onRequestUnassign: (ids: string[]) => void;
}

// ServerSideTable constrains T to TableItem (id + string index signature);
// the index signature keeps the intersection assignable without casting.
type MemberRow = GroupAssignedUser & {
  id: string;
  [key: string]: unknown;
};

/**
 * Members of one organization with multi-select bulk unassign.
 *
 * Selection lives with the parent (it drives the confirm dialog), the table
 * owns paging/search. The manager row is badged amber and filtered out of
 * the unassign payload by `getRemovableMemberIds`.
 */
const OrganizationMembersCard: React.FC<OrganizationMembersCardProps> = ({
  users,
  managerId,
  canRemove,
  isLoading,
  selectedIds,
  onSelectedChange,
  onRequestUnassign,
}) => {
  const rows = useMemo<MemberRow[]>(
    () => users.map(user => ({ ...user, id: user._id })),
    [users]
  );

  const columns = useMemo(
    () => [
      {
        key: 'firstName',
        label: 'User',
        render: (_value: unknown, member: MemberRow) => {
          const isManager = !!managerId && member._id === managerId;
          return (
            <div className="min-w-0">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium">
                  {member.firstName} {member.lastName}
                </span>
                {isManager && (
                  <span className="inline-flex shrink-0 items-center whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                    Manager
                  </span>
                )}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {member.email}
              </div>
            </div>
          );
        },
      },
      {
        key: 'role_name',
        label: 'Role',
        render: (_value: unknown, member: MemberRow) =>
          member.role_name ? (
            <span className="text-sm">{member.role_name}</span>
          ) : (
            <span className="text-sm text-muted-foreground">No role</span>
          ),
      },
      {
        key: 'isActive',
        label: 'Status',
        render: (_value: unknown, member: MemberRow) => (
          <span
            className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium ${
              member.isActive
                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}
          >
            {member.isActive ? 'Active' : 'Inactive'}
          </span>
        ),
      },
      {
        key: 'lastLogin',
        label: 'Last Login',
        render: (_value: unknown, member: MemberRow) => (
          <div className="text-sm tabular-nums">
            {member.lastLogin
              ? formatWithPattern(member.lastLogin, 'MMM dd, yyyy HH:mm')
              : 'Never'}
          </div>
        ),
      },
    ],
    [managerId]
  );

  const handleBulkUnassign = useCallback(() => {
    const removable = getRemovableMemberIds(selectedIds, managerId);
    if (removable.length === 0) {
      toast.error(
        'Nothing to unassign',
        'Select at least one member — the organization manager cannot be unassigned.'
      );
      return;
    }
    onRequestUnassign(removable);
  }, [managerId, onRequestUnassign, selectedIds]);

  return (
    <Card className="p-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Members</h3>
          <p className="text-sm text-muted-foreground">
            {users.length} {users.length === 1 ? 'user' : 'users'} assigned to
            this organization
          </p>
        </div>
        {canRemove && (
          <Button
            variant="danger"
            size="sm"
            onClick={handleBulkUnassign}
            disabled={selectedIds.length === 0}
          >
            Unassign ({selectedIds.length})
          </Button>
        )}
      </div>

      <ServerSideTable<MemberRow>
        title="Organization members"
        data={rows}
        columns={columns}
        loading={isLoading}
        multiSelect={canRemove}
        selectedItems={canRemove ? selectedIds : []}
        onSelectedItemsChange={canRemove ? onSelectedChange : undefined}
        showClientPagination
        searchableColumns={['firstName', 'lastName', 'email', 'role_name']}
        selectionLabel={member => `${member.firstName} ${member.lastName}`}
        emptyComponent={
          <EmptyState
            title="No members yet"
            description="Users assigned to this organization will appear here."
            className="min-h-[200px] border-0 bg-transparent"
          />
        }
      />
    </Card>
  );
};

export default OrganizationMembersCard;
