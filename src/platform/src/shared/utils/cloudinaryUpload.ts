/**
 * Cloudinary Upload Utility
 *
 * Simplified utility for uploading images to Cloudinary via Next.js API proxy.
 * Handles file validation, folder organization, and error handling.
 */

// Types
export interface CloudinaryUploadOptions {
  folder?: string;
  publicId?: string;
  tags?: string[];
  onProgress?: (progress: number) => void;
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
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

/**
 * Validates file before upload
 */
function validateFile(file: File): void {
  if (!ALLOWED_FORMATS.includes(file.type)) {
    throw new Error(
      `Invalid format. Allowed: ${ALLOWED_FORMATS.map(f => f.split('/')[1]).join(', ')}`
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File too large (max 5MB)');
  }

  if (file.size === 0) {
    throw new Error('File is empty');
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
  validateFile(file);

  const formData = new FormData();
  formData.append('file', file);

  // Add folder structure (using 'folder' parameter instead of 'public_id' for unsigned uploads)
  if (options.folder) {
    const sanitizedFolder = sanitizeFolder(options.folder);
    formData.append('folder', sanitizedFolder);
  }

  // Add tags
  if (options.tags?.length) {
    formData.append('tags', options.tags.join(','));
  }

  try {
    const response = await fetch('/api/cloudinary/upload', {
      method: 'POST',
      body: formData,
    });

    let result;
    const text = await response.text();
    try {
      result = JSON.parse(text);
    } catch {
      // If response is not JSON (e.g. 500 HTML), throw the text
      throw new Error(`Upload failed: ${text.substring(0, 100)}...`);
    }

    if (!response.ok) {
      throw new Error(result.error || 'Upload failed');
    }

    return result;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Upload failed');
  }
}

/**
 * Convenience function for profile image uploads
 */
export async function uploadProfileImage(
  file: File,
  userName: string,
  options: Omit<CloudinaryUploadOptions, 'folder'> = {}
): Promise<CloudinaryUploadResult> {
  const sanitizedUserName = sanitizeFolder(userName);

  return uploadToCloudinary(file, {
    ...options,
    folder: `profiles/${sanitizedUserName}`,
    tags: ['profile', 'user-avatar', ...(options.tags || [])],
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
