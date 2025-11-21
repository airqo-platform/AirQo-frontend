'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { countries } from 'countries-list';
import type { CountryCode } from 'libphonenumber-js';
import {
  Button,
  Input,
  Avatar,
  TextInput,
  Select,
  PhoneNumberInput,
} from '@/shared/components/ui';
import { toast } from '@/shared/components/ui';
import { useSession } from 'next-auth/react';
import { useUpdateUserDetails, useUserDetails } from '@/shared/hooks';
import { useChecklistIntegration } from '@/modules/user-checklist';
import { uploadProfileImage } from '@/shared/utils/cloudinaryUpload';
import { profileSchema, type ProfileFormData } from '@/shared/lib/validators';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { ProfileFormData as ProfileFormType } from '../types';
import SettingsLayout from './SettingsLayout';

interface ProfileFormProps {
  userId: string;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [pendingImage, setPendingImage] = useState<File | null>(null); // <-- NEW
  const { data: session } = useSession();
  const { data: userDetails, mutate: mutateUserDetails } =
    useUserDetails(userId);
  const updateUserDetails = useUpdateUserDetails();

  // Checklist integration hook
  const { markProfileStepCompleted } = useChecklistIntegration();

  /* ---------- everything below is untouched ---------- */
  const countryOptions = useMemo(() => {
    return Object.values(countries)
      .map(c => ({ value: c.name, label: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      jobTitle: '',
      country: '',
      description: '',
      profilePicture: '',
    },
    mode: 'onChange',
  });

  const selectedCountry = watch('country');

  const getCountryCodeFromName = (name: string): CountryCode => {
    if (!name) return 'UG';
    for (const [code, country] of Object.entries(countries)) {
      if (country.name === name) return code as CountryCode;
    }
    return 'UG';
  };

  const phoneDefaultCountry = useMemo(
    () => (selectedCountry ? getCountryCodeFromName(selectedCountry) : 'UG'),
    [selectedCountry]
  );

  useEffect(() => {
    if (userDetails?.users?.[0]) {
      const u = userDetails.users[0];
      setValue('firstName', u.firstName || '');
      setValue('lastName', u.lastName || '');
      setValue('email', u.email || '');
      setValue(
        'phoneNumber',
        u.phoneNumber
          ? u.phoneNumber.toString().startsWith('+')
            ? u.phoneNumber.toString()
            : `+${u.phoneNumber}`
          : ''
      );
      setValue('jobTitle', u.jobTitle || '');
      setValue('country', u.country || '');
      setValue('description', u.description || '');
      setValue('profilePicture', u.profilePicture || '');
    }
  }, [userDetails, setValue]);

  /* -------------------------------------------------- */

  /**
   * 1. User selects a file → store locally, preview instantly
   */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPendingImage(file);
    // instant preview
    const reader = new FileReader();
    reader.onload = ev =>
      setValue('profilePicture', ev.target?.result as string, {
        shouldDirty: true,
      });
    reader.readAsDataURL(file);
  };

  /**
   * 2. Real submit handler – upload (if needed) then save to DB
   */
  const onSubmit = async (data: ProfileFormData) => {
    if (!isDirty && !pendingImage) {
      toast.info('No changes to save');
      return;
    }

    setLoading(true);

    try {
      let finalPictureUrl = data.profilePicture;

      // Upload only when user pressed Save
      if (pendingImage) {
        const sessionUser = session?.user as {
          firstName?: string;
          lastName?: string;
          email?: string;
        };
        const userName =
          sessionUser?.firstName && sessionUser?.lastName
            ? `${sessionUser.firstName.charAt(0).toUpperCase()}${sessionUser.firstName
                .slice(1)
                .toLowerCase()}_${sessionUser.lastName.toLowerCase()}`
            : sessionUser?.email?.split('@')[0] || 'user';

        const uploadRes = await uploadProfileImage(pendingImage, userName);
        finalPictureUrl = uploadRes.secure_url;
      }

      // Build changed-fields object exactly like you already do
      const changed: Partial<ProfileFormType> = {};
      const u = userDetails?.users?.[0];
      if (u) {
        if (data.firstName !== u.firstName) changed.firstName = data.firstName;
        if (data.lastName !== u.lastName) changed.lastName = data.lastName;
        if (data.email !== u.email) changed.email = data.email;

        const norm = (p: string | number | null | undefined) =>
          String(p || '').replace(/[\s+]/g, '');
        if (norm(data.phoneNumber) !== norm(u.phoneNumber))
          changed.phoneNumber = data.phoneNumber;

        if (data.jobTitle !== u.jobTitle) changed.jobTitle = data.jobTitle;
        if (data.country !== u.country) changed.country = data.country;
        if (data.description !== u.description)
          changed.description = data.description;
        if (finalPictureUrl !== u.profilePicture)
          changed.profilePicture = finalPictureUrl;
      }

      if (!Object.keys(changed).length) {
        toast.info('No changes to save');
        return;
      }

      await updateUserDetails.trigger({ userId, details: changed });
      toast.success('Profile updated successfully');
      mutateUserDetails();
      setPendingImage(null); // clear pending image after successful save

      // Update checklist - mark profile completion step as completed
      try {
        await markProfileStepCompleted();
      } catch (checklistError) {
        // Don't block the main flow if checklist update fails
        console.error(
          'Failed to update checklist for profile completion:',
          checklistError
        );
      }
    } catch (err: unknown) {
      const errorMessage = getUserFriendlyErrorMessage(err);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  /* ------------------ UI stays identical ------------------ */
  return (
    <SettingsLayout
      title="Personal Information"
      description="Update your personal details and profile picture"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Profile Picture */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <Avatar
              src={watch('profilePicture') || '/default-avatar.png'}
              alt="Profile"
              className="w-24 h-24"
              size="xl"
            />
            <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer hover:bg-primary/80 transition-colors shadow-lg">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
                disabled={loading}
              />
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
            </label>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-medium ">Profile Picture</h3>
            <p className="text-sm text-gray-600 mt-1">
              Upload a new profile picture. JPG, PNG or GIF (max 5MB)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            {...register('firstName')}
            label="First Name"
            type="text"
            placeholder="Enter your first name"
            error={errors.firstName?.message}
            required
          />
          <Input
            {...register('lastName')}
            label="Last Name"
            type="text"
            placeholder="Enter your last name"
            error={errors.lastName?.message}
            required
          />
        </div>

        <Input
          {...register('email')}
          label="Email Address"
          type="email"
          placeholder="Enter your email"
          error={errors.email?.message}
          disabled
          description="Email cannot be changed. Contact support if needed."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Controller
            name="phoneNumber"
            control={control}
            render={({ field }) => (
              <PhoneNumberInput
                label="Phone Number"
                value={field.value || ''}
                onChange={field.onChange}
                error={errors.phoneNumber?.message}
                placeholder="Enter your phone number"
                defaultCountry={phoneDefaultCountry}
              />
            )}
          />
          <Input
            {...register('jobTitle')}
            label="Job Title"
            type="text"
            placeholder="Enter your job title"
            error={errors.jobTitle?.message}
          />
        </div>

        <Controller
          name="country"
          control={control}
          render={({ field }) => (
            <Select
              label="Country"
              error={errors.country?.message}
              value={field.value}
              onChange={e => field.onChange(e.target.value)}
              placeholder="Select a country"
            >
              <option value="">Select a country</option>
              {countryOptions.map(c => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </Select>
          )}
        />

        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextInput
              label="Bio"
              placeholder="Tell us about yourself..."
              error={errors.description?.message}
              rows={4}
              {...field}
            />
          )}
        />

        <div className="flex justify-end pt-6 border-t border-gray-200">
          <Button type="submit" loading={loading} className="px-8 py-2">
            Save Changes
          </Button>
        </div>
      </form>
    </SettingsLayout>
  );
};

export default ProfileForm;
