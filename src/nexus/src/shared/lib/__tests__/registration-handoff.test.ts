import {
  consumePendingRegistrationEmail,
  setPendingRegistrationEmail,
} from '../registration-handoff';

describe('registration handoff', () => {
  beforeEach(() => {
    sessionStorage.clear();
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('stores and consumes the email once', () => {
    setPendingRegistrationEmail('new@example.com');

    expect(consumePendingRegistrationEmail()).toBe('new@example.com');
    expect(consumePendingRegistrationEmail()).toBe('');
  });

  it('rejects an expired handoff and removes it', () => {
    setPendingRegistrationEmail('expired@example.com');
    jest.spyOn(Date, 'now').mockReturnValue(1_700_000_000_000 + 5 * 60 * 1000);

    expect(consumePendingRegistrationEmail()).toBe('');
    expect(
      sessionStorage.getItem('airqo:pending-registration-email')
    ).toBeNull();
  });
});
