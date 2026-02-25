/**
 * Cloudinary Upload Utility
 *
 * Simplified utility for uploading images directly to Cloudinary.
 * Handles file validation, folder organization, and error handling.
 */

// Types
export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  onProgress?: (progress: number) => void;
  maxFileSizeBytes?: number;
  allowedMimeTypes?: string[];
}

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  version: number;
  width: number;
  height: number;
  format: string;
  bytes: number;
  etag: string;
  created_at: string;
  folder?: string;
}

// Constants
const DEFAULT_MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const DEFAULT_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
  'image/gif',
  'image/svg+xml',
];

export const MAX_IMAGE_FILE_SIZE_BYTES = DEFAULT_MAX_FILE_SIZE_BYTES;
export const PROFILE_IMAGE_ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/avif',
] as const;

const ALLOWED_PROFILE_IMAGE_TYPES_LABEL = 'PNG, JPG, WebP, AVIF';

interface ImageValidationOptions {
  allowedMimeTypes?: string[];
  maxFileSizeBytes?: number;
}

const bytesToMb = (bytes: number): string =>
  `${(bytes / 1024 / 1024).toFixed(0)}MB`;

/**
 * Validates file before upload
 */
export function validateImageFile(
  file: File,
  options: ImageValidationOptions = {}
): void {
  const allowedMimeTypes =
    options.allowedMimeTypes ?? DEFAULT_ALLOWED_MIME_TYPES;
  const maxFileSizeBytes =
    options.maxFileSizeBytes ?? DEFAULT_MAX_FILE_SIZE_BYTES;

  if (!allowedMimeTypes.includes(file.type)) {
    const allowedTypesLabel =
      allowedMimeTypes.length === PROFILE_IMAGE_ALLOWED_MIME_TYPES.length &&
      allowedMimeTypes.every(
        (type, index) => type === PROFILE_IMAGE_ALLOWED_MIME_TYPES[index]
      )
        ? ALLOWED_PROFILE_IMAGE_TYPES_LABEL
        : allowedMimeTypes
            .map(type => type.split('/')[1]?.toUpperCase() || type)
            .join(', ');
    throw new Error(
      `Unsupported file format. Allowed formats: ${allowedTypesLabel}.`
    );
  }

  if (file.size > maxFileSizeBytes) {
    throw new Error(
      `File is too large. Maximum allowed size is ${bytesToMb(maxFileSizeBytes)}.`
    );
  }

  if (file.size === 0) {
    throw new Error('The selected file is empty.');
  }
}

/**
 * Sanitizes folder path
 */
function sanitizeFolder(folder: string): string {
  return folder.replace(/[^a-zA-Z0-9_\-\/]/g, '_');
}

/**
 * Main upload function
 */
export async function uploadToCloudinary(
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> {
  validateImageFile(file, {
    maxFileSizeBytes: options.maxFileSizeBytes,
    allowedMimeTypes: options.allowedMimeTypes,
  });

  const formData = new FormData();
  formData.append('file', file);
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error(
      'Image upload is not configured correctly. Please contact support.'
    );
  }

  // Add folder structure (using 'folder' parameter instead of 'public_id' for unsigned uploads)
  if (options.folder) {
    const sanitizedFolder = sanitizeFolder(options.folder);
    formData.append('folder', sanitizedFolder);
  }

  // Add tags
  if (options.tags?.length) {
    formData.append('tags', options.tags.join(','));
  }

  // Required for unsigned browser uploads
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      const cloudinaryMessage =
        (result as { error?: { message?: string } })?.error?.message ||
        (result as { error?: string })?.error;

      throw new Error(cloudinaryMessage || 'Image upload failed.');
    }

    return result as CloudinaryUploadResult;
  } catch (error) {
    if (error instanceof Error) {
      const lowerMessage = error.message.toLowerCase();
      if (
        lowerMessage.includes('payload too large') ||
        lowerMessage.includes('request entity too large')
      ) {
        throw new Error(
          'File is too large for upload processing. Please choose a smaller image (max 5MB).'
        );
      }

      throw error;
    }
    throw new Error('Image upload failed.');
  }
}

/**
 * Uploads profile image using strict profile format constraints
 */
export async function uploadProfileImage(
  file: File,
  options: Omit<CloudinaryUploadOptions, 'folder' | 'allowedMimeTypes'> = {}
): Promise<CloudinaryUploadResult> {
  return uploadToCloudinary(file, {
    ...options,
    folder: 'profiles',
    tags: ['profile', 'user-avatar', ...(options.tags || [])],
    allowedMimeTypes: [...PROFILE_IMAGE_ALLOWED_MIME_TYPES],
    maxFileSizeBytes: MAX_IMAGE_FILE_SIZE_BYTES,
  });
}

/**
 * Get optimized image URL
 */
export function getOptimizedImageUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    quality?: 'auto' | number;
    format?: 'auto' | 'jpg' | 'png' | 'webp';
    crop?: 'fill' | 'fit' | 'scale' | 'crop';
  } = {}
): string {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;
  if (!cloudName) {
    throw new Error('Cloudinary cloud name not configured');
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fill',
  } = options;

  let transformation = '';

  if (width || height) {
    transformation += `c_${crop}`;
    if (width) transformation += `,w_${width}`;
    if (height) transformation += `,h_${height}`;
  }

  if (quality !== 'auto') {
    transformation += `,q_${quality}`;
  }

  if (format !== 'auto') {
    transformation += `,f_${format}`;
  }

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;

  if (transformation) {
    return `${baseUrl}/${transformation}/${publicId}`;
  }

  return `${baseUrl}/${publicId}`;
}

/**
 * Delete image from Cloudinary
 */
export async function deleteFromCloudinary(
  publicId: string
): Promise<{ result: string }> {
  try {
    const response = await fetch('/api/cloudinary/delete', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ publicId }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Delete failed');
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Delete failed');
  }
}

/**
 * Extract public ID from Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url) return null;

  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').map(decodeURIComponent);
    // Path structure: /cloud_name/image/upload/transformations/version/public_id.ext

    const uploadIndex = pathParts.indexOf('upload');
    if (uploadIndex === -1) return null;

    // Get parts after 'upload'
    const parts = pathParts.slice(uploadIndex + 1);

    // Helper to identify transformations and versions
    const isTransformation = (part: string) =>
      /^(c_|w_|h_|q_|f_|e_|l_|u_|d_|a_|g_|b_|co_|so_|y_|x_|z_|r_|p_|dn_|fl_|if_|bo_)/.test(
        part
      ) || part.includes(',');
    const isVersion = (part: string) => /^v\d+$/.test(part);

    // Skip leading transformations and version
    let startIndex = 0;
    while (
      startIndex < parts.length &&
      (isTransformation(parts[startIndex]) || isVersion(parts[startIndex]))
    ) {
      startIndex++;
    }

    const publicIdParts = parts.slice(startIndex);
    if (publicIdParts.length === 0) return null;

    return publicIdParts.join('/').replace(/\.[^/.]+$/, ''); // Remove extension
  } catch {
    return null;
  }
}
