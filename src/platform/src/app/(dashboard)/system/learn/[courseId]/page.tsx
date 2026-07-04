'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import { PermissionGuard } from '@/shared/components';
import { Button, Card, LoadingState, toast } from '@/shared/components/ui';
import {
  AqArrowLeft,
  AqEdit05,
  AqFile01,
  AqGraduationHat01,
  AqImage01,
  AqLayersThree01,
  AqPlayCircle,
  AqPlus,
  AqRefreshCw05,
  AqTrash01,
} from '@airqo/icons-react';
import { learnAdminService } from '@/shared/services';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import type {
  Activity,
  Course,
  Lesson,
  QuizPayload,
  Unit,
} from '@/shared/types/learn';
import {
  computeCourseCounts,
  formatDateTime,
  getActivityIconClass,
  getActivityTypeLabel,
  getPlainTextPreview,
  getPublishValidationIssues,
  getYoutubeThumbnail,
  normalizeCoverImageUrl,
} from '../utils';
import CourseFormDialog from '../components/CourseFormDialog';
import UnitFormDialog from '../components/UnitFormDialog';
import LessonFormDialog from '../components/LessonFormDialog';
import ActivityFormDialog from '../components/ActivityFormDialog';
import DeleteConfirmDialog from '../components/DeleteConfirmDialog';
import PublishValidationDialog from '../components/PublishValidationDialog';
import CourseCoverImage from '../components/CourseCoverImage';

type DialogState =
  | { type: 'course'; item: Course | null }
  | { type: 'unit'; item: Unit | null }
  | { type: 'lesson'; item: Lesson | null; parent: Unit | null }
  | { type: 'activity'; item: Activity | null; parent: Lesson | null }
  | {
      type: 'delete';
      itemType: string;
      itemId: string;
      itemName: string;
      warning?: string;
      onConfirm: () => Promise<void>;
    }
  | { type: 'validation'; issues: string[] }
  | null;

const ActivityIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'article':
      return <AqFile01 className="h-4 w-4" />;
    case 'video':
      return <AqPlayCircle className="h-4 w-4" />;
    case 'image':
      return <AqImage01 className="h-4 w-4" />;
    case 'quiz':
      return <AqGraduationHat01 className="h-4 w-4" />;
    default:
      return <AqFile01 className="h-4 w-4" />;
  }
};

const CourseDetailPage: React.FC = () => {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const { mutate: globalMutate } = useSWRConfig();
  const courseId = params?.courseId;

  const [dialog, setDialog] = useState<DialogState>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: course,
    error: courseError,
    isLoading: courseLoading,
    isValidating,
    mutate: mutateCourse,
  } = useSWR(
    courseId ? `system/learn/courses/${courseId}` : null,
    () => learnAdminService.getCourseById(courseId as string),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    if (!courseId) {
      router.push('/system/learn');
    }
  }, [router, courseId]);

  const counts = useMemo(() => {
    return course
      ? computeCourseCounts(course)
      : { unitCount: 0, lessonCount: 0, activityCount: 0 };
  }, [course]);

  const refreshData = useCallback(async () => {
    await Promise.allSettled([
      mutateCourse(),
      globalMutate('system/learn/courses'),
    ]);
  }, [globalMutate, mutateCourse]);

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(refreshData, 'Course refreshed successfully');
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    }
  }, [refreshData]);

  const handleBack = useCallback(() => {
    router.push('/system/learn');
  }, [router]);

  const handlePublishToggle = useCallback(async () => {
    if (!course) {
      return;
    }

    const nextPublished = !course.published;

    if (nextPublished) {
      const issues = getPublishValidationIssues(course);

      if (issues.length > 0) {
        setDialog({ type: 'validation', issues });
        return;
      }
    }

    setIsProcessing(true);

    try {
      await learnAdminService.updateCourse(course._id, {
        published: nextPublished,
      });

      toast.success(
        nextPublished
          ? 'Course published successfully'
          : 'Course unpublished successfully'
      );
      await refreshData();
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
    } finally {
      setIsProcessing(false);
    }
  }, [course, refreshData]);

  const handleDeleteCourse = useCallback(async () => {
    if (!course) {
      return;
    }

    setIsProcessing(true);

    try {
      await learnAdminService.deleteCourse(course._id);
      toast.success('Course deleted successfully');
      await globalMutate('system/learn/courses');
      router.push('/system/learn');
    } catch (error) {
      toast.error(getUserFriendlyErrorMessage(error));
      setIsProcessing(false);
    }
  }, [course, globalMutate, router]);

  const handleDeleteUnit = useCallback(
    async (unit: Unit) => {
      setIsProcessing(true);

      try {
        await learnAdminService.deleteUnit(unit._id);
        toast.success('Unit deleted successfully');
        await refreshData();
        setDialog(null);
      } catch (error) {
        toast.error(getUserFriendlyErrorMessage(error));
      } finally {
        setIsProcessing(false);
      }
    },
    [refreshData]
  );

  const handleDeleteLesson = useCallback(
    async (lesson: Lesson) => {
      setIsProcessing(true);

      try {
        await learnAdminService.deleteLesson(lesson._id);
        toast.success('Lesson deleted successfully');
        await refreshData();
        setDialog(null);
      } catch (error) {
        toast.error(getUserFriendlyErrorMessage(error));
      } finally {
        setIsProcessing(false);
      }
    },
    [refreshData]
  );

  const handleDeleteActivity = useCallback(
    async (activity: Activity) => {
      setIsProcessing(true);

      try {
        await learnAdminService.deleteActivity(activity._id);
        toast.success('Activity deleted successfully');
        await refreshData();
        setDialog(null);
      } catch (error) {
        toast.error(getUserFriendlyErrorMessage(error));
      } finally {
        setIsProcessing(false);
      }
    },
    [refreshData]
  );

  const openDeleteDialog = useCallback(
    (
      itemType: string,
      item: { _id: string; title?: string; type?: string },
      onConfirm: () => Promise<void>,
      warning?: string
    ) => {
      setDialog({
        type: 'delete',
        itemType,
        itemId: item._id,
        itemName: item.title || `${itemType} ${item.type || ''}`.trim(),
        warning,
        onConfirm,
      });
    },
    []
  );

  const renderUnitActions = (unit: Unit) => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outlined"
          size="sm"
          Icon={AqPlus}
          onClick={() =>
            setDialog({ type: 'lesson', item: null, parent: unit })
          }
        >
          Add lesson
        </Button>
        <Button
          variant="ghost"
          size="sm"
          Icon={AqEdit05}
          onClick={() => setDialog({ type: 'unit', item: unit })}
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          Icon={AqTrash01}
          onClick={() =>
            openDeleteDialog(
              'unit',
              unit,
              () => handleDeleteUnit(unit),
              course?.published
                ? 'This course is published. Unpublish it first to delete this unit.'
                : undefined
            )
          }
          className="text-red-600 hover:text-red-700"
        >
          Delete
        </Button>
      </div>
    );
  };

  const renderLessonActions = (lesson: Lesson, unit: Unit) => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outlined"
          size="sm"
          Icon={AqPlus}
          onClick={() =>
            setDialog({ type: 'activity', item: null, parent: lesson })
          }
        >
          Add activity
        </Button>
        <Button
          variant="ghost"
          size="sm"
          Icon={AqEdit05}
          onClick={() =>
            setDialog({ type: 'lesson', item: lesson, parent: unit })
          }
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          Icon={AqTrash01}
          onClick={() =>
            openDeleteDialog(
              'lesson',
              lesson,
              () => handleDeleteLesson(lesson),
              course?.published
                ? 'This course is published. Unpublish it first to delete this lesson.'
                : undefined
            )
          }
          className="text-red-600 hover:text-red-700"
        >
          Delete
        </Button>
      </div>
    );
  };

  const renderActivityActions = (activity: Activity, _lesson: Lesson) => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          Icon={AqEdit05}
          onClick={() =>
            setDialog({ type: 'activity', item: activity, parent: _lesson })
          }
        >
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          Icon={AqTrash01}
          onClick={() =>
            openDeleteDialog(
              'activity',
              activity,
              () => handleDeleteActivity(activity),
              course?.published
                ? 'This course is published. Unpublish it first to delete this activity.'
                : undefined
            )
          }
          className="text-red-600 hover:text-red-700"
        >
          Delete
        </Button>
      </div>
    );
  };

  const renderActivityPreview = (activity: Activity) => {
    if (activity.type === 'article') {
      const payload = activity.payload as {
        title?: string;
        body?: string;
        image_url?: string;
      };

      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {payload.title || 'Untitled article'}
          </p>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {getPlainTextPreview(payload.body || '') || 'No content yet.'}
          </p>
        </div>
      );
    }

    if (activity.type === 'video') {
      const payload = activity.payload as {
        video_url?: string;
        youtube_id?: string;
      };

      const thumbnail = getYoutubeThumbnail(
        payload.video_url,
        payload.youtube_id
      );

      return (
        <div className="flex items-start gap-3">
          {thumbnail ? (
            <div className="relative h-12 w-20 flex-shrink-0 overflow-hidden rounded-md bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={thumbnail}
                alt="Video thumbnail"
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="line-clamp-1 text-xs text-muted-foreground">
              {payload.youtube_id ||
                payload.video_url ||
                'No video source set.'}
            </p>
          </div>
        </div>
      );
    }

    if (activity.type === 'image') {
      const payload = activity.payload as { image_url?: string };

      return (
        <p className="text-xs text-muted-foreground">
          {payload.image_url || 'No image URL set.'}
        </p>
      );
    }

    if (activity.type === 'quiz') {
      const payload = activity.payload as QuizPayload;

      return (
        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">
            {payload.question || 'Untitled quiz'}
          </p>
          <p className="text-xs text-muted-foreground">
            {payload.options?.filter(Boolean).length || 0} options ·{' '}
            {payload.format.replace('_', ' ')}
          </p>
        </div>
      );
    }

    return null;
  };

  const renderTree = () => {
    if (!course) {
      return null;
    }

    const units = course.units || [];

    if (units.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-border bg-muted/10 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            This course has no units yet.
          </p>
          <Button
            className="mt-4"
            size="sm"
            Icon={AqPlus}
            onClick={() => setDialog({ type: 'unit', item: null })}
          >
            Add first unit
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {units.map((unit, unitIndex) => {
          const lessons = unit.lessons || [];

          return (
            <div
              key={unit._id}
              className="rounded-2xl border border-border bg-card/90 shadow-sm"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border bg-muted/30 p-4 sm:p-5">
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <AqLayersThree01 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Unit {unitIndex + 1}
                    </p>
                    <h3 className="text-base font-semibold text-foreground">
                      {unit.title}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {unit.plain_title_key} · Order {unit.unit_order}
                    </p>
                  </div>
                </div>
                {renderUnitActions(unit)}
              </div>

              <div className="p-4 sm:p-5">
                {lessons.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/10 p-4 text-center text-sm text-muted-foreground">
                    No lessons in this unit yet.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {lessons.map((lesson, lessonIndex) => {
                      const activities = lesson.activities || [];

                      return (
                        <div
                          key={lesson._id}
                          className="rounded-xl border border-border bg-background"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border bg-muted/20 p-3 sm:p-4">
                            <div className="flex items-start gap-3">
                              {(() => {
                                const lessonCoverUrl = normalizeCoverImageUrl(
                                  lesson.cover_image_url
                                );
                                return lessonCoverUrl ? (
                                  <div className="relative h-10 w-14 flex-shrink-0 overflow-hidden rounded-md bg-muted">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={lessonCoverUrl}
                                      alt={lesson.title}
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                    <AqFile01 className="h-4 w-4" />
                                  </div>
                                );
                              })()}
                              <div>
                                <p className="text-xs font-medium text-muted-foreground">
                                  Lesson {lessonIndex + 1}
                                </p>
                                <h4 className="text-sm font-semibold text-foreground">
                                  {lesson.title}
                                </h4>
                                <p className="text-xs text-muted-foreground">
                                  {lesson.plain_title_key} · Order{' '}
                                  {lesson.lesson_order}
                                </p>
                              </div>
                            </div>
                            {renderLessonActions(lesson, unit)}
                          </div>

                          <div className="p-3 sm:p-4">
                            {activities.length === 0 ? (
                              <div className="rounded-lg border border-dashed border-border bg-muted/10 p-3 text-center text-xs text-muted-foreground">
                                No activities in this lesson yet.
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {activities.map((activity, activityIndex) => (
                                  <div
                                    key={activity._id}
                                    className="flex flex-wrap items-start justify-between gap-3 rounded-lg border border-border bg-muted/10 p-3"
                                  >
                                    <div className="flex items-start gap-3">
                                      <div
                                        className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full ${getActivityIconClass(
                                          activity.type
                                        )}`}
                                      >
                                        <ActivityIcon type={activity.type} />
                                      </div>
                                      <div>
                                        <p className="text-xs font-medium text-muted-foreground">
                                          Activity {activityIndex + 1} ·{' '}
                                          {getActivityTypeLabel(activity.type)}
                                        </p>
                                        <div className="mt-1 max-w-md">
                                          {renderActivityPreview(activity)}
                                        </div>
                                      </div>
                                    </div>
                                    {renderActivityActions(activity, lesson)}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  if (courseLoading) {
    return (
      <PermissionGuard
        requireAirQoSuperAdmin={true}
        accessDeniedTitle="Access Restricted"
        accessDeniedMessage="You need system administrator permissions to manage courses."
      >
        <LoadingState
          className="min-h-[calc(100vh-220px)]"
          text="Loading course details..."
        />
      </PermissionGuard>
    );
  }

  if (courseError || !course) {
    return (
      <PermissionGuard
        requireAirQoSuperAdmin={true}
        accessDeniedTitle="Access Restricted"
        accessDeniedMessage="You need system administrator permissions to manage courses."
      >
        <div className="space-y-6">
          <Button variant="ghost" Icon={AqArrowLeft} onClick={handleBack}>
            Back to courses
          </Button>
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              {courseError
                ? getUserFriendlyErrorMessage(courseError)
                : 'Course not found.'}
            </p>
          </Card>
        </div>
      </PermissionGuard>
    );
  }

  const statusTone = course.published
    ? 'bg-emerald-500 text-white'
    : 'bg-amber-500 text-white';

  const coverUrl = normalizeCoverImageUrl(course.cover_image_url);

  return (
    <PermissionGuard
      requireAirQoSuperAdmin={true}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administrator permissions to manage courses."
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" Icon={AqArrowLeft} onClick={handleBack}>
            Back
          </Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outlined"
              size="sm"
              Icon={AqRefreshCw05}
              onClick={handleRefresh}
              loading={courseLoading || isValidating}
            >
              Refresh
            </Button>
            <Button
              variant="outlined"
              size="sm"
              Icon={AqEdit05}
              onClick={() => setDialog({ type: 'course', item: course })}
            >
              Edit
            </Button>
            <Button
              variant={course.published ? 'danger' : 'filled'}
              size="sm"
              onClick={handlePublishToggle}
              loading={isProcessing}
            >
              {course.published ? 'Unpublish' : 'Publish'}
            </Button>
            <Button
              variant="danger"
              size="sm"
              Icon={AqTrash01}
              onClick={() =>
                openDeleteDialog(
                  'course',
                  course,
                  handleDeleteCourse,
                  course.published
                    ? 'Unpublish the course before deleting.'
                    : undefined
                )
              }
            >
              Delete
            </Button>
          </div>
        </div>

        <Card className="overflow-hidden p-0">
          <div className="flex flex-col sm:flex-row">
            <div className="relative w-full flex-shrink-0 overflow-hidden sm:w-52 md:w-64">
              <CourseCoverImage
                src={coverUrl}
                alt={course.title}
                aspectRatio="3/4"
                className="h-full"
              />
            </div>

            <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusTone}`}
                >
                  {course.published ? 'Published' : 'Draft'}
                </span>
                <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-foreground">
                  #{course.course_number}
                </span>
              </div>

              <h1 className="mt-3 text-xl font-bold text-foreground sm:text-2xl">
                {course.title}
              </h1>

              {course.plain_title_key && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {course.plain_title_key}
                </p>
              )}

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="rounded-lg border border-border bg-muted/15 p-3 text-center">
                  <p className="text-lg font-semibold text-foreground">
                    {counts.unitCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Units</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/15 p-3 text-center">
                  <p className="text-lg font-semibold text-foreground">
                    {counts.lessonCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Lessons</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/15 p-3 text-center">
                  <p className="text-lg font-semibold text-foreground">
                    {counts.activityCount}
                  </p>
                  <p className="text-xs text-muted-foreground">Activities</p>
                </div>
              </div>

              <div className="mt-auto flex flex-wrap items-center gap-4 pt-4 text-xs text-muted-foreground">
                <span>Created {formatDateTime(course.created_at)}</span>
                <span>Updated {formatDateTime(course.updated_at)}</span>
                {course.catalog_version && (
                  <span>Catalog {course.catalog_version}</span>
                )}
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Course content
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Manage units, lessons, and activities.
              </p>
            </div>
            <Button
              size="sm"
              Icon={AqPlus}
              onClick={() => setDialog({ type: 'unit', item: null })}
            >
              Add unit
            </Button>
          </div>

          <div className="mt-5">{renderTree()}</div>
        </Card>

        {dialog?.type === 'course' && (
          <CourseFormDialog
            isOpen
            course={dialog.item}
            onClose={() => setDialog(null)}
            onSaved={refreshData}
          />
        )}

        {dialog?.type === 'unit' && (
          <UnitFormDialog
            isOpen
            course={course}
            unit={dialog.item}
            onClose={() => setDialog(null)}
            onSaved={refreshData}
          />
        )}

        {dialog?.type === 'lesson' && (
          <LessonFormDialog
            isOpen
            unit={dialog.parent}
            lesson={dialog.item}
            onClose={() => setDialog(null)}
            onSaved={refreshData}
          />
        )}

        {dialog?.type === 'activity' && (
          <ActivityFormDialog
            isOpen
            lesson={dialog.parent}
            activity={dialog.item}
            onClose={() => setDialog(null)}
            onSaved={refreshData}
          />
        )}

        {dialog?.type === 'delete' && (
          <DeleteConfirmDialog
            isOpen
            title={`Delete ${dialog.itemType}`}
            itemName={dialog.itemName}
            warning={dialog.warning}
            confirmLabel={`Delete ${dialog.itemType}`}
            isDeleting={isProcessing}
            onClose={() => {
              if (!isProcessing) {
                setDialog(null);
              }
            }}
            onConfirm={async () => {
              await dialog.onConfirm();
            }}
          />
        )}

        {dialog?.type === 'validation' && (
          <PublishValidationDialog
            isOpen
            issues={dialog.issues}
            onClose={() => setDialog(null)}
          />
        )}
      </div>
    </PermissionGuard>
  );
};

export default CourseDetailPage;
