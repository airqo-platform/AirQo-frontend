import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must include uppercase, lowercase, number, and special character'
    ),
  agreed: z
    .boolean()
    .refine(val => val === true, 'You must agree to the terms'),
});

export const forgotPwdSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
});

export const resetPwdSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must include uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  phoneNumber: z.string().optional(),
  jobTitle: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  description: z.string().optional(),
  profilePicture: z.string().optional(),
});

export const securitySchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must include uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string(),
  })
  .refine(d => d.newPassword === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

// Organization Request validation
export const organizationRequestSchema = z.object({
  organization_name: z
    .string()
    .min(2, 'Organization name must be at least 2 characters')
    .max(100, 'Organization name must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9\s\-&.,()]+$/,
      'Organization name contains invalid characters'
    ),

  organization_slug: z
    .string()
    .min(3, 'Organization slug must be at least 3 characters')
    .max(50, 'Organization slug must be less than 50 characters')
    .regex(
      /^[a-z0-9-]+$/,
      'Slug must contain only lowercase letters, numbers, and hyphens'
    )
    .regex(/^[a-z0-9]/, 'Slug must start with a letter or number')
    .regex(/[a-z0-9]$/, 'Slug must end with a letter or number')
    .refine(
      slug => !slug.includes('--'),
      'Slug cannot contain consecutive hyphens'
    ),

  contact_email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long'),

  contact_name: z
    .string()
    .min(2, 'Contact name must be at least 2 characters')
    .max(100, 'Contact name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-.,']+$/, 'Contact name contains invalid characters'),

  contact_phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(
      /^\+[1-9]\d{1,14}$/,
      'Please enter a valid phone number with country code'
    ),

  use_case: z
    .string()
    .min(10, 'Use case description must be at least 10 characters')
    .max(1000, 'Use case description must be less than 1000 characters'),

  organization_type: z.enum([
    'government',
    'academic',
    'ngo',
    'private',
    'other',
  ]),

  country: z
    .string()
    .min(2, 'Country is required')
    .max(100, 'Country name is too long'),

  branding_settings: z
    .object({
      logo_url: z.string().url().optional().or(z.literal('')),
      primary_color: z
        .string()
        .regex(/^#[0-9A-Fa-f]{6}$/, 'Primary color must be a valid hex color'),
      secondary_color: z
        .string()
        .regex(
          /^#[0-9A-Fa-f]{6}$/,
          'Secondary color must be a valid hex color'
        ),
    })
    .optional(),
});

// Individual field validators for real-time validation
export const validateEmail = (email: string): string | null => {
  try {
    organizationRequestSchema.shape.contact_email.parse(email);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Invalid email';
    }
    return 'Invalid email';
  }
};

export const validateSlug = (slug: string): string | null => {
  try {
    organizationRequestSchema.shape.organization_slug.parse(slug);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Invalid slug format';
    }
    return 'Invalid slug format';
  }
};

export const validatePhone = (phone: string): string | null => {
  try {
    organizationRequestSchema.shape.contact_phone.parse(phone);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      return error.issues[0]?.message || 'Invalid phone number';
    }
    return 'Invalid phone number';
  }
};

// Slug generation utility
export const generateSlug = (name: string): string => {
  return (
    name
      .toLowerCase()
      .trim()
      // Replace spaces and special chars with hyphens
      .replace(/[^a-z0-9\s-]/g, '')
      // Replace spaces with single hyphens
      .replace(/\s+/g, '-')
      // Remove consecutive hyphens
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
  );
};

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPwdFormData = z.infer<typeof forgotPwdSchema>;
export type ResetPwdFormData = z.infer<typeof resetPwdSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type SecurityFormData = z.infer<typeof securitySchema>;
export type OrganizationRequestFormData = z.infer<
  typeof organizationRequestSchema
>;

// IP Address validation
export const isValidIpAddress = (ip: string): boolean => {
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
  if (!ipRegex.test(ip)) return false;
  const parts = ip.split('.');
  return parts.every(part => {
    const num = parseInt(part, 10);
    return num >= 0 && num <= 255;
  });
};
