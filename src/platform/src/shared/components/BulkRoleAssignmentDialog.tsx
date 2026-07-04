'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Dialog from '@/shared/components/ui/dialog';
import { useUser } from '@/shared/hooks/useUser';
import { useRolesByGroup, useAssignUsersToRole } from '@/shared/hooks';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';

interface BulkRoleAssignmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userIds: string[];
  userCount: number;
  onSuccess?: () => void;
}

const BulkRoleAssignmentDialog: React.FC<BulkRoleAssignmentDialogProps> = ({
  isOpen,
  onClose,
  userIds,
  userCount,
  onSuccess,
}) => {
  const { activeGroup } = useUser();
  const [selectedRoleId, setSelectedRoleId] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    data: rolesData,
    isLoading: rolesLoading,
    error: rolesError,
  } = useRolesByGroup(activeGroup?.id || undefined);

  const assignUsersToRole = useAssignUsersToRole();

  const availableRoles = useMemo(
    () => rolesData?.roles || [],
    [rolesData?.roles]
  );

  const filteredRoles = useMemo(() => {
    const q = roleSearch.trim().toLowerCase();
    if (!q) return availableRoles;
    return availableRoles.filter(r => {
      const name = (r.role_name || '').toLowerCase();
      const group = (r.group?.grp_title || '').toLowerCase();
      return name.includes(q) || group.includes(q);
    });
  }, [availableRoles, roleSearch]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isOpen) {
      setSelectedRoleId('');
      setRoleSearch('');
      setIsDropdownOpen(false);
    }
  }, [isOpen]);

  const selectedRole = useMemo(
    () => availableRoles.find(role => role._id === selectedRoleId),
    [availableRoles, selectedRoleId]
  );

  const handleAssign = async () => {
    if (!selectedRoleId) {
      toast.error('Please select a role');
      return;
    }

    if (userIds.length === 0) {
      toast.error('No users selected');
      return;
    }

    try {
      await assignUsersToRole.trigger({
        roleId: selectedRoleId,
        user_ids: userIds,
      });
      toast.success(`Role assigned to ${userCount} user(s)`);
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  };

  const canAssign =
    !rolesLoading && availableRoles.length > 0 && !rolesError;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Role to ${userCount} User${userCount !== 1 ? 's' : ''}`}
      primaryAction={{
        label: 'Assign Role',
        onClick: handleAssign,
        disabled:
          assignUsersToRole.isMutating || !selectedRoleId || !canAssign,
        loading: assignUsersToRole.isMutating,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        disabled: assignUsersToRole.isMutating,
        variant: 'outlined',
      }}
    >
      <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
        <div>
          <p className="text-sm text-muted-foreground mb-4">
            Selected users: {userCount}
          </p>
        </div>

        <div ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Role *
          </label>
          <input
            type="text"
            value={roleSearch}
            onChange={e => {
              setRoleSearch(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            placeholder="Search and select a role..."
            disabled={rolesLoading || !!rolesError}
            className="w-full px-3 py-2.5 border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:bg-muted disabled:text-muted-foreground"
          />

          {isDropdownOpen && (
            <div className="mt-1 w-full bg-popover rounded-md shadow-lg border border-primary max-h-[200px] overflow-y-auto">
              <ul role="listbox" className="py-1">
                {filteredRoles.length > 0 ? (
                  filteredRoles.map(role => (
                    <li
                      key={role._id}
                      role="option"
                      aria-selected={selectedRoleId === role._id}
                      onClick={() => {
                        setSelectedRoleId(role._id);
                        setRoleSearch('');
                        setIsDropdownOpen(false);
                      }}
                      className={`cursor-pointer px-3 py-2 text-sm transition-colors duration-150 hover:bg-primary/10 ${
                        selectedRoleId === role._id
                          ? 'bg-primary/20 text-primary font-medium'
                          : 'text-foreground'
                      }`}
                    >
                      {role.role_name} -{' '}
                      {role.group?.grp_title || 'No group'}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-sm text-muted-foreground">
                    No roles found
                  </li>
                )}
              </ul>
            </div>
          )}

          {rolesLoading && (
            <p className="mt-1 text-xs text-muted-foreground">
              Loading roles...
            </p>
          )}

          {rolesError && (
            <p className="mt-1 text-xs text-destructive">
              Failed to load roles
            </p>
          )}
        </div>

        {selectedRole && (
          <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
            <div>
              <p className="text-sm font-medium">Selected Role</p>
              <p className="text-sm text-muted-foreground">
                {selectedRole.role_name}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {selectedRole.group?.grp_title || 'No group'}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Permissions</p>
              <div className="flex flex-wrap gap-2">
                {(selectedRole.role_permissions || []).map(permission => (
                  <span
                    key={permission._id}
                    className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary"
                  >
                    {permission.permission}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
};

export default BulkRoleAssignmentDialog;
