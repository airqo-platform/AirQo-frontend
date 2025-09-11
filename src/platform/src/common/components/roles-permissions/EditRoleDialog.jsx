import { useState } from 'react';
import PropTypes from 'prop-types';
import ReusableDialog from '@/common/components/Modal/ReusableDialog';
import Button from '@/common/components/Button';
import InputField from '@/common/components/InputField';
import SelectField from '@/common/components/SelectField';
import NotificationService from '@/core/utils/notificationService';
import { updateGroupRoleApi } from '@/core/apis/Account';

const EditRoleDialog = ({
  isOpen,
  onClose,
  roleId,
  initialRoleName,
  initialRoleStatus,
  onRefresh,
}) => {
  const [roleName, setRoleName] = useState(initialRoleName || '');
  const [roleStatus, setRoleStatus] = useState(initialRoleStatus || 'ACTIVE');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roleName.trim()) return;
    setLoading(true);
    try {
      const trimmedName = roleName.trim();
      const payload = {
        role_name: trimmedName,
        role_code: trimmedName,
        role_status: roleStatus,
      };
      const response = await updateGroupRoleApi(roleId, payload);
      if (response?.success) {
        NotificationService.success(
          response?.status || 200,
          'Role updated successfully!',
        );
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
            response?.message || 'Failed to update role.',
          );
        }
      }
    } catch (error) {
      const status = error?.response?.status || null;
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to update role.';
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
      ariaLabel="Edit Role Dialog"
      size="max-w-md w-full"
      className="z-[10001]"
      hideCloseIcon={true}
      customHeader={
        <div>
          <h2 className="text-xl font-semibold">Edit Role</h2>
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
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="pt-2 flex flex-col gap-4">
        <div>
          <InputField
            id="role_name"
            name="role_name"
            label="Role Name"
            type="text"
            value={roleName}
            onChange={(e) => setRoleName(e.target.value)}
            placeholder="Enter role name"
            required
            autoFocus
            disabled
          />
        </div>
        <div>
          <SelectField
            id="role_status"
            label="Role Status"
            name="role_status"
            value={roleStatus}
            onChange={(e) => setRoleStatus(e.target.value)}
            required
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </SelectField>
        </div>
        {/* Hidden role_id field */}
        <InputField type="hidden" name="role_id" value={roleId} />
      </form>
    </ReusableDialog>
  );
};

EditRoleDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  roleId: PropTypes.string.isRequired,
  initialRoleName: PropTypes.string.isRequired,
  initialRoleStatus: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
};

export default EditRoleDialog;
