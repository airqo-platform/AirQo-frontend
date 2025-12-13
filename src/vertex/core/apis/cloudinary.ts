export interface CloudinaryUploadOptions {
  folder?: string;
  tags?: string[];
}

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

const VALID_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/svg+xml', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const validateFile = (file: File) => {
  if (!file) throw new Error('No file provided');
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Please upload an image (JPEG, PNG, GIF, SVG, WEBP).');
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File size too large. Maximum size is 10MB.');
  }
};

const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_NAME}`;

export const uploadToCloudinary = async (
  file: File,
  options: CloudinaryUploadOptions = {}
): Promise<CloudinaryUploadResult> => {
  validateFile(file);

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_PRESET || 'airqo_vertex');

  if (options.folder) {
    formData.append('folder', options.folder);
  }

  if (options.tags?.length) {
    options.tags.forEach((tag) => formData.append('tags', tag));
  }

  try {
    const response = await fetch(`${cloudinaryUrl}/image/upload`, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
        throw new Error(result.error?.message || 'Upload failed');
    }

    return result as CloudinaryUploadResult;
  } catch (error: any) {
    throw new Error(error.message || 'Upload failed');
  }
};

// Maintain backward compatibility if needed, or deprecate
export const cloudinaryImageUpload = async (formData: any) => {
  return await fetch(`${cloudinaryUrl}/image/upload`, {
    method: 'POST',
    body: formData,
  }).then((response) => response.json());
};
