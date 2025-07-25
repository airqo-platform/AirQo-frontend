import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReusableDialog from '../Modal/ReusableDialog';
import SelectField from '../SelectField';
import { getGroupRolesApi, assignRoleToUserApi } from '@/core/apis/Account';

const EditUserRoleModal = ({
  isOpen,
  onClose,
  user,
  groupId,
  onSave,
  isLoading,
}) => {
  console.log(user);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(user?.role || '');
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && groupId) {
      setLoadingRoles(true);
      getGroupRolesApi(groupId)
        .then((data) => {
          setRoles(data?.roles || []);
          setError('');
        })
        .catch((err) => {
          setError(err.message || 'Failed to fetch roles');
        })
        .finally(() => setLoadingRoles(false));
    }
  }, [isOpen, groupId]);

  useEffect(() => {
    setSelectedRole(user?.role || '');
  }, [user]);

  const handleSave = async () => {
    const userId = user?._id;
    if (!selectedRole || !userId) return;
    try {
      // Assign the role to the user using _id
      await assignRoleToUserApi(selectedRole, { user: userId });
      onSave(selectedRole);
    } catch (err) {
      // Try to parse a more user-friendly error message
      let friendlyMessage = err.message || 'Failed to assign role';
      if (err.errors && Array.isArray(err.errors)) {
        const alreadyAssigned = err.errors.find(
          (e) =>
            e.message && e.message.includes('is already assigned to the role'),
        );
        if (alreadyAssigned) {
          friendlyMessage =
            'The selected role is already assigned to this user.';
        }
      }
      setError(friendlyMessage);
    }
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Role for ${user?.firstName || ''} ${user?.lastName || ''}`}
      showFooter={true}
      primaryAction={{
        label: isLoading ? 'Saving...' : 'Save',
        onClick: handleSave,
        disabled: isLoading || !selectedRole,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        disabled: isLoading,
      }}
    >
      <div className="space-y-4">
        {loadingRoles ? (
          <div className="text-sm text-gray-500">Loading roles...</div>
        ) : error ? (
          <div className="text-sm text-red-500">{error}</div>
        ) : (
          <SelectField
            label="Role"
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            required
            disabled={isLoading}
          >
            <option value="" disabled>
              Select a role
            </option>
            {roles.map((role) => (
              <option key={role._id} value={role._id}>
                {role.role_name}
              </option>
            ))}
          </SelectField>
        )}
      </div>
    </ReusableDialog>
  );
};

EditUserRoleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.object,
  groupId: PropTypes.string,
  onSave: PropTypes.func.isRequired,
  isLoading: PropTypes.bool,
};

export default EditUserRoleModal;
