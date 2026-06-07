/*
 * CLOUDINARY CONFIGURATION REQUIREMENTS
 *
 * This module requires the following environment variables:
 * - NEXT_PUBLIC_CLOUDINARY_NAME: Your Cloudinary cloud name
 * - NEXT_PUBLIC_CLOUDINARY_PRESET: An "Unsigned" upload preset
 *
 * PRESET SECURITY SETTINGS:
 * The 'NEXT_PUBLIC_CLOUDINARY_PRESET' must be configured in the Cloudinary Dashboard as "Unsigned".
 * For security, strictly enforce the following in the preset settings:
 * 1. Allowed Formats: Restrict to ['jpg', 'png', 'gif', 'webp']
 * 2. Incoming Transformation: Resize/limit dimensions if necessary
 * 3. Media Analysis & moderations: Enable if needed
 * 4. Folder: Restrict to specific folders if possible
 * 5. Tags: Limit auto-tagging if not needed
 *
 * DO NOT use a signed preset here as we are uploading directly from the client.
 */

import { getCloudinaryName, getCloudinaryPreset } from '@/lib/envConstants';

export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const validateFile = (file: File) => {
  if (!file) throw new Error('No file provided');
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, WEBP).');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size too large. Maximum size is 2MB.');
  }
};

const getCloudinaryConfig = () => {
  const cloudName = getCloudinaryName();
  const uploadPreset = getCloudinaryPreset();

  return {
    cloudinaryUrl: `https://api.cloudinary.com/v1_1/${cloudName}`,
    uploadPreset,
  };
};

export const uploadToCloudinary = async (
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  validateFile(file);

  const formData = new FormData();
  formData.append('file', file);

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.tags?.length) {
    formData.append('tags', options.tags.join(','));
  }

  try {
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }

    return result as CloudinaryUploadResult;
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Upload failed';
    throw new Error(errMsg);
  }
};

// Maintain backward compatibility if needed, or deprecate
export const cloudinaryImageUpload = async (formData: FormData) => {
  const { cloudinaryUrl } = getCloudinaryConfig();
  return await fetch(`${cloudinaryUrl}/image/upload`, {
    method: 'POST',
    body: formData,
  }).then((response) => response.json());
};
