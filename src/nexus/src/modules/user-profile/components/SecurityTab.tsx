'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Banner } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { securitySchema, type SecurityFormData } from '@/shared/lib/validators';
import { PasswordRequirements } from '@/shared/components/ui/password-requirements';
import { PASSWORD_MAX } from '@/shared/lib/validation-limits';
import { useUpdatePassword, useUser } from '@/shared/hooks';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { isInOrganizationContext } from '@/shared/utils/groupUtils';
import SettingsLayout from './SettingsLayout';
import AccountDeletionCard from './AccountDeletionCard';
import { LeaveOrganizationCard } from '@/modules/organization';
import ConnectedAccounts from './ConnectedAccounts';

const SecurityTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user, activeGroup, isLoading: isUserLoading } = useUser();
  const { data: session, status: sessionStatus } = useSession();
  const { trigger: updatePassword } = useUpdatePassword();

  // Check if user is in an organization context (not AirQo default)
  const showLeaveOrganization = isInOrganizationContext(activeGroup);
  const authMethods = user?.authMethods ?? session?.authMethods;

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<SecurityFormData>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
    mode: 'onChange',
  });

  const newPasswordValue = watch('newPassword');

  const onSubmit = async (data: SecurityFormData) => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    setLoading(true);

    try {
      await updatePassword({
        userId: user.id,
        passwordData: {
          password: data.newPassword,
          old_password: data.currentPassword,
        },
      });

      toast.success('Password changed successfully');
      reset();
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <SettingsLayout
        title="Security Settings"
        description="Update your password and security preferences"
      >
        <div className="space-y-8">
          {/* Password Section */}
          <div className="space-y-6">
            {/* Security Info */}
            <Banner
              severity="warning"
              title="Password Requirements"
              message="Your password must meet all the requirements listed below."
              showIcon={true}
            />

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Current Password */}
              <Input
                {...register('currentPassword')}
                label="Current Password"
                type="password"
                placeholder="Enter your current password"
                error={errors.currentPassword?.message}
                required
                showPasswordToggle
                maxLength={PASSWORD_MAX}
              />

              {/* New Password */}
              <div>
                <Input
                  {...register('newPassword')}
                  label="New Password"
                  type="password"
                  placeholder="Enter your new password"
                  error={errors.newPassword?.message}
                  required
                  showPasswordToggle
                  maxLength={PASSWORD_MAX}
                />
                <PasswordRequirements password={newPasswordValue || ''} />
              </div>

              {/* Confirm Password */}
              <Input
                {...register('confirmPassword')}
                label="Confirm New Password"
                type="password"
                placeholder="Confirm your new password"
                error={errors.confirmPassword?.message}
                required
                showPasswordToggle
                maxLength={PASSWORD_MAX}
              />

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button type="submit" loading={loading} className="px-8 py-2">
                  {loading ? 'Changing...' : 'Change Password'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </SettingsLayout>

      <ConnectedAccounts
        authMethods={authMethods}
        loading={isUserLoading || sessionStatus === 'loading'}
      />

      {/* Account Deletion Section */}
      <AccountDeletionCard />

      {/* Leave Organization Section - Only show if in organization context */}
      {showLeaveOrganization && <LeaveOrganizationCard />}
    </div>
  );
};

export default SecurityTab;
