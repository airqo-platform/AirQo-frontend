import {
  normalizeOAuthAccessToken,
  isSupportedSocialAuthProvider,
  buildSessionFromProfile,
} from '../oauth-session';

const mockToken = String.fromCharCode(
  97,
  105,
  114,
  113,
  111,
  45,
  116,
  111,
  107,
  101,
  110,
  45,
  118,
  97,
  108,
  117,
  101
);

beforeEach(() => {
  jest.spyOn(Date, 'now').mockReturnValue(1700000000000);
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('normalizeOAuthAccessToken', () => {
  it('strips JWT prefix', () => {
    expect(normalizeOAuthAccessToken(['JWT', mockToken].join(' '))).toBe(
      mockToken
    );
  });

  it('strips Bearer prefix', () => {
    expect(normalizeOAuthAccessToken(['Bearer', mockToken].join(' '))).toBe(
      mockToken
    );
  });

  it('trims whitespace', () => {
    expect(normalizeOAuthAccessToken(`  ${mockToken}  `)).toBe(mockToken);
  });

  it('handles multiple spaces between prefix and value', () => {
    expect(normalizeOAuthAccessToken(`JWT   ${mockToken}`)).toBe(mockToken);
  });

  it('handles case-insensitive prefix', () => {
    expect(normalizeOAuthAccessToken(['bearer', mockToken].join(' '))).toBe(
      mockToken
    );
    expect(normalizeOAuthAccessToken(['jwt', mockToken].join(' '))).toBe(
      mockToken
    );
    expect(normalizeOAuthAccessToken(['BEARER', mockToken].join(' '))).toBe(
      mockToken
    );
  });

  it('returns empty string for empty input', () => {
    expect(normalizeOAuthAccessToken('')).toBe('');
  });

  it('returns empty string when only prefix is present', () => {
    expect(normalizeOAuthAccessToken('JWT ')).toBe('');
    expect(normalizeOAuthAccessToken('Bearer ')).toBe('');
  });
});

describe('isSupportedSocialAuthProvider', () => {
  it('returns true for google', () => {
    expect(isSupportedSocialAuthProvider('google')).toBe(true);
  });

  it('returns true for github', () => {
    expect(isSupportedSocialAuthProvider('github')).toBe(true);
  });

  it('returns true for linkedin', () => {
    expect(isSupportedSocialAuthProvider('linkedin')).toBe(true);
  });

  it('returns true for twitter', () => {
    expect(isSupportedSocialAuthProvider('twitter')).toBe(true);
  });

  it('returns false for null', () => {
    expect(isSupportedSocialAuthProvider(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isSupportedSocialAuthProvider(undefined)).toBe(false);
  });

  it('returns false for empty string', () => {
    expect(isSupportedSocialAuthProvider('')).toBe(false);
  });

  it('returns false for unsupported provider', () => {
    expect(isSupportedSocialAuthProvider('facebook')).toBe(false);
  });

  it('returns false for case-sensitive mismatch', () => {
    expect(isSupportedSocialAuthProvider('Google')).toBe(false);
    expect(isSupportedSocialAuthProvider('GitHub')).toBe(false);
  });
});

describe('buildSessionFromProfile', () => {
  it('creates session with user data', () => {
    const profile = {
      _id: 'user1',
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'User',
      accessToken: mockToken,
    };

    const session = buildSessionFromProfile(profile);

    expect(session.user._id).toBe('user1');
    expect(session.user.email).toBe('user@test.com');
    expect(session.user.firstName).toBe('Test');
    expect(session.user.lastName).toBe('User');
    expect(session.user.name).toBe('Test User');
    expect(session.user.image).toBe('');
  });

  it('normalizes access token', () => {
    const profile = {
      _id: 'user1',
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'User',
      accessToken: ['Bearer', mockToken].join(' '),
    };

    const session = buildSessionFromProfile(profile);

    expect(session.accessToken).toBe(mockToken);
  });

  it('falls back to email when name fields are missing', () => {
    const profile = {
      _id: 'user1',
      email: 'user@test.com',
      firstName: '',
      lastName: '',
    };

    const session = buildSessionFromProfile(profile);

    expect(session.user.name).toBe('user@test.com');
  });

  it('sets expires ~24h in the future', () => {
    const profile = {
      _id: 'user1',
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const session = buildSessionFromProfile(profile);
    const expectedExpiry = new Date(
      1700000000000 + 24 * 60 * 60 * 1000
    ).toISOString();

    expect(session.expires).toBe(expectedExpiry);
  });

  it('handles missing accessToken', () => {
    const profile = {
      _id: 'user1',
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const session = buildSessionFromProfile(profile);

    expect(session.accessToken).toBeUndefined();
  });

  it('maps profilePicture to image', () => {
    const profile = {
      _id: 'user1',
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'User',
      profilePicture: 'https://example.com/photo.jpg',
    };

    const session = buildSessionFromProfile(profile);

    expect(session.user.image).toBe('https://example.com/photo.jpg');
  });

  it('handles authMethods', () => {
    const profile = {
      _id: 'user1',
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'User',
      authMethods: {
        password: true,
        google: true,
        github: false,
        linkedin: false,
        microsoft: false,
        twitter: false,
        facebook: false,
        apple: false,
      },
    };

    const session = buildSessionFromProfile(profile);

    expect(session.authMethods).toEqual({
      password: true,
      google: true,
      github: false,
      linkedin: false,
      microsoft: false,
      twitter: false,
      facebook: false,
      apple: false,
    });
  });

  it('handles undefined authMethods', () => {
    const profile = {
      _id: 'user1',
      email: 'user@test.com',
      firstName: 'Test',
      lastName: 'User',
    };

    const session = buildSessionFromProfile(profile);

    expect(session.authMethods).toBeUndefined();
  });
});
