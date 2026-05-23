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
  feedback?: any;
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

    const ratingLabel = rating >= 4 ? 'Positive' : 'Negative';
    const message = description
      ? `${ratingLabel}: ${description}`
      : ratingLabel;

    const metadata: FeedbackSubmissionMetadata = {
      page: '/home',
      loginDurationMs: String(loginDurationMs),
      submittedAt: String(submittedAt),
      browser:
        typeof window !== 'undefined'
          ? navigator.userAgent.slice(0, 80)
          : 'Unknown',
      appVersion: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
    };

    return this.submitFeedback({
      email,
      subject: 'Login Experience',
      message,
      rating,
      category: 'page_satisfaction',
      platform: 'web',
      app: 'vertex',
      metadata,
    });
  }
}

export const feedbackService = new FeedbackService();
