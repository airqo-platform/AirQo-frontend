export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email address';
  return null;
};

export const validateSlug = (slug: string): string | null => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  if (!slug) return 'Slug is required';
  if (slug.length < 3) return 'Slug must be at least 3 characters';
  if (!slugRegex.test(slug)) return 'Slug must contain only lowercase letters, numbers, and hyphens';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  // Basic phone validation - can be enhanced with libphonenumber-js if needed
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phone) return 'Phone number is required';
  if (!phoneRegex.test(phone.replace(/[\s()-]/g, ''))) return 'Invalid phone number format';
  return null;
};

export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};
