import { Survey, SurveyResponse, SurveyStats } from '@/types/survey';

class SurveyAPI {

  async getSurveys(token?: string): Promise<Survey[]> {
    const response = await fetch('/api/surveys', {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch surveys: ${response.statusText}`);
    }

    return response.json();
  }

  async getSurvey(id: string, token?: string): Promise<Survey> {
    const response = await fetch(`/api/surveys/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    });

    if (!response.ok) {
      const text = await response.text();
      let data: { message?: string };
      try { data = JSON.parse(text); } catch { data = { message: text }; }
      throw new Error(data?.message || `Failed to fetch survey: ${response.statusText}`);
    }

    return response.json();
  }

  async createSurvey(survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>, token?: string): Promise<Survey> {
    const response = await fetch('/api/surveys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
      body: JSON.stringify(survey),
    });

    if (!response.ok) {
      throw new Error(`Failed to create survey: ${response.statusText}`);
    }

    return response.json();
  }

  async updateSurvey(id: string, survey: Omit<Survey, 'id' | 'createdAt' | 'updatedAt'>, token?: string, signal?: AbortSignal): Promise<Partial<Survey>> {
    const response = await fetch(`/api/surveys/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
      body: JSON.stringify(survey),
      signal,
    });

    if (response.status === 204) return {}; // no body, treat as success

    const text = await response.text();
    let json: { message?: string };
    try { json = JSON.parse(text); } catch { json = text ? { message: text } : {}; }
    
    if (!response.ok) {
      throw new Error(json?.message || `Failed to update survey (HTTP ${response.status})`);
    }
    
    return json as Partial<Survey>; // may or may not include isActive
  }


  async deleteSurvey(id: string, token?: string): Promise<void> {
    const response = await fetch(`/api/surveys/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete survey: ${response.statusText}`);
    }
  }

  async getSurveyStats(id: string, token?: string): Promise<SurveyStats> {
    const response = await fetch(`/api/surveys/stats/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch survey stats: ${response.statusText}`);
    }

    return response.json();
  }

  async submitResponse(response: Omit<SurveyResponse, 'id' | 'completedAt'>, token?: string): Promise<SurveyResponse> {
    const responseData = await fetch('/api/surveys/responses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': token }),
      },
      body: JSON.stringify(response),
    });

    if (!responseData.ok) {
      throw new Error(`Failed to submit response: ${responseData.statusText}`);
    }

    return responseData.json();
  }

}


export const surveyApi = new SurveyAPI();


