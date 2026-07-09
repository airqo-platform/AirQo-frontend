import type { CleanAirForum2026LessonResponse } from '@/features/clean-air-forum-2026/types/learn';

export type CleanAirForum2026GuestSession = {
  deviceId: string;
  guestId: string | null;
  displayName: string | null;
  avatarIcon: string | null;
  avatarImageUrl: string | null;
  username: string | null;
  eventId: string | null;
};

export type CleanAirForum2026QuizAnswer = {
  activityId: string;
  format: string;
  selectedIndex: number;
  isCorrect: boolean;
};

export type CleanAirForum2026QuizAnswerMap = Record<
  string,
  CleanAirForum2026QuizAnswer
>;

export type CleanAirForum2026QuizSetupStatus =
  | 'idle'
  | 'loading'
  | 'ready'
  | 'error';

export type CleanAirForum2026QuizSetupState = {
  status: CleanAirForum2026QuizSetupStatus;
  guestSession: CleanAirForum2026GuestSession | null;
  lessonPayload: CleanAirForum2026LessonResponse | null;
  hydratedFromCache: boolean;
  errorMessage: string | null;
};
