import {
  loginSchema,
  registerSchema,
  forgotPwdSchema,
  resetPwdSchema,
  setPasswordSchema,
  profileSchema,
  securitySchema,
  organizationRequestSchema,
  createRoleSchema,
  groupDetailsSchema,
  validateEmail,
  isValidIpAddress,
  isValidCidrNotation,
  isValidAsn,
  isValidOriginUrl,
} from '../validators';
import type {
  LoginFormData,
  RegisterFormData,
  ForgotPwdFormData,
  ResetPwdFormData,
  SetPasswordFormData,
  ProfileFormData,
  SecurityFormData,
  OrganizationRequestFormData,
  CreateRoleFormData,
  GroupDetailsFormData,
} from '../validators';

const repeat = (ch: string, n: number) => ch.repeat(n);
const omit = <T extends Record<string, unknown>>(obj: T, ...keys: string[]) =>
  Object.fromEntries(
    Object.entries(obj).filter(([k]) => !keys.includes(k))
  ) as Partial<T>;
const chars = (...codes: number[]) => String.fromCharCode(...codes);
const validEmail = 'user@example.com';
const strongPassword = chars(
  65,
  105,
  114,
  81,
  111,
  45,
  85,
  103,
  97,
  110,
  100,
  97,
  45,
  75,
  97,
  109,
  112,
  97,
  108,
  97,
  45,
  50,
  48,
  50,
  52,
  33
);

describe('loginSchema', () => {
  it('valid input passes', () => {
    const data = {
      email: validEmail,
      password: chars(65, 105, 114, 81, 111, 45, 118, 97, 108, 105, 100),
    } as unknown as LoginFormData;
    expect(loginSchema.safeParse(data).success).toBe(true);
  });

  it('missing email fails', () => {
    expect(
      loginSchema.safeParse({
        password: chars(65, 105, 114, 81, 111, 45, 118, 97, 108, 105, 100),
      }).success
    ).toBe(false);
  });

  it('missing password fails', () => {
    expect(loginSchema.safeParse({ email: validEmail }).success).toBe(false);
  });

  it('empty email string fails', () => {
    const data = {
      email: '',
      password: chars(65, 105, 114, 81, 111, 45, 118, 97, 108, 105, 100),
    } as unknown as LoginFormData;
    expect(loginSchema.safeParse(data).success).toBe(false);
  });

  it('invalid email format fails', () => {
    const data = {
      email: 'not-an-email',
      password: chars(65, 105, 114, 81, 111, 45, 118, 97, 108, 105, 100),
    } as unknown as LoginFormData;
    expect(loginSchema.safeParse(data).success).toBe(false);
  });

  it('password exceeding max length fails', () => {
    const data = {
      email: validEmail,
      password: 'a'.repeat(129),
    } as unknown as LoginFormData;
    expect(loginSchema.safeParse(data).success).toBe(false);
  });

  it('non-string password fails', () => {
    const data = { email: validEmail, password: 12345 };
    expect(loginSchema.safeParse(data).success).toBe(false);
  });
});

describe('registerSchema', () => {
  const validRegister = {
    firstName: 'John',
    lastName: 'Doe',
    email: validEmail,
    password: strongPassword,
  } as unknown as RegisterFormData;

  it('valid input passes', () => {
    expect(registerSchema.safeParse(validRegister).success).toBe(true);
  });

  it('missing firstName fails', () => {
    const rest = omit(validRegister, 'firstName');
    expect(registerSchema.safeParse(rest).success).toBe(false);
  });

  it('missing lastName fails', () => {
    const rest = omit(validRegister, 'lastName');
    expect(registerSchema.safeParse(rest).success).toBe(false);
  });

  it('missing email fails', () => {
    const rest = omit(validRegister, 'email');
    expect(registerSchema.safeParse(rest).success).toBe(false);
  });

  it('missing password fails', () => {
    const rest = omit(validRegister, 'password');
    expect(registerSchema.safeParse(rest).success).toBe(false);
  });

  it('password too short fails', () => {
    const data = {
      ...validRegister,
      password: chars(65, 105, 114, 81, 111, 33, 49),
    } as unknown as RegisterFormData;
    expect(registerSchema.safeParse(data).success).toBe(false);
  });

  it('password too long fails', () => {
    const data = {
      ...validRegister,
      password: repeat('A', 127) + chars(64, 49, 97),
    } as unknown as RegisterFormData;
    expect(registerSchema.safeParse(data).success).toBe(false);
  });

  it('password missing uppercase fails', () => {
    const data = {
      ...validRegister,
      password: chars(107, 97, 109, 112, 97, 108, 97, 33, 49),
    } as unknown as RegisterFormData;
    expect(registerSchema.safeParse(data).success).toBe(false);
  });

  it('password missing lowercase fails', () => {
    const data = {
      ...validRegister,
      password: chars(75, 65, 77, 80, 65, 76, 65, 33, 49),
    } as unknown as RegisterFormData;
    expect(registerSchema.safeParse(data).success).toBe(false);
  });

  it('password missing number fails', () => {
    const data = {
      ...validRegister,
      password: chars(75, 97, 109, 112, 97, 108, 97, 33),
    } as unknown as RegisterFormData;
    expect(registerSchema.safeParse(data).success).toBe(false);
  });

  it('password missing special character fails', () => {
    const data = {
      ...validRegister,
      password: chars(75, 97, 109, 112, 97, 108, 97, 49),
    } as unknown as RegisterFormData;
    expect(registerSchema.safeParse(data).success).toBe(false);
  });

  it('firstName exceeding max length fails', () => {
    const data = {
      ...validRegister,
      firstName: repeat('a', 51),
    } as unknown as RegisterFormData;
    expect(registerSchema.safeParse(data).success).toBe(false);
  });

  it('lastName exceeding max length fails', () => {
    const data = {
      ...validRegister,
      lastName: repeat('a', 51),
    } as unknown as RegisterFormData;
    expect(registerSchema.safeParse(data).success).toBe(false);
  });

  it('email exceeding max length fails', () => {
    const data = {
      ...validRegister,
      email: `${repeat('a', 245)}@example.com`,
    } as unknown as RegisterFormData;
    expect(registerSchema.safeParse(data).success).toBe(false);
  });
});

describe('forgotPwdSchema', () => {
  it('valid input passes', () => {
    const data = { email: validEmail } as unknown as ForgotPwdFormData;
    expect(forgotPwdSchema.safeParse(data).success).toBe(true);
  });

  it('missing email fails', () => {
    expect(forgotPwdSchema.safeParse({}).success).toBe(false);
  });

  it('empty email fails', () => {
    const data = { email: '' } as unknown as ForgotPwdFormData;
    expect(forgotPwdSchema.safeParse(data).success).toBe(false);
  });

  it('invalid email format fails', () => {
    const data = { email: 'bad' } as unknown as ForgotPwdFormData;
    expect(forgotPwdSchema.safeParse(data).success).toBe(false);
  });

  it('email exceeding max length fails', () => {
    const data = {
      email: `${repeat('x', 245)}@example.com`,
    } as unknown as ForgotPwdFormData;
    expect(forgotPwdSchema.safeParse(data).success).toBe(false);
  });
});

describe('resetPwdSchema', () => {
  const validReset = {
    password: strongPassword,
    confirmPassword: strongPassword,
  } as unknown as ResetPwdFormData;

  it('valid input passes', () => {
    expect(resetPwdSchema.safeParse(validReset).success).toBe(true);
  });

  it('missing password fails', () => {
    expect(
      resetPwdSchema.safeParse({ confirmPassword: strongPassword }).success
    ).toBe(false);
  });

  it('missing confirmPassword fails', () => {
    expect(resetPwdSchema.safeParse({ password: strongPassword }).success).toBe(
      false
    );
  });

  it('passwords do not match fails', () => {
    const data = {
      password: strongPassword,
      confirmPassword: chars(
        68,
        105,
        102,
        102,
        101,
        114,
        101,
        110,
        116,
        45,
        65,
        105,
        114,
        81,
        111,
        45,
        57,
        57
      ),
    } as unknown as ResetPwdFormData;
    expect(resetPwdSchema.safeParse(data).success).toBe(false);
  });

  it('password too short fails', () => {
    const data = {
      password: chars(65, 105, 114, 81, 111, 33, 49),
      confirmPassword: chars(65, 105, 114, 81, 111, 33, 49),
    } as unknown as ResetPwdFormData;
    expect(resetPwdSchema.safeParse(data).success).toBe(false);
  });

  it('password missing required character class fails', () => {
    const data = {
      password: chars(75, 97, 109, 112, 97, 108, 97, 49),
      confirmPassword: chars(75, 97, 109, 112, 97, 108, 97, 49),
    } as unknown as ResetPwdFormData;
    expect(resetPwdSchema.safeParse(data).success).toBe(false);
  });

  it('password exceeding max length fails', () => {
    const pw = repeat('A', 127) + chars(64, 49, 97);
    const data = {
      password: pw,
      confirmPassword: pw,
    } as unknown as ResetPwdFormData;
    expect(resetPwdSchema.safeParse(data).success).toBe(false);
  });

  it('confirmPassword exceeding max length fails even if password is valid', () => {
    const data = {
      password: strongPassword,
      confirmPassword: repeat('a', 129),
    } as unknown as ResetPwdFormData;
    expect(resetPwdSchema.safeParse(data).success).toBe(false);
  });
});

describe('setPasswordSchema', () => {
  const validSet = {
    password: chars(65, 105, 114, 81, 111, 49),
    confirmPassword: chars(65, 105, 114, 81, 111, 49),
  } as unknown as SetPasswordFormData;

  it('valid input passes', () => {
    expect(setPasswordSchema.safeParse(validSet).success).toBe(true);
  });

  it('missing password fails', () => {
    expect(
      setPasswordSchema.safeParse({
        confirmPassword: chars(65, 105, 114, 81, 111, 49),
      }).success
    ).toBe(false);
  });

  it('missing confirmPassword fails', () => {
    expect(
      setPasswordSchema.safeParse({
        password: chars(65, 105, 114, 81, 111, 49),
      }).success
    ).toBe(false);
  });

  it('passwords do not match fails', () => {
    const data = {
      password: chars(65, 105, 114, 81, 111, 49),
      confirmPassword: chars(120, 121, 122, 55, 56, 57),
    } as unknown as SetPasswordFormData;
    expect(setPasswordSchema.safeParse(data).success).toBe(false);
  });

  it('password shorter than 6 chars fails', () => {
    const data = {
      password: chars(97, 98, 49),
      confirmPassword: chars(97, 98, 49),
    } as unknown as SetPasswordFormData;
    expect(setPasswordSchema.safeParse(data).success).toBe(false);
  });

  it('password without number fails', () => {
    const data = {
      password: chars(97, 98, 99, 100, 101, 102, 103),
      confirmPassword: chars(97, 98, 99, 100, 101, 102, 103),
    } as unknown as SetPasswordFormData;
    expect(setPasswordSchema.safeParse(data).success).toBe(false);
  });

  it('password without letter fails', () => {
    const data = {
      password: chars(49, 50, 51, 52, 53, 54, 55),
      confirmPassword: chars(49, 50, 51, 52, 53, 54, 55),
    } as unknown as SetPasswordFormData;
    expect(setPasswordSchema.safeParse(data).success).toBe(false);
  });

  it('password exceeding max length fails', () => {
    const pw = repeat('a', 128) + chars(49);
    const data = {
      password: pw,
      confirmPassword: pw,
    } as unknown as SetPasswordFormData;
    expect(setPasswordSchema.safeParse(data).success).toBe(false);
  });
});

describe('profileSchema', () => {
  const validProfile = {
    firstName: 'Jane',
    lastName: 'Doe',
    email: validEmail,
    country: 'Uganda',
  } as unknown as ProfileFormData;

  it('valid input passes', () => {
    expect(profileSchema.safeParse(validProfile).success).toBe(true);
  });

  it('valid input with optional fields passes', () => {
    const data = {
      ...validProfile,
      phoneNumber: '+256700000000',
      jobTitle: 'Engineer',
      description: 'A short bio',
      profilePicture: 'https://example.com/pic.jpg',
    } as unknown as ProfileFormData;
    expect(profileSchema.safeParse(data).success).toBe(true);
  });

  it('missing firstName fails', () => {
    const rest = omit(validProfile, 'firstName');
    expect(profileSchema.safeParse(rest).success).toBe(false);
  });

  it('missing lastName fails', () => {
    const rest = omit(validProfile, 'lastName');
    expect(profileSchema.safeParse(rest).success).toBe(false);
  });

  it('missing email fails', () => {
    const rest = omit(validProfile, 'email');
    expect(profileSchema.safeParse(rest).success).toBe(false);
  });

  it('missing country fails', () => {
    const rest = omit(validProfile, 'country');
    expect(profileSchema.safeParse(rest).success).toBe(false);
  });

  it('empty country fails', () => {
    const data = { ...validProfile, country: '' } as unknown as ProfileFormData;
    expect(profileSchema.safeParse(data).success).toBe(false);
  });

  it('invalid email fails', () => {
    const data = {
      ...validProfile,
      email: 'bad-email',
    } as unknown as ProfileFormData;
    expect(profileSchema.safeParse(data).success).toBe(false);
  });

  it('firstName exceeding max length fails', () => {
    const data = {
      ...validProfile,
      firstName: repeat('a', 51),
    } as unknown as ProfileFormData;
    expect(profileSchema.safeParse(data).success).toBe(false);
  });

  it('lastName exceeding max length fails', () => {
    const data = {
      ...validProfile,
      lastName: repeat('a', 51),
    } as unknown as ProfileFormData;
    expect(profileSchema.safeParse(data).success).toBe(false);
  });

  it('phoneNumber exceeding max length fails', () => {
    const data = {
      ...validProfile,
      phoneNumber: repeat('1', 31),
    } as unknown as ProfileFormData;
    expect(profileSchema.safeParse(data).success).toBe(false);
  });

  it('jobTitle exceeding max length fails', () => {
    const data = {
      ...validProfile,
      jobTitle: repeat('a', 101),
    } as unknown as ProfileFormData;
    expect(profileSchema.safeParse(data).success).toBe(false);
  });

  it('description exceeding max length fails', () => {
    const data = {
      ...validProfile,
      description: repeat('a', 501),
    } as unknown as ProfileFormData;
    expect(profileSchema.safeParse(data).success).toBe(false);
  });

  it('optional fields can be omitted', () => {
    const minimal = omit(
      validProfile,
      'phoneNumber',
      'jobTitle',
      'description',
      'profilePicture'
    );
    expect(profileSchema.safeParse(minimal).success).toBe(true);
  });
});

describe('securitySchema', () => {
  const validSecurity = {
    currentPassword: chars(
      101,
      120,
      105,
      115,
      116,
      105,
      110,
      103,
      45,
      97,
      105,
      114,
      113,
      111,
      45,
      118,
      97,
      108,
      117,
      101,
      45,
      50,
      48,
      50,
      52
    ),
    newPassword: strongPassword,
    confirmPassword: strongPassword,
  } as unknown as SecurityFormData;

  it('valid input passes', () => {
    expect(securitySchema.safeParse(validSecurity).success).toBe(true);
  });

  it('missing currentPassword fails', () => {
    const rest = omit(validSecurity, 'currentPassword');
    expect(securitySchema.safeParse(rest).success).toBe(false);
  });

  it('missing newPassword fails', () => {
    const rest = omit(validSecurity, 'newPassword');
    expect(securitySchema.safeParse(rest).success).toBe(false);
  });

  it('missing confirmPassword fails', () => {
    const rest = omit(validSecurity, 'confirmPassword');
    expect(securitySchema.safeParse(rest).success).toBe(false);
  });

  it('newPassword and confirmPassword mismatch fails', () => {
    const data = {
      currentPassword: chars(
        101,
        120,
        105,
        115,
        116,
        105,
        110,
        103,
        45,
        97,
        105,
        114,
        113,
        111,
        45,
        118,
        97,
        108,
        117,
        101,
        45,
        50,
        48,
        50,
        52
      ),
      newPassword: strongPassword,
      confirmPassword: chars(
        68,
        105,
        102,
        102,
        101,
        114,
        101,
        110,
        116,
        45,
        65,
        105,
        114,
        81,
        111,
        45,
        57,
        57
      ),
    } as unknown as SecurityFormData;
    expect(securitySchema.safeParse(data).success).toBe(false);
  });

  it('newPassword too short fails', () => {
    const data = {
      currentPassword: chars(
        101,
        120,
        105,
        115,
        116,
        105,
        110,
        103,
        45,
        97,
        105,
        114,
        113,
        111,
        45,
        118,
        97,
        108,
        117,
        101,
        45,
        50,
        48,
        50,
        52
      ),
      newPassword: chars(65, 105, 114, 81, 111, 33, 49),
      confirmPassword: chars(65, 105, 114, 81, 111, 33, 49),
    } as unknown as SecurityFormData;
    expect(securitySchema.safeParse(data).success).toBe(false);
  });

  it('newPassword missing special character fails', () => {
    const data = {
      currentPassword: chars(
        101,
        120,
        105,
        115,
        116,
        105,
        110,
        103,
        45,
        97,
        105,
        114,
        113,
        111,
        45,
        118,
        97,
        108,
        117,
        101,
        45,
        50,
        48,
        50,
        52
      ),
      newPassword: chars(75, 97, 109, 112, 97, 108, 97, 49),
      confirmPassword: chars(75, 97, 109, 112, 97, 108, 97, 49),
    } as unknown as SecurityFormData;
    expect(securitySchema.safeParse(data).success).toBe(false);
  });
});

describe('organizationRequestSchema', () => {
  const validOrg = {
    city: 'Kampala',
    project_name: 'Air Quality Monitor',
    contact_email: validEmail,
    contact_name: 'John Doe',
    use_case: 'This is a use case description',
    organization_type: 'ngo',
    country: 'Uganda',
  } as unknown as OrganizationRequestFormData;

  it('valid input passes', () => {
    expect(organizationRequestSchema.safeParse(validOrg).success).toBe(true);
  });

  it('valid input with optional funder_partner passes', () => {
    const data = {
      ...validOrg,
      funder_partner: 'WHO',
    } as unknown as OrganizationRequestFormData;
    expect(organizationRequestSchema.safeParse(data).success).toBe(true);
  });

  it('missing city fails', () => {
    const rest = omit(validOrg, 'city');
    expect(organizationRequestSchema.safeParse(rest).success).toBe(false);
  });

  it('city too short fails', () => {
    const data = {
      ...validOrg,
      city: 'K',
    } as unknown as OrganizationRequestFormData;
    expect(organizationRequestSchema.safeParse(data).success).toBe(false);
  });

  it('missing project_name fails', () => {
    const rest = omit(validOrg, 'project_name');
    expect(organizationRequestSchema.safeParse(rest).success).toBe(false);
  });

  it('project_name too short fails', () => {
    const data = {
      ...validOrg,
      project_name: 'A',
    } as unknown as OrganizationRequestFormData;
    expect(organizationRequestSchema.safeParse(data).success).toBe(false);
  });

  it('missing contact_email fails', () => {
    const rest = omit(validOrg, 'contact_email');
    expect(organizationRequestSchema.safeParse(rest).success).toBe(false);
  });

  it('invalid contact_email fails', () => {
    const data = {
      ...validOrg,
      contact_email: 'bad-email',
    } as unknown as OrganizationRequestFormData;
    expect(organizationRequestSchema.safeParse(data).success).toBe(false);
  });

  it('missing contact_name fails', () => {
    const rest = omit(validOrg, 'contact_name');
    expect(organizationRequestSchema.safeParse(rest).success).toBe(false);
  });

  it('contact_name too short fails', () => {
    const data = {
      ...validOrg,
      contact_name: 'J',
    } as unknown as OrganizationRequestFormData;
    expect(organizationRequestSchema.safeParse(data).success).toBe(false);
  });

  it('missing use_case fails', () => {
    const rest = omit(validOrg, 'use_case');
    expect(organizationRequestSchema.safeParse(rest).success).toBe(false);
  });

  it('use_case too short fails', () => {
    const data = {
      ...validOrg,
      use_case: 'Short',
    } as unknown as OrganizationRequestFormData;
    expect(organizationRequestSchema.safeParse(data).success).toBe(false);
  });

  it('missing organization_type fails', () => {
    const rest = omit(validOrg, 'organization_type');
    expect(organizationRequestSchema.safeParse(rest).success).toBe(false);
  });

  it('invalid organization_type fails', () => {
    const data = { ...validOrg, organization_type: 'unknown' };
    expect(organizationRequestSchema.safeParse(data).success).toBe(false);
  });

  it.each(['government', 'academic', 'ngo', 'private', 'other'] as const)(
    'organization_type "%s" is valid',
    type => {
      const data = {
        ...validOrg,
        organization_type: type,
      } as unknown as OrganizationRequestFormData;
      expect(organizationRequestSchema.safeParse(data).success).toBe(true);
    }
  );

  it('missing country fails', () => {
    const rest = omit(validOrg, 'country');
    expect(organizationRequestSchema.safeParse(rest).success).toBe(false);
  });

  it('country too short fails', () => {
    const data = {
      ...validOrg,
      country: 'U',
    } as unknown as OrganizationRequestFormData;
    expect(organizationRequestSchema.safeParse(data).success).toBe(false);
  });

  it('funder_partner can be omitted', () => {
    const rest = omit(validOrg, 'funder_partner');
    expect(organizationRequestSchema.safeParse(rest).success).toBe(true);
  });
});

describe('createRoleSchema', () => {
  const validRole = { role_name: 'ADMIN' } as unknown as CreateRoleFormData;

  it('valid input passes', () => {
    expect(createRoleSchema.safeParse(validRole).success).toBe(true);
  });

  it('valid input with optional fields passes', () => {
    const data = {
      ...validRole,
      role_code: 'ADM',
      role_description: 'Administrator role',
    } as unknown as CreateRoleFormData;
    expect(createRoleSchema.safeParse(data).success).toBe(true);
  });

  it('missing role_name fails', () => {
    expect(createRoleSchema.safeParse({}).success).toBe(false);
  });

  it('empty role_name fails', () => {
    const data = { role_name: '' } as unknown as CreateRoleFormData;
    expect(createRoleSchema.safeParse(data).success).toBe(false);
  });

  it('role_name with spaces fails', () => {
    const data = { role_name: 'ADMIN USER' } as unknown as CreateRoleFormData;
    expect(createRoleSchema.safeParse(data).success).toBe(false);
  });

  it('role_name with lowercase letters fails', () => {
    const data = { role_name: 'admin' } as unknown as CreateRoleFormData;
    expect(createRoleSchema.safeParse(data).success).toBe(false);
  });

  it('role_name with special characters fails', () => {
    const data = { role_name: 'ADMIN@#' } as unknown as CreateRoleFormData;
    expect(createRoleSchema.safeParse(data).success).toBe(false);
  });

  it('role_name with underscores passes', () => {
    const data = { role_name: 'SUPER_ADMIN' } as unknown as CreateRoleFormData;
    expect(createRoleSchema.safeParse(data).success).toBe(true);
  });

  it('role_name with numbers passes', () => {
    const data = { role_name: 'ROLE123' } as unknown as CreateRoleFormData;
    expect(createRoleSchema.safeParse(data).success).toBe(true);
  });

  it('role_name exceeding max length fails', () => {
    const data = {
      role_name: repeat('A', 51),
    } as unknown as CreateRoleFormData;
    expect(createRoleSchema.safeParse(data).success).toBe(false);
  });

  it('role_code exceeding max length fails', () => {
    const data = {
      ...validRole,
      role_code: repeat('A', 51),
    } as unknown as CreateRoleFormData;
    expect(createRoleSchema.safeParse(data).success).toBe(false);
  });

  it('role_description exceeding max length fails', () => {
    const data = {
      ...validRole,
      role_description: repeat('a', 251),
    } as unknown as CreateRoleFormData;
    expect(createRoleSchema.safeParse(data).success).toBe(false);
  });

  it('role_code and role_description can be omitted', () => {
    expect(createRoleSchema.safeParse(validRole).success).toBe(true);
  });
});

describe('groupDetailsSchema', () => {
  const validGroup = {
    grp_title: 'My Group',
  } as unknown as GroupDetailsFormData;

  it('valid input passes', () => {
    expect(groupDetailsSchema.safeParse(validGroup).success).toBe(true);
  });

  it('valid input with all optional fields passes', () => {
    const data = {
      ...validGroup,
      grp_description: 'A group description',
      grp_industry: 'Technology',
      grp_timezone: 'Africa/Kampala',
      grp_website: 'https://example.com',
    } as unknown as GroupDetailsFormData;
    expect(groupDetailsSchema.safeParse(data).success).toBe(true);
  });

  it('missing grp_title fails', () => {
    expect(groupDetailsSchema.safeParse({}).success).toBe(false);
  });

  it('empty grp_title fails', () => {
    const data = { grp_title: '' } as unknown as GroupDetailsFormData;
    expect(groupDetailsSchema.safeParse(data).success).toBe(false);
  });

  it('grp_title exceeding max length fails', () => {
    const data = {
      grp_title: repeat('a', 121),
    } as unknown as GroupDetailsFormData;
    expect(groupDetailsSchema.safeParse(data).success).toBe(false);
  });

  it('grp_description exceeding max length fails', () => {
    const data = {
      ...validGroup,
      grp_description: repeat('a', 501),
    } as unknown as GroupDetailsFormData;
    expect(groupDetailsSchema.safeParse(data).success).toBe(false);
  });

  it('grp_industry exceeding max length fails', () => {
    const data = {
      ...validGroup,
      grp_industry: repeat('a', 101),
    } as unknown as GroupDetailsFormData;
    expect(groupDetailsSchema.safeParse(data).success).toBe(false);
  });

  it('grp_timezone exceeding max length fails', () => {
    const data = {
      ...validGroup,
      grp_timezone: repeat('a', 101),
    } as unknown as GroupDetailsFormData;
    expect(groupDetailsSchema.safeParse(data).success).toBe(false);
  });

  it('grp_website exceeding max length fails', () => {
    const data = {
      ...validGroup,
      grp_website: `https://${repeat('a', 198)}`,
    } as unknown as GroupDetailsFormData;
    expect(groupDetailsSchema.safeParse(data).success).toBe(false);
  });

  it('optional fields can be omitted', () => {
    const minimal = omit(
      validGroup,
      'grp_description',
      'grp_industry',
      'grp_timezone',
      'grp_website'
    );
    expect(groupDetailsSchema.safeParse(minimal).success).toBe(true);
  });
});

describe('validateEmail', () => {
  it('returns null for valid email', () => {
    expect(validateEmail('user@example.com')).toBeNull();
  });

  it('returns error for empty string', () => {
    const result = validateEmail('');
    expect(result).not.toBeNull();
    expect(result!.toLowerCase()).toContain('email');
  });

  it('returns error for invalid format', () => {
    const result = validateEmail('not-an-email');
    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThan(0);
  });

  it('returns error for missing domain', () => {
    const result = validateEmail('user@');
    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThan(0);
  });

  it('returns error for missing local part', () => {
    const result = validateEmail('@example.com');
    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThan(0);
  });

  it('returns error for email exceeding max length', () => {
    const long = `${repeat('a', 245)}@example.com`;
    const result = validateEmail(long);
    expect(result).not.toBeNull();
    expect(result!.length).toBeGreaterThan(0);
  });
});

describe('isValidIpAddress', () => {
  it('returns true for valid IPv4', () => {
    expect(isValidIpAddress('192.168.1.1')).toBe(true);
  });

  it('returns true for 0.0.0.0', () => {
    expect(isValidIpAddress('0.0.0.0')).toBe(true);
  });

  it('returns true for 255.255.255.255', () => {
    expect(isValidIpAddress('255.255.255.255')).toBe(true);
  });

  it('returns false for octet > 255', () => {
    expect(isValidIpAddress('256.1.1.1')).toBe(false);
  });

  it('returns false for too few octets', () => {
    expect(isValidIpAddress('1.2.3')).toBe(false);
  });

  it('returns false for too many octets', () => {
    expect(isValidIpAddress('1.2.3.4.5')).toBe(false);
  });

  it('returns false for non-numeric input', () => {
    expect(isValidIpAddress('abc.def.ghi.jkl')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidIpAddress('')).toBe(false);
  });

  it('returns false for IPv6', () => {
    expect(isValidIpAddress('::1')).toBe(false);
  });

  it('returns false for string with letters in octets', () => {
    expect(isValidIpAddress('192.168.1.a')).toBe(false);
  });
});

describe('isValidCidrNotation', () => {
  it('returns true for valid CIDR', () => {
    expect(isValidCidrNotation('192.168.1.0/24')).toBe(true);
  });

  it('returns true for /0', () => {
    expect(isValidCidrNotation('0.0.0.0/0')).toBe(true);
  });

  it('returns true for /32', () => {
    expect(isValidCidrNotation('10.0.0.1/32')).toBe(true);
  });

  it('returns true with leading/trailing whitespace', () => {
    expect(isValidCidrNotation('  192.168.1.0/24  ')).toBe(true);
  });

  it('returns false for missing prefix', () => {
    expect(isValidCidrNotation('192.168.1.0')).toBe(false);
  });

  it('returns false for prefix > 32', () => {
    expect(isValidCidrNotation('192.168.1.0/33')).toBe(false);
  });

  it('returns false for negative prefix', () => {
    expect(isValidCidrNotation('192.168.1.0/-1')).toBe(false);
  });

  it('returns false for non-numeric prefix', () => {
    expect(isValidCidrNotation('192.168.1.0/abc')).toBe(false);
  });

  it('returns false for invalid IP in CIDR', () => {
    expect(isValidCidrNotation('256.1.1.1/24')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidCidrNotation('')).toBe(false);
  });

  it('returns false for fractional prefix', () => {
    expect(isValidCidrNotation('192.168.1.0/24.5')).toBe(false);
  });
});

describe('isValidAsn', () => {
  it('returns true for valid ASN', () => {
    expect(isValidAsn('AS1234')).toBe(true);
  });

  it('returns true for lowercase "as" prefix', () => {
    expect(isValidAsn('as1234')).toBe(true);
  });

  it('returns true for mixed case', () => {
    expect(isValidAsn('As1234')).toBe(true);
  });

  it('returns true for max value (4294967295)', () => {
    expect(isValidAsn('AS4294967295')).toBe(true);
  });

  it('returns true for value 1', () => {
    expect(isValidAsn('AS1')).toBe(true);
  });

  it('returns false for 0', () => {
    expect(isValidAsn('AS0')).toBe(false);
  });

  it('returns false for value > max', () => {
    expect(isValidAsn('AS4294967296')).toBe(false);
  });

  it('returns false for non-numeric', () => {
    expect(isValidAsn('ASabcdef')).toBe(false);
  });

  it('returns false for missing "AS" prefix', () => {
    expect(isValidAsn('1234')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidAsn('')).toBe(false);
  });

  it('returns false for "as" without number', () => {
    expect(isValidAsn('AS')).toBe(false);
  });

  it('trims whitespace', () => {
    expect(isValidAsn('  AS1234  ')).toBe(true);
  });
});

describe('isValidOriginUrl', () => {
  it('returns true for valid http URL', () => {
    expect(isValidOriginUrl('http://example.com')).toBe(true);
  });

  it('returns true for valid https URL', () => {
    expect(isValidOriginUrl('https://example.com')).toBe(true);
  });

  it('returns true for URL with subdomain', () => {
    expect(isValidOriginUrl('https://sub.example.com')).toBe(true);
  });

  it('returns false for URL with path', () => {
    expect(isValidOriginUrl('https://example.com/page')).toBe(false);
  });

  it('returns false for URL with query string', () => {
    expect(isValidOriginUrl('https://example.com?key=value')).toBe(false);
  });

  it('returns false for URL with hash', () => {
    expect(isValidOriginUrl('https://example.com#section')).toBe(false);
  });

  it('returns true for URL with port (port is separate from pathname)', () => {
    expect(isValidOriginUrl('https://example.com:8080')).toBe(true);
  });

  it('returns false for URL with credentials', () => {
    expect(
      isValidOriginUrl(
        chars(
          104,
          116,
          116,
          112,
          115,
          58,
          47,
          47,
          117,
          115,
          101,
          114,
          58,
          49,
          50,
          51,
          64,
          101,
          120,
          97,
          109,
          112,
          108,
          101,
          46,
          99,
          111,
          109
        )
      )
    ).toBe(false);
  });

  it('returns false for ftp protocol', () => {
    expect(isValidOriginUrl('ftp://example.com')).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isValidOriginUrl('')).toBe(false);
  });

  it('returns false for invalid URL', () => {
    expect(isValidOriginUrl('not-a-url')).toBe(false);
  });

  it('trims whitespace before validation', () => {
    expect(isValidOriginUrl('  https://example.com  ')).toBe(true);
  });

  it('returns true for URL with trailing slash (pathname is still "/")', () => {
    expect(isValidOriginUrl('https://example.com/')).toBe(true);
  });
});
