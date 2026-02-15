import { NextRequest, NextResponse } from 'next/server';
import logger from '@/shared/lib/logger';

export async function POST(request: NextRequest) {
  try {
    // Enhanced validation with detailed logging for production debugging
    const CLOUDINARY_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;
    const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

    if (!CLOUDINARY_NAME) {
      logger.error(
        'Cloudinary name not configured',
        new Error('Missing CLOUDINARY_NAME'),
        {
          hasPreset: !!CLOUDINARY_PRESET,
        }
      );
      return NextResponse.json(
        { error: 'Cloudinary service not configured. Please contact support.' },
        { status: 500 }
      );
    }

    if (!CLOUDINARY_PRESET) {
      logger.error(
        'Cloudinary preset not configured',
        new Error('Missing CLOUDINARY_PRESET'),
        {
          hasCloudName: !!CLOUDINARY_NAME,
        }
      );
      return NextResponse.json(
        {
          error:
            'Cloudinary upload preset not configured. Please contact support.',
        },
        { status: 500 }
      );
    }

    const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/upload`;

    const formData = await request.formData();

    // Validate required fields
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    // Add upload preset if not provided
    if (!formData.has('upload_preset')) {
      formData.append('upload_preset', CLOUDINARY_PRESET);
    }

    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      // Get response text first for better error handling
      const responseText = await response.text();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      let result;

      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        logger.error(
          'Failed to parse Cloudinary response',
          parseError instanceof Error ? parseError : new Error('Parse error'),
          {
            responseStatus: response.status,
            responsePreview: responseText.substring(0, 200),
          }
        );
        return NextResponse.json(
          { error: 'Invalid response from upload service' },
          { status: 500 }
        );
      }

      logger.error(
        'Cloudinary upload failed',
        new Error(`Upload failed: ${result.error?.message || 'Unknown error'}`),
        {
          status: response.status,
          cloudinaryError: result.error,
        }
      );
      return NextResponse.json(
        { error: 'Upload failed' },
        { status: response.status }
      );
    }

    const result = await response.json();
    return NextResponse.json(result);
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
