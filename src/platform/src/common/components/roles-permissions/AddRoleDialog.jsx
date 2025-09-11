import { useState } from 'react';
import PropTypes from 'prop-types';
import ReusableDialog from '@/common/components/Modal/ReusableDialog';
import Button from '@/common/components/Button';
import InputField from '@/common/components/InputField';
import NotificationService from '@/core/utils/notificationService';
import { createGroupRoleApi } from '@/core/apis/Account';

const AddRoleDialog = ({ isOpen, onClose, groupId, onRefresh }) => {
  const [roleName, setRoleName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    setLoading(true);
    try {
      const payload = {
        role_name: roleName.trim(),
        group_id: groupId,
      };
      const response = await createGroupRoleApi(payload);
      if (response?.success) {
        NotificationService.success(
          response?.status || 200,
          'Role created successfully!',
        );
        setRoleName('');
        onClose();
        if (typeof onRefresh === 'function') onRefresh();
      } else {
        const status = response?.status || null;
        if (status === 500) {
          NotificationService.error(
            500,
            'Something went wrong on our servers. Please try again later.',
          );
        } else {
          NotificationService.error(
            status,
            response?.message || 'Failed to create role.',
          );
        }
      }
    } catch (error) {
      const status = error?.response?.status || null;
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to create role.';
      if (status === 500) {
        NotificationService.error(
          500,
          'Something went wrong on our servers. Please try again later.',
        );
      } else {
        NotificationService.error(status, apiMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel="Add Role Dialog"
      size="max-w-md w-full"
      className="z-[10001]"
      hideCloseIcon={true}
      customHeader={
        <div>
          <h2 className="text-xl font-semibold">Add New Role</h2>
        </div>
      }
      customFooter={
        <div className="flex justify-end items-center w-full space-x-4">
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="filled"
            loading={loading}
            disabled={!roleName.trim() || loading}
          >
            Add Role
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="pt-2 flex flex-col gap-6">
        <div>
          <label htmlFor="role_name" className="block text-sm font-medium mb-1">
            Role Name
          </label>
          <InputField
            id="role_name"
            name="role_name"
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Enter role name"
            required
            autoFocus
          />
        </div>
        {/* Hidden group_id field */}
        <InputField type="hidden" name="group_id" value={groupId} />
      </form>
    </ReusableDialog>
  );
};

AddRoleDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  groupId: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
};

export default AddRoleDialog;
