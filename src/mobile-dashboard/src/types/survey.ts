export interface Survey {
  id: string;
  title: string;
  description?: string;
  questions: Question[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  questionCount?: number;
}

export interface Question {
  id: string;
  type: 'text' | 'multiple-choice' | 'single-choice' | 'rating' | 'boolean';
  text: string;
  required: boolean;
  options?: string[];
  min?: number;
  max?: number;
  placeholder?: string;
}

export interface SurveyResponse {
  id: string;
  surveyId: string;
  responses: Response[];
  completedAt: string;
  userId?: string;
}

export interface Response {
  questionId: string;
  answer: string | string[] | number | boolean;
}

export interface SurveyStats {
  surveyId: string;
  totalResponses: number;
  completionRate: number;
  averageTime: number;
  questionStats: QuestionStats[];
}

export interface QuestionStats {
  questionId: string;
  responseCount: number;
  averageRating?: number;
  mostCommonAnswer?: string;
  answerDistribution?: Record<string, number>;
}
