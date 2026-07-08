import type { CleanAirForum2026LessonResponse } from '@/features/clean-air-forum-2026/types/learn';

export type CleanAirForum2026GuestSession = {
  deviceId: string;
  guestId: string | null;
  displayName: string | null;
};

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
