import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { countries } from 'countries-list';
import { useSWRConfig } from 'swr';
import { useDispatch } from 'react-redux';
import { useUser } from '@/shared/hooks/useUser';
import { userService } from '@/shared/services/userService';
import { uploadToCloudinary } from '@/shared/utils/cloudinaryUpload';
import { LoadingSpinner } from '@/shared/components/ui';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { TextInput } from '@/shared/components/ui/text-input';
import SelectField from '@/shared/components/ui/select';
import SettingsLayout from '@/modules/user-profile/components/SettingsLayout';
import { toast } from '@/shared/components/ui/toast';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { GroupDetails, UpdateGroupDetailsRequest } from '@/shared/types/api';
import { AqCheck, AqUploadCloud01 } from '@airqo/icons-react';
import { setActiveGroup, setGroups } from '@/shared/store/userSlice';
import { normalizeGroupDetails } from '@/shared/utils/userUtils';

const GroupDetailsSettings: React.FC = () => {
  const { activeGroup, groups, user } = useUser();
  const dispatch = useDispatch();
  const { mutate } = useSWRConfig();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [formData, setFormData] = useState<UpdateGroupDetailsRequest>({});
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const countryOptions = useMemo(() => {
    return Object.values(countries)
      .map(c => ({ value: c.name, label: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  // Cleanup object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!activeGroup?.id) return;

      setIsLoading(true);
      try {
        const response = await userService.getGroupDetails(activeGroup.id);
        if (response.success) {
          setGroupDetails(response.group);
          setFormData({
            grp_title: response.group.grp_title,
            grp_status: response.group.grp_status,
            grp_description: response.group.grp_description,
            grp_manager: response.group.grp_manager?._id,
            grp_website: response.group.grp_website,
            grp_industry: response.group.grp_industry,
            grp_country: response.group.grp_country,
            grp_timezone: response.group.grp_timezone,
            grp_image: response.group.grp_image,
          });
          setImagePreview(response.group.grp_image);
          setImageError(false);
        }
      } catch (error) {
        console.error('Failed to fetch group details:', error);
        toast.error('Failed to load group details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroupDetails();
  }, [activeGroup?.id]);

  const handleInputChange = (
    e:
      | React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
      | { target: { name?: string; value: unknown } }
  ) => {
    const { name, value } = e.target;
    if (name) {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setImageError(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup?.id) return;

    setIsSaving(true);
    try {
      let imageUrl = formData.grp_image;

      if (selectedImage) {
        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (selectedImage.size > maxSize) {
          toast.error('File size exceeds 5MB limit');
          setIsSaving(false);
          return;
        }

        const uploadResult = await uploadToCloudinary(selectedImage, {
          folder: 'organization_profiles',
          tags: ['group-logo', activeGroup.id],
        });
        imageUrl = uploadResult.secure_url;
      }

      // Find manager details if manager changed
      let managerDetails = {};
      if (formData.grp_manager && groupDetails?.grp_users) {
        const selectedManager = groupDetails.grp_users.find(
          u => u._id === formData.grp_manager
        );
        if (selectedManager) {
          managerDetails = {
            grp_manager: selectedManager._id,
            grp_manager_firstname: selectedManager.firstName,
            grp_manager_lastname: selectedManager.lastName,
            grp_manager_username: selectedManager.email,
          };
        }
      }

      const updateData: UpdateGroupDetailsRequest = {
        ...formData,
        ...managerDetails,
        grp_image: imageUrl,
        grp_profile_picture: imageUrl, // Ensure profile picture is also updated
      };

      await userService.updateGroupDetails(activeGroup.id, updateData);
      toast.success('Group details updated successfully');

      // Refresh details
      const response = await userService.getGroupDetails(activeGroup.id);
      if (response.success) {
        setGroupDetails(response.group);
        setImagePreview(response.group.grp_image);
        setImageError(false);
        setSelectedImage(null); // Reset selected image state

        // Update Redux store with the new group details
        const normalizedGroup = normalizeGroupDetails(response.group);
        if (normalizedGroup) {
          // Update active group in Redux
          dispatch(setActiveGroup(normalizedGroup));

          // Update groups array in Redux
          const updatedGroups = groups.map(g =>
            g.id === normalizedGroup.id ? normalizedGroup : g
          );
          dispatch(setGroups(updatedGroups));
        }

        // Invalidate SWR cache to trigger refetch of user data
        // This ensures the header and sidebar get the updated logo
        if (user?.id) {
          mutate(`user/details/${user.id}`, undefined, { revalidate: true });
        }
      }
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error('Failed to update group details', errorMessage);
      console.error('Failed to update group details:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SettingsLayout
        title="Group Details"
        description="Manage your organization's group information."
      >
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner />
        </div>
      </SettingsLayout>
    );
  }

  return (
    <SettingsLayout
      title="Group Details"
      description="Manage your organization's group information."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Group Logo
          </label>
          <div className="flex items-center gap-4">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {imagePreview && !imageError ? (
                <Image
                  src={imagePreview}
                  alt="Group Logo"
                  fill
                  className="object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full text-gray-400">
                  <AqUploadCloud01 size={24} />
                </div>
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
                id="group-image-upload"
              />
              <label
                htmlFor="group-image-upload"
                className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Change Logo
              </label>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                JPG, PNG or GIF. Max 5MB.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Title */}
          <Input
            label="Group Title"
            id="grp_title"
            name="grp_title"
            value={formData.grp_title || ''}
            onChange={handleInputChange}
            required
          />

          {/* Status */}
          <SelectField
            label="Status"
            id="grp_status"
            name="grp_status"
            value={formData.grp_status || 'ACTIVE'}
            onChange={handleInputChange}
          >
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </SelectField>

          {/* Industry */}
          <Input
            label="Industry"
            id="grp_industry"
            name="grp_industry"
            value={formData.grp_industry || ''}
            onChange={handleInputChange}
          />

          {/* Country */}
          <SelectField
            label="Country"
            id="grp_country"
            name="grp_country"
            value={formData.grp_country || ''}
            onChange={handleInputChange}
          >
            <option value="">Select Country</option>
            {countryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectField>

          {/* Timezone */}
          <Input
            label="Timezone"
            id="grp_timezone"
            name="grp_timezone"
            value={formData.grp_timezone || ''}
            onChange={handleInputChange}
          />

          {/* Website */}
          <Input
            label="Website"
            type="url"
            id="grp_website"
            name="grp_website"
            value={formData.grp_website || ''}
            onChange={handleInputChange}
          />

          {/* Manager */}
          <SelectField
            label="Group Manager"
            id="grp_manager"
            name="grp_manager"
            value={formData.grp_manager || ''}
            onChange={handleInputChange}
          >
            <option value="">Select Manager</option>
            {groupDetails?.grp_users?.map(user => (
              <option key={user._id} value={user._id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </SelectField>
        </div>

        {/* Description */}
        <TextInput
          label="Description"
          id="grp_description"
          name="grp_description"
          rows={4}
          value={formData.grp_description || ''}
          onChange={handleInputChange}
        />

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            disabled={isSaving}
            loading={isSaving}
            Icon={AqCheck}
            className="bg-primary text-white border-primary hover:bg-primary/90"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </SettingsLayout>
  );
};

export default GroupDetailsSettings;
