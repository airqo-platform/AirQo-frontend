'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Dialog from '@/shared/components/ui/dialog';
import { useUser } from '@/shared/hooks/useUser';
import { useRolesByGroup, useAssignUsersToRole } from '@/shared/hooks';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { SEARCH_TERM_MAX } from '@/shared/lib/validation-limits';

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
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

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

  const selectedRole = useMemo(
    () => availableRoles.find(role => role._id === selectedRoleId),
    [availableRoles, selectedRoleId]
  );

  const selectRole = useCallback((roleId: string) => {
    setSelectedRoleId(roleId);
    setRoleSearch('');
    setIsDropdownOpen(false);
    setHighlightedIndex(-1);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setHighlightedIndex(-1);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isDropdownOpen]);

  useEffect(() => {
    if (isOpen) {
      setSelectedRoleId('');
      setRoleSearch('');
      setIsDropdownOpen(false);
      setHighlightedIndex(-1);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isDropdownOpen && highlightedIndex >= 0 && listRef.current) {
      const highlightedElement = listRef.current.children[
        highlightedIndex
      ] as HTMLElement | undefined;
      highlightedElement?.scrollIntoView({ block: 'nearest' });
    }
  }, [isDropdownOpen, highlightedIndex]);

  const handleAssign = async () => {
    if (!selectedRole) {
      toast.error('Please select a valid role');
      return;
    }

    if (userIds.length === 0) {
      toast.error('No users selected');
      return;
    }

    try {
      await assignUsersToRole.trigger({
        roleId: selectedRole._id,
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
    !!activeGroup?.id &&
    !rolesLoading &&
    availableRoles.length > 0 &&
    !rolesError;

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Assign Role to ${userCount} User${userCount !== 1 ? 's' : ''}`}
      primaryAction={{
        label: 'Assign Role',
        onClick: handleAssign,
        disabled: assignUsersToRole.isMutating || !selectedRole || !canAssign,
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
          {!activeGroup?.id && (
            <p className="text-sm text-destructive">
              No active group selected. Please select a group first.
            </p>
          )}
        </div>

        <div ref={dropdownRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Role *
          </label>
          <input
            type="text"
            role="combobox"
            aria-expanded={isDropdownOpen}
            aria-controls="bulk-role-listbox"
            aria-activedescendant={
              highlightedIndex >= 0
                ? `bulk-role-option-${filteredRoles[highlightedIndex]?._id}`
                : undefined
            }
            value={roleSearch}
            onChange={e => {
              setRoleSearch(e.target.value);
              setIsDropdownOpen(true);
              setHighlightedIndex(-1);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={e => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setIsDropdownOpen(false);
                setHighlightedIndex(-1);
              } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                setIsDropdownOpen(true);
                setHighlightedIndex(prev =>
                  prev < filteredRoles.length - 1 ? prev + 1 : 0
                );
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setIsDropdownOpen(true);
                setHighlightedIndex(prev =>
                  prev > 0 ? prev - 1 : filteredRoles.length - 1
                );
              } else if (e.key === 'Enter' && highlightedIndex >= 0) {
                e.preventDefault();
                const role = filteredRoles[highlightedIndex];
                if (role) {
                  selectRole(role._id);
                }
              }
            }}
            placeholder="Search and select a role..."
            disabled={rolesLoading || !!rolesError || !activeGroup?.id}
            maxLength={SEARCH_TERM_MAX}
            className="w-full px-3 py-2.5 border rounded-md text-sm bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none disabled:bg-muted disabled:text-muted-foreground"
          />

          {isDropdownOpen && (
            <div className="mt-1 w-full bg-popover rounded-md shadow-lg border border-primary max-h-[200px] overflow-y-auto">
              <ul
                ref={listRef}
                id="bulk-role-listbox"
                role="listbox"
                className="py-1"
              >
                {filteredRoles.length > 0 ? (
                  filteredRoles.map((role, index) => (
                    <li
                      key={role._id}
                      id={`bulk-role-option-${role._id}`}
                      role="option"
                      tabIndex={-1}
                      aria-selected={selectedRoleId === role._id}
                      onClick={() => selectRole(role._id)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                      className={`cursor-pointer px-3 py-2 text-sm transition-colors duration-150 hover:bg-primary/10 ${
                        selectedRoleId === role._id
                          ? 'bg-primary/20 text-primary font-medium'
                          : 'text-foreground'
                      } ${
                        highlightedIndex === index ? 'bg-primary/10' : ''
                      }`}
                    >
                      {role.role_name} - {role.group?.grp_title || 'No group'}
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
