/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  ApiClient,
  createAuthenticatedClient,
} from '@/shared/services/apiClient';
import { syncClientSessionToken } from '@/shared/services/sessionAuthToken';
import type {
  ApiErrorResponse,
  GetFeedbackSubmissionResponse,
  GetFeedbackSubmissionsResponse,
  SubmitFeedbackRequest,
  SubmitFeedbackResponse,
  UpdateFeedbackStatusResponse,
} from '@/shared/types/api';

interface FeedbackQueryParams {
  page?: number;
  limit?: number;
  status?: string;
  category?: string;
  platform?: string;
  search?: string;
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
  private authenticatedClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async ensureAuthenticated() {
    await syncClientSessionToken(this.authenticatedClient);
  }

  async getFeedbackSubmissions(
    params: FeedbackQueryParams = {}
  ): Promise<GetFeedbackSubmissionsResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.get<
      GetFeedbackSubmissionsResponse | ApiErrorResponse
    >('/users/feedback/submissions', {
      params,
    });

    return extractResponseData(
      response.data as GetFeedbackSubmissionsResponse,
      'Failed to load feedback submissions'
    );
  }

  async getFeedbackSubmission(
    feedbackId: string
  ): Promise<GetFeedbackSubmissionResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.get<
      GetFeedbackSubmissionResponse | ApiErrorResponse
    >(`/users/feedback/submissions/${feedbackId}`);

    return extractResponseData(
      response.data as GetFeedbackSubmissionResponse,
      'Failed to load feedback submission'
    );
  }

  async submitFeedback(
    payload: SubmitFeedbackRequest
  ): Promise<SubmitFeedbackResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.post<
      SubmitFeedbackResponse | ApiErrorResponse
    >('/users/feedback/submit', payload);

    return extractResponseData(
      response.data as SubmitFeedbackResponse,
      'Failed to submit feedback'
    );
  }

  async updateFeedbackStatus(
    feedbackId: string,
    status: string
  ): Promise<UpdateFeedbackStatusResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.patch<
      UpdateFeedbackStatusResponse | ApiErrorResponse
    >(`/users/feedback/submissions/${feedbackId}/status`, {
      status,
    });

    return extractResponseData(
      response.data as UpdateFeedbackStatusResponse,
      'Failed to update feedback status'
    );
  }
}

export const feedbackService = new FeedbackService();
