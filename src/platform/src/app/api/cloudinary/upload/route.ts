import { NextRequest, NextResponse } from 'next/server';
import logger from '@/shared/lib/logger';

const CLOUDINARY_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;
const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

export async function POST(request: NextRequest) {
  try {
    // Enhanced validation with detailed logging for production debugging
    if (!CLOUDINARY_NAME) {
      logger.error(
        'Cloudinary name not configured',
        new Error('Missing CLOUDINARY_NAME')
      );
      return NextResponse.json(
        { error: 'Cloudinary API credentials not configured' },
        { status: 500 }
      );
    }

    if (!CLOUDINARY_PRESET) {
      logger.error(
        'Cloudinary preset not configured',
        new Error('Missing CLOUDINARY_PRESET')
      );
      return NextResponse.json(
        { error: 'Cloudinary API credentials not configured' },
        { status: 500 }
      );
    }

    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;

    const formData = await request.formData();

    // Validate required fields
    const file = formData.get('file') as File;
    if (!file) {
      logger.debug('No file provided in upload request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Log file details at debug level only
    logger.debug('Cloudinary upload request', {
      fileName: file.name,
      fileType: file.type,
      fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      logger.debug('Invalid file type attempted', { fileType: file.type });
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      logger.debug('File size exceeds limit', {
        fileSizeMB: (file.size / 1024 / 1024).toFixed(2),
        maxSizeMB: '5',
      });
      return NextResponse.json(
        {
          error: `File size exceeds 5MB limit. Your file is ${(file.size / 1024 / 1024).toFixed(2)}MB.`,
        },
        { status: 400 }
      );
    }

    // Add upload preset if not provided
    if (!formData.has('upload_preset')) {
      formData.append('upload_preset', CLOUDINARY_PRESET);
    }

    // Upload to Cloudinary with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout

    try {
      const response = await fetch(CLOUDINARY_URL, {
        method: 'POST',
        body: formData,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      let result;
      try {
        const text = await response.text();
        try {
          result = JSON.parse(text);
        } catch {
          const parseError = new Error('Cloudinary returned non-JSON response');
          parseError.name = 'CloudinaryParseError';
          logger.errorWithSlack(
            'Invalid Cloudinary response format',
            parseError,
            {
              status: response.status,
              statusText: response.statusText,
              responsePreview: text.substring(0, 200),
            }
          );
          return NextResponse.json(
            {
              error: 'Invalid response from Cloudinary',
              details: text.substring(0, 200),
            },
            { status: 502 }
          );
        }
      } catch (e) {
        const readError =
          e instanceof Error
            ? e
            : new Error('Failed to read Cloudinary response');
        readError.name = 'CloudinaryReadError';
        logger.errorWithSlack('Failed to read Cloudinary response', readError);
        return NextResponse.json(
          { error: 'Failed to read response from Cloudinary' },
          { status: 502 }
        );
      }

      if (!response.ok) {
        const uploadError = new Error(
          `Cloudinary upload failed: ${result.error?.message || 'Unknown error'}`
        );
        uploadError.name = 'CloudinaryUploadError';
        logger.errorWithSlack('Cloudinary upload request failed', uploadError, {
          status: response.status,
          statusText: response.statusText,
          errorMessage: result.error?.message,
          errorHttp: result.error?.http_code,
          publicId: result.public_id,
          fileName: file.name,
          fileSize: file.size,
        });
        return NextResponse.json(
          { error: result.error?.message || 'Upload failed' },
          { status: response.status }
        );
      }

      logger.debug('Cloudinary upload successful', {
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      });

      return NextResponse.json(result);
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        const timeoutError = new Error(
          'Cloudinary upload timeout after 30 seconds'
        );
        timeoutError.name = 'CloudinaryTimeoutError';
        logger.errorWithSlack('Cloudinary upload timeout', timeoutError, {
          fileName: file.name,
          fileSize: file.size,
        });
        return NextResponse.json(
          { error: 'Upload timeout. Please try again.' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    const uploadError =
      error instanceof Error
        ? error
        : new Error('Unknown error during Cloudinary upload');
    uploadError.name = 'CloudinaryUploadException';

    logger.errorWithSlack('Cloudinary upload operation failed', uploadError, {
      errorMessage: (error as Error)?.message,
      errorStack: (error as Error)?.stack,
    });

    return NextResponse.json(
      { error: 'Internal server error. Please check server logs.' },
      { status: 500 }
    );
  }
}
