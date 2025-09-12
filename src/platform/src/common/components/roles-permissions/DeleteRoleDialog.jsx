import React from 'react';
import PropTypes from 'prop-types';
import ReusableDialog from '@/common/components/Modal/ReusableDialog';
import Button from '@/common/components/Button';
import InputField from '@/common/components/InputField';
import NotificationService from '@/core/utils/notificationService';
import { deleteGroupRoleApi } from '@/core/apis/Account';

const DeleteRoleDialog = ({ isOpen, onClose, roleId, onRefresh }) => {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    if (!roleId) return;
    setLoading(true);
    try {
      const response = await deleteGroupRoleApi(roleId);
      // Some delete endpoints return 204/no-body and APIs in this repo
      // often return `response.data` (so `status` may be undefined).
      // Treat absence of explicit `success: false` as success.
      const ok = response?.success !== false;
      if (ok) {
        const status = Number(response?.status) || 200;
        const message =
          response?.data?.message ||
          response?.message ||
          'Role deleted successfully!';
        NotificationService.success(status, message);
        onClose();
        if (typeof onRefresh === 'function') onRefresh();
      } else {
        const status = Number(response?.status) || 400;
        const message =
          response?.data?.message ||
          response?.message ||
          'Failed to delete role.';
        if (status === 500) {
          NotificationService.error(
            500,
            'Something went wrong on our servers. Please try again later.',
          );
        } else {
          NotificationService.error(status, message);
        }
      }
    } catch (error) {
      const status = error?.response?.status ?? 0; // 0 => network error
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        'Failed to delete role.';
      if (status === 500) {
        NotificationService.error(
          500,
          'Something went wrong on our servers. Please try again later.',
        );
      } else if (status === 0) {
        NotificationService.error(
          0,
          'Network error. Please check your connection and try again.',
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
      ariaLabel="Delete Role Confirmation"
      size="max-w-md w-full"
      className="z-[10001]"
      hideCloseIcon={true}
      customHeader={
        <div>
          <h2 className="text-xl font-semibold text-red-600">Delete Role</h2>
        </div>
      }
      customFooter={
        <div className="flex justify-end items-center w-full space-x-4">
          <Button onClick={onClose} variant="outlined" disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            variant="danger"
            loading={loading}
            disabled={loading}
          >
            Delete
          </Button>
        </div>
      }
    >
      <div className="pt-2">
        <p className="text-base text-gray-700 dark:text-gray-200 mb-4">
          Are you sure you want to delete this role?
        </p>
        {/* Hidden role_id field */}
        <InputField type="hidden" name="role_id" value={roleId} />
      </div>
    </ReusableDialog>
  );
};

DeleteRoleDialog.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  roleId: PropTypes.string.isRequired,
  onRefresh: PropTypes.func,
};

export default DeleteRoleDialog;
