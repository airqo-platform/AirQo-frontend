/*
 * What the feedback components hand to the app to send. The shapes are the
 * request bodies of Beacon's services/feedback.service.ts (submitFeedback,
 * submitSatisfactionFeedback, submitLoginFeedback); Vertex's
 * core/apis/feedback.ts sends the same fields to the same AirQo endpoints.
 * Each app keeps its own service and passes it in through `onSubmit`.
 */

export interface FeedbackSubmission {
  email: string
  subject: string
  message: string
  rating: number
  /** 'bug' for "Report an issue", 'feature_request' for "Suggest an idea". */
  category: string
  platform: string
  /** e.g. 'beacon', 'vertex'. */
  app?: string
  contact_consent?: boolean
  screenshot_url?: string
  metadata?: Record<string, unknown>
}

export interface SatisfactionFeedbackSubmission {
  email: string
  subject: string
  rating: number
  description?: string
  page?: string
  metadata?: Record<string, unknown>
}

export interface LoginFeedbackSubmission {
  email: string
  rating: number
  description?: string
  loginDurationMs: number
  landingPage: string
  submittedAt: number
}
