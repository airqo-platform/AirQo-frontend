import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/lib/auth';
import type { Session } from 'next-auth';

const CLOUDINARY_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_NAME;

if (!CLOUDINARY_NAME) {
  throw new Error(
    'NEXT_PUBLIC_CLOUDINARY_NAME environment variable is not set'
  );
}

const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_NAME}/image/destroy`;

// Validate publicId format
// Cloudinary Public IDs can include any character except: ? & # \ % < >
// We also allow + as it is common in URLs (spaces)
const isValidPublicId = (publicId: string): boolean => {
  const publicIdRegex = /^[^?&#\\%<>]+$/;
  return (
    publicIdRegex.test(publicId) &&
    publicId.length > 0 &&
    publicId.length <= 255
  );
};

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const session = (await getServerSession(authOptions)) as Session | null;
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate JSON
    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const { publicId } = body;

    console.log('Attempting to delete publicId:', publicId);

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json(
        { error: 'No publicId provided or invalid type' },
        { status: 400 }
      );
    }

    // Validate publicId format
    if (!isValidPublicId(publicId)) {
      console.error('Invalid publicId format:', publicId);
      return NextResponse.json(
        { error: 'Invalid publicId format' },
        { status: 400 }
      );
    }

    // TODO: Add ownership/permission check for the publicId
    // This should verify that the authenticated user owns or has permission to delete this image
    // For now, allowing authenticated users to delete any image

    const timestamp = Math.floor(Date.now() / 1000);
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const apiKey = process.env.CLOUDINARY_API_KEY;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary API credentials not configured' },
        { status: 500 }
      );
    }

    // Create signature for authentication
    const crypto = await import('crypto');
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    const formData = new FormData();
    formData.append('public_id', publicId);
    formData.append('timestamp', timestamp.toString());
    formData.append('api_key', apiKey);
    formData.append('signature', signature);
    formData.append('invalidate', 'true'); // Invalidate CDN cache

    const response = await fetch(CLOUDINARY_URL, {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: result.error?.message || 'Delete failed' },
        { status: response.status }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
