import React from 'react';
import PropTypes from 'prop-types';
import ReusableDialog from '@/common/components/Modal/ReusableDialog';

import Button from '@/common/components/Button';
import InputField from '@/common/components/InputField';

import CustomToast from '@/common/components/Toast/CustomToast';

const DeleteRoleDialog = ({ isOpen, onClose, roleId }) => {
  const [loading, setLoading] = React.useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    const payload = { role_id: roleId };
    console.log('DeleteRoleDialog payload:', payload);
    try {
      // TODO: Replace with actual delete role API call
      await new Promise((resolve) => setTimeout(resolve, 800));
      CustomToast({ message: 'Role deleted successfully!', type: 'success' });
      onClose();
    } catch {
      CustomToast({ message: 'Failed to delete role.', type: 'error' });
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
};

export default DeleteRoleDialog;
