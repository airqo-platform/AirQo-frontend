'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AqArrowLeft, AqPlus, AqTrash01 } from '@airqo/icons-react';
import type {
  CreateSurveyRequest,
  Survey,
  UpdateSurveyRequest,
} from '@/shared/types/api';
import {
  Button,
  Card,
  Checkbox,
  Input,
  PageHeading,
  Select,
  TextInput,
  toast,
} from '@/shared/components/ui';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import {
  SURVEY_TITLE_MAX,
  SURVEY_DESCRIPTION_MAX,
  SURVEY_QUESTION_MAX,
  SURVEY_OPTION_MAX,
  SURVEY_PLACEHOLDER_MAX,
} from '@/shared/lib/validation-limits';
import {
  createQuestionDraft,
  createTriggerDraft,
  formatDateTime,
  formatDuration,
  formatQuestionTypeLabel,
  getSurveyTriggerTypeLabel,
  SURVEY_QUESTION_TYPES,
  SURVEY_TRIGGER_TYPES,
  serializeQuestionDraft,
  serializeTriggerDraft,
  type SurveyQuestionDraft,
  type SurveyTriggerDraft,
} from '../utils';

type SurveyPayload = CreateSurveyRequest | UpdateSurveyRequest;

interface SurveyFormProps {
  mode: 'create' | 'edit';
  initialSurvey?: Survey | null;
  onCancel: () => void;
  onSubmit: (payload: SurveyPayload) => Promise<Survey>;
  onSuccess: (survey: Survey) => Promise<void> | void;
}

const formatDateTimeLocal = (value?: string | null): string => {
  if (!value) {
    return '';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const offset = parsed.getTimezoneOffset() * 60000;
  const localDate = new Date(parsed.getTime() - offset);
  return localDate.toISOString().slice(0, 16);
};

const buildQuestionErrors = (question: SurveyQuestionDraft): string[] => {
  const errors: string[] = [];

  if (!question.question.trim()) {
    errors.push('Question text is required');
  }

  if (question.type === 'multipleChoice') {
    const optionCount = question.optionsText
      .split(/\r?\n/)
      .map(option => option.trim())
      .filter(Boolean).length;

    if (optionCount < 2) {
      errors.push('Add at least two options for multiple choice');
    }
  }

  if (question.type === 'rating' || question.type === 'scale') {
    const minValue = Number(question.minValue);
    const maxValue = Number(question.maxValue);

    if (!Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
      errors.push('Provide a valid rating range');
    } else if (minValue > maxValue) {
      errors.push('Minimum value must be less than or equal to maximum');
    }
  }

  return errors;
};

const SurveyForm: React.FC<SurveyFormProps> = ({
  mode,
  initialSurvey,
  onCancel,
  onSubmit,
  onSuccess,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [timeToComplete, setTimeToComplete] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [triggerDraft, setTriggerDraft] =
    useState<SurveyTriggerDraft>(createTriggerDraft());
  const [questions, setQuestions] = useState<SurveyQuestionDraft[]>([
    createQuestionDraft(),
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    if (mode === 'edit' && initialSurvey) {
      setTitle(initialSurvey.title || '');
      setDescription(initialSurvey.description || '');
      setIsActive(initialSurvey.isActive ?? true);
      setTimeToComplete(String(initialSurvey.timeToComplete ?? ''));
      setExpiresAt(formatDateTimeLocal(initialSurvey.expiresAt));
      setTriggerDraft(createTriggerDraft(initialSurvey.trigger || undefined));
      setQuestions(
        initialSurvey.questions.length > 0
          ? initialSurvey.questions.map(question =>
              createQuestionDraft(question)
            )
          : [createQuestionDraft()]
      );
      return;
    }

    if (mode === 'create') {
      setTitle('');
      setDescription('');
      setIsActive(true);
      setTimeToComplete('180');
      setExpiresAt('');
      setTriggerDraft(createTriggerDraft());
      setQuestions([createQuestionDraft()]);
    }
  }, [initialSurvey, mode]);

  const questionSummary = useMemo(() => {
    const total = questions.length;
    const required = questions.filter(question => question.isRequired).length;
    return { total, required };
  }, [questions]);

  const handleAddQuestion = () => {
    setQuestions(previous => [...previous, createQuestionDraft()]);
  };

  const handleRemoveQuestion = (index: number) => {
    setQuestions(previous => {
      if (previous.length <= 1) {
        return [createQuestionDraft()];
      }

      return previous.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const handleQuestionChange = (
    index: number,
    field: keyof SurveyQuestionDraft,
    value: string | boolean
  ) => {
    setQuestions(previous =>
      previous.map((question, currentIndex) =>
        currentIndex === index ? { ...question, [field]: value } : question
      )
    );
  };

  const handleSubmit = async () => {
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const normalizedTimeToComplete = Number(timeToComplete);
    const normalizedExpiresAt = expiresAt
      ? new Date(expiresAt).toISOString()
      : undefined;
    const serializedQuestions = questions.map(question =>
      serializeQuestionDraft(question)
    );
    const serializedTrigger = serializeTriggerDraft(triggerDraft);

    const nextErrors: Record<string, string[]> = {};

    if (!normalizedTitle) {
      nextErrors.title = ['Survey title is required'];
    }

    if (
      !Number.isFinite(normalizedTimeToComplete) ||
      normalizedTimeToComplete < 0
    ) {
      nextErrors.timeToComplete = ['Enter a valid completion time in seconds'];
    }

    if (triggerDraft.type === 'postExposure') {
      const threshold = Number(triggerDraft.threshold);
      const duration = Number(triggerDraft.duration);

      if (!Number.isFinite(threshold) || threshold < 0) {
        nextErrors.trigger = [
          ...(nextErrors.trigger || []),
          'Threshold must be a valid number',
        ];
      }

      if (!Number.isFinite(duration) || duration <= 0) {
        nextErrors.trigger = [
          ...(nextErrors.trigger || []),
          'Duration must be greater than zero',
        ];
      }
    }

    questions.forEach((question, index) => {
      const errors = buildQuestionErrors(question);
      if (errors.length > 0) {
        nextErrors[`question-${index}`] = errors;
      }
    });

    setFieldErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstMessage =
        nextErrors.title?.[0] ||
        nextErrors.timeToComplete?.[0] ||
        nextErrors.trigger?.[0] ||
        nextErrors['question-0']?.[0] ||
        'Please fix the highlighted errors';
      toast.error(firstMessage);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: SurveyPayload = {
        title: normalizedTitle,
        description: normalizedDescription,
        isActive,
        timeToComplete: normalizedTimeToComplete,
        expiresAt: normalizedExpiresAt,
        trigger: serializedTrigger,
        questions: serializedQuestions,
      };

      const savedSurvey = await onSubmit(payload);
      toast.success(
        mode === 'edit'
          ? 'Survey updated successfully'
          : 'Survey created successfully'
      );
      await onSuccess(savedSurvey);
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const titleError = fieldErrors.title?.[0];
  const timeToCompleteError = fieldErrors.timeToComplete?.[0];
  const triggerError = fieldErrors.trigger?.[0];

  return (
    <div className="space-y-6">
      <div className="flex justify-start">
        <Button variant="ghost" Icon={AqArrowLeft} onClick={onCancel}>
          Back
        </Button>
      </div>

      <PageHeading
        title={mode === 'edit' ? 'Edit survey' : 'Create survey'}
        subtitle={
          mode === 'edit'
            ? 'Update the survey definition, trigger logic, and question set in a full-page editor.'
            : 'Build a new survey with a large form that is easier to review and manage.'
        }
        action={
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
            >
              {mode === 'edit' ? 'Save changes' : 'Create survey'}
            </Button>
          </div>
        }
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            {questionSummary.total} questions
          </span>
          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
            {questionSummary.required} required
          </span>
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
              isActive
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                : 'bg-slate-100 text-slate-700 dark:bg-slate-950/40 dark:text-slate-300'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </div>
      </PageHeading>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Survey details
                </h3>
                <p className="text-sm text-muted-foreground">
                  Title, description, lifecycle, and timing.
                </p>
              </div>

              <Input
                label="Survey title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Air Quality Exposure Assessment"
                required
                error={titleError}
                maxLength={SURVEY_TITLE_MAX}
              />

              <TextInput
                label="Description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Help us understand how air quality affects your daily activities and health."
                rows={4}
                maxLength={SURVEY_DESCRIPTION_MAX}
              />

              <div className="grid gap-4 md:grid-cols-2">
                <Input
                  label="Time to complete (seconds)"
                  type="number"
                  min={0}
                  value={timeToComplete}
                  onChange={e => setTimeToComplete(String(e.target.value))}
                  description="Estimate the time respondents should need to finish."
                  error={timeToCompleteError}
                />

                <Input
                  label="Expires at"
                  type="datetime-local"
                  value={expiresAt}
                  onChange={e => setExpiresAt(String(e.target.value))}
                  description="Optional end date for the survey."
                />
              </div>

              <div className="rounded-xl border border-border bg-muted/10 p-4">
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={isActive}
                    onCheckedChange={checked => setIsActive(Boolean(checked))}
                    className="mt-0.5"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      Survey active
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Active surveys can be shown to respondents immediately.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Trigger
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Choose when the survey should be delivered.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Select
                  label="Trigger type"
                  value={triggerDraft.type}
                  onChange={event =>
                    setTriggerDraft(previous => ({
                      ...previous,
                      type: String(event.target.value || 'manual'),
                    }))
                  }
                  required
                >
                  {SURVEY_TRIGGER_TYPES.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>

                <div className="rounded-xl border border-border bg-background p-4">
                  <p className="text-sm font-medium text-foreground">
                    Current trigger
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {getSurveyTriggerTypeLabel(triggerDraft.type)}
                  </p>
                  {triggerDraft.type === 'postExposure' ? (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Deliver the survey when air quality rises above the
                      threshold for the configured duration.
                    </p>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">
                      Manual trigger keeps the survey controlled by the admin.
                    </p>
                  )}
                </div>
              </div>

              {triggerDraft.type === 'postExposure' && (
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    label="Threshold"
                    type="number"
                    step="0.1"
                    min={0}
                    value={triggerDraft.threshold}
                    onChange={e =>
                      setTriggerDraft(previous => ({
                        ...previous,
                        threshold: String(e.target.value),
                      }))
                    }
                    description="Example: 50"
                    error={triggerError}
                  />
                  <Input
                    label="Duration (seconds)"
                    type="number"
                    min={1}
                    value={triggerDraft.duration}
                    onChange={e =>
                      setTriggerDraft(previous => ({
                        ...previous,
                        duration: String(e.target.value),
                      }))
                    }
                    description="How long the threshold must stay elevated."
                    error={triggerError}
                  />
                </div>
              )}
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">
                    Questions
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Build the survey structure. One option per line for multiple
                    choice questions.
                  </p>
                </div>
                <Button
                  variant="outlined"
                  Icon={AqPlus}
                  onClick={handleAddQuestion}
                >
                  Add question
                </Button>
              </div>

              <div className="space-y-4">
                {questions.map((question, index) => {
                  const isMultipleChoice = question.type === 'multipleChoice';
                  const isRating = question.type === 'rating';
                  const isScale = question.type === 'scale';
                  const isYesNo = question.type === 'yesNo';
                  const questionErrors = fieldErrors[`question-${index}`] || [];

                  return (
                    <div
                      key={question.id}
                      className="rounded-2xl border border-border bg-background p-4 shadow-sm"
                    >
                      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">
                            Question {index + 1}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatQuestionTypeLabel(question.type)}
                          </p>
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          Icon={AqTrash01}
                          iconPosition="start"
                          onClick={() => handleRemoveQuestion(index)}
                        >
                          Remove
                        </Button>
                      </div>

                      <div className="grid gap-4 lg:grid-cols-2">
                        <div className="lg:col-span-2">
                          <TextInput
                            label="Question text"
                            value={question.question}
                            onChange={e =>
                              handleQuestionChange(
                                index,
                                'question',
                                e.target.value
                              )
                            }
                            placeholder="What activity were you doing when you received this survey?"
                            rows={3}
                            required
                            maxLength={SURVEY_QUESTION_MAX}
                          />
                        </div>

                        <Select
                          label="Question type"
                          value={question.type}
                          onChange={event =>
                            handleQuestionChange(
                              index,
                              'type',
                              String(event.target.value || 'text')
                            )
                          }
                          required
                        >
                          {SURVEY_QUESTION_TYPES.map(option => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>

                        <div className="rounded-xl border border-border bg-muted/10 p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              checked={question.isRequired}
                              onCheckedChange={checked =>
                                handleQuestionChange(
                                  index,
                                  'isRequired',
                                  Boolean(checked)
                                )
                              }
                              className="mt-0.5"
                            />
                            <div className="space-y-1">
                              <p className="text-sm font-medium text-foreground">
                                Required response
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Required questions block completion until
                                answered.
                              </p>
                            </div>
                          </div>
                        </div>

                        {isRating || isScale ? (
                          <>
                            <Input
                              label="Minimum value"
                              type="number"
                              min={0}
                              value={question.minValue}
                              onChange={e =>
                                handleQuestionChange(
                                  index,
                                  'minValue',
                                  e.target.value
                                )
                              }
                              description="Lowest allowed value."
                            />
                            <Input
                              label="Maximum value"
                              type="number"
                              min={0}
                              value={question.maxValue}
                              onChange={e =>
                                handleQuestionChange(
                                  index,
                                  'maxValue',
                                  e.target.value
                                )
                              }
                              description="Highest allowed value."
                            />
                          </>
                        ) : null}

                        {question.type === 'text' && (
                          <div className="lg:col-span-2">
                            <Input
                              label="Placeholder"
                              value={question.placeholder}
                              onChange={e =>
                                handleQuestionChange(
                                  index,
                                  'placeholder',
                                  e.target.value
                                )
                              }
                              placeholder="Enter your answer here..."
                              description="Shown inside the response field."
                              maxLength={SURVEY_PLACEHOLDER_MAX}
                            />
                          </div>
                        )}

                        {isMultipleChoice && (
                          <div className="lg:col-span-2">
                            <TextInput
                              label="Options"
                              value={question.optionsText}
                              onChange={e =>
                                handleQuestionChange(
                                  index,
                                  'optionsText',
                                  e.target.value
                                )
                              }
                              placeholder={`Option one\nOption two\nOption three`}
                              rows={4}
                              maxLength={SURVEY_OPTION_MAX}
                            />
                            <p className="mt-1 text-xs text-muted-foreground">
                              Enter one option per line.
                            </p>
                          </div>
                        )}

                        {isYesNo && (
                          <div className="lg:col-span-2 rounded-xl border border-border bg-muted/10 p-4 text-sm text-muted-foreground">
                            This question will render as a fixed Yes / No
                            choice.
                          </div>
                        )}
                      </div>

                      {questionErrors.length > 0 && (
                        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900/40 dark:bg-red-950/30 dark:text-red-200">
                          <ul className="space-y-1">
                            {questionErrors.map(error => (
                              <li key={error}>{error}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <Button
                variant="outlined"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                loading={isSubmitting}
              >
                {mode === 'edit' ? 'Save changes' : 'Create survey'}
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Preview
                </h3>
                <p className="text-sm text-muted-foreground">
                  What admins will see in the survey list and details view.
                </p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/15 p-4">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Title
                </p>
                <p className="mt-1 text-base font-semibold text-foreground">
                  {title || 'Untitled survey'}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {description || 'No description provided yet.'}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                <div className="rounded-xl border border-border bg-muted/15 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Estimated time
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {formatDuration(Number(timeToComplete) || 0)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/15 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Trigger
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {getSurveyTriggerTypeLabel(triggerDraft.type)}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/15 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Status
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-muted/15 p-4">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Expires
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {expiresAt
                      ? formatDateTime(new Date(expiresAt).toISOString())
                      : 'Not set'}
                  </p>
                </div>
              </div>

              {mode === 'edit' && initialSurvey && (
                <div className="rounded-xl border border-border bg-muted/10 p-4 text-sm text-muted-foreground">
                  <p>
                    Created {formatDateTime(initialSurvey.createdAt)} and last
                    updated {formatDateTime(initialSurvey.updatedAt)}.
                  </p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SurveyForm;
