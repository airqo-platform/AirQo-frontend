'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

import Button from '@/components/clean-air-forum-2026/Button';
import Screen from '@/components/clean-air-forum-2026/Screen';
import {
  CLEAN_AIR_FORUM_2026_COURSE_ID,
  CLEAN_AIR_FORUM_2026_LESSON_ID,
} from '@/features/clean-air-forum-2026/constants/learn';
import {
  CLEAN_AIR_FORUM_2026_QUIZ_ANSWERS_STORAGE_KEY,
  CLEAN_AIR_FORUM_2026_QUIZ_INDEX_STORAGE_KEY,
} from '@/features/clean-air-forum-2026/constants/storage';
import { useCleanAirForumQuizSetup } from '@/features/clean-air-forum-2026/hooks/useCleanAirForumQuizSetup';
import {
  fetchCleanAirForum2026LeaderboardPosition,
  submitCleanAirForum2026LessonCompletion,
} from '@/features/clean-air-forum-2026/lib/learn-progress';
import type {
  CleanAirForum2026LessonActivity,
  CleanAirForum2026LessonProgressResponse,
} from '@/features/clean-air-forum-2026/types/learn';
import type { CleanAirForum2026QuizAnswerMap } from '@/features/clean-air-forum-2026/types/quiz';

const EMPTY_ACTIVITIES: CleanAirForum2026LessonActivity[] = [];

export default function QuizScreen() {
  const quizSetup = useCleanAirForumQuizSetup();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answersByActivityId, setAnswersByActivityId] =
    useState<CleanAirForum2026QuizAnswerMap>({});
  const [screenStage, setScreenStage] = useState<'questions' | 'results'>(
    'questions',
  );
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'submitting' | 'submitted' | 'error'
  >('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] =
    useState<CleanAirForum2026LessonProgressResponse | null>(null);
  const [leaderboardPosition, setLeaderboardPosition] = useState<number | null>(
    null,
  );
  const [leaderboardStatus, setLeaderboardStatus] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >('idle');
  const revealTimeoutRef = useRef<number | null>(null);
  const [revealedActivityId, setRevealedActivityId] = useState<string | null>(
    null,
  );

  const lessonActivities = quizSetup.lessonPayload?.lesson.activities;
  const activities = lessonActivities ?? EMPTY_ACTIVITIES;
  const currentActivity = activities[currentQuestionIndex] ?? null;
  const totalQuestions = activities.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const selectedOptionIndex =
    currentActivity && answersByActivityId[currentActivity.id]
      ? answersByActivityId[currentActivity.id].selectedIndex
      : null;
  const selectedAnswer =
    currentActivity && answersByActivityId[currentActivity.id]
      ? answersByActivityId[currentActivity.id]
      : null;
  const hasSelectedCurrentQuestion = selectedOptionIndex !== null;
  const correctOptionIndex = currentActivity?.payload.correct_index ?? null;
  const isRevealingCurrentQuestion = revealedActivityId === currentActivity?.id;
  const quizAttempts = Object.values(answersByActivityId);
  const correctAnswersCount = quizAttempts.filter(
    (answer) => answer.isCorrect,
  ).length;

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (quizSetup.status !== 'ready' || !quizSetup.lessonPayload) {
      return;
    }

    console.group('[CAF 2026] Quiz setup ready');
    console.info('course_id', CLEAN_AIR_FORUM_2026_COURSE_ID);
    console.info('lesson_id', CLEAN_AIR_FORUM_2026_LESSON_ID);
    console.info('guest_session', quizSetup.guestSession);
    console.info('hydrated_from_cache', quizSetup.hydratedFromCache);
    console.log(quizSetup.lessonPayload);
    console.groupEnd();
  }, [
    quizSetup.guestSession,
    quizSetup.hydratedFromCache,
    quizSetup.lessonPayload,
    quizSetup.status,
  ]);

  useEffect(() => {
    if (quizSetup.status !== 'error' || !quizSetup.errorMessage) {
      return;
    }

    console.error('[CAF 2026] Quiz setup failed', quizSetup.errorMessage);
  }, [quizSetup.errorMessage, quizSetup.status]);

  useEffect(() => {
    if (quizSetup.status !== 'ready' || activities.length === 0) {
      return;
    }

    const storedIndex = window.sessionStorage.getItem(
      CLEAN_AIR_FORUM_2026_QUIZ_INDEX_STORAGE_KEY,
    );
    const storedAnswers = window.sessionStorage.getItem(
      CLEAN_AIR_FORUM_2026_QUIZ_ANSWERS_STORAGE_KEY,
    );

    if (storedIndex) {
      const parsedIndex = Number.parseInt(storedIndex, 10);
      if (Number.isFinite(parsedIndex)) {
        setCurrentQuestionIndex(
          Math.min(Math.max(parsedIndex, 0), activities.length - 1),
        );
      }
    }

    if (storedAnswers) {
      try {
        const parsedAnswers = JSON.parse(
          storedAnswers,
        ) as CleanAirForum2026QuizAnswerMap;
        const validActivityIds = new Set(
          activities.map((activity) => activity.id),
        );
        const filteredAnswers = Object.fromEntries(
          Object.entries(parsedAnswers).filter(([activityId]) =>
            validActivityIds.has(activityId),
          ),
        ) as CleanAirForum2026QuizAnswerMap;
        setAnswersByActivityId(filteredAnswers);
      } catch {
        window.sessionStorage.removeItem(
          CLEAN_AIR_FORUM_2026_QUIZ_ANSWERS_STORAGE_KEY,
        );
      }
    }
  }, [activities, quizSetup.status]);

  useEffect(() => {
    if (quizSetup.status !== 'ready' || activities.length === 0) {
      return;
    }

    window.sessionStorage.setItem(
      CLEAN_AIR_FORUM_2026_QUIZ_INDEX_STORAGE_KEY,
      String(currentQuestionIndex),
    );
    window.sessionStorage.setItem(
      CLEAN_AIR_FORUM_2026_QUIZ_ANSWERS_STORAGE_KEY,
      JSON.stringify(answersByActivityId),
    );
  }, [
    activities,
    activities.length,
    answersByActivityId,
    currentQuestionIndex,
    quizSetup.status,
  ]);

  useEffect(() => {
    if (quizSetup.status !== 'ready') {
      return;
    }

    console.info('[CAF 2026] Quiz progress snapshot', {
      currentQuestionIndex,
      totalQuestions,
      answersCount: quizAttempts.length,
      correctAnswersCount,
      quizAttempts,
    });
  }, [
    correctAnswersCount,
    currentQuestionIndex,
    quizAttempts,
    quizSetup.status,
    totalQuestions,
  ]);

  useEffect(() => {
    if (
      screenStage !== 'results' ||
      !quizSetup.guestSession ||
      submissionStatus !== 'submitted'
    ) {
      return;
    }

    const guestSession = quizSetup.guestSession;
    const controller = new AbortController();

    async function loadLeaderboardPosition() {
      setLeaderboardStatus('loading');

      try {
        const leaderboard = await fetchCleanAirForum2026LeaderboardPosition(
          guestSession,
          controller.signal,
        );

        setLeaderboardPosition(leaderboard.position);
        setLeaderboardStatus('ready');

        console.group('[CAF 2026] Leaderboard position resolved');
        console.info('guest_session', guestSession);
        console.info('leaderboard_position', leaderboard.position);
        console.info('leaderboard_entry', leaderboard.matchedEntry);
        console.info('leaderboard_payload', leaderboard.payload);
        console.groupEnd();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : 'Unable to load leaderboard position.';

        setLeaderboardStatus('error');
        console.error('[CAF 2026] Leaderboard fetch failed', message);
      }
    }

    void loadLeaderboardPosition();

    return () => controller.abort();
  }, [quizSetup.guestSession, screenStage, submissionStatus]);

  const handleSubmitQuiz = async (
    submittedAnswersByActivityId: CleanAirForum2026QuizAnswerMap = answersByActivityId,
  ) => {
    if (
      quizSetup.status !== 'ready' ||
      !quizSetup.guestSession ||
      activities.length === 0 ||
      submissionStatus === 'submitting' ||
      submissionStatus === 'submitted'
    ) {
      return;
    }

    const quizAttempts = activities
      .map((activity) => submittedAnswersByActivityId[activity.id])
      .filter((answer) => Boolean(answer))
      .map((answer) => ({
        activity_id: answer.activityId,
        format: answer.format,
        selected_index: answer.selectedIndex,
        is_correct: answer.isCorrect,
      }));

    setSubmissionStatus('submitting');
    setSubmissionError(null);

    try {
      const response = await submitCleanAirForum2026LessonCompletion(
        quizSetup.guestSession,
        {
          furthest_activity_index: totalQuestions - 1,
          completed: true,
          quiz_attempts: quizAttempts,
        },
      );

      setSubmissionResult(response);
      setSubmissionStatus('submitted');
      setScreenStage('results');

      console.group('[CAF 2026] Quiz completion submitted');
      console.info('course_id', CLEAN_AIR_FORUM_2026_COURSE_ID);
      console.info('lesson_id', CLEAN_AIR_FORUM_2026_LESSON_ID);
      console.info('guest_session', quizSetup.guestSession);
      console.info('submission_payload', {
        furthest_activity_index: totalQuestions - 1,
        completed: true,
        quiz_attempts: quizAttempts,
      });
      console.info('submission_response', response);
      console.groupEnd();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unable to submit quiz';

      setSubmissionStatus('error');
      setSubmissionError(message);
      console.error('[CAF 2026] Quiz completion failed', message);
    }
  };

  const handleSubmitCurrentQuestion = () => {
    if (!currentActivity || selectedOptionIndex === null || isRevealingCurrentQuestion) {
      return;
    }

    const updatedAnswersByActivityId = {
      ...answersByActivityId,
      [currentActivity.id]: {
        activityId: currentActivity.id,
        format: currentActivity.payload.format,
        selectedIndex: selectedOptionIndex,
        isCorrect: selectedOptionIndex === currentActivity.payload.correct_index,
      },
    };

    setAnswersByActivityId(updatedAnswersByActivityId);
    setRevealedActivityId(currentActivity.id);

    revealTimeoutRef.current = window.setTimeout(() => {
      setRevealedActivityId(null);

      if (isLastQuestion) {
        void handleSubmitQuiz(updatedAnswersByActivityId);
        return;
      }

      setCurrentQuestionIndex((questionIndex) => questionIndex + 1);
    }, 1200);
  };

  if (
    quizSetup.status !== 'ready' ||
    !quizSetup.lessonPayload ||
    !currentActivity
  ) {
    return <Screen className="caf-2026-screen" />;
  }

  if (screenStage === 'results') {
    return (
      <Screen className="caf-2026-screen">
        <section className="mx-auto flex min-h-screen w-full max-w-[1600px] px-5 py-10 sm:px-8 sm:py-12 md:px-12 lg:px-16 lg:py-16">
          <div className="flex w-full flex-col items-center">
            <div className="flex w-full justify-center">
              <div className="flex w-full max-w-[75.125rem] items-center justify-between gap-4 px-1 sm:px-0">
                <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                  <div className="relative w-fit shrink-0">
                    <Image
                      src="/clean-air-forum-2026/logos/airqo-clean-air-forum-pretoria-2026-leaderboard-logo.svg?v=20260709"
                      alt="AirQo"
                      width={90.95}
                      height={61.53}
                      priority
                      className="h-auto w-auto"
                    />
                  </div>

                  <h1 className="min-w-0 flex-1 text-balance text-[clamp(1.1rem,4vw,2.95rem)] font-bold leading-[0.96] tracking-[-0.02em] text-white">
                    Air Quality Quiz
                  </h1>
                </div>

                <div className="hidden shrink-0 text-left text-white md:block">
                  <p className="text-[18.49px] font-bold leading-none tracking-[-0.02em]">
                    Africa clean air forum
                  </p>
                  <p className="mt-1 text-[18.49px] font-normal italic leading-none tracking-[-0.02em]">
                    Pretoria 2026
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-16 flex w-full max-w-4xl flex-col items-center gap-8 text-center sm:mt-20 sm:gap-10">
              <div className="space-y-3">
                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0d4f57]/72">
                  Results Revealed
                </p>
                <h1 className="text-balance text-[clamp(1.9rem,4vw,4rem)] font-bold leading-[0.98] tracking-[-0.04em] text-[#072b31]">
                  {quizSetup.guestSession?.displayName || 'Guest participant'}
                </h1>
              </div>

              <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] bg-white/30 px-5 py-5 text-left text-[#072b31] backdrop-blur-[10px]">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0d4f57]/72">
                    Points Earned
                  </p>
                  <p className="mt-3 text-[clamp(2.2rem,4vw,3.6rem)] font-bold leading-none tracking-[-0.04em]">
                    {submissionResult?.points_earned ?? 0}
                  </p>
                </div>

                <div className="rounded-[1.5rem] bg-white/30 px-5 py-5 text-left text-[#072b31] backdrop-blur-[10px]">
                  <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#0d4f57]/72">
                    Leaderboard Position
                  </p>
                  <p className="mt-3 text-[clamp(2.2rem,4vw,3.6rem)] font-bold leading-none tracking-[-0.04em]">
                    {leaderboardStatus === 'loading'
                      ? '...'
                      : leaderboardPosition
                        ? `#${leaderboardPosition}`
                        : '--'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Screen>
    );
  }

  return (
    <Screen className="caf-2026-screen">
      <section className="caf-2026-quiz-stage mx-auto flex min-h-screen w-full max-w-[1600px] px-5 py-10 sm:px-8 sm:py-12 md:px-12 lg:px-16 lg:py-16">
        <div className="caf-2026-quiz-shell flex w-full flex-col items-center">
          <div className="flex w-full justify-center">
            <div className="flex w-full max-w-[75.125rem] items-center justify-between gap-4 px-1 sm:px-0">
              <div className="flex min-w-0 items-center gap-3 sm:gap-5">
                <div className="relative w-fit shrink-0">
                  <Image
                    src="/clean-air-forum-2026/logos/airqo-clean-air-forum-pretoria-2026-leaderboard-logo.svg?v=20260709"
                    alt="AirQo"
                    width={90.95}
                    height={61.53}
                    priority
                    className="h-auto w-auto"
                  />
                </div>

                <h1 className="min-w-0 flex-1 text-balance text-[clamp(1.1rem,4vw,2.95rem)] font-bold leading-[0.96] tracking-[-0.02em] text-white">
                  Air Quality Quiz
                </h1>
              </div>

              <div className="hidden shrink-0 text-left text-white md:block">
                <p className="text-[18.49px] font-bold leading-none tracking-[-0.02em]">
                  Africa clean air forum
                </p>
                <p className="mt-1 text-[18.49px] font-normal italic leading-none tracking-[-0.02em]">
                  Pretoria 2026
                </p>
              </div>
            </div>
          </div>

          <div className="caf-2026-quiz-content mt-16 flex w-full max-w-5xl flex-col items-center gap-8 sm:mt-20 sm:gap-10">
            <div
              key={currentActivity.id}
              className="caf-2026-quiz-question-block animate-fade-in flex w-full flex-col items-center gap-8 sm:gap-10"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0d4f57]/72">
                Question {currentQuestionIndex + 1} of {totalQuestions}
              </p>
              <h1 className="caf-2026-quiz-question w-full max-w-none text-balance text-left text-[clamp(1.2rem,2vw,2.1rem)] font-bold leading-[1.12] tracking-[-0.025em] text-[#072b31] md:text-center">
                {currentActivity.payload.question}
              </h1>

              <div className="caf-2026-quiz-options flex w-full max-w-4xl flex-col gap-4">
                {currentActivity.payload.options.map((option, optionIndex) => {
                  const isSelected = selectedOptionIndex === optionIndex;
                  const isCorrectOption = correctOptionIndex === optionIndex;
                  const isSelectedWrong =
                    isRevealingCurrentQuestion &&
                    isSelected &&
                    selectedAnswer?.isCorrect === false;
                  const isSelectedCorrect =
                    isRevealingCurrentQuestion &&
                    isSelected &&
                    selectedAnswer?.isCorrect === true;

                  const optionStateClass = isRevealingCurrentQuestion
                    ? isSelectedCorrect || isCorrectOption
                      ? 'bg-[#0d8f6f] text-white'
                      : isSelectedWrong
                        ? 'bg-[#b93815] text-white'
                        : 'bg-white text-[#072b31] opacity-72'
                    : isSelected
                      ? 'bg-[var(--caf-2026-interactive)] text-white'
                      : 'bg-white text-[#072b31]';

                  return (
                    <button
                      key={`${currentActivity.id}-${optionIndex}`}
                      type="button"
                      onClick={() => {
                        if (isRevealingCurrentQuestion) {
                          return;
                        }

                        setAnswersByActivityId((currentAnswers) => ({
                          ...currentAnswers,
                          [currentActivity.id]: {
                            activityId: currentActivity.id,
                            format: currentActivity.payload.format,
                            selectedIndex: optionIndex,
                            isCorrect:
                              optionIndex ===
                              currentActivity.payload.correct_index,
                          },
                        }));
                      }}
                      className={[
                        'caf-2026-quiz-option rounded-[1.5rem] px-5 py-4 text-left transition-colors sm:px-6 sm:py-5',
                        optionStateClass,
                      ].join(' ')}
                    >
                      <p className="caf-2026-quiz-option-label text-lg font-semibold leading-[1.2] tracking-[-0.02em] sm:text-[1.45rem]">
                        {option.trim()}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {hasSelectedCurrentQuestion ? (
              <Button
                className="caf-2026-quiz-action rounded-[1.4rem] px-7 py-3 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleSubmitCurrentQuestion}
                disabled={isRevealingCurrentQuestion || submissionStatus === 'submitting'}
              >
                {isRevealingCurrentQuestion
                  ? selectedAnswer?.isCorrect
                    ? 'Correct'
                    : 'Showing Answer'
                  : isLastQuestion
                    ? 'Finish Quiz'
                    : 'Submit Answer'}
              </Button>
            ) : null}

            {submissionStatus === 'error' && submissionError ? (
              <p className="text-sm font-medium text-[#8a1f1f]">
                {submissionError}
              </p>
            ) : null}

            {submissionStatus === 'submitted' && submissionResult ? (
              <p className="text-sm font-medium text-[#0d4f57]">
                Submission recorded: {submissionResult.points_earned} points
                earned.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </Screen>
  );
}
