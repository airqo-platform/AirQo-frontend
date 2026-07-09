export type CleanAirForum2026QuizPayload = {
  format: string;
  question: string;
  options: string[];
  correct_index: number;
};

export type CleanAirForum2026LessonActivity = {
  id: string;
  type: string;
  order: number;
  payload: CleanAirForum2026QuizPayload;
};

export type CleanAirForum2026Lesson = {
  id: string;
  title: string;
  completion_message: string;
  activities: CleanAirForum2026LessonActivity[];
};

export type CleanAirForum2026LessonResponse = {
  success: boolean;
  lesson: CleanAirForum2026Lesson;
};

export type CleanAirForum2026LessonQuizAttempt = {
  activity_id: string;
  format: string;
  selected_index?: number;
  is_correct: boolean;
};

export type CleanAirForum2026LessonProgressRequest = {
  furthest_activity_index: number;
  completed: boolean;
  quiz_attempts: CleanAirForum2026LessonQuizAttempt[];
};

export type CleanAirForum2026LessonProgressResponse = {
  success: boolean;
  lesson_id: string;
  stars: number;
  points_earned: number;
  total_points: number;
  current_stage: {
    index: number;
    name: string;
  };
  unlock: {
    next_lesson_id: string;
    course_complete: boolean;
  } | null;
};

export type CleanAirForum2026GuestSessionResponse = {
  success: boolean;
  guest_id: string;
  display_name?: string;
  created_at?: string;
};

export type CleanAirForum2026ProgressLinkRequest = {
  device_id: string;
  guest_id: string;
};

export type CleanAirForum2026ProgressLinkResponse = {
  success: boolean;
  user_id: string;
  merged: {
    lessons_transferred: number;
    points_transferred: number;
    courses_completed: number;
  };
};
