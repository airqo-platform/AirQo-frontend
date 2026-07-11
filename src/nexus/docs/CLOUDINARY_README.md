# Cloudinary Upload Utility

A comprehensive, reusable utility for uploading images to Cloudinary with proper error handling, type safety, and folder organization.

## Features

- ✅ **TypeScript Support**: Full type safety with detailed interfaces
- ✅ **File Validation**: Automatic validation of file types and sizes
- ✅ **Folder Organization**: Automatic folder structure creation
- ✅ **Progress Tracking**: Upload progress callbacks
- ✅ **Retry Mechanism**: Automatic retry on failed uploads
- ✅ **Error Handling**: Comprehensive error handling with descriptive messages
- ✅ **Best Practices**: Follows Cloudinary and React best practices

## Environment Setup

Add the following environment variables to your `.env.local` file:

```env
NEXT_PUBLIC_CLOUDINARY_NAME=your-cloudinary-cloud-name
NEXT_PUBLIC_CLOUDINARY_PRESET=your-unsigned-upload-preset
```

### Cloudinary Configuration

1. **Create an unsigned upload preset** in your Cloudinary dashboard:
   - Go to Settings > Upload
   - Create a new upload preset
   - Set it as "Unsigned"
   - Configure the following settings:
     - **Use filename or externally defined Public ID**: On
     - **Unique filename**: Off
     - **Disallow Public ID**: Off

## Usage Examples

### Basic Image Upload

```typescript
import { uploadToCloudinary } from '@/shared/utils/cloudinaryUpload';

const handleFileUpload = async (file: File) => {
  try {
    const result = await uploadToCloudinary(file, {
      folder: 'my-app/images',
      tags: ['user-upload'],
      quality: 'auto',
      format: 'auto',
    });

    console.log('Upload successful:', result.secure_url);
  } catch (error) {
    console.error('Upload failed:', error.message);
  }
};
```

### Profile Image Upload

```typescript
import { uploadProfileImage } from '@/shared/utils/cloudinaryUpload';

const ProfileImageUpload = () => {
  const handleProfileUpload = async (file: File) => {
    try {
      const result = await uploadProfileImage(file, {
        onProgress: progress => {
          console.log(`Upload progress: ${progress}%`);
        },
      });

      // result.secure_url contains the uploaded image URL
      // All profile images are stored in the 'profiles' folder
    } catch (error) {
      console.error('Profile upload failed:', error.message);
    }
  };
};
```

### Upload with Progress Tracking

```typescript
import { uploadToCloudinary } from '@/shared/utils/cloudinaryUpload';

const UploadWithProgress = () => {
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setProgress(0);

    try {
      await uploadToCloudinary(file, {
        folder: 'documents',
        onProgress: (progress) => {
          setProgress(progress);
        }
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      {uploading && <div>Upload progress: {progress}%</div>}
    </div>
  );
};
```

### Get Optimized Image URL

```typescript
import { getOptimizedImageUrl } from '@/shared/utils/cloudinaryUpload';

// Get a responsive image URL
const optimizedUrl = getOptimizedImageUrl('profiles/john_doe/avatar.jpg', {
  width: 300,
  height: 300,
  quality: 'auto',
  format: 'auto',
  crop: 'fill',
});
```

## API Reference

### `uploadToCloudinary(file, options)`

Main upload function with full customization options.

**Parameters:**

- `file: File` - The file to upload
- `options: CloudinaryUploadOptions` - Upload configuration

**Options:**

```typescript
interface CloudinaryUploadOptions {
  folder?: string; // Folder path in Cloudinary
  publicId?: string; // Custom public ID
  tags?: string[]; // Tags for the uploaded file
  onProgress?: (progress: number) => void; // Progress callback
}
```

### `uploadProfileImage(file, options)`

Convenience function for profile image uploads.

**Parameters:**

- `file: File` - The image file to upload
- `options: Omit<CloudinaryUploadOptions, 'folder'>` - Upload options (folder is auto-set to 'profiles')

**Folder Structure:**

- All profile images are stored in: `profiles/[filename]`
- Automatically adds profile-related tags
- Optimized for profile images

### `getOptimizedImageUrl(publicId, options)`

Generate optimized Cloudinary URLs for existing images.

## File Validation

The utility automatically validates:

- **File Type**: Only allows image formats (JPEG, PNG, WebP, GIF)
- **File Type**: Only allows image formats (JPEG, PNG, WebP, GIF)
- **File Size**: Maximum 5MB (configurable)
- **File Content**: Ensures file is not empty

## Error Handling

The utility provides descriptive error messages for:

- Invalid file formats
- File size exceeded
- Network errors
- Cloudinary API errors
- Configuration errors (missing env variables)

## Retry Mechanism

- There is currently no automatic retry mechanism implemented in the utility.

If you need retries, implement them in your caller or add retry logic to
`uploadToCloudinary` (for example: exponential backoff with a limited
number of attempts).

## Folder Structure Examples

```
# Profile images
profiles/
  john_doe/
    1640995200000_abc123.jpg
    1640995300000_def456.png

# General uploads with custom folder
my-app/
  documents/
    report_2024.pdf
  images/
    banner.jpg
```

## Constants

```typescript
// The library does not export a single `CLOUDINARY_CONSTANTS` object.
// The following are the implementation values used by
// `src/shared/utils/cloudinaryUpload.ts` and are shown here for
// documentation purposes.

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5242880 (5MB)
const ALLOWED_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
];

console.log(MAX_FILE_SIZE); // 5242880 (5MB)
console.log(ALLOWED_FORMATS);

// NOTE: There is no `MAX_RETRIES` constant in the current implementation.
```

## Best Practices

1. **Always handle errors**: Wrap upload calls in try-catch blocks
2. **Show progress**: Use the `onProgress` callback for better UX
3. **Validate on frontend**: Pre-validate files before uploading
4. **Use meaningful folder structures**: Organize uploads logically
5. **Optimize images**: Use appropriate quality and format settings
6. **Set appropriate tags**: Tag uploads for better organization

## Troubleshooting

### Common Issues

1. **"Cloudinary cloud name not configured"**
   - Check your `.env.local` file has `NEXT_PUBLIC_CLOUDINARY_NAME`

2. **"Upload preset not configured"**
   - Check your `.env.local` file has `NEXT_PUBLIC_CLOUDINARY_PRESET`
   - Ensure the preset exists in your Cloudinary dashboard

3. **"Invalid file format"**
   - Only image files are supported (JPEG, PNG, WebP, GIF)

4. **"File size too large"**
   - Maximum file size is 10MB
   - Consider resizing images before upload

5. **Upload fails with network error**
   - Check your internet connection
   - Verify Cloudinary service status
   - The utility will automatically retry 3 times
