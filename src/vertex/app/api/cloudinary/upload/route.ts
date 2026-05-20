import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getCloudinaryName, getCloudinaryApiKey, getCloudinaryApiSecret } from '@/lib/envConstants';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const requestedFolder = formData.get('folder') as string || 'feedback';
    const tags = formData.get('tags') as string || '';

    const ALLOWED_FOLDERS = new Set(['feedback']);
    const folder = ALLOWED_FOLDERS.has(requestedFolder) ? requestedFolder : 'feedback';

    const VALID_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp']);
    const MAX_BYTES = 2 * 1024 * 1024; // 2MB

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    if (!VALID_TYPES.has(file.type)) {
      return NextResponse.json({ success: false, error: 'Invalid file type' }, { status: 400 });
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json({ success: false, error: 'File too large (max 2MB)' }, { status: 400 });
    }

    let cloudName: string;
    let apiKey: string;
    let apiSecret: string;

    try {
      cloudName = getCloudinaryName();
      apiKey = getCloudinaryApiKey();
      apiSecret = getCloudinaryApiSecret();
    } catch (configError: unknown) {
      const errMsg = configError instanceof Error ? configError.message : 'Cloudinary configuration is incomplete on the server.';
      return NextResponse.json({
        success: false,
        error: errMsg
      }, { status: 500 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000).toString();

    // Prepare parameters to sign (sorted alphabetically)
    const paramsToSign: Record<string, string> = {
      folder,
      timestamp,
    };
    if (tags) {
      paramsToSign.tags = tags;
    }

    const sortedKeys = Object.keys(paramsToSign).sort();
    const paramString = sortedKeys
      .map(key => `${key}=${paramsToSign[key]}`)
      .join('&');

    const stringToSign = paramString + apiSecret;
    const signature = crypto
      .createHash('sha1')
      .update(stringToSign)
      .digest('hex');

    // Build the request body for Cloudinary
    const cloudinaryFormData = new FormData();
    cloudinaryFormData.append('file', file);
    cloudinaryFormData.append('api_key', apiKey);
    cloudinaryFormData.append('timestamp', timestamp);
    cloudinaryFormData.append('signature', signature);
    cloudinaryFormData.append('folder', folder);
    if (tags) {
      cloudinaryFormData.append('tags', tags);
    }

    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
    const response = await fetch(cloudinaryUrl, {
      method: 'POST',
      body: cloudinaryFormData,
    });

    const result = await response.json();

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: result.error?.message || 'Failed to upload to Cloudinary'
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      secure_url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Server error during upload';
    return NextResponse.json({
      success: false,
      error: errMsg
    }, { status: 500 });
  }
}
