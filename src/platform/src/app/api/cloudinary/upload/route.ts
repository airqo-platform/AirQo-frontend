import { NextRequest, NextResponse } from 'next/server';

const CLOUDINARY_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;

export async function POST(request: NextRequest) {
  try {
    if (!CLOUDINARY_NAME) {
      return NextResponse.json(
        { error: 'Cloudinary configuration is missing' },
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
      const preset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET;
      if (!preset) {
        console.error('NEXT_PUBLIC_CLOUDINARY_PRESET is not defined');
        return NextResponse.json(
          { error: 'Server configuration error: Missing upload preset' },
          { status: 500 }
        );
      }
      formData.append('upload_preset', preset);
    }

    console.log('Uploading to Cloudinary:', CLOUDINARY_URL);

    // Upload to Cloudinary
    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    let result;
    try {
      const text = await response.text();
      try {
        result = JSON.parse(text);
      } catch {
        console.error('Cloudinary returned non-JSON response:', text);
        return NextResponse.json(
          {
            error: 'Invalid response from Cloudinary',
            details: text.substring(0, 200),
          },
          { status: 502 }
        );
      }
    } catch (e) {
      console.error('Failed to read Cloudinary response:', e);
      return NextResponse.json(
        { error: 'Failed to read response from Cloudinary' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      console.error('Cloudinary upload failed:', result);
      return NextResponse.json(
        { error: result.error?.message || 'Upload failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
