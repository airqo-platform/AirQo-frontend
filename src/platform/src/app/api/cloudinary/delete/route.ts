import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/shared/lib/auth';
import type { Session } from 'next-auth';
import logger from '@/shared/lib/logger';

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
  let body: { publicId?: string } | undefined;
  let session: Session | null = null;

  try {
    // Check authentication
    session = (await getServerSession(authOptions)) as Session | null;
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate JSON
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }

    const publicId = body?.publicId;

    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json(
        { error: 'No publicId provided or invalid type' },
        { status: 400 }
      );
    }

    // Validate publicId format
    if (!isValidPublicId(publicId)) {
      logger.debug('Invalid publicId format attempted', { publicId });
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
      logger.error(
        'Cloudinary API credentials missing',
        new Error('Missing credentials'),
        {
          hasApiKey: !!apiKey,
          hasApiSecret: !!apiSecret,
        }
      );
      return NextResponse.json(
        { error: 'Cloudinary API credentials not configured' },
        { status: 500 }
      );
    }

    logger.debug('Cloudinary delete request', {
      publicId,
      timestamp,
      userId: session.user._id,
      userName:
        session.user.firstName || session.user.lastName
          ? `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim()
          : undefined,
    });

    // Create signature for authentication
    // IMPORTANT: The signature must include ALL parameters in alphabetical order
    // Reference: https://cloudinary.com/documentation/upload_images#generating_authentication_signatures
    const crypto = await import('crypto');
    const stringToSign = `invalidate=true&public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash('sha1')
      .update(stringToSign)
      .digest('hex');

    logger.debug('Signature generated', {
      publicId,
      timestamp,
      signaturePreview: signature.substring(0, 8) + '...',
    });

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
      // Handle 404 gracefully - resource might not exist (e.g., first-time upload)
      if (response.status === 404 || result.result === 'not found') {
        logger.debug('Cloudinary resource not found for deletion', {
          publicId,
          status: response.status,
        });
        // Return success since the resource doesn't exist anyway
        return NextResponse.json({
          result: 'ok',
          message: 'Resource already deleted or does not exist',
        });
      }

      const cloudinaryError = new Error(
        `Cloudinary delete failed: ${result.error?.message || 'Unknown error'}`
      );
      cloudinaryError.name = 'CloudinaryDeleteError';

      logger.errorWithSlack(
        'Cloudinary delete request failed',
        cloudinaryError,
        {
          publicId,
          status: response.status,
          statusText: response.statusText,
          cloudinaryError: result.error,
          result,
          userId: session.user._id,
          userName:
            session.user.firstName || session.user.lastName
              ? `${session.user.firstName || ''} ${session.user.lastName || ''}`.trim()
              : undefined,
        }
      );

      return NextResponse.json(
        { error: result.error?.message || 'Delete failed' },
        { status: response.status }
      );
    }

    logger.debug('Cloudinary delete successful', {
      publicId,
      result: result.result,
      userId: session.user._id,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    const deleteError =
      error instanceof Error
        ? error
        : new Error('Unknown error during Cloudinary delete');
    deleteError.name = 'CloudinaryDeleteException';

    logger.errorWithSlack('Cloudinary delete operation failed', deleteError, {
      publicId: body?.publicId,
      userId: session?.user?._id,
      errorMessage: (error as Error)?.message,
      errorStack: (error as Error)?.stack,
    });

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
