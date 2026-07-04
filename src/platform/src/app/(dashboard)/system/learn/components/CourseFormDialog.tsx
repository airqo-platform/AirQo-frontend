'use client';

import React, { useEffect, useState } from 'react';
import { Dialog, Input, toast } from '@/shared/components/ui';
import { learnAdminService } from '@/shared/services';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import type {
  Course,
  CreateCourseRequest,
  UpdateCourseRequest,
} from '@/shared/types/learn';
import CourseCoverImage from './CourseCoverImage';

interface CourseFormDialogProps {
  isOpen: boolean;
  course: Course | null;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

const CourseFormDialog: React.FC<CourseFormDialogProps> = ({
  isOpen,
  course,
  onClose,
  onSaved,
}) => {
  const [courseNumber, setCourseNumber] = useState('');
  const [title, setTitle] = useState('');
  const [plainTitleKey, setPlainTitleKey] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const isEditing = Boolean(course);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (course) {
      setCourseNumber(String(course.course_number ?? ''));
      setTitle(course.title || '');
      setPlainTitleKey(course.plain_title_key || '');
      setCoverImageUrl(course.cover_image_url || '');
    } else {
      setCourseNumber('');
      setTitle('');
      setPlainTitleKey('');
      setCoverImageUrl('');
    }
  }, [isOpen, course]);

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

    if (!normalizedTitle) {
      toast.error('Course title is required');
      return;
    }

    if (!normalizedPlainTitleKey) {
      toast.error('Plain title key is required');
      return;
    }

    if (!isEditing) {
      const parsedCourseNumber = Number(courseNumber);

      if (
        !Number.isFinite(parsedCourseNumber) ||
        parsedCourseNumber < 1 ||
        !Number.isInteger(parsedCourseNumber)
      ) {
        toast.error('Course number must be a positive integer');
        return;
      }
    }

    setIsSaving(true);

    try {
      if (isEditing && course) {
        const payload: UpdateCourseRequest = {
          title: normalizedTitle,
          plain_title_key: normalizedPlainTitleKey,
          ...(normalizedCoverImageUrl
            ? { cover_image_url: normalizedCoverImageUrl }
            : { cover_image_url: '' }),
        };

        await learnAdminService.updateCourse(course._id, payload);
        toast.success('Course updated successfully');
      } else {
        const payload: CreateCourseRequest = {
          course_number: Number(courseNumber),
          title: normalizedTitle,
          plain_title_key: normalizedPlainTitleKey,
          ...(normalizedCoverImageUrl
            ? { cover_image_url: normalizedCoverImageUrl }
            : {}),
        };

        await learnAdminService.createCourse(payload);
        toast.success('Course created successfully');
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
      title={isEditing ? 'Edit course' : 'Create course'}
      subtitle={
        isEditing
          ? 'Update course metadata and cover image.'
          : 'Create a new course shell to begin authoring.'
      }
      size="lg"
      primaryAction={{
        label: isEditing ? 'Save changes' : 'Create course',
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
        {!isEditing && (
          <Input
            label="Course number"
            type="number"
            min={1}
            step={1}
            value={courseNumber}
            onChange={e => setCourseNumber(e.target.value)}
            placeholder="1"
            required
            description="Must be unique across all courses."
          />
        )}

        <Input
          label="Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Know your air"
          required
        />

        <Input
          label="Plain title key"
          value={plainTitleKey}
          onChange={e => setPlainTitleKey(e.target.value)}
          placeholder="Know your air"
          required
          description="Stable i18n key used for localization."
        />

        <Input
          label="Cover image URL"
          type="url"
          value={coverImageUrl}
          onChange={e => setCoverImageUrl(e.target.value)}
          placeholder="https://cdn.airqo.net/learn/courses/..."
          description="Required before the course can be published."
        />

        <div>
          <p className="mb-2 text-sm font-medium text-foreground">
            Cover image preview
          </p>
          <CourseCoverImage
            src={coverImageUrl || null}
            alt="Cover preview"
            aspectRatio="16/9"
            className="max-h-[200px] w-full rounded-lg"
          />
        </div>
      </div>
    </Dialog>
  );
};

export default CourseFormDialog;
