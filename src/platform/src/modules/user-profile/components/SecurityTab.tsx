'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Banner } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { securitySchema, type SecurityFormData } from '@/shared/lib/validators';
import { useUpdatePassword, useUser } from '@/shared/hooks';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import SettingsLayout from './SettingsLayout';
import AccountDeletionCard from './AccountDeletionCard';

const SecurityTab: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { trigger: updatePassword } = useUpdatePassword();

  const {
    register,
    handleSubmit,
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
              message={
                <ul className="list-disc list-inside space-y-1 mt-2">
                  <li>At least 8 characters long</li>
                  <li>Include uppercase and lowercase letters</li>
                  <li>Include at least one number</li>
                  <li>Include at least one special character</li>
                </ul>
              }
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
              />

              {/* New Password */}
              <Input
                {...register('newPassword')}
                label="New Password"
                type="password"
                placeholder="Enter your new password"
                error={errors.newPassword?.message}
                required
                showPasswordToggle
              />

              {/* Confirm Password */}
              <Input
                {...register('confirmPassword')}
                label="Confirm New Password"
                type="password"
                placeholder="Confirm your new password"
                error={errors.confirmPassword?.message}
                required
                showPasswordToggle
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

      {/* Account Deletion Section */}
      <AccountDeletionCard />
    </div>
  );
};

export default SecurityTab;
