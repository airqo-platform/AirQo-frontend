import authService from './api-service';
import { config } from '@/lib/config';

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
  private readonly baseUrl: string;
  private readonly apiPrefix: string;

  constructor() {
    // User feedback is sent to staging on localhost, and to the appropriate platform URL otherwise
    this.baseUrl = config.isLocalhost ? 'https://staging-platform.airqo.net' : config.airqoPlatformUrl;
    this.apiPrefix = '/api/v2';
  }

  private getEndpoint(resource: string): string {
    const cleanPath = resource.startsWith('/') ? resource : `/${resource}`;
    return `${this.apiPrefix}${cleanPath}`;
  }

  private getAuthHeaders(): HeadersInit {
    const token = authService.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = token;
    }
    return headers;
  }

  async submitFeedback(
    payload: SubmitFeedbackRequest
  ): Promise<SubmitFeedbackResponse> {
    const endpoint = this.getEndpoint('/users/feedback/submit');
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = 'Failed to submit feedback';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.detail || errorMessage;
      } catch (e) {
        // use default error message
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return extractResponseData(
      data as SubmitFeedbackResponse,
      'Failed to submit feedback'
    );
  }
}

export const feedbackService = new FeedbackService();
