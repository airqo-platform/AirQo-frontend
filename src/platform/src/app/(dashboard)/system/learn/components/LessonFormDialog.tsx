'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, Input, TextInput, toast } from '@/shared/components/ui';
import { learnAdminService } from '@/shared/services';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import type {
  CreateLessonRequest,
  Lesson,
  Unit,
  UpdateLessonRequest,
} from '@/shared/types/learn';
import { getNextLessonOrder } from '../utils';

interface LessonFormDialogProps {
  isOpen: boolean;
  unit: Unit | null;
  lesson: Lesson | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const LessonFormDialog: React.FC<LessonFormDialogProps> = ({
  isOpen,
  unit,
  lesson,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState('');
  const [plainTitleKey, setPlainTitleKey] = useState('');
  const [lessonOrder, setLessonOrder] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [completionMessage, setCompletionMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(lesson);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (lesson) {
      setTitle(lesson.title || '');
      setPlainTitleKey(lesson.plain_title_key || '');
      setLessonOrder(String(lesson.lesson_order ?? ''));
      setCoverImageUrl(lesson.cover_image_url || '');
      setCompletionMessage(lesson.completion_message || '');
    } else if (unit) {
      setTitle('');
      setPlainTitleKey('');
      setLessonOrder(String(getNextLessonOrder(unit)));
      setCoverImageUrl('');
      setCompletionMessage('');
    } else {
      setTitle('');
      setPlainTitleKey('');
      setLessonOrder('1');
      setCoverImageUrl('');
      setCompletionMessage('');
    }
  }, [isOpen, lesson, unit]);

  const handleClose = () => {
    if (isSaving) {
      return;
    }
    onClose();
  };

  const handleSubmit = async () => {
    const normalizedTitle = title.trim();
    const normalizedPlainTitleKey = plainTitleKey.trim();
    const normalizedCoverImageUrl = coverImageUrl.trim() || undefined;
    const normalizedCompletionMessage = completionMessage.trim() || undefined;
    const parsedOrder = Number(lessonOrder);

    if (!normalizedTitle) {
      toast.error('Lesson title is required');
      return;
    }

    if (!normalizedPlainTitleKey) {
      toast.error('Plain title key is required');
      return;
    }

    if (
      !Number.isFinite(parsedOrder) ||
      parsedOrder < 1 ||
      !Number.isInteger(parsedOrder)
    ) {
      toast.error('Lesson order must be a positive integer');
      return;
    }

    if (!isEditing && !unit) {
      toast.error('Unit is not available');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && lesson) {
        const payload: UpdateLessonRequest = {
          title: normalizedTitle,
          plain_title_key: normalizedPlainTitleKey,
          lesson_order: parsedOrder,
          ...(normalizedCoverImageUrl
            ? { cover_image_url: normalizedCoverImageUrl }
            : { cover_image_url: '' }),
          ...(normalizedCompletionMessage
            ? { completion_message: normalizedCompletionMessage }
            : { completion_message: '' }),
        };

        await learnAdminService.updateLesson(lesson._id, payload);
        toast.success('Lesson updated successfully');
      } else if (unit) {
        const payload: CreateLessonRequest = {
          title: normalizedTitle,
          plain_title_key: normalizedPlainTitleKey,
          lesson_order: parsedOrder,
          ...(normalizedCoverImageUrl
            ? { cover_image_url: normalizedCoverImageUrl }
            : {}),
          ...(normalizedCompletionMessage
            ? { completion_message: normalizedCompletionMessage }
            : {}),
        };

        await learnAdminService.createLesson(unit._id, payload);
        toast.success('Lesson created successfully');
      }

      await onSaved();
      handleClose();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Edit lesson' : 'Add lesson'}
      subtitle={
        isEditing
          ? 'Update lesson metadata and order.'
          : 'Add a new lesson to this unit.'
      }
      size="lg"
      primaryAction={{
        label: isEditing ? 'Save changes' : 'Add lesson',
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
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="What is air quality"
          required
        />

        <Input
          label="Plain title key"
          value={plainTitleKey}
          onChange={e => setPlainTitleKey(e.target.value)}
          placeholder="What is air quality"
          required
        />

        <Input
          label="Lesson order"
          type="number"
          min={1}
          step={1}
          value={lessonOrder}
          onChange={e => setLessonOrder(e.target.value)}
          placeholder="1"
          required
          description="Must be unique within the unit."
        />

        <Input
          label="Cover image URL"
          type="url"
          value={coverImageUrl}
          onChange={e => setCoverImageUrl(e.target.value)}
          placeholder="https://cdn.airqo.net/learn/lessons/..."
        />

        <TextInput
          label="Completion message"
          value={completionMessage}
          onChange={e => setCompletionMessage(e.target.value)}
          placeholder="Great work!"
          rows={2}
        />
      </div>
    </Dialog>
  );
};

export default LessonFormDialog;
