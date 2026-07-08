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

export type CleanAirForum2026GuestSessionResponse = {
  success: boolean;
  guest_id: string;
  display_name?: string;
  created_at?: string;
};
