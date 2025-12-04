import { NextRequest, NextResponse } from 'next/server';

const CLOUDINARY_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;
const CLOUDINARY_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;

export async function POST(request: NextRequest) {
  try {
    // Enhanced validation with detailed logging for production debugging
    if (!CLOUDINARY_NAME) {
      console.error('❌ NEXT_PUBLIC_CLOUDINARY_NAME is not configured');
      return NextResponse.json(
        { error: 'Cloudinary API credentials not configured' },
        { status: 500 }
      );
    }

    if (!CLOUDINARY_PRESET) {
      console.error('❌ NEXT_PUBLIC_CLOUDINARY_PRESET is not configured');
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
      console.error('❌ No file provided in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Log file details for debugging
    console.log('📤 Upload request:', {
      fileName: file.name,
      fileType: file.type,
      fileSize: `${(file.size / 1024 / 1024).toFixed(2)}MB`,
      maxAllowed: '5MB',
    });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      console.error('❌ Invalid file type:', file.type);
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      console.error('❌ File too large:', {
        size: file.size,
        maxSize,
        sizeInMB: (file.size / 1024 / 1024).toFixed(2),
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

    console.log('📤 Uploading to Cloudinary:', CLOUDINARY_URL);

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
          console.error('❌ Cloudinary returned non-JSON response:', {
            status: response.status,
            statusText: response.statusText,
            preview: text.substring(0, 200),
          });
          return NextResponse.json(
            {
              error: 'Invalid response from Cloudinary',
              details: text.substring(0, 200),
            },
            { status: 502 }
          );
        }
      } catch (e) {
        console.error('❌ Failed to read Cloudinary response:', e);
        return NextResponse.json(
          { error: 'Failed to read response from Cloudinary' },
          { status: 502 }
        );
      }

      if (!response.ok) {
        console.error('❌ Cloudinary upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: result.error,
          result,
        });
        return NextResponse.json(
          { error: result.error?.message || 'Upload failed' },
          { status: response.status }
        );
      }

      console.log('✅ Upload successful:', {
        publicId: result.public_id,
        format: result.format,
        bytes: result.bytes,
      });

      return NextResponse.json(result);
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('❌ Upload timeout after 30 seconds');
        return NextResponse.json(
          { error: 'Upload timeout. Please try again.' },
          { status: 504 }
        );
      }
      throw fetchError;
    }
  } catch (error: unknown) {
    console.error('❌ Cloudinary upload error:', {
      message: (error as Error)?.message,
      stack: (error as Error)?.stack,
      error,
    });
    return NextResponse.json(
      { error: 'Internal server error. Please check server logs.' },
      { status: 500 }
    );
  }
}
