// Learn Admin API types

export type ActivityType = 'article' | 'video' | 'image' | 'quiz';

export type QuizFormat =
  | 'single_choice'
  | 'multi_choice'
  | 'ranking'
  | 'free_text';

export interface ArticlePayload {
  title: string;
  body: string;
  image_url?: string;
  tts_enabled?: boolean;
}

export interface VideoPayload {
  video_url?: string;
  youtube_id?: string;
}

export interface ImagePayload {
  image_url: string;
}

export interface QuizPayload {
  format: QuizFormat;
  question: string;
  options: string[];
  correct_index?: number;
}

export type ActivityPayload =
  | ArticlePayload
  | VideoPayload
  | ImagePayload
  | QuizPayload;

export interface Activity {
  _id: string;
  lesson_id: string;
  type: ActivityType;
  order: number;
  payload: ActivityPayload;
  createdAt?: string;
  updatedAt?: string;
}

export interface Lesson {
  _id: string;
  unit_id: string;
  title: string;
  plain_title_key: string;
  lesson_order: number;
  cover_image_url: string | null;
  completion_message: string | null;
  activities: Activity[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Unit {
  _id: string;
  course_id: string;
  title: string;
  plain_title_key: string;
  unit_order: number;
  lessons: Lesson[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CourseSummary {
  _id: string;
  course_number: number;
  title: string;
  plain_title_key: string;
  cover_image_url: string | null;
  published: boolean;
  catalog_version?: string;
  unit_count: number;
  lesson_count: number;
  activity_count: number;
  created_at: string;
  updated_at: string;
}

export interface Course extends Omit<
  CourseSummary,
  'unit_count' | 'lesson_count' | 'activity_count'
> {
  units: Unit[];
}

export interface CreateCourseRequest {
  course_number: number;
  title: string;
  plain_title_key: string;
  cover_image_url?: string;
}

export interface UpdateCourseRequest {
  title?: string;
  plain_title_key?: string;
  cover_image_url?: string;
  published?: boolean;
}

export interface CreateUnitRequest {
  title: string;
  plain_title_key: string;
  unit_order: number;
}

export interface UpdateUnitRequest {
  title?: string;
  plain_title_key?: string;
  unit_order?: number;
}

export interface CreateLessonRequest {
  title: string;
  plain_title_key: string;
  lesson_order: number;
  cover_image_url?: string;
  completion_message?: string;
}

export interface UpdateLessonRequest {
  title?: string;
  plain_title_key?: string;
  lesson_order?: number;
  cover_image_url?: string;
  completion_message?: string;
}

export interface CreateActivityRequest {
  type: ActivityType;
  order: number;
  payload: ActivityPayload;
}

export interface UpdateActivityRequest {
  type?: ActivityType;
  order?: number;
  payload?: ActivityPayload;
}

export interface CourseListResponse {
  success: boolean;
  courses: CourseSummary[];
}

export interface CourseResponse {
  success: boolean;
  course: Course;
}

export interface UnitResponse {
  success: boolean;
  unit: Unit;
}

export interface LessonResponse {
  success: boolean;
  lesson: Lesson;
}

export interface ActivityResponse {
  success: boolean;
  activity: Activity;
}

export interface DeleteResponse {
  success: boolean;
  message: string;
}
