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

    // Only allow known/whitelisted hostnames. Do not fallback to checking
    // pathnames or extensions for unknown hosts to avoid Next.js <Image>
    // runtime errors for unconfigured remote hosts.
    if (KNOWN_RENDERABLE_HOSTNAMES.has(url.hostname)) {
      return trimmedSrc;
    }

    return null;
  } catch {
    // Strip any fragment/hash before testing extension (e.g., "pic.jpg#foo").
    const withoutFragment = trimmedSrc.split('#')[0];
    return IMAGE_EXTENSION_PATTERN.test(withoutFragment) ? trimmedSrc : null;
  }
};
