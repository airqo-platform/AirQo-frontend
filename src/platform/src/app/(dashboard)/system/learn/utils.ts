import type {
  Activity,
  ActivityType,
  Course,
  Lesson,
  Unit,
  QuizPayload,
} from '@/shared/types/learn';

export const ACTIVITY_TYPES: { value: ActivityType; label: string }[] = [
  { value: 'article', label: 'Article' },
  { value: 'video', label: 'Video' },
  { value: 'image', label: 'Image' },
  { value: 'quiz', label: 'Quiz' },
];

export const QUIZ_FORMATS: { value: QuizPayload['format']; label: string }[] = [
  { value: 'single_choice', label: 'Single choice' },
  { value: 'multi_choice', label: 'Multiple choice' },
  { value: 'ranking', label: 'Ranking' },
  { value: 'free_text', label: 'Free text' },
];

export const getActivityTypeLabel = (type?: ActivityType | string): string => {
  const match = ACTIVITY_TYPES.find(item => item.value === type);
  return match?.label || String(type || 'Unknown');
};

export const getActivityIconClass = (type?: ActivityType | string): string => {
  switch (type) {
    case 'article':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300';
    case 'video':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300';
    case 'image':
      return 'bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300';
    case 'quiz':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export const formatDateTime = (value?: string | null): string => {
  if (!value) {
    return '—';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const computeCourseCounts = (course: Course) => {
  const units = course.units || [];
  const lessons = units.flatMap(unit => unit.lessons || []);
  const activities = lessons.flatMap(lesson => lesson.activities || []);

  return {
    unitCount: units.length,
    lessonCount: lessons.length,
    activityCount: activities.length,
  };
};

export const getNextUnitOrder = (course: Course): number => {
  const units = course.units || [];
  const maxOrder = units.reduce(
    (max, unit) => Math.max(max, unit.unit_order || 0),
    0
  );
  return maxOrder + 1;
};

export const getNextLessonOrder = (unit: Unit): number => {
  const lessons = unit.lessons || [];
  const maxOrder = lessons.reduce(
    (max, lesson) => Math.max(max, lesson.lesson_order || 0),
    0
  );
  return maxOrder + 1;
};

export const getNextActivityOrder = (lesson: Lesson): number => {
  const activities = lesson.activities || [];
  const maxOrder = activities.reduce(
    (max, activity) => Math.max(max, activity.order || 0),
    0
  );
  return maxOrder + 1;
};

export const getPublishValidationIssues = (
  course: Course | undefined
): string[] => {
  if (!course) {
    return [];
  }

  const issues: string[] = [];
  const units = course.units || [];

  if (units.length === 0) {
    issues.push('At least one unit is required.');
  }

  units.forEach(unit => {
    const lessons = unit.lessons || [];

    if (lessons.length === 0) {
      issues.push(`Unit "${unit.title}" has no lessons.`);
    }

    lessons.forEach(lesson => {
      const activities = lesson.activities || [];

      if (activities.length === 0) {
        issues.push(`Lesson "${lesson.title}" has no activities.`);
      }
    });
  });

  if (!course.cover_image_url) {
    issues.push('A cover image URL is required before publishing.');
  }

  return issues;
};

export const isPublishedCourse = (course: Course | undefined): boolean => {
  return Boolean(course?.published);
};

const normalizeNbsp = (text: string): string =>
  text.replace(/&nbsp;/gi, ' ').replace(/\u00a0/g, ' ');

export const isHtmlEmpty = (html: string): boolean =>
  !html || normalizeNbsp(html.replace(/<[^>]*>/g, '')).trim().length === 0;

export const stripHtmlTags = (html: string): string =>
  normalizeNbsp(html.replace(/<[^>]*>/g, '')).trim();

export const getPlainTextPreview = (text: string, maxLength = 120): string => {
  if (!text) return '';
  const hasTags = /<[a-z][\s\S]*>/i.test(text);
  const plain = hasTags ? stripHtmlTags(text) : text;
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).trimEnd() + '...';
};

const YOUTUBE_REGEX =
  /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;

export const extractYoutubeId = (
  videoUrl?: string,
  youtubeId?: string
): string | null => {
  if (youtubeId && youtubeId.trim().length === 11) {
    return youtubeId.trim();
  }

  if (!videoUrl) return null;

  const match = videoUrl.match(YOUTUBE_REGEX);
  return match ? match[1] : null;
};

export const getYoutubeThumbnail = (
  videoUrl?: string,
  youtubeId?: string
): string | null => {
  const id = extractYoutubeId(videoUrl, youtubeId);
  return id ? `https://img.youtube.com/vi/${id}/mqdefault.jpg` : null;
};

export const normalizeCoverImageUrl = (
  url: string | null | undefined
): string | null => {
  if (!url || typeof url !== 'string') {
    return null;
  }

  const trimmed = url.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed;
};

export const isActivityEmpty = (activity: Activity): boolean => {
  if (!activity.payload) {
    return true;
  }

  if (activity.type === 'article') {
    const payload = activity.payload as { title?: string; body?: string };
    return !payload.title?.trim() && !payload.body?.trim();
  }

  if (activity.type === 'video') {
    const payload = activity.payload as {
      video_url?: string;
      youtube_id?: string;
    };
    return !payload.video_url?.trim() && !payload.youtube_id?.trim();
  }

  if (activity.type === 'image') {
    const payload = activity.payload as { image_url?: string };
    return !payload.image_url?.trim();
  }

  if (activity.type === 'quiz') {
    const payload = activity.payload as QuizPayload;
    return !payload.question?.trim();
  }

  return false;
};

export const createEmptyArticlePayload = (): {
  title: string;
  body: string;
  image_url: string;
  tts_enabled: boolean;
} => ({
  title: '',
  body: '',
  image_url: '',
  tts_enabled: true,
});

export const createEmptyVideoPayload = (): {
  video_url: string;
  youtube_id: string;
} => ({
  video_url: '',
  youtube_id: '',
});

export const createEmptyImagePayload = (): { image_url: string } => ({
  image_url: '',
});

export const createEmptyQuizPayload = (): {
  format: QuizPayload['format'];
  question: string;
  options: string[];
  correct_index: number;
} => ({
  format: 'single_choice',
  question: '',
  options: ['', ''],
  correct_index: 0,
});
