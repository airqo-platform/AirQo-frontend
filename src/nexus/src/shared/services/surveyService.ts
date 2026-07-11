/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiClient, createAuthenticatedClient } from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
import type {
  Survey,
  SurveyResponseItem,
  SurveyStats,
  CreateSurveyRequest,
  UpdateSurveyRequest,
} from '../types/api';

const extractResponseData = <T extends { success?: boolean; message?: string }>(
  data: T,
  fallbackMessage: string
): T => {
  if ('success' in data && data.success === false) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

const normalizeSurveyList = (payload: any): Survey[] => {
  if (Array.isArray(payload?.surveys)) {
    return payload.surveys as Survey[];
  }

  if (Array.isArray(payload?.data?.surveys)) {
    return payload.data.surveys as Survey[];
  }

  if (payload?.survey) {
    return [payload.survey as Survey];
  }

  if (payload?.data?.survey) {
    return [payload.data.survey as Survey];
  }

  return [];
};

const normalizeSurvey = (payload: any): Survey => {
  const surveys = normalizeSurveyList(payload);
  const survey = payload?.survey || payload?.data?.survey || surveys[0];

  if (!survey) {
    throw new Error('Survey not found');
  }

  return survey as Survey;
};

const normalizeSurveyResponses = (payload: any): SurveyResponseItem[] => {
  if (Array.isArray(payload?.responses)) {
    return payload.responses as SurveyResponseItem[];
  }

  if (Array.isArray(payload?.data?.responses)) {
    return payload.data.responses as SurveyResponseItem[];
  }

  return [];
};

const normalizeSurveyStats = (payload: any): SurveyStats => {
  const stats = payload?.stats || payload?.data?.stats;

  if (!stats) {
    throw new Error('Survey statistics not found');
  }

  return stats as SurveyStats;
};

export class SurveyService {
  private authenticatedClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async ensureAuthenticated() {
    await syncClientSessionToken(this.authenticatedClient);
  }

  async getActiveSurveys(): Promise<Survey[]> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.get<any>('/users/surveys');

    const data = extractResponseData(response.data, 'Failed to load surveys');

    return normalizeSurveyList(data);
  }

  async getSurveyById(surveyId: string): Promise<Survey> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.get<any>(
      `/users/surveys/${encodeURIComponent(surveyId)}`
    );

    const data = extractResponseData(
      response.data,
      'Failed to load survey details'
    );

    return normalizeSurvey(data);
  }

  async createSurvey(payload: CreateSurveyRequest): Promise<Survey> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.post<any>(
      '/users/surveys',
      payload
    );

    const data = extractResponseData(response.data, 'Failed to create survey');

    return normalizeSurvey(data);
  }

  async updateSurvey(
    surveyId: string,
    payload: UpdateSurveyRequest
  ): Promise<Survey> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.put<any>(
      `/users/surveys/${encodeURIComponent(surveyId)}`,
      payload
    );

    const data = extractResponseData(response.data, 'Failed to update survey');

    try {
      return normalizeSurvey(data);
    } catch {
      return this.getSurveyById(surveyId);
    }
  }

  async deleteSurvey(surveyId: string): Promise<void> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.delete<any>(
      `/users/surveys/${encodeURIComponent(surveyId)}`
    );

    extractResponseData(response.data, 'Failed to delete survey');
  }

  async getSurveyResponses(): Promise<SurveyResponseItem[]> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.get<any>(
      '/users/surveys/responses'
    );

    const data = extractResponseData(
      response.data,
      'Failed to load survey responses'
    );

    return normalizeSurveyResponses(data);
  }

  async getSurveyStats(surveyId: string): Promise<SurveyStats> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.get<any>(
      `/users/surveys/stats/${encodeURIComponent(surveyId)}`
    );

    const data = extractResponseData(
      response.data,
      'Failed to load survey statistics'
    );

    return normalizeSurveyStats(data);
  }
}

export const surveyService = new SurveyService();
