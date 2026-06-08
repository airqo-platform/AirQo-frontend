'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AqPlus, AqTrash01 } from '@airqo/icons-react';
import {
  Button,
  Checkbox,
  Dialog,
  Input,
  TextInput,
  Select,
  toast,
} from '@/shared/components/ui';
import { surveyService } from '@/shared/services';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import type { Survey } from '@/shared/types/api';
import {
  SURVEY_QUESTION_TYPES,
  createQuestionDraft,
  formatQuestionTypeLabel,
  serializeQuestionDraft,
  type SurveyQuestionDraft,
} from '../utils';

interface SurveyEditorDialogProps {
  isOpen: boolean;
  survey: Survey | null;
  onClose: () => void;
  onSaved: (updatedSurvey: Survey) => Promise<void> | void;
}

const buildInitialQuestions = (survey: Survey | null): SurveyQuestionDraft[] => {
  if (!survey?.questions?.length) {
    return [createQuestionDraft()];
  }

  return survey.questions.map(question => createQuestionDraft(question));
};

const SurveyEditorDialog: React.FC<SurveyEditorDialogProps> = ({
  isOpen,
  survey,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [timeToComplete, setTimeToComplete] = useState('0');
  const [questions, setQuestions] = useState<SurveyQuestionDraft[]>([
    createQuestionDraft(),
  ]);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!isOpen || !survey) {
      return;
    }

    setTitle(survey.title || '');
    setDescription(survey.description || '');
    setIsActive(survey.isActive ?? true);
    setTimeToComplete(String(survey.timeToComplete ?? 0));
    setQuestions(buildInitialQuestions(survey));
  }, [isOpen, survey]);

  const totalQuestions = useMemo(() => questions.length, [questions.length]);

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
      previous.map((question, currentIndex) => {
        if (currentIndex !== index) {
          return question;
        }

        return {
          ...question,
          [field]: value,
        };
      })
    );
  };

  const handleSubmit = async () => {
    const normalizedTitle = title.trim();
    const normalizedDescription = description.trim();
    const normalizedTimeToComplete = Number(timeToComplete);

    if (!survey) {
      toast.error('Survey data is not available');
      return;
    }

    if (!normalizedTitle) {
      toast.error('Survey title is required');
      return;
    }

    if (!Number.isFinite(normalizedTimeToComplete) || normalizedTimeToComplete < 0) {
      toast.error('Enter a valid time to complete in seconds');
      return;
    }

    const validationError = questions.find((question, index) => {
      if (!question.question.trim()) {
        toast.error(`Question ${index + 1} needs text`);
        return true;
      }

      if (question.type === 'multipleChoice') {
        const optionCount = question.optionsText
          .split(/\r?\n/)
          .map(option => option.trim())
          .filter(Boolean).length;

        if (optionCount < 2) {
          toast.error(
            `Question ${index + 1} needs at least two options for multiple choice`
          );
          return true;
        }
      }

      if (question.type === 'rating') {
        const minValue = Number(question.minValue);
        const maxValue = Number(question.maxValue);

        if (
          !Number.isFinite(minValue) ||
          !Number.isFinite(maxValue) ||
          minValue > maxValue
        ) {
          toast.error(
            `Question ${index + 1} needs a valid rating range`
          );
          return true;
        }
      }

      return false;
    });

    if (validationError) {
      return;
    }

    setIsSaving(true);

    try {
      const updatedSurvey = await surveyService.updateSurvey(survey._id, {
        title: normalizedTitle,
        description: normalizedDescription,
        isActive,
        timeToComplete: normalizedTimeToComplete,
        questions: questions.map(question => serializeQuestionDraft(question)),
      });

      toast.success('Survey updated successfully');
      await onSaved(updatedSurvey);
      onClose();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Edit survey"
      subtitle={
        survey ? `Update ${survey.title} and refine the question set.` : undefined
      }
      size="2xl"
      maxHeight="max-h-[88vh]"
      contentClassName="pr-2"
      primaryAction={{
        label: 'Save changes',
        onClick: handleSubmit,
        disabled: isSaving || !survey,
        loading: isSaving,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: onClose,
        variant: 'outlined',
        disabled: isSaving,
      }}
    >
      <div className="space-y-5">
        <div className="grid gap-4">
          <Input
            label="Survey title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="Air quality awareness survey"
            required
          />

          <TextInput
            label="Description"
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Short description that explains the survey purpose."
            rows={4}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Input
            label="Time to complete (seconds)"
            type="number"
            min={0}
            value={timeToComplete}
            onChange={e => setTimeToComplete(String(e.target.value))}
            description="Used to estimate completion effort."
          />

          <div className="rounded-xl border border-border bg-muted/20 p-4 md:col-span-2">
            <div className="flex items-start gap-3">
              <Checkbox
                checked={isActive}
                onCheckedChange={checked => setIsActive(Boolean(checked))}
                className="mt-0.5"
              />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  Active survey
                </p>
                <p className="text-xs text-muted-foreground">
                  Active surveys remain visible in the system list and can keep
                  collecting responses.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">Questions</p>
              <p className="text-xs text-muted-foreground">
                {totalQuestions} question
                {totalQuestions === 1 ? '' : 's'} in this survey.
                Use one option per line for multiple choice questions.
              </p>
            </div>

            <Button
              variant="outlined"
              size="sm"
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

              return (
                <div
                  key={question.id}
                  className="rounded-2xl border border-border bg-background p-4 shadow-sm"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        Question {index + 1}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatQuestionTypeLabel(question.type)}
                      </p>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      Icon={AqTrash01}
                      iconPosition="start"
                      onClick={() => handleRemoveQuestion(index)}
                      className="text-red-600 hover:text-red-700"
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
                          handleQuestionChange(index, 'question', e.target.value)
                        }
                        placeholder="What was your primary activity when you received this survey?"
                        rows={3}
                        required
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
                            Required questions must be answered before the
                            survey can be completed.
                          </p>
                        </div>
                      </div>
                    </div>

                    {isRating && (
                      <>
                        <Input
                          label="Minimum rating"
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
                          description="Lowest score allowed in this question."
                        />
                        <Input
                          label="Maximum rating"
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
                          description="Highest score allowed in this question."
                        />
                      </>
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
                        />
                        <p className="mt-1 text-xs text-muted-foreground">
                          Enter one option per line.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Dialog>
  );
};

export default SurveyEditorDialog;
