import { z } from 'zod';
import {
  FIRST_NAME_MAX,
  LAST_NAME_MAX,
  EMAIL_MAX,
  PASSWORD_MIN,
  PASSWORD_MAX,
  JOB_TITLE_MAX,
  USER_BIO_MAX,
  PHONE_MAX,
  CITY_MAX,
  PROJECT_NAME_MAX,
  FUNDER_PARTNER_MAX,
  CONTACT_NAME_MAX,
  USE_CASE_MAX,
  COUNTRY_MAX,
  GROUP_TITLE_MAX,
  GROUP_DESCRIPTION_MAX,
  GROUP_INDUSTRY_MAX,
  GROUP_TIMEZONE_MAX,
  GROUP_WEBSITE_MAX,
  ROLE_NAME_MAX,
  ROLE_DESCRIPTION_MAX,
  ROLE_CODE_MAX,
} from './validation-limits';

export const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required').max(PASSWORD_MAX, `Password must be ${PASSWORD_MAX} characters or less`),
});

export const registerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(FIRST_NAME_MAX, `First name must be ${FIRST_NAME_MAX} characters or less`),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(LAST_NAME_MAX, `Last name must be ${LAST_NAME_MAX} characters or less`),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(EMAIL_MAX, `Email must be ${EMAIL_MAX} characters or less`),
  password: z
    .string()
    .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
    .max(PASSWORD_MAX, `Password must be ${PASSWORD_MAX} characters or less`)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must include uppercase, lowercase, number, and special character'
    ),
});

export const forgotPwdSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(EMAIL_MAX, `Email must be ${EMAIL_MAX} characters or less`),
});

export const resetPwdSchema = z
  .object({
    password: z
      .string()
      .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
      .max(PASSWORD_MAX, `Password must be ${PASSWORD_MAX} characters or less`)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must include uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string().max(PASSWORD_MAX, `Password must be ${PASSWORD_MAX} characters or less`),
  })
  .refine(d => d.password === d.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const setPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, 'Password must be at least 6 characters')
      .max(PASSWORD_MAX, `Password must be ${PASSWORD_MAX} characters or less`)
      .regex(
        /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@#?!$%^&*.,]+$/,
        'Password must include at least one letter and one number'
      ),
    confirmPassword: z.string().max(PASSWORD_MAX, `Password must be ${PASSWORD_MAX} characters or less`),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export const profileSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(FIRST_NAME_MAX, `First name must be ${FIRST_NAME_MAX} characters or less`),
  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(LAST_NAME_MAX, `Last name must be ${LAST_NAME_MAX} characters or less`),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email address')
    .max(EMAIL_MAX, `Email must be ${EMAIL_MAX} characters or less`),
  phoneNumber: z.string().max(PHONE_MAX, `Phone number must be ${PHONE_MAX} characters or less`).optional(),
  jobTitle: z.string().max(JOB_TITLE_MAX, `Job title must be ${JOB_TITLE_MAX} characters or less`).optional(),
  country: z.string().min(1, 'Country is required'),
  description: z.string().max(USER_BIO_MAX, `Bio must be ${USER_BIO_MAX} characters or less`).optional(),
  profilePicture: z.string().optional(),
});

export const securitySchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required').max(PASSWORD_MAX, `Password must be ${PASSWORD_MAX} characters or less`),
    newPassword: z
      .string()
      .min(PASSWORD_MIN, `Password must be at least ${PASSWORD_MIN} characters`)
      .max(PASSWORD_MAX, `Password must be ${PASSWORD_MAX} characters or less`)
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        'Password must include uppercase, lowercase, number, and special character'
      ),
    confirmPassword: z.string().max(PASSWORD_MAX, `Password must be ${PASSWORD_MAX} characters or less`),
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
    .max(CITY_MAX, `City must be less than ${CITY_MAX} characters`),

  project_name: z
    .string()
    .min(2, 'Project name must be at least 2 characters')
    .max(PROJECT_NAME_MAX, `Project name must be less than ${PROJECT_NAME_MAX} characters`),

  funder_partner: z
    .string()
    .max(FUNDER_PARTNER_MAX, `Funder/partner must be less than ${FUNDER_PARTNER_MAX} characters`)
    .optional(),

  contact_email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(EMAIL_MAX, 'Email address is too long'),

  contact_name: z
    .string()
    .min(2, 'Contact name must be at least 2 characters')
    .max(CONTACT_NAME_MAX, `Contact name must be less than ${CONTACT_NAME_MAX} characters`),

  use_case: z
    .string()
    .min(10, 'Use case description must be at least 10 characters')
    .max(USE_CASE_MAX, `Use case description must be less than ${USE_CASE_MAX} characters`),

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
    .max(COUNTRY_MAX, `Country name must be less than ${COUNTRY_MAX} characters`),
});

// Role creation validation
export const createRoleSchema = z.object({
  role_name: z
    .string()
    .min(1, 'Role name is required')
    .max(ROLE_NAME_MAX, `Role name must be ${ROLE_NAME_MAX} characters or less`)
    .regex(
      /^[A-Z0-9_]+$/,
      'Role name must contain only uppercase letters, numbers, and underscores'
    ),
  role_code: z
    .string()
    .max(ROLE_CODE_MAX, `Role code must be ${ROLE_CODE_MAX} characters or less`)
    .optional(),
  role_description: z
    .string()
    .max(ROLE_DESCRIPTION_MAX, `Role description must be ${ROLE_DESCRIPTION_MAX} characters or less`)
    .optional(),
});

// Group details validation
export const groupDetailsSchema = z.object({
  grp_title: z
    .string()
    .min(1, 'Group title is required')
    .max(GROUP_TITLE_MAX, `Group title must be ${GROUP_TITLE_MAX} characters or less`),
  grp_description: z
    .string()
    .max(GROUP_DESCRIPTION_MAX, `Description must be ${GROUP_DESCRIPTION_MAX} characters or less`)
    .optional(),
  grp_industry: z
    .string()
    .max(GROUP_INDUSTRY_MAX, `Industry must be ${GROUP_INDUSTRY_MAX} characters or less`)
    .optional(),
  grp_timezone: z
    .string()
    .max(GROUP_TIMEZONE_MAX, `Timezone must be ${GROUP_TIMEZONE_MAX} characters or less`)
    .optional(),
  grp_website: z
    .string()
    .max(GROUP_WEBSITE_MAX, `Website must be ${GROUP_WEBSITE_MAX} characters or less`)
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

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPwdFormData = z.infer<typeof forgotPwdSchema>;
export type ResetPwdFormData = z.infer<typeof resetPwdSchema>;
export type SetPasswordFormData = z.infer<typeof setPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type SecurityFormData = z.infer<typeof securitySchema>;
export type OrganizationRequestFormData = z.infer<
  typeof organizationRequestSchema
>;
export type CreateRoleFormData = z.infer<typeof createRoleSchema>;
export type GroupDetailsFormData = z.infer<typeof groupDetailsSchema>;

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

export const isValidCidrNotation = (cidr: string): boolean => {
  const trimmed = cidr.trim();
  const cidrRegex =
    /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}\/(?:[0-9]|[1-2][0-9]|3[0-2])$/;
  if (!cidrRegex.test(trimmed)) return false;

  const [ipPart, maskPart] = trimmed.split('/');
  if (!ipPart || !maskPart) return false;

  if (!isValidIpAddress(ipPart)) return false;

  const mask = Number(maskPart);
  return Number.isInteger(mask) && mask >= 0 && mask <= 32;
};

export const isValidAsn = (asn: string): boolean => {
  const trimmed = asn.trim().toUpperCase();
  const match = trimmed.match(/^AS(\d{1,10})$/);
  if (!match) return false;

  const value = Number(match[1]);
  return Number.isInteger(value) && value >= 1 && value <= 4294967295;
};

export const isValidOriginUrl = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return false;

  try {
    const parsed = new URL(trimmed);
    return (
      (parsed.protocol === 'http:' || parsed.protocol === 'https:') &&
      parsed.hostname.length > 0 &&
      parsed.username === '' &&
      parsed.password === '' &&
      parsed.pathname === '/' &&
      parsed.search === '' &&
      parsed.hash === ''
    );
  } catch {
    return false;
  }
};
