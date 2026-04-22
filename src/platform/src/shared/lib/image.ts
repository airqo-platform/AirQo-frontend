const CLOUDINARY_ASSET_HOSTNAME = 'asset.cloudinary.com';
const KNOWN_RENDERABLE_HOSTNAMES = new Set([
  'res.cloudinary.com',
  'firebasestorage.googleapis.com',
  'flagcdn.com',
]);
const IMAGE_EXTENSION_PATTERN =
  /\.(avif|bmp|gif|ico|jpe?g|png|svg|webp)(?:$|\?)/i;

export const getRenderableImageSrc = (src?: string | null): string | null => {
  const trimmedSrc = src?.trim();

  if (!trimmedSrc) {
    return null;
  }

  if (
    trimmedSrc.startsWith('/') ||
    trimmedSrc.startsWith('data:image/') ||
    trimmedSrc.startsWith('blob:')
  ) {
    return trimmedSrc;
  }

  try {
    const url = new URL(trimmedSrc);

    if (url.hostname === CLOUDINARY_ASSET_HOSTNAME) {
      return null;
    }

    if (KNOWN_RENDERABLE_HOSTNAMES.has(url.hostname)) {
      return trimmedSrc;
    }

    return url.pathname.includes('/image/') ||
      IMAGE_EXTENSION_PATTERN.test(url.pathname)
      ? trimmedSrc
      : null;
  } catch {
    return IMAGE_EXTENSION_PATTERN.test(trimmedSrc) ? trimmedSrc : null;
  }
};
