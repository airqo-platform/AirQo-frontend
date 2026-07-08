'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

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
import { submitCleanAirForum2026LessonCompletion } from '@/features/clean-air-forum-2026/lib/learn-progress';
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
  const [submissionStatus, setSubmissionStatus] = useState<
    'idle' | 'submitting' | 'submitted' | 'error'
  >('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] =
    useState<CleanAirForum2026LessonProgressResponse | null>(null);

  const lessonActivities = quizSetup.lessonPayload?.lesson.activities;
  const activities = lessonActivities ?? EMPTY_ACTIVITIES;
  const currentActivity = activities[currentQuestionIndex] ?? null;
  const totalQuestions = activities.length;
  const isLastQuestion = currentQuestionIndex === totalQuestions - 1;
  const selectedOptionIndex =
    currentActivity && answersByActivityId[currentActivity.id]
      ? answersByActivityId[currentActivity.id].selectedIndex
      : null;
  const quizAttempts = Object.values(answersByActivityId);
  const correctAnswersCount = quizAttempts.filter(
    (answer) => answer.isCorrect,
  ).length;

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

  const handleSubmitQuiz = async () => {
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
      .map((activity) => answersByActivityId[activity.id])
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

  if (
    quizSetup.status !== 'ready' ||
    !quizSetup.lessonPayload ||
    !currentActivity
  ) {
    return <Screen className="caf-2026-screen" />;
  }

  return (
    <Screen className="caf-2026-screen">
      <section className="mx-auto flex min-h-screen w-full max-w-[1600px] px-5 py-10 sm:px-8 sm:py-12 md:px-12 lg:px-16 lg:py-16">
        <div className="flex w-full flex-col items-center">
          <div className="relative w-[min(84vw,34rem)] sm:w-[min(62vw,34rem)] md:w-[min(46vw,34rem)] lg:w-[30rem] xl:w-[34.125rem]">
            <Image
              src="/clean-air-forum-2026/logos/airqo-clean-air-forum-pretoria-2026-logo.svg"
              alt="Africa CLEAN Air Forum Pretoria 2026"
              width={546}
              height={94}
              priority
              className="h-auto w-full"
            />
          </div>

          <div className="mt-16 flex w-full max-w-5xl flex-col items-center gap-8 sm:mt-20 sm:gap-10">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[#0d4f57]/72">
              Question {currentQuestionIndex + 1} of {totalQuestions}
            </p>
            <h1 className="w-full max-w-none text-balance text-left text-[clamp(1.2rem,2vw,2.1rem)] font-bold leading-[1.12] tracking-[-0.025em] text-[#072b31] md:text-center">
              {currentActivity.payload.question}
            </h1>

            <div className="flex w-full max-w-4xl flex-col gap-4">
              {currentActivity.payload.options.map((option, optionIndex) => {
                const isSelected = selectedOptionIndex === optionIndex;

                return (
                  <button
                    key={`${currentActivity.id}-${optionIndex}`}
                    type="button"
                    onClick={() =>
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
                      }))
                    }
                    className={[
                      'rounded-[1.5rem] px-5 py-4 text-left transition-colors sm:px-6 sm:py-5',
                      isSelected
                        ? 'bg-[var(--caf-2026-interactive)] text-white'
                        : 'bg-white/55 text-[#072b31]',
                    ].join(' ')}
                  >
                    <p className="text-lg font-semibold leading-[1.2] tracking-[-0.02em] sm:text-[1.45rem]">
                      {option.trim()}
                    </p>
                  </button>
                );
              })}
            </div>

            {selectedOptionIndex !== null && !isLastQuestion ? (
              <Button
                className="rounded-[1.4rem] px-7 py-3 text-base font-semibold"
                onClick={() =>
                  setCurrentQuestionIndex((questionIndex) => questionIndex + 1)
                }
              >
                Next Question
              </Button>
            ) : null}

            {selectedOptionIndex !== null && isLastQuestion ? (
              <Button
                className="rounded-[1.4rem] px-7 py-3 text-base font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleSubmitQuiz}
                disabled={submissionStatus === 'submitting'}
              >
                {submissionStatus === 'submitting'
                  ? 'Submitting Quiz...'
                  : submissionStatus === 'submitted'
                    ? 'Quiz Submitted'
                    : 'Submit Quiz'}
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
