'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  Dialog,
  LoadingState,
  PageHeading,
  toast,
} from '@/shared/components/ui';
import { ServerSideTable } from '@/shared/components/ui/server-side-table';
import { AqArrowLeft, AqEdit05, AqEye, AqRefreshCw05, AqTrash01 } from '@airqo/icons-react';
import { surveyService } from '@/shared/services';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import type { Survey, SurveyResponseItem } from '@/shared/types/api';
import SurveyEditorDialog from '../components/SurveyEditorDialog';
import SurveyResponseDialog from '../components/SurveyResponseDialog';
import {
  formatDateTime,
  formatDuration,
  formatQuestionTypeLabel,
  formatSurveyStatus,
  getQuestionDistribution,
  getSurveyTriggerLabel,
  getTopAnswerEntries,
  getTotalAnswerCount,
} from '../utils';

type SurveyResponseRow = SurveyResponseItem & {
  id: string;
  [key: string]: unknown;
};

const RESPONSE_STATUS_TONES: Record<string, string> = {
  completed:
    'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  skipped:
    'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  partial:
    'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300',
};

const getResponseStatusTone = (value?: string) => {
  const normalized = String(value || '').toLowerCase();
  return (
    RESPONSE_STATUS_TONES[normalized] ||
    'bg-slate-100 text-slate-700 dark:bg-slate-950/40 dark:text-slate-300'
  );
};

const getRespondentLabel = (response: SurveyResponseItem) => {
  if (response.user?.email) {
    return response.user.email;
  }

  if (response.userId) {
    return response.userId;
  }

  return response.isGuest ? 'Guest respondent' : 'Unknown respondent';
};

const SurveyDetailsPage: React.FC = () => {
  const params = useParams<{ surveyId: string }>();
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const surveyId = params?.surveyId;

  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] =
    useState<SurveyResponseItem | null>(null);

  const {
    data: survey,
    error: surveyError,
    isLoading: surveyLoading,
    mutate: mutateSurvey,
  } = useSWR(
    surveyId ? `system/surveys/${surveyId}` : null,
    () => surveyService.getSurveyById(surveyId as string),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const {
    data: stats,
    error: statsError,
    isLoading: statsLoading,
    mutate: mutateStats,
  } = useSWR(
    surveyId ? `system/surveys/stats/${surveyId}` : null,
    () => surveyService.getSurveyStats(surveyId as string),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  const {
    data: responses = [],
    error: responsesError,
    isLoading: responsesLoading,
    mutate: mutateResponses,
  } = useSWR('system/surveys/responses', () => surveyService.getSurveyResponses(), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  useEffect(() => {
    if (!surveyId) {
      router.push('/system/surveys');
    }
  }, [router, surveyId]);

  const currentSurvey = survey as Survey | undefined;

  const filteredResponses = useMemo(() => {
    return responses
      .filter(response => response.surveyId === surveyId)
      .slice()
      .sort((left, right) => {
        const leftTime = new Date(
          left.completedAt || left.createdAt
        ).getTime();
        const rightTime = new Date(
          right.completedAt || right.createdAt
        ).getTime();
        return rightTime - leftTime;
      });
  }, [responses, surveyId]);

  const responseRows = useMemo<SurveyResponseRow[]>(
    () =>
      filteredResponses.map(response => ({
        ...response,
        id: response._id,
      })),
    [filteredResponses]
  );

  const overviewSummary = useMemo(() => {
    if (!currentSurvey) {
      return [];
    }

    return [
      {
        label: 'Question count',
        value: currentSurvey.questionCount ?? currentSurvey.questions.length,
      },
      {
        label: 'Required questions',
        value:
          currentSurvey.requiredQuestionCount ??
          currentSurvey.questions.filter(question => question.isRequired).length,
      },
      {
        label: 'Estimated time',
        value: formatDuration(currentSurvey.timeToComplete),
      },
      {
        label: 'Survey status',
        value: formatSurveyStatus(
          currentSurvey.isActive,
          currentSurvey.surveyStatus,
          currentSurvey.isExpired
        ).label,
      },
    ];
  }, [currentSurvey]);

  const refreshAll = useCallback(async () => {
    await Promise.allSettled([
      mutateSurvey(),
      mutateStats(),
      mutateResponses(),
      globalMutate('system/surveys'),
    ]);
  }, [globalMutate, mutateResponses, mutateStats, mutateSurvey]);

  const handleBack = useCallback(() => {
    router.push('/system/surveys');
  }, [router]);

  const handleRefresh = useCallback(() => {
    void refreshAll();
  }, [refreshAll]);

  const handleSaved = useCallback(
    async () => {
      await refreshAll();
    },
    [refreshAll]
  );

  const handleEditClick = useCallback(() => {
    setIsEditorOpen(true);
  }, []);

  const handleDeleteSurvey = useCallback(async () => {
    if (!currentSurvey) {
      return;
    }

    try {
      await surveyService.deleteSurvey(currentSurvey._id);
      toast.success('Survey deleted successfully');
      setDeleteDialogOpen(false);
      await Promise.allSettled([
        globalMutate('system/surveys'),
        mutateSurvey(),
        mutateStats(),
        mutateResponses(),
      ]);
      router.push('/system/surveys');
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  }, [
    currentSurvey,
    globalMutate,
    mutateResponses,
    mutateStats,
    mutateSurvey,
    router,
  ]);

  const columns = useMemo(
    () => [
      {
        key: 'respondent',
        label: 'Respondent',
        minWidth: '220px',
        render: (_value: unknown, item: SurveyResponseRow) => (
          <div className="space-y-1">
            <p className="font-medium text-foreground">{getRespondentLabel(item)}</p>
            <p className="text-xs text-muted-foreground">
              {item.isGuest ? 'Guest response' : item.user ? 'Registered user' : 'No profile'}
            </p>
          </div>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        minWidth: '130px',
        render: (value: unknown) => (
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${getResponseStatusTone(
              String(value || '')
            )}`}
          >
            {formatQuestionTypeLabel(String(value || 'unknown'))}
          </span>
        ),
      },
      {
        key: 'answers',
        label: 'Answers',
        minWidth: '90px',
        render: (_value: unknown, item: SurveyResponseRow) => (
          <span className="text-sm font-medium text-foreground">
            {item.answerCount ?? item.answers.length}
          </span>
        ),
      },
      {
        key: 'timeToComplete',
        label: 'Time spent',
        minWidth: '120px',
        render: (value: unknown) => (
          <span className="text-sm text-muted-foreground">
            {formatDuration(value as number | null | undefined)}
          </span>
        ),
      },
      {
        key: 'submitted',
        label: 'Submitted',
        minWidth: '180px',
        render: (_value: unknown, item: SurveyResponseRow) => (
          <span className="text-sm text-muted-foreground">
            {formatDateTime(item.completedAt || item.createdAt)}
          </span>
        ),
      },
      {
        key: 'actions',
        label: 'Actions',
        minWidth: '120px',
        render: (_value: unknown, item: SurveyResponseRow) => (
          <Button
            variant="ghost"
            size="sm"
            Icon={AqEye}
            iconPosition="start"
            onClick={() => setSelectedResponse(item)}
          >
            View
          </Button>
        ),
      },
    ],
    []
  );

  const isInitialLoading = surveyLoading;

  if (isInitialLoading) {
    return (
      <PermissionGuard
        requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
        accessDeniedTitle="Access Restricted"
        accessDeniedMessage="You need system administration permissions to manage surveys."
      >
        <LoadingState
          className="min-h-[calc(100vh-220px)]"
          text="Loading survey details..."
        />
      </PermissionGuard>
    );
  }

  if (surveyError || !currentSurvey) {
    return (
      <PermissionGuard
        requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
        accessDeniedTitle="Access Restricted"
        accessDeniedMessage="You need system administration permissions to manage surveys."
      >
        <div className="space-y-6">
          <Button variant="ghost" Icon={AqArrowLeft} onClick={handleBack}>
            Back to surveys
          </Button>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              {surveyError
                ? getUserFriendlyErrorMessage(surveyError)
                : 'Survey not found.'}
            </p>
          </Card>
        </div>
      </PermissionGuard>
    );
  }

  const status = formatSurveyStatus(
    currentSurvey.isActive,
    currentSurvey.surveyStatus,
    currentSurvey.isExpired
  );
  const triggerLabel = getSurveyTriggerLabel(currentSurvey.trigger);

  return (
    <PermissionGuard
      requiredPermissions={['SYSTEM_ADMIN', 'SUPER_ADMIN']}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administration permissions to manage surveys."
    >
      <div className="space-y-6">
        <div className="flex justify-start">
          <Button variant="ghost" Icon={AqArrowLeft} onClick={handleBack}>
            Back
          </Button>
        </div>

        <PageHeading
          title={currentSurvey.title}
          subtitle={currentSurvey.description}
          action={
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                variant="outlined"
                Icon={AqRefreshCw05}
                onClick={handleRefresh}
                loading={surveyLoading || statsLoading || responsesLoading}
              >
                Refresh
              </Button>
              <Button
                variant="outlined"
                Icon={AqEdit05}
                onClick={handleEditClick}
              >
                Edit survey
              </Button>
              <Button
                variant="outlined"
                Icon={AqTrash01}
                onClick={() => setDeleteDialogOpen(true)}
                className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:hover:bg-red-950/40"
              >
                Delete
              </Button>
            </div>
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.tone}`}
            >
              {status.label}
            </span>
            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
              {currentSurvey.questionCount ?? currentSurvey.questions.length}{' '}
              questions
            </span>
            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
              {formatDuration(currentSurvey.timeToComplete)}
            </span>
            <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
              Expires {formatDateTime(currentSurvey.expiresAt)}
            </span>
          </div>
        </PageHeading>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Survey overview
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Basic configuration and lifecycle details.
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {triggerLabel}
                </span>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {overviewSummary.map(item => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-border bg-muted/15 p-4"
                  >
                    <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
                <div className="rounded-xl border border-border bg-muted/15 p-4 md:col-span-2">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Dates
                  </p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Created</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {formatDateTime(currentSurvey.createdAt)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Updated</p>
                      <p className="mt-1 text-sm font-medium text-foreground">
                        {formatDateTime(currentSurvey.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Questions
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The survey structure and the strongest answer patterns.
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  {currentSurvey.questions.length} total
                </span>
              </div>

              <div className="mt-5 space-y-4">
                {currentSurvey.questions.length > 0 ? (
                  currentSurvey.questions.map((question, index) => {
                    const distribution = getQuestionDistribution(
                      stats?.answerDistribution,
                      question.id
                    );
                    const topAnswers = getTopAnswerEntries(distribution);
                    const maxCount = topAnswers[0]?.[1] || 0;
                    const totalAnswers = getTotalAnswerCount(distribution);

                    return (
                      <div
                        key={question.id}
                        className="rounded-2xl border border-border bg-background p-4 shadow-sm"
                      >
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                                Question {index + 1}
                              </span>
                              <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                                {formatQuestionTypeLabel(question.type)}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                                  question.isRequired
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-950/40 dark:text-slate-300'
                                }`}
                              >
                                {question.isRequired ? 'Required' : 'Optional'}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-foreground">
                              {question.question}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Question ID: {question.id}
                            </p>
                          </div>

                          <div className="min-w-0 rounded-xl border border-border bg-muted/15 p-4 lg:w-[42%]">
                            {question.type === 'multipleChoice' &&
                            question.options.length > 0 ? (
                              <div className="space-y-2">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  Options
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {question.options.map(option => (
                                    <span
                                      key={option}
                                      className="rounded-full bg-background px-2.5 py-1 text-xs font-medium text-foreground"
                                    >
                                      {option}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            ) : question.type === 'rating' ? (
                              <div className="space-y-2">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  Rating range
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                  {question.minValue ?? '1'} to {question.maxValue ?? '5'}
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  Response format
                                </p>
                                <p className="text-sm font-medium text-foreground">
                                  Free text response
                                </p>
                              </div>
                            )}

                            {topAnswers.length > 0 && (
                              <div className="mt-4 space-y-3 rounded-xl bg-background/80 p-4">
                                <div className="flex items-center justify-between gap-3">
                                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                    Top responses
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {totalAnswers} recorded
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  {topAnswers.map(([answer, count]) => (
                                    <div key={answer} className="space-y-1">
                                      <div className="flex items-center justify-between gap-3 text-xs">
                                        <span className="truncate text-foreground">
                                          {answer}
                                        </span>
                                        <span className="text-muted-foreground">
                                          {count}
                                        </span>
                                      </div>
                                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                                        <div
                                          className="h-full rounded-full bg-primary"
                                          style={{
                                            width: `${
                                              maxCount
                                                ? Math.max(
                                                    4,
                                                    (count / maxCount) * 100
                                                  )
                                                : 0
                                            }%`,
                                          }}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-6 text-sm text-muted-foreground">
                    This survey does not have any questions yet.
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Responses
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Review individual submissions and drill into the answers.
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  {filteredResponses.length} matched
                </span>
              </div>

              <div className="mt-5">
                <ServerSideTable
                  title="Survey responses"
                  data={responseRows}
                  columns={columns}
                  loading={responsesLoading}
                  error={
                    responsesError
                      ? getUserFriendlyErrorMessage(responsesError)
                      : null
                  }
                  onRefresh={() => void mutateResponses()}
                  showClientPagination={true}
                  pageSize={10}
                  compactRows={true}
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Survey stats
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Response health and completion performance.
                  </p>
                </div>
                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  Analytics
                </span>
              </div>

              {statsLoading ? (
                <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/10 p-6 text-sm text-muted-foreground">
                  Loading survey statistics...
                </div>
              ) : statsError ? (
                <div className="mt-5 rounded-2xl border border-dashed border-border bg-muted/10 p-6 text-sm text-muted-foreground">
                  {getUserFriendlyErrorMessage(statsError)}
                </div>
              ) : stats ? (
                <div className="mt-5 space-y-4">
                  <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                    <div className="rounded-xl border border-border bg-muted/15 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Total responses
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {stats.totalResponses}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/15 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Completion rate
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {stats.completionRate}%
                      </p>
                      <div className="mt-3 h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${stats.completionRate}%` }}
                        />
                      </div>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/15 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Completed
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {stats.completedResponses}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/15 p-4">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Skipped
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {stats.skippedResponses}
                      </p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/15 p-4 sm:col-span-2 xl:col-span-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        Average completion time
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-foreground">
                        {formatDuration(stats.averageCompletionTime)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Survey controls
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Change the survey or remove it entirely.
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <Button
                  fullWidth
                  variant="outlined"
                  Icon={AqEdit05}
                  onClick={handleEditClick}
                >
                  Edit survey
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  Icon={AqTrash01}
                  onClick={() => setDeleteDialogOpen(true)}
                  className="border-red-200 text-red-600 hover:border-red-300 hover:bg-red-50 hover:text-red-700 dark:border-red-900/40 dark:hover:bg-red-950/40"
                >
                  Delete survey
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <SurveyEditorDialog
          isOpen={isEditorOpen}
          survey={currentSurvey}
          onClose={() => setIsEditorOpen(false)}
          onSaved={handleSaved}
        />

        <SurveyResponseDialog
          isOpen={Boolean(selectedResponse)}
          onClose={() => setSelectedResponse(null)}
          response={selectedResponse}
          survey={currentSurvey}
        />

        <Dialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          title="Delete survey"
          subtitle="This action permanently removes the survey and its management entry."
          size="md"
          primaryAction={{
            label: 'Delete survey',
            onClick: handleDeleteSurvey,
            className: 'bg-red-600 hover:bg-red-700 text-white',
          }}
          secondaryAction={{
            label: 'Cancel',
            onClick: () => setDeleteDialogOpen(false),
            variant: 'outlined',
          }}
        >
          <p className="text-sm leading-6 text-muted-foreground">
            Are you sure you want to delete{' '}
            <span className="font-medium text-foreground">
              {currentSurvey.title}
            </span>
            ? This cannot be undone.
          </p>
        </Dialog>
      </div>
    </PermissionGuard>
  );
};

export default SurveyDetailsPage;
