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
}

export const feedbackService = new FeedbackService();
