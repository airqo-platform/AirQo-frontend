'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, Input } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { useCreateRole } from '@/shared/hooks/useAdmin';
import type { UserRoleSummary } from '@/shared/types/api';

interface CreateRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  groups: UserRoleSummary['group'][];
}

const CreateRoleDialog: React.FC<CreateRoleDialogProps> = ({
  isOpen,
  onClose,
  onSuccess,
  groups,
}) => {
  const { trigger: createRole, isMutating } = useCreateRole();
  const [roleName, setRoleName] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [groupId, setGroupId] = useState('');
  const [networkId, setNetworkId] = useState('');
  const [groupSearch, setGroupSearch] = useState('');
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const groupDropdownRef = useRef<HTMLDivElement>(null);

  const selectedGroup = useMemo(
    () => groups.find(g => g._id === groupId),
    [groups, groupId]
  );

  const filteredGroups = useMemo(() => {
    if (!groupSearch) return groups;
    const term = groupSearch.toLowerCase();
    return groups.filter(g => g.grp_title.toLowerCase().includes(term));
  }, [groups, groupSearch]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        groupDropdownRef.current &&
        !groupDropdownRef.current.contains(e.target as Node)
      ) {
        setShowGroupDropdown(false);
      }
    };
    if (showGroupDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showGroupDropdown]);

  const handleSelectGroup = useCallback((id: string) => {
    setGroupId(id);
    setGroupSearch('');
    setShowGroupDropdown(false);
  }, []);

  const handleSubmit = async () => {
    if (!roleName.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (!/^[A-Z0-9_]+$/.test(roleName.trim())) {
      toast.error('Role name must contain only uppercase letters, numbers, and underscores');
      return;
    }

    try {
      await createRole({
        role_name: roleName.trim(),
        ...(roleCode.trim() && { role_code: roleCode.trim() }),
        ...(groupId && { group_id: groupId }),
        ...(networkId.trim() && { network_id: networkId.trim() }),
      });

      toast.success('Role created successfully');
      setRoleName('');
      setRoleCode('');
      setGroupId('');
      setNetworkId('');
      setGroupSearch('');
      onSuccess?.();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  };

  const handleClose = () => {
    if (!isMutating) {
      setRoleName('');
      setRoleCode('');
      setGroupId('');
      setNetworkId('');
      setGroupSearch('');
      setShowGroupDropdown(false);
      onClose();
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title="Create New Role"
      subtitle="Add a new role to the system"
      size="md"
      maxHeight="max-h-[75vh]"
      contentClassName="pr-2"
      primaryAction={{
        label: 'Create Role',
        onClick: handleSubmit,
        disabled: isMutating || !roleName.trim(),
        loading: isMutating,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        disabled: isMutating,
        variant: 'outlined',
        loading: isMutating,
      }}
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role Name *
          </label>
          <Input
            value={roleName}
            onChange={e => setRoleName(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))}
            placeholder="EXAMPLE_ROLE_NAME"
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Role Code
          </label>
          <Input
            value={roleCode}
            onChange={e => setRoleCode(e.target.value)}
            placeholder="Optional identifier code"
            className="w-full"
          />
        </div>

        <div className="relative" ref={groupDropdownRef}>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Group
          </label>
          <button
            type="button"
            onClick={() => setShowGroupDropdown(prev => !prev)}
            className="w-full flex justify-between items-center rounded-md px-4 py-2.5 text-sm border border-input bg-background text-foreground hover:bg-muted transition duration-150 ease-in-out focus:outline-none focus:border-primary"
          >
            <span className={selectedGroup ? '' : 'text-muted-foreground'}>
              {selectedGroup?.grp_title || 'None'}
            </span>
            <svg
              className={`w-5 h-5 ml-2 transition-transform duration-200 flex-shrink-0 text-muted-foreground ${showGroupDropdown ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showGroupDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-popover rounded-md shadow-lg border border-primary overflow-hidden">
              <div className="p-2">
                <input
                  type="text"
                  value={groupSearch}
                  onChange={e => setGroupSearch(e.target.value)}
                  placeholder="Search groups..."
                  className="w-full px-3 py-2 text-sm rounded-md border border-input bg-background text-foreground focus:outline-none focus:border-primary"
                  autoFocus
                />
              </div>
              <ul className="py-1 max-h-48 overflow-y-auto">
                <li
                  onClick={() => handleSelectGroup('')}
                  className={`cursor-pointer px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-primary/10 ${!groupId ? 'bg-primary/20 text-primary font-medium' : 'text-foreground'}`}
                >
                  None
                </li>
                {filteredGroups.map(group => (
                  <li
                    key={group._id}
                    onClick={() => handleSelectGroup(group._id)}
                    className={`cursor-pointer px-4 py-2.5 text-sm transition-colors duration-150 hover:bg-primary/10 ${groupId === group._id ? 'bg-primary/20 text-primary font-medium' : 'text-foreground'}`}
                  >
                    {group.grp_title}
                  </li>
                ))}
                {filteredGroups.length === 0 && (
                  <li className="px-4 py-2.5 text-sm text-muted-foreground">
                    No groups found
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Network ID
          </label>
          <Input
            value={networkId}
            onChange={e => setNetworkId(e.target.value)}
            placeholder="Optional network ID"
            className="w-full"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default CreateRoleDialog;
