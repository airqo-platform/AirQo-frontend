'use client';

import React, { useEffect, useState } from 'react';
import {
  Button,
  Checkbox,
  Dialog,
  Input,
  Select,
  toast,
} from '@/shared/components/ui';
import { RichTextEditor } from '@/shared/components/ui/rich-text-editor';
import { AqPlus, AqTrash01 } from '@airqo/icons-react';
import { learnAdminService } from '@/shared/services';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import type {
  Activity,
  ActivityPayload,
  ActivityType,
  CreateActivityRequest,
  Lesson,
  QuizPayload,
  UpdateActivityRequest,
} from '@/shared/types/learn';
import {
  ACTIVITY_TYPES,
  QUIZ_FORMATS,
  createEmptyArticlePayload,
  createEmptyImagePayload,
  createEmptyQuizPayload,
  createEmptyVideoPayload,
  getNextActivityOrder,
  isHtmlEmpty,
} from '../utils';

interface ActivityFormDialogProps {
  isOpen: boolean;
  lesson: Lesson | null;
  activity: Activity | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const ActivityFormDialog: React.FC<ActivityFormDialogProps> = ({
  isOpen,
  lesson,
  activity,
  onClose,
  onSaved,
}) => {
  const [type, setType] = useState<ActivityType>('article');
  const [order, setOrder] = useState('');
  const [payload, setPayload] = useState<ActivityPayload>(
    createEmptyArticlePayload()
  );
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(activity);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (activity) {
      setType(activity.type);
      setOrder(String(activity.order ?? ''));
      setPayload(activity.payload || createPayloadForType(activity.type));
    } else if (lesson) {
      setType('article');
      setOrder(String(getNextActivityOrder(lesson)));
      setPayload(createEmptyArticlePayload());
    } else {
      setType('article');
      setOrder('1');
      setPayload(createEmptyArticlePayload());
    }
  }, [isOpen, activity, lesson]);

  const createPayloadForType = (
    activityType: ActivityType
  ): ActivityPayload => {
    switch (activityType) {
      case 'article':
        return createEmptyArticlePayload();
      case 'video':
        return createEmptyVideoPayload();
      case 'image':
        return createEmptyImagePayload();
      case 'quiz':
        return createEmptyQuizPayload();
      default:
        return createEmptyArticlePayload();
    }
  };

  const handleTypeChange = (newType: ActivityType) => {
    setType(newType);
    setPayload(createPayloadForType(newType));
  };

  const handleClose = () => {
    if (isSaving) {
      return;
    }
    onClose();
  };

  const validatePayload = (): string | null => {
    if (type === 'article') {
      const articlePayload = payload as {
        title?: string;
        body?: string;
      };

      if (!articlePayload.title?.trim()) {
        return 'Article title is required';
      }

      if (isHtmlEmpty(articlePayload.body || '')) {
        return 'Article body is required';
      }
    } else if (type === 'video') {
      const videoPayload = payload as {
        video_url?: string;
        youtube_id?: string;
      };

      if (!videoPayload.video_url?.trim() && !videoPayload.youtube_id?.trim()) {
        return 'Video URL or YouTube ID is required';
      }
    } else if (type === 'image') {
      const imagePayload = payload as { image_url?: string };

      if (!imagePayload.image_url?.trim()) {
        return 'Image URL is required';
      }
    } else if (type === 'quiz') {
      const quizPayload = payload as QuizPayload;

      if (!quizPayload.question?.trim()) {
        return 'Quiz question is required';
      }

      if (quizPayload.format === 'free_text') {
        return null;
      }

      const validOptions = quizPayload.options.filter(
        option => option.trim() !== ''
      );

      if (validOptions.length < 2) {
        return 'At least two options are required';
      }

      if (
        quizPayload.format === 'single_choice' &&
        (quizPayload.correct_index === undefined ||
          quizPayload.correct_index < 0 ||
          quizPayload.correct_index >= quizPayload.options.length ||
          !quizPayload.options[quizPayload.correct_index]?.trim())
      ) {
        return 'Select a valid correct answer';
      }
    }

    return null;
  };

  const handleSubmit = async () => {
    const parsedOrder = Number(order);

    if (
      !Number.isFinite(parsedOrder) ||
      parsedOrder < 1 ||
      !Number.isInteger(parsedOrder)
    ) {
      toast.error('Activity order must be a positive integer');
      return;
    }

    const validationError = validatePayload();

    if (validationError) {
      toast.error(validationError);
      return;
    }

    if (!isEditing && !lesson) {
      toast.error('Lesson is not available');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && activity) {
        const updatePayload: UpdateActivityRequest = {
          type,
          order: parsedOrder,
          payload,
        };

        await learnAdminService.updateActivity(activity._id, updatePayload);
        toast.success('Activity updated successfully');
      } else if (lesson) {
        const createPayload: CreateActivityRequest = {
          type,
          order: parsedOrder,
          payload,
        };

        await learnAdminService.createActivity(lesson._id, createPayload);
        toast.success('Activity created successfully');
      }

      await onSaved();
      handleClose();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const renderArticleFields = () => {
    const articlePayload = payload as {
      title: string;
      body: string;
      image_url: string;
      tts_enabled: boolean;
    };

    return (
      <div className="space-y-4">
        <Input
          label="Article title"
          value={articlePayload.title}
          onChange={e =>
            setPayload({ ...articlePayload, title: e.target.value })
          }
          placeholder="Introduction to PM2.5"
          required
        />

        <RichTextEditor
          label="Body"
          value={articlePayload.body}
          onChange={html => setPayload({ ...articlePayload, body: html })}
          placeholder="Write the article content here..."
        />

        <Input
          label="Image URL"
          type="url"
          value={articlePayload.image_url}
          onChange={e =>
            setPayload({ ...articlePayload, image_url: e.target.value })
          }
          placeholder="https://cdn.airqo.net/learn/articles/..."
        />

        <div className="rounded-xl border border-border bg-muted/15 p-4">
          <div className="flex items-start gap-3">
            <Checkbox
              checked={articlePayload.tts_enabled}
              onCheckedChange={checked =>
                setPayload({
                  ...articlePayload,
                  tts_enabled: Boolean(checked),
                })
              }
              className="mt-0.5"
            />
            <div className="space-y-1">
              <p className="text-sm font-medium text-foreground">
                Text-to-speech enabled
              </p>
              <p className="text-xs text-muted-foreground">
                Allow the article to be read aloud in the app.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderVideoFields = () => {
    const videoPayload = payload as {
      video_url: string;
      youtube_id: string;
    };

    return (
      <div className="space-y-4">
        <Input
          label="Video URL"
          type="url"
          value={videoPayload.video_url}
          onChange={e =>
            setPayload({ ...videoPayload, video_url: e.target.value })
          }
          placeholder="https://cdn.airqo.net/learn/videos/..."
        />

        <div className="relative py-2 text-center text-xs text-muted-foreground">
          <span className="relative z-10 bg-card px-2">or</span>
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
        </div>

        <Input
          label="YouTube ID"
          value={videoPayload.youtube_id}
          onChange={e =>
            setPayload({ ...videoPayload, youtube_id: e.target.value })
          }
          placeholder="dQw4w9WgXcQ"
        />
      </div>
    );
  };

  const renderImageFields = () => {
    const imagePayload = payload as { image_url: string };

    return (
      <div className="space-y-4">
        <Input
          label="Image URL"
          type="url"
          value={imagePayload.image_url}
          onChange={e =>
            setPayload({ ...imagePayload, image_url: e.target.value })
          }
          placeholder="https://cdn.airqo.net/learn/infographics/..."
          required
        />
      </div>
    );
  };

  const renderQuizFields = () => {
    const quizPayload = payload as QuizPayload;

    const handleOptionChange = (index: number, value: string) => {
      const updatedOptions = [...quizPayload.options];
      updatedOptions[index] = value;
      setPayload({ ...quizPayload, options: updatedOptions });
    };

    const handleAddOption = () => {
      setPayload({
        ...quizPayload,
        options: [...quizPayload.options, ''],
      });
    };

    const handleRemoveOption = (index: number) => {
      const updatedOptions = quizPayload.options.filter((_, i) => i !== index);
      let updatedCorrectIndex = quizPayload.correct_index;

      if (updatedCorrectIndex !== undefined) {
        if (updatedCorrectIndex === index) {
          updatedCorrectIndex = undefined;
        } else if (updatedCorrectIndex > index) {
          updatedCorrectIndex -= 1;
        }
      }

      setPayload({
        ...quizPayload,
        options: updatedOptions,
        correct_index: updatedCorrectIndex,
      });
    };

    const showCorrectIndex = quizPayload.format === 'single_choice';

    return (
      <div className="space-y-4">
        <Select
          label="Quiz format"
          value={quizPayload.format}
          onChange={event =>
            setPayload({
              ...quizPayload,
              format: event.target.value as QuizPayload['format'],
            })
          }
          required
        >
          {QUIZ_FORMATS.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>

        <Input
          label="Question"
          value={quizPayload.question}
          onChange={e =>
            setPayload({ ...quizPayload, question: e.target.value })
          }
          placeholder="Which pollutant is measured as PM2.5?"
          required
        />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-foreground">Options</p>
            <Button
              type="button"
              variant="outlined"
              size="sm"
              Icon={AqPlus}
              onClick={handleAddOption}
            >
              Add option
            </Button>
          </div>

          <div className="space-y-2">
            {/* Dynamic form list — index is integral to onChange/onRemove callbacks */}
            {quizPayload.options.map((option, index) => (
              <div key={index} className="flex items-start gap-2">
                <div className="flex-1">
                  <Input
                    value={option}
                    onChange={e => handleOptionChange(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required={quizPayload.format !== 'free_text'}
                  />
                </div>
                {showCorrectIndex && (
                  <button
                    type="button"
                    onClick={() =>
                      setPayload({ ...quizPayload, correct_index: index })
                    }
                    className={`mt-2 rounded-full px-2.5 py-1 text-xs font-medium ${
                      quizPayload.correct_index === index
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                        : 'bg-muted text-muted-foreground hover:bg-muted/80'
                    }`}
                    title="Mark as correct answer"
                  >
                    {quizPayload.correct_index === index ? 'Correct' : 'Mark'}
                  </button>
                )}
                {quizPayload.options.length > 2 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    Icon={AqTrash01}
                    onClick={() => handleRemoveOption(index)}
                    className="mt-1 text-red-600 hover:text-red-700"
                  />
                )}
              </div>
            ))}
          </div>

          {showCorrectIndex && (
            <p className="text-xs text-muted-foreground">
              Click &ldquo;Mark&rdquo; next to the correct option.
            </p>
          )}
        </div>
      </div>
    );
  };

  const renderPayloadFields = () => {
    switch (type) {
      case 'article':
        return renderArticleFields();
      case 'video':
        return renderVideoFields();
      case 'image':
        return renderImageFields();
      case 'quiz':
        return renderQuizFields();
      default:
        return null;
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit activity' : 'Add activity'}
      subtitle={
        isEditing
          ? 'Update activity content and order.'
          : 'Add a new activity to this lesson.'
      }
      size="2xl"
      maxHeight="max-h-[88vh]"
      contentClassName="pr-2"
      primaryAction={{
        label: isEditing ? 'Save changes' : 'Add activity',
        onClick: handleSubmit,
        loading: isSaving,
        disabled: isSaving,
      }}
      secondaryAction={{
        label: 'Cancel',
        onClick: handleClose,
        variant: 'outlined',
        disabled: isSaving,
      }}
    >
      <div className="space-y-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Select
            label="Activity type"
            value={type}
            onChange={event =>
              handleTypeChange(event.target.value as ActivityType)
            }
            required
          >
            {ACTIVITY_TYPES.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>

          <Input
            label="Order"
            type="number"
            min={1}
            step={1}
            value={order}
            onChange={e => setOrder(e.target.value)}
            placeholder="1"
            required
            description="Must be unique within the lesson."
          />
        </div>

        {renderPayloadFields()}
      </div>
    </Dialog>
  );
};

export default ActivityFormDialog;
