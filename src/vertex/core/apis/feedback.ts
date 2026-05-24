import createSecureApiClient from "../utils/secureApiProxyClient";

export interface FeedbackSubmissionMetadata extends Record<string, unknown> {
  page?: string;
  browser?: string;
  appVersion?: string;
  screenResolution?: string;
}

export interface SubmitFeedbackRequest {
  email: string;
  subject: string;
  message: string;
  rating: number;
  category: string;
  platform: string;
  app?: string;
  screenshot_url?: string;
  metadata?: FeedbackSubmissionMetadata;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  message: string;
  feedback?: unknown;
}

export interface SubmitSatisfactionFeedbackRequest {
  email: string;
  subject: string;
  rating: number;
  description?: string;
  category?: string;
  page?: string;
  platform?: string;
  app?: string;
  metadata?: FeedbackSubmissionMetadata;
}

const extractResponseData = <T extends { success?: boolean; message?: string }>(
  data: T,
  fallbackMessage: string
): T => {
  if ('success' in data && data.success === false) {
    throw new Error(data.message || fallbackMessage);
  }
  return data;
};

export class FeedbackService {
  async submitFeedback(
    payload: SubmitFeedbackRequest
  ): Promise<SubmitFeedbackResponse> {
    const response = await createSecureApiClient().post<SubmitFeedbackResponse>(
      '/users/feedback/submit',
      payload
    );

    return extractResponseData(
      response.data as SubmitFeedbackResponse,
      'Failed to submit feedback'
    );
  }

  async submitSatisfactionFeedback(
    params: SubmitSatisfactionFeedbackRequest
  ): Promise<SubmitFeedbackResponse> {
    const {
      email,
      subject,
      rating,
      description,
      category = 'page_satisfaction',
      page,
      platform = 'web',
      app = 'vertex',
      metadata,
    } = params;

    const ratingLabel = rating >= 4 ? 'Positive' : 'Negative';
    const message = description
      ? `${ratingLabel}: ${description}`
      : ratingLabel;

    return this.submitFeedback({
      email,
      subject,
      message,
      rating,
      category,
      platform,
      app,
      metadata: {
        page,
        browser:
          typeof window !== 'undefined'
            ? navigator.userAgent.slice(0, 80)
            : 'Unknown',
        appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
        ...metadata,
      },
    });
  }

  /**
   * Submits a quick post-login experience rating.
   * Maps onto the existing /users/feedback/submit endpoint using
   * category: 'page_satisfaction' and subject: 'Login Experience'.
   */
  async submitLoginFeedback(params: {
    email: string;
    rating: number;
    description?: string;
    loginDurationMs: number;
    submittedAt: number;
  }): Promise<SubmitFeedbackResponse> {
    const { email, rating, description, loginDurationMs, submittedAt } = params;

    return this.submitSatisfactionFeedback({
      email,
      subject: 'Login Experience',
      rating,
      description,
      page: '/home',
      metadata: {
        loginDurationMs: String(loginDurationMs),
        submittedAt: String(submittedAt),
      },
    });
  }
}

export const feedbackService = new FeedbackService();
