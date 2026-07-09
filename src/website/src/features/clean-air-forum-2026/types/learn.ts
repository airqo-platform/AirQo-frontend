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

export type CleanAirForum2026LeaderboardEntry = {
  rank?: number;
  position?: number;
  points?: number;
  total_points?: number;
  display_name?: string;
  name?: string;
  guest_id?: string;
  device_id?: string;
  is_me?: boolean;
  current_stage?: {
    index?: number;
    name?: string;
  } | null;
  avatar?: string;
  emoji?: string;
};

export type CleanAirForum2026LeaderboardResponse = {
  success?: boolean;
  leaderboard?: CleanAirForum2026LeaderboardEntry[];
  entries?: CleanAirForum2026LeaderboardEntry[];
  results?: CleanAirForum2026LeaderboardEntry[];
  data?: CleanAirForum2026LeaderboardEntry[];
  current_user_rank?: number | null;
  my_rank?: number | null;
  your_rank?: number | null;
  rank?: number | null;
};
