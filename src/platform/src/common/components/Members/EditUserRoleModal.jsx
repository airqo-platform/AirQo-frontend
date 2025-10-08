import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import ReusableDialog from '../Modal/ReusableDialog';
import SelectField from '../SelectField';
import Button from '@/common/components/Button';
import NotificationService from '@/core/utils/notificationService';
import { getGroupRolesApi, assignRoleToUserApi } from '@/core/apis/Account';

const EditUserRoleModal = ({
  isOpen,
  onClose,
  user,
  groupId,
  onSave,
  isLoading,
}) => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(user?.role || '');
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && groupId) {
      setLoadingRoles(true);
      getGroupRolesApi(groupId)
        .then((data) => {
          setRoles(data?.roles || []);
          // clear any prior errors silently
        })
        .catch((err) => {
          NotificationService.error(
            err?.status || 400,
            err?.message || 'Failed to fetch roles',
          );
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

    setError('');
    setSubmitting(true);
    try {
      const res = await assignRoleToUserApi(selectedRole, { user: userId });

      const status =
        res?.status ?? res?.statusCode ?? (res?.success === false ? 400 : 200);

      if (res && typeof res === 'object') {
        if (res.success === false) {
          // Prefer detailed error from API when available (avoid generic 'Bad Request Error')
          let detail = res.message || 'Failed to assign role';
          if (
            status === 400 &&
            Array.isArray(res.errors) &&
            res.errors.length > 0
          ) {
            // Prefer the first error message and sanitize IDs
            const messages = res.errors.map((e) => e?.message).filter(Boolean);
            if (messages.length > 0) {
              const raw = messages[0];
              // Detect common 'already assigned' pattern and replace with friendly message
              const alreadyAssignedRegex =
                /User\s+[a-fA-F0-9]{24}\s+is already assigned to the role\s+[a-fA-F0-9]{24}/i;
              if (alreadyAssignedRegex.test(raw)) {
                detail = 'Selected user already has the selected role.';
              } else {
                // Remove any Mongo-like IDs from the message to avoid exposing them
                detail = messages
                  .map((m) =>
                    m
                      .replace(/[a-fA-F0-9]{24}/g, '')
                      .replace(/\s{2,}/g, ' ')
                      .trim(),
                  )
                  .filter(Boolean)
                  .join('; ');
              }
            }
          }
          NotificationService.error(status, detail);
          return;
        }

        NotificationService.success(
          status,
          res.message || 'Role assigned successfully',
        );
        onSave(selectedRole);
        return;
      }

      // Fallback: assume success
      NotificationService.success(200, 'Role assigned successfully');
      onSave(selectedRole);
    } catch (err) {
      const apiMessage =
        err?.message || err?.response?.data?.message || 'Failed to assign role';
      const status = err?.status || err?.response?.status || 500;
      NotificationService.error(status, apiMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ReusableDialog
      isOpen={isOpen}
      onClose={onClose}
      title={`Edit Role for ${user?.firstName || ''} ${user?.lastName || ''}`}
      showFooter={true}
      // Keep footer but render custom buttons to use Button component and local loading
      customFooter={
        <div className="flex gap-2 justify-end">
          <Button
            variant="text"
            onClick={onClose}
            disabled={isLoading || submitting}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            loading={isLoading || submitting}
            onClick={handleSave}
            disabled={isLoading || submitting || !selectedRole}
          >
            {isLoading || submitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      }
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
            disabled={isLoading || submitting}
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
