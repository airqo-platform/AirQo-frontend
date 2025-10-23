'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input } from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { securitySchema, type SecurityFormData } from '@/shared/lib/validators';
import { useUpdatePassword, useUser } from '@/shared/hooks';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import SettingsLayout from './SettingsLayout';
import { AqAlertTriangle } from '@airqo/icons-react';

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
    <SettingsLayout
      title="Security Settings"
      description="Update your password and security preferences"
    >
      <div className="space-y-6">
        {/* Security Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <AqAlertTriangle size={20} className="text-amber-400 mt-0.5 mr-3" />
            <div>
              <h4 className="text-sm font-medium text-amber-800">
                Password Requirements
              </h4>
              <ul className="mt-1 text-sm text-amber-700 list-disc list-inside space-y-1">
                <li>At least 8 characters long</li>
                <li>Include uppercase and lowercase letters</li>
                <li>Include at least one number</li>
                <li>Include at least one special character</li>
              </ul>
            </div>
          </div>
        </div>

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
    </SettingsLayout>
  );
};

export default SecurityTab;
