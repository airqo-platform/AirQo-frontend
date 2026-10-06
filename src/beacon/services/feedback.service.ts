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
  /** When false the backend sends the submitter no emails about this report. */
  contact_consent?: boolean;
  screenshot_url?: string;
  metadata?: FeedbackSubmissionMetadata;
}

export interface SubmitFeedbackResponse {
  success: boolean;
  message: string;
  feedback?: any;
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

export interface UploadScreenshotResponse {
  secure_url: string;
  public_id: string;
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

export const getAppVersion = (): string => process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0';

export class FeedbackService {
  private readonly baseUrl: string;
  private readonly apiPrefix: string;
  private readonly defaultRequestTimeoutMs: number;

  constructor() {
    // User feedback is sent to staging on localhost, and to the appropriate platform URL otherwise
    this.baseUrl = config.isLocalhost ? 'https://staging-platform.airqo.net' : config.airqoPlatformUrl;
    this.apiPrefix = '/api/v2';
    this.defaultRequestTimeoutMs = 10000;
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
    payload: SubmitFeedbackRequest,
    timeoutMs: number = this.defaultRequestTimeoutMs
  ): Promise<SubmitFeedbackResponse> {
    const endpoint = this.getEndpoint('/users/feedback/submit');
    const url = `${this.baseUrl}${endpoint}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;

    try {
      response = await fetch(url, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(payload),
        signal: controller.signal,
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Feedback submission timed out. Please try again.');
      }
      throw error;
    } finally {
      clearTimeout(timeoutId);
    }

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

  /**
   * Uploads a feedback screenshot through Beacon's own API route, which holds
   * the Cloudinary credentials and only writes to the feedback folder.
   */
  async uploadScreenshot(file: File): Promise<UploadScreenshotResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/feedback/screenshot', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
      signal: AbortSignal.timeout(20000),
    });

    let result: { success?: boolean; error?: string } & Partial<UploadScreenshotResponse> = {};
    try {
      result = await response.json();
    } catch {
      // Non-JSON body; fall through to the generic error below.
    }

    if (!response.ok || !result.secure_url) {
      throw new Error(result.error || 'Screenshot upload failed');
    }

    return { secure_url: result.secure_url, public_id: result.public_id || '' };
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
      app = 'beacon',
      metadata,
    } = params;

    // Nothing written means the message is a bare "Positive"/"Negative": that
    // is what keeps counted clicks out of the support inbox.
    const ratingLabel = rating >= 4 ? 'Positive' : 'Negative';
    const message = description ? `${ratingLabel}: ${description}` : ratingLabel;

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
        appVersion: getAppVersion(),
        ...metadata,
      },
    });
  }

  /**
   * Submits a quick post-login experience rating as page satisfaction feedback
   * with subject 'Login Experience'.
   */
  async submitLoginFeedback(params: {
    email: string;
    rating: number;
    description?: string;
    loginDurationMs: number;
    landingPage: string;
    submittedAt: number;
  }): Promise<SubmitFeedbackResponse> {
    const { email, rating, description, loginDurationMs, landingPage, submittedAt } = params;

    return this.submitSatisfactionFeedback({
      email,
      subject: 'Login Experience',
      rating,
      description,
      page: landingPage,
      metadata: {
        loginDurationMs: String(loginDurationMs),
        submittedAt: String(submittedAt),
      },
    });
  }
}

export const feedbackService = new FeedbackService();
