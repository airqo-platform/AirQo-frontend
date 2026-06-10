'use client';

import React, { useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import { PermissionGuard } from '@/shared/components';
import {
  Button,
  Card,
  EmptyState,
  LoadingState,
  PageHeading,
  toast,
} from '@/shared/components/ui';
import { AqEye, AqPlus, AqRefreshCw05 } from '@airqo/icons-react';
import { surveyService } from '@/shared/services';
import { getUserFriendlyErrorMessage, isForbiddenError } from '@/shared/utils/errorMessages';
import { AccessDenied } from '@/shared/components/AccessDenied';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import type { Survey } from '@/shared/types/api';
import {
  formatDateTime,
  formatDuration,
  getSurveyTriggerLabel,
  formatSurveyStatus,
} from './utils';

const SurveyListPage: React.FC = () => {
  const router = useRouter();

  const {
    data: surveys = [],
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR('system/surveys', () => surveyService.getActiveSurveys(), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const summary = useMemo(() => {
    const totalQuestions = surveys.reduce(
      (sum, survey) => sum + (survey.questionCount ?? survey.questions.length),
      0
    );
    const requiredQuestions = surveys.reduce(
      (sum, survey) =>
        sum +
        (survey.requiredQuestionCount ??
          survey.questions.filter(question => question.isRequired).length),
      0
    );
    const averageCompletionTime =
      surveys.length > 0
        ? Math.round(
            surveys.reduce((sum, survey) => sum + survey.timeToComplete, 0) /
              surveys.length
          )
        : 0;
    const activeSurveys = surveys.filter(survey => survey.isActive !== false);

    return {
      activeSurveys: activeSurveys.length,
      totalQuestions,
      requiredQuestions,
      averageCompletionTime,
    };
  }, [surveys]);

  const handleOpenSurvey = useCallback(
    (surveyId: string) => {
      router.push(`/system/surveys/${surveyId}`);
    },
    [router]
  );

  const handleCreateSurvey = useCallback(() => {
    router.push('/system/surveys/new');
  }, [router]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(
        () => mutate(),
        'Survey list refreshed successfully'
      );
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  }, [mutate]);

  const renderSurveyCard = useCallback(
    (survey: Survey) => {
      const status = formatSurveyStatus(
        survey.isActive,
        survey.surveyStatus,
        survey.isExpired
      );

      const questionCount = survey.questionCount ?? survey.questions.length;
      const requiredCount =
        survey.requiredQuestionCount ??
        survey.questions.filter(question => question.isRequired).length;

      return (
        <Card
          key={survey._id}
          className="flex h-full flex-col border-border/70 bg-card/90 p-5 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md"
        >
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <div className="flex flex-wrap gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${status.tone}`}
                >
                  {status.label}
                </span>
                <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  {questionCount} question{questionCount === 1 ? '' : 's'}
                </span>
                <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  {requiredCount} required
                </span>
              </div>

              <div>
                <h3 className="truncate text-lg font-semibold text-foreground">
                  {survey.title}
                </h3>
                <p className="mt-1 line-clamp-3 text-sm leading-6 text-muted-foreground">
                  {survey.description || 'No description provided.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-5 grid gap-3 rounded-2xl border border-border bg-muted/15 p-4 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Estimated time
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatDuration(survey.timeToComplete)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Updated
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatDateTime(survey.updatedAt)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Created
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatDateTime(survey.createdAt)}
              </p>
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Expires
              </p>
              <p className="mt-1 text-sm font-medium text-foreground">
                {formatDateTime(survey.expiresAt)}
              </p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Trigger: {getSurveyTriggerLabel(survey.trigger)}
            </p>

            <Button
              Icon={AqEye}
              iconPosition="start"
              variant="outlined"
              onClick={() => handleOpenSurvey(survey._id)}
            >
              View details
            </Button>
          </div>
        </Card>
      );
    },
    [handleOpenSurvey]
  );

  return (
    <PermissionGuard
      requireAirQoSuperAdmin={true}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need the AIRQO_SUPER_ADMIN role with an @airqo.net email to manage surveys."
    >
      {isForbiddenError(error) ? (
        <AccessDenied
          title="Access Denied"
          message="You do not have the required permissions to view surveys."
        />
      ) : (
      <div className="space-y-6">
        <PageHeading
          title="Survey Management"
          subtitle="Review active surveys, inspect question sets, and open a survey to analyze responses and update its configuration."
          action={
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outlined"
                Icon={AqRefreshCw05}
                onClick={handleRefresh}
                loading={isLoading || isValidating}
              >
                Refresh
              </Button>
              <Button Icon={AqPlus} onClick={handleCreateSurvey}>
                Create survey
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Active surveys</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {summary.activeSurveys}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Available to the system team right now.
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total questions</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {summary.totalQuestions}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Across all active surveys.
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Required questions</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {summary.requiredQuestions}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Must be answered before completion.
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">
              Avg. completion time
            </p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {formatDuration(summary.averageCompletionTime)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Average across active surveys.
            </p>
          </Card>
        </div>

        {isLoading ? (
          <LoadingState
            className="min-h-[400px]"
            text="Loading active surveys..."
          />
        ) : error ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              {getUserFriendlyErrorMessage(error)}
            </p>
          </Card>
        ) : surveys.length === 0 ? (
          <EmptyState
            title="No active surveys"
            description="There are no active surveys to review right now."
            action={{
              label: 'Create survey',
              onClick: handleCreateSurvey,
              variant: 'filled',
            }}
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {surveys.map(renderSurveyCard)}
          </div>
        )}
      </div>
      )}
    </PermissionGuard>
  );
};

export default SurveyListPage;
