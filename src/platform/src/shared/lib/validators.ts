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
  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(100, 'City must be less than 100 characters'),

  project_name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(120, 'Project name must be less than 120 characters'),

  funder_partner: z
    .string()
    .max(120, 'Funder/partner must be less than 120 characters')
    .optional(),

  contact_email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(254, 'Email address is too long'),

  contact_name: z
    .string()
    .min(2, 'Contact name must be at least 2 characters')
    .max(100, 'Contact name must be less than 100 characters'),

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
