'use client';

import React, { useCallback, useMemo, useState } from 'react';
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
import { learnAdminService } from '@/shared/services';
import { getUserFriendlyErrorMessage } from '@/shared/utils/errorMessages';
import { refreshWithToast } from '@/shared/utils/refreshWithToast';
import type { CourseSummary } from '@/shared/types/learn';
import { formatDateTime, normalizeCoverImageUrl } from './utils';
import CourseFormDialog from './components/CourseFormDialog';
import CourseCoverImage from './components/CourseCoverImage';

const CourseListPage: React.FC = () => {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const {
    data: courses = [],
    error,
    isLoading,
    mutate,
    isValidating,
  } = useSWR('system/learn/courses', () => learnAdminService.getCourses(), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const summary = useMemo(() => {
    const published = courses.filter(course => course.published).length;
    const drafts = courses.length - published;
    const totalActivities = courses.reduce(
      (sum, course) => sum + (course.activity_count || 0),
      0
    );

    return {
      total: courses.length,
      published,
      drafts,
      totalActivities,
    };
  }, [courses]);

  const handleOpenCourse = useCallback(
    (courseId: string) => {
      router.push(`/system/learn/${courseId}`);
    },
    [router]
  );

  const handleRefresh = useCallback(async () => {
    try {
      await refreshWithToast(
        () => mutate(),
        'Course list refreshed successfully'
      );
    } catch (refreshError) {
      toast.error(getUserFriendlyErrorMessage(refreshError));
    }
  }, [mutate]);

  const handleSaved = useCallback(async () => {
    await mutate();
  }, [mutate]);

  const renderCourseCard = useCallback(
    (course: CourseSummary) => {
      const statusTone = course.published
        ? 'bg-emerald-500 text-white'
        : 'bg-amber-500 text-white';

      const coverUrl = normalizeCoverImageUrl(course.cover_image_url);

      return (
        <Card
          key={course._id}
          className="group flex h-full flex-col overflow-hidden border-border/70 bg-card/90 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
        >
          <div className="relative overflow-hidden">
            <CourseCoverImage
              src={coverUrl}
              alt={course.title}
              aspectRatio="16/9"
              className="transition-transform duration-300 group-hover:scale-[1.02]"
            />

            <div className="absolute bottom-3 left-3 flex flex-wrap gap-1.5">
              <span
                className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium backdrop-blur-md ${statusTone}`}
              >
                {course.published ? 'Published' : 'Draft'}
              </span>
              <span className="inline-flex rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                #{course.course_number}
              </span>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-4">
            <h3 className="truncate text-base font-semibold text-foreground">
              {course.title}
            </h3>
            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
              {course.plain_title_key}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
              <span>{course.unit_count || 0} units</span>
              <span>{course.lesson_count || 0} lessons</span>
              <span>{course.activity_count || 0} activities</span>
            </div>

            <div className="mt-auto flex items-center justify-between gap-3 pt-4">
              <p className="text-xs text-muted-foreground">
                Updated {formatDateTime(course.updated_at)}
              </p>

              <Button
                Icon={AqEye}
                iconPosition="start"
                variant="outlined"
                size="sm"
                onClick={() => handleOpenCourse(course._id)}
              >
                View details
              </Button>
            </div>
          </div>
        </Card>
      );
    },
    [handleOpenCourse]
  );

  return (
    <PermissionGuard
      requireAirQoSuperAdmin={true}
      accessDeniedTitle="Access Restricted"
      accessDeniedMessage="You need system administrator permissions to manage courses."
    >
      <div className="space-y-6">
        <PageHeading
          title="Course Management"
          subtitle="Create and manage AirQo Learn courses, units, lessons, and activities."
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
              <Button Icon={AqPlus} onClick={() => setIsCreateDialogOpen(true)}>
                Create course
              </Button>
            </div>
          }
        />

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total courses</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {summary.total}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Across all catalog versions.
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Published</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {summary.published}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Live courses available to users.
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Drafts</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {summary.drafts}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Courses still being authored.
            </p>
          </Card>

          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total activities</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {summary.totalActivities}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Articles, videos, images, and quizzes.
            </p>
          </Card>
        </div>

        {isLoading ? (
          <LoadingState className="min-h-[400px]" text="Loading courses..." />
        ) : error ? (
          <Card className="p-6">
            <p className="text-sm text-muted-foreground">
              {getUserFriendlyErrorMessage(error)}
            </p>
          </Card>
        ) : courses.length === 0 ? (
          <EmptyState
            title="No courses yet"
            description="Create your first course to start building the AirQo Learn catalog."
            action={{
              label: 'Create course',
              onClick: () => setIsCreateDialogOpen(true),
              variant: 'filled',
            }}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-1 lg:grid-cols-2">
            {courses.map(renderCourseCard)}
          </div>
        )}

        <CourseFormDialog
          isOpen={isCreateDialogOpen}
          course={null}
          onClose={() => setIsCreateDialogOpen(false)}
          onSaved={handleSaved}
        />
      </div>
    </PermissionGuard>
  );
};

export default CourseListPage;
