'use client';

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import Dialog from '@/shared/components/ui/dialog';
import SelectField from '@/shared/components/ui/select';
import { toast } from '@/shared/components/ui/toast';
import { useUpdateUserRole } from '@/shared/hooks/useAdmin';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import type { User, UserRoleSummary } from '@/shared/types/api';
import {
  getCurrentRoleNameForGroup,
  getRoleGroupOptions,
  getRolesForGroup,
  hasGroupMembership,
  resolveInitialRoleSelection,
} from '@/shared/utils/roleGrouping';
import type { RoleWithGroup } from '@/shared/utils/roleGrouping';

export interface UserRoleAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  roles: UserRoleSummary[];
  onSuccess?: () => void | Promise<void>;
}

/**
 * Assigns one role to a user inside one specific group. The group is picked
 * first; the role list and every request that follows are scoped to it. The
 * role itself is implied by the endpoint (`PUT /users/roles/{roleId}/user/
 * {userId}`), so no group id is ever sent along with it.
 */
const UserRoleAssignmentDialog: React.FC<UserRoleAssignmentDialogProps> = ({
  isOpen,
  onClose,
  user,
  roles,
  onSuccess,
}) => {
  const updateUserRole = useUpdateUserRole();
  const { isMutating } = updateUserRole;
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [selectedRoleId, setSelectedRoleId] = useState('');
  // True once the admin picks something themselves: from then on the
  // preselection logic must not overwrite their choice on prop refreshes.
  const selectionTouchedByUser = useRef(false);

  const groupOptions = useMemo(() => getRoleGroupOptions(roles), [roles]);
  const groupRoles: RoleWithGroup[] = useMemo(
    () => getRolesForGroup(roles, selectedGroupId),
    [roles, selectedGroupId]
  );
  const selectedGroup = useMemo(
    () => groupOptions.find(option => option.id === selectedGroupId) ?? null,
    [groupOptions, selectedGroupId]
  );
  // Resolved from the group-scoped list, so the role belongs to the selected
  // group by construction.
  const selectedRole = useMemo(
    () => groupRoles.find(role => role._id === selectedRoleId) ?? null,
    [groupRoles, selectedRoleId]
  );

  const isMemberOfSelectedGroup = hasGroupMembership(user, selectedGroupId);
  const currentRoleName = getCurrentRoleNameForGroup(user, selectedGroupId);

  // Preselect the group whenever the dialog opens, and re-resolve whenever
  // the inputs change (roles still loading, user arriving late) — unless the
  // admin already picked something themselves and it is still valid.
  useEffect(() => {
    if (!isOpen) {
      selectionTouchedByUser.current = false;
      return;
    }

    const isValidSelection =
      selectedGroupId !== '' &&
      groupOptions.some(option => option.id === selectedGroupId);
    if (selectionTouchedByUser.current && isValidSelection) return;

    const { groupId, roleId } = resolveInitialRoleSelection(user, roles);
    setSelectedGroupId(groupId);
    setSelectedRoleId(roleId);
  }, [isOpen, user, roles, groupOptions, selectedGroupId]);

  const handleGroupChange = useCallback(
    (event: { target: { value: unknown } }) => {
      selectionTouchedByUser.current = true;
      setSelectedGroupId(String(event.target.value ?? ''));
      // The role must always be re-picked for the new group.
      setSelectedRoleId('');
    },
    []
  );

  const handleRoleChange = useCallback(
    (event: { target: { value: unknown } }) => {
      selectionTouchedByUser.current = true;
      setSelectedRoleId(String(event.target.value ?? ''));
    },
    []
  );

  const handleClose = useCallback(() => {
    if (isMutating) return;
    onClose();
  }, [isMutating, onClose]);

  const handleSubmit = useCallback(async () => {
    if (isMutating || !user || !selectedGroupId || !selectedRole) return;
    if (selectedRole.group?._id !== selectedGroupId) return;

    try {
      await updateUserRole.trigger({
        userId: user._id,
        roleId: selectedRole._id,
      });
      toast.success(
        'Role updated',
        `${selectedRole.role_name} in ${selectedGroup?.title ?? ''}`
      );
      onClose();
      await onSuccess?.();
    } catch (error) {
      toast.error(
        'Failed to update user role',
        getUserFriendlyErrorMessage(error)
      );
    }
  }, [
    isMutating,
    user,
    selectedGroupId,
    selectedRole,
    selectedGroup,
    updateUserRole,
    onClose,
    onSuccess,
  ]);

  const noGroupScopedRoles = groupOptions.length === 0;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      preventBackdropClose={isMutating}
      title={`Update Role: ${user?.firstName ?? ''} ${user?.lastName ?? ''}`}
      subtitle="Assign a role within a specific organization."
      size="md"
      maxHeight="max-h-[75vh]"
      primaryAction={{
        label: 'Update Role',
        onClick: handleSubmit,
        disabled:
          isMutating ||
          noGroupScopedRoles ||
          !selectedGroupId ||
          !selectedRoleId,
        loading: isMutating,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        disabled: isMutating,
        variant: 'outlined',
      }}
    >
      <div className="space-y-4">
        <SelectField
          label="Organization"
          required
          searchable
          searchPlaceholder="Search organizations..."
          placeholder="Select an organization"
          value={selectedGroupId}
          onChange={handleGroupChange}
        >
          {groupOptions.map(option => (
            <option key={option.id} value={option.id} data-search={option.slug}>
              {option.title} ({option.roleCount} roles)
            </option>
          ))}
        </SelectField>

        <SelectField
          label="Role in this organization"
          required
          searchable
          disabled={!selectedGroupId}
          placeholder={
            selectedGroupId ? 'Select a role' : 'Select an organization first'
          }
          value={selectedRoleId}
          onChange={handleRoleChange}
        >
          {groupRoles.map(role => (
            <option
              key={role._id}
              value={role._id}
              disabled={role.role_status !== 'ACTIVE'}
              data-search={role.role_description ?? ''}
            >
              {role.role_status === 'ACTIVE'
                ? role.role_name
                : `${role.role_name} (inactive)`}
            </option>
          ))}
        </SelectField>

        {selectedGroupId && (
          <div className="space-y-1 rounded-md border border-border bg-muted/40 p-3 text-xs text-muted-foreground">
            <p>
              {isMemberOfSelectedGroup
                ? `Current role in this organization: ${currentRoleName || 'No role assigned'}`
                : 'This user is not yet a member of this organization.'}
            </p>
            <p>
              Saving applies the selected role in {selectedGroup?.title ?? ''}{' '}
              only.
            </p>
          </div>
        )}

        {noGroupScopedRoles && (
          <p className="text-sm text-muted-foreground">
            No organization roles are available.
          </p>
        )}
      </div>
    </Dialog>
  );
};

export default UserRoleAssignmentDialog;
