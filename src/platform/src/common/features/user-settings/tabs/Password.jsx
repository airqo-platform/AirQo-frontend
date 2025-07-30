import { useState } from 'react';
import * as Yup from 'yup';
import { updateUserPasswordApi } from '@/core/apis/Settings';
import { useSession } from 'next-auth/react';
import AlertBox from '@/components/AlertBox';
import Spinner from '@/components/Spinner';
import Card from '@/components/CardWrapper';
import Button from '@/components/Button';
import InputField from '@/common/components/InputField';

// Define the password complexity regex
const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&.*,]).{6,}$/;

// Yup validation schema for password fields
const passwordSchema = Yup.object().shape({
  currentPassword: Yup.string().required('Current password is required'),
  newPassword: Yup.string()
    .matches(
      passwordRegex,
      'Password must contain at least 6 characters including UPPER/lowercase, numbers and special characters.',
    )
    .required('New password is required'),
  confirmNewPassword: Yup.string()
    .oneOf(
      [Yup.ref('newPassword'), null],
      'New password and confirmation do not match.',
    )
    .required('Confirmation is required'),
});

const Password = () => {
  const { data: session } = useSession();
  const [isDisabled, setIsDisabled] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [errorState, setErrorState] = useState({
    isError: false,
    message: '',
    type: '',
  });
  // Local state for field values and field-level errors
  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});

  // Handle change for InputField components
  const handleChange = (e) => {
    const { id, value } = e.target;
    setPasswords((prev) => {
      const updated = { ...prev, [id]: value };
      // Mark as dirty if any field is changed from initial state
      setIsDirty(
        updated.currentPassword !== '' ||
          updated.newPassword !== '' ||
          updated.confirmNewPassword !== '',
      );
      return updated;
    });
    // Clear individual field error if present
    if (fieldErrors[id]) {
      setFieldErrors({ ...fieldErrors, [id]: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Validate password fields using Yup
    try {
      await passwordSchema.validate(passwords, { abortEarly: false });
      // Clear field errors if validation passes
      setFieldErrors({});
    } catch (validationError) {
      const errors = {};
      validationError.inner.forEach((err) => {
        errors[err.path] = err.message;
      });
      setFieldErrors(errors);
      return;
    }

    const { currentPassword, newPassword } = passwords;
    const pwdData = { password: newPassword, old_password: currentPassword };

    try {
      setIsDisabled(true);
      const response = await updateUserPasswordApi(
        session.user.id,
        session.user.organization,
        pwdData,
      );
      if (response.success) {
        setPasswords({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setIsDirty(false);
        setErrorState({
          isError: true,
          message: 'Password updated successfully.',
          type: 'success',
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      setErrorState({
        isError: true,
        message:
          error.message || 'Something went wrong. Please try again later.',
        type: 'error',
      });
    } finally {
      setIsDisabled(false);
    }
  };

  const handleReset = () => {
    setPasswords({
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    });
    setFieldErrors({});
    setIsDirty(false);
  };

  return (
    <div data-testid="tab-content">
      <AlertBox
        message={errorState.message}
        type={errorState.type}
        show={errorState.isError}
        hide={() => setErrorState({ isError: false, message: '', type: '' })}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
        <div>
          <h1 className="text-2xl font-medium text-gray-700 dark:text-white">
            Password
          </h1>
          <p className="text-sm text-gray-500">
            Enter your current password to change your password.
          </p>
        </div>
        <div className="md:col-span-2">
          <Card>
            <form
              className="flex flex-col gap-4"
              onSubmit={handleSubmit}
              data-testid="form-box"
            >
              <InputField
                id="currentPassword"
                type="password"
                value={passwords.currentPassword}
                onChange={handleChange}
                label="Current Password"
                placeholder="•••••••••"
                error={fieldErrors.currentPassword}
                required
              />
              <InputField
                id="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={handleChange}
                label="New Password"
                placeholder="•••••••••"
                error={fieldErrors.newPassword}
                required
              />
              <InputField
                id="confirmNewPassword"
                type="password"
                value={passwords.confirmNewPassword}
                onChange={handleChange}
                label="Confirm New Password"
                placeholder="•••••••••"
                error={fieldErrors.confirmNewPassword}
                required
              />
            </form>
            <div className="flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
              <Button
                onClick={handleReset}
                type="button"
                disabled={isDisabled || !isDirty}
                variant={isDisabled || !isDirty ? 'disabled' : 'outlined'}
                className="py-3 px-4 text-sm dark:bg-transparent"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                type="button"
                disabled={isDisabled || !isDirty}
                variant={isDisabled || !isDirty ? 'disabled' : 'filled'}
                className="py-3 px-4 text-sm rounded"
              >
                {isDisabled ? (
                  <div className="flex items-center gap-1">
                    <Spinner size={16} />
                    <span>Saving...</span>
                  </div>
                ) : (
                  'Save'
                )}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Password;
