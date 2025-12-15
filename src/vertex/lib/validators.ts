export const validateEmail = (email: string): string | null => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email address';
  return null;
};

export const validatePhone = (phone: string): string | null => {
  // Basic phone validation - can be enhanced with libphonenumber-js if needed
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  if (!phone) return 'Phone number is required';
  if (!phoneRegex.test(phone.replace(/[\s()-]/g, ''))) return 'Invalid phone number format';
  return null;
};

