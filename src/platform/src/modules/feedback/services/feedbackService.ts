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
  ReplyToFeedbackRequest,
  ReplyToFeedbackResponse,
  UpdateAdminNotesRequest,
  UpdateAdminNotesResponse,
  BulkStatusUpdateRequest,
  BulkStatusUpdateResponse,
  AssignFeedbackRequest,
  AssignFeedbackResponse,
  AddWatcherRequest,
  AddWatcherResponse,
  RemoveWatcherResponse,
  RegisterWebhookRequest,
  RegisterWebhookResponse,
  GetWebhooksResponse,
  UpdateWebhookRequest,
  UpdateWebhookResponse,
  DeleteWebhookResponse,
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
    throw new Error(fallbackMessage);
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

  async replyToFeedback(
    feedbackId: string,
    payload: ReplyToFeedbackRequest
  ): Promise<ReplyToFeedbackResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.post<
      ReplyToFeedbackResponse | ApiErrorResponse
    >(`/users/feedback/submissions/${feedbackId}/reply`, payload);

    return extractResponseData(
      response.data as ReplyToFeedbackResponse,
      'Failed to send reply'
    );
  }

  async updateAdminNotes(
    feedbackId: string,
    payload: UpdateAdminNotesRequest
  ): Promise<UpdateAdminNotesResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.patch<
      UpdateAdminNotesResponse | ApiErrorResponse
    >(`/users/feedback/submissions/${feedbackId}/notes`, payload);

    return extractResponseData(
      response.data as UpdateAdminNotesResponse,
      'Failed to update admin notes'
    );
  }

  async bulkUpdateStatus(
    payload: BulkStatusUpdateRequest
  ): Promise<BulkStatusUpdateResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.patch<
      BulkStatusUpdateResponse | ApiErrorResponse
    >('/users/feedback/submissions/bulk-status', payload);

    return extractResponseData(
      response.data as BulkStatusUpdateResponse,
      'Failed to perform bulk status update'
    );
  }

  async assignFeedback(
    feedbackId: string,
    payload: AssignFeedbackRequest
  ): Promise<AssignFeedbackResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.patch<
      AssignFeedbackResponse | ApiErrorResponse
    >(`/users/feedback/submissions/${feedbackId}/assign`, payload);

    return extractResponseData(
      response.data as AssignFeedbackResponse,
      'Failed to assign feedback'
    );
  }

  async addWatcher(
    feedbackId: string,
    payload: AddWatcherRequest
  ): Promise<AddWatcherResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.post<
      AddWatcherResponse | ApiErrorResponse
    >(`/users/feedback/submissions/${feedbackId}/watchers`, payload);

    return extractResponseData(
      response.data as AddWatcherResponse,
      'Failed to add watcher'
    );
  }

  async removeWatcher(
    feedbackId: string,
    watcherEmail: string
  ): Promise<RemoveWatcherResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.delete<
      RemoveWatcherResponse | ApiErrorResponse
    >(
      `/users/feedback/submissions/${feedbackId}/watchers/${encodeURIComponent(watcherEmail)}`
    );

    return extractResponseData(
      response.data as RemoveWatcherResponse,
      'Failed to remove watcher'
    );
  }

  async getWebhooks(): Promise<GetWebhooksResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.get<
      GetWebhooksResponse | ApiErrorResponse
    >('/users/feedback/webhooks');

    return extractResponseData(
      response.data as GetWebhooksResponse,
      'Failed to load webhooks'
    );
  }

  async registerWebhook(
    payload: RegisterWebhookRequest
  ): Promise<RegisterWebhookResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.post<
      RegisterWebhookResponse | ApiErrorResponse
    >('/users/feedback/webhooks', payload);

    return extractResponseData(
      response.data as RegisterWebhookResponse,
      'Failed to register webhook'
    );
  }

  async updateWebhook(
    webhookId: string,
    payload: UpdateWebhookRequest
  ): Promise<UpdateWebhookResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.patch<
      UpdateWebhookResponse | ApiErrorResponse
    >(`/users/feedback/webhooks/${webhookId}`, payload);

    return extractResponseData(
      response.data as UpdateWebhookResponse,
      'Failed to update webhook'
    );
  }

  async deleteWebhook(webhookId: string): Promise<DeleteWebhookResponse> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.delete<
      DeleteWebhookResponse | ApiErrorResponse
    >(`/users/feedback/webhooks/${webhookId}`);

    return extractResponseData(
      response.data as DeleteWebhookResponse,
      'Failed to delete webhook'
    );
  }
}

export const feedbackService = new FeedbackService();
