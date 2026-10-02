export type FeedbackCategory =
  | 'general'
  | 'bug'
  | 'feature_request'
  | 'performance'
  | 'ux_design'
  | 'other';

export interface FeedbackContactPolicy {
  actionable?: boolean;
  contact_consent?: boolean;
}

export const getContactConsentDefault = (category: FeedbackCategory) =>
  category === 'bug' ||
  category === 'performance' ||
  category === 'feature_request';

export const shouldEmailSubmitter = (
  feedback: FeedbackContactPolicy,
  nextStatus: string
) =>
  Boolean(feedback.actionable) &&
  feedback.contact_consent !== false &&
  nextStatus !== 'archived';
