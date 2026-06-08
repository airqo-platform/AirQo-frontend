'use client';

import React, { useMemo } from 'react';
import { Card, Dialog } from '@/shared/components/ui';
import type { Survey, SurveyResponseItem } from '@/shared/types/api';
import {
  formatDateTime,
  formatDuration,
  formatQuestionTypeLabel,
  formatResponseValue,
} from '../utils';

interface SurveyResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  response: SurveyResponseItem | null;
  survey: Survey | null;
}

const DetailChip: React.FC<{
  label: string;
  value: React.ReactNode;
}> = ({ label, value }) => (
  <div className="rounded-xl border border-border bg-muted/20 p-4">
    <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
    </p>
    <div className="mt-2 text-sm font-medium text-foreground">{value}</div>
  </div>
);

const SurveyResponseDialog: React.FC<SurveyResponseDialogProps> = ({
  isOpen,
  onClose,
  response,
  survey,
}) => {
  const questionLookup = useMemo(() => {
    return new Map(
      survey?.questions?.map(question => [question.id, question]) || []
    );
  }, [survey?.questions]);

  const statusLabel = response?.status ? formatQuestionTypeLabel(response.status) : 'Unknown';

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Survey response"
      subtitle={
        response
          ? `${response.isGuest ? 'Guest respondent' : 'Registered respondent'}`
          : undefined
      }
      size="xl"
      maxHeight="max-h-[88vh]"
      showFooter={false}
    >
      {response ? (
        <div className="space-y-5">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <DetailChip
              label="Status"
              value={
                <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {statusLabel}
                </span>
              }
            />
            <DetailChip
              label="Respondent"
              value={
                <div className="space-y-1">
                  <p>{response.user?.email || response.userId || 'Unknown'}</p>
                  <p className="text-xs font-normal text-muted-foreground">
                    {response.user
                      ? `${response.user.firstName || ''} ${response.user.lastName || ''}`.trim() ||
                        'No user profile attached'
                      : response.isGuest
                        ? 'Guest submission'
                        : 'No user profile attached'}
                  </p>
                </div>
              }
            />
            <DetailChip
              label="Survey"
              value={survey?.title || response.survey?.title || response.surveyId}
            />
            <DetailChip
              label="Answers"
              value={response.answerCount ?? response.answers.length}
            />
            <DetailChip
              label="Completed"
              value={formatDateTime(response.completedAt || response.createdAt)}
            />
            <DetailChip
              label="Time spent"
              value={formatDuration(response.timeToComplete)}
            />
          </div>

          <Card className="p-5">
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailChip label="Device ID" value={response.deviceId || 'Not tracked'} />
              <DetailChip label="User ID" value={response.userId || 'Not tracked'} />
              <DetailChip
                label="Location tracking"
                value={response.hasLocationData ? 'Available' : 'Unavailable'}
              />
              <DetailChip
                label="Device tracking"
                value={response.hasDeviceTracking ? 'Available' : 'Unavailable'}
              />
            </div>
          </Card>

          <div className="space-y-3">
            <div>
              <h3 className="text-base font-semibold text-foreground">Answers</h3>
              <p className="text-sm text-muted-foreground">
                Answers are shown in the order they were submitted.
              </p>
            </div>

            <div className="space-y-3">
              {response.answers.length > 0 ? (
                response.answers.map(answer => {
                  const question = questionLookup.get(answer.questionId);

                  return (
                    <Card
                      key={`${answer.questionId}-${answer.answeredAt}`}
                      className="p-4"
                    >
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-foreground">
                            {question?.question || `Question ${answer.questionId}`}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <span className="rounded-full bg-muted px-2.5 py-1 font-medium text-foreground">
                              {question
                                ? formatQuestionTypeLabel(question.type)
                                : 'Unknown type'}
                            </span>
                            <span>{answer.questionId}</span>
                          </div>
                        </div>

                        <div className="min-w-0 rounded-xl bg-muted/20 px-4 py-3 text-sm text-foreground lg:max-w-[45%]">
                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Answer
                          </p>
                          <p className="mt-1 whitespace-pre-wrap break-words">
                            {formatResponseValue(answer.answer)}
                          </p>
                          <p className="mt-2 text-xs text-muted-foreground">
                            Answered at {formatDateTime(answer.answeredAt)}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              ) : (
                <Card className="p-5">
                  <p className="text-sm text-muted-foreground">
                    No answers were captured for this submission.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
};

export default SurveyResponseDialog;
