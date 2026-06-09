'use client';

import React, { useState } from 'react';
import { Dialog, Input, Select } from '@/shared/components/ui';
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

        <div>
          <Select
            label="Group"
            value={groupId}
            onChange={e => setGroupId(String(e.target.value || ''))}
            placeholder="Select a group"
          >
            <option value="">None</option>
            {groups.map(group => (
              <option key={group._id} value={group._id}>
                {group.grp_title}
              </option>
            ))}
          </Select>
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
