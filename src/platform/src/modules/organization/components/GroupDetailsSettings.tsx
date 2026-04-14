import React, { useState, useEffect, useMemo, useRef } from 'react';
import Image from 'next/image';
import { countries } from 'countries-list';
import { useSWRConfig } from 'swr';
import { useDispatch } from 'react-redux';
import { useUser } from '@/shared/hooks/useUser';
import { userService } from '@/shared/services/userService';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
  extractPublicIdFromUrl,
  validateImageFile,
  PROFILE_IMAGE_ALLOWED_MIME_TYPES,
  MAX_IMAGE_FILE_SIZE_BYTES,
} from '@/shared/utils/cloudinaryUpload';
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
  const [isSavingTitle, setIsSavingTitle] = useState(false);
  const [isSavingManager, setIsSavingManager] = useState(false);
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [formData, setFormData] = useState<UpdateGroupDetailsRequest>({});
  const [groupTitle, setGroupTitle] = useState('');
  const [selectedManager, setSelectedManager] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  const countryOptions = useMemo(() => {
    return Object.values(countries)
      .map(c => ({ value: c.name, label: c.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  // Cleanup object URL to avoid memory leaks on unmount
  const imagePreviewRef = useRef(imagePreview);
  imagePreviewRef.current = imagePreview;

  useEffect(() => {
    return () => {
      if (
        imagePreviewRef.current &&
        imagePreviewRef.current.startsWith('blob:')
      ) {
        URL.revokeObjectURL(imagePreviewRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const fetchGroupDetails = async () => {
      if (!activeGroup?.id) return;

      setIsLoading(true);
      try {
        const response = await userService.getGroupDetails(activeGroup.id);
        if (response.success) {
          setGroupDetails(response.group);
          setGroupTitle(response.group.grp_title);
          setSelectedManager(response.group.grp_manager?._id || '');
          setFormData({
            grp_status: response.group.grp_status,
            grp_description: response.group.grp_description,
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

      try {
        validateImageFile(file, {
          allowedMimeTypes: [...PROFILE_IMAGE_ALLOWED_MIME_TYPES],
          maxFileSizeBytes: MAX_IMAGE_FILE_SIZE_BYTES,
        });
      } catch (error) {
        setSelectedImage(null);
        e.target.value = '';
        const errorMessage = getUserFriendlyErrorMessage(error);
        toast.error('Invalid image', errorMessage);
        return;
      }

      // Revoke previous blob URL if it exists to prevent memory leaks
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
      setImageError(false);
    }
  };

  const refreshGroupDetails = async () => {
    if (!activeGroup?.id) return;

    try {
      const response = await userService.getGroupDetails(activeGroup.id);
      if (response.success) {
        setGroupDetails(response.group);
        setImagePreview(response.group.grp_image);
        setImageError(false);

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
        // This ensures the header and sidebar get the updated info
        if (user?.id) {
          mutate(`user/details/${user.id}`, undefined, { revalidate: true });
        }
      }
    } catch (error) {
      console.error('Failed to refresh group details:', error);
    }
  };

  const handleSaveTitle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup?.id || !groupTitle.trim()) return;

    setIsSavingTitle(true);
    try {
      await userService.updateGroupTitle(activeGroup.id, {
        grp_title: groupTitle.trim(),
      });
      toast.success('Group title updated successfully');
      await refreshGroupDetails();
      // Reload to ensure UI (header/sidebar) reflects the updated title immediately
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.reload();
      }, 500);
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error('Failed to update group title', errorMessage);
      console.error('Failed to update group title:', error);
    } finally {
      setIsSavingTitle(false);
    }
  };

  const handleSaveManager = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup?.id || !selectedManager) return;

    setIsSavingManager(true);
    try {
      await userService.setGroupManager(activeGroup.id, selectedManager);
      toast.success('Group manager updated successfully');
      await refreshGroupDetails();
      // Reload so manager changes are reflected across the app
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.reload();
      }, 500);
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      toast.error('Failed to update group manager', errorMessage);
      console.error('Failed to update group manager:', error);
    } finally {
      setIsSavingManager(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup?.id) return;

    setIsSaving(true);
    try {
      let imageUrl = formData.grp_image;

      // Handle group logo changes - delete old image when uploading a new one
      const oldImageUrl = groupDetails?.grp_image;

      if (selectedImage) {
        validateImageFile(selectedImage, {
          allowedMimeTypes: [...PROFILE_IMAGE_ALLOWED_MIME_TYPES],
          maxFileSizeBytes: MAX_IMAGE_FILE_SIZE_BYTES,
        });

        // Delete old logo from Cloudinary if it exists
        if (oldImageUrl) {
          const oldPublicId = extractPublicIdFromUrl(oldImageUrl);
          if (oldPublicId) {
            try {
              await deleteFromCloudinary(oldPublicId);
              console.log('Successfully deleted old group logo:', oldPublicId);
            } catch (deleteError) {
              // Log but don't block - orphaned images are better than blocked uploads
              console.warn(
                'Failed to delete old group logo from Cloudinary (non-critical):',
                deleteError instanceof Error ? deleteError.message : deleteError
              );
              // Continue with upload regardless of deletion result
            }
          }
        }

        const uploadResult = await uploadToCloudinary(selectedImage, {
          folder: 'organization_profiles',
          tags: ['group-logo', activeGroup.id],
          allowedMimeTypes: [...PROFILE_IMAGE_ALLOWED_MIME_TYPES],
          maxFileSizeBytes: MAX_IMAGE_FILE_SIZE_BYTES,
        });
        imageUrl = uploadResult.secure_url;
      }

      const updateData: UpdateGroupDetailsRequest = {
        ...formData,
        grp_image: imageUrl,
        grp_profile_picture: imageUrl, // Ensure profile picture is also updated
      };

      await userService.updateGroupDetails(activeGroup.id, updateData);
      toast.success('Group details updated successfully');
      setSelectedImage(null); // Reset selected image state

      await refreshGroupDetails();
      // Reload to ensure all UI (header, sidebar, profile) shows updated group info
      setTimeout(() => {
        if (typeof window !== 'undefined') window.location.reload();
      }, 500);
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
      <div className="space-y-8">
        {/* Group Title Section */}
        <form onSubmit={handleSaveTitle} className="space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Group Title
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Update your organization&apos;s name.
            </p>
          </div>
          <Input
            label="Group Title"
            id="grp_title"
            name="grp_title"
            value={groupTitle}
            onChange={e => setGroupTitle(e.target.value)}
            required
          />
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSavingTitle || !groupTitle.trim()}
              loading={isSavingTitle}
              Icon={AqCheck}
              className="bg-primary text-white border-primary hover:bg-primary/90"
            >
              {isSavingTitle ? 'Saving...' : 'Save Title'}
            </Button>
          </div>
        </form>

        {/* Group Manager Section */}
        <form onSubmit={handleSaveManager} className="space-y-4">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Group Manager
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Select a manager from your group members.
            </p>
          </div>
          <SelectField
            label="Group Manager"
            id="grp_manager_select"
            name="grp_manager_select"
            value={selectedManager}
            onChange={e => setSelectedManager(e.target.value as string)}
          >
            <option value="">Select Manager</option>
            {groupDetails?.grp_users?.map(user => (
              <option key={user._id} value={user._id}>
                {user.firstName} {user.lastName} ({user.email})
              </option>
            ))}
          </SelectField>
          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSavingManager || !selectedManager}
              loading={isSavingManager}
              Icon={AqCheck}
              className="bg-primary text-white border-primary hover:bg-primary/90"
            >
              {isSavingManager ? 'Saving...' : 'Save Manager'}
            </Button>
          </div>
        </form>

        {/* Other Group Details Section */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Group Information
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Manage your organization&apos;s profile and settings.
            </p>
          </div>

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
                  accept="image/png,image/jpeg,image/jpg,image/webp,image/avif"
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
                  PNG, JPG, WebP, or AVIF. Max 5MB.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>
    </SettingsLayout>
  );
};

export default GroupDetailsSettings;
