import {
  getContactConsentDefault,
  shouldEmailSubmitter,
} from '../feedbackPolicy';

describe('feedback contact policy', () => {
  it.each(['bug', 'performance', 'feature_request'] as const)(
    'opts into contact by default for %s feedback',
    category => {
      expect(getContactConsentDefault(category)).toBe(true);
    }
  );

  it.each(['general', 'ux_design', 'other'] as const)(
    'does not opt into contact by default for %s feedback',
    category => {
      expect(getContactConsentDefault(category)).toBe(false);
    }
  );

  it('emails only for actionable, consented feedback moved to a non-archived status', () => {
    expect(
      shouldEmailSubmitter(
        { actionable: true, contact_consent: true },
        'reviewed'
      )
    ).toBe(true);
    expect(
      shouldEmailSubmitter(
        { actionable: true, contact_consent: false },
        'reviewed'
      )
    ).toBe(false);
    expect(
      shouldEmailSubmitter(
        { actionable: false, contact_consent: true },
        'reviewed'
      )
    ).toBe(false);
    expect(
      shouldEmailSubmitter(
        { actionable: true, contact_consent: true },
        'archived'
      )
    ).toBe(false);
  });

  it('treats missing consent on older submissions as allowed', () => {
    expect(shouldEmailSubmitter({ actionable: true }, 'resolved')).toBe(true);
  });
});
