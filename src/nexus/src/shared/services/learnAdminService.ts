/* eslint-disable @typescript-eslint/no-explicit-any */
import { ApiClient, createAuthenticatedClient } from './apiClient';
import { syncClientSessionToken } from './sessionAuthToken';
import type {
  Course,
  CourseListResponse,
  CourseResponse,
  CourseSummary,
  CreateCourseRequest,
  CreateUnitRequest,
  CreateLessonRequest,
  CreateActivityRequest,
  UpdateCourseRequest,
  UpdateUnitRequest,
  UpdateLessonRequest,
  UpdateActivityRequest,
  UnitResponse,
  LessonResponse,
  ActivityResponse,
  DeleteResponse,
} from '../types/learn';

const extractResponseData = <T extends { success?: boolean; message?: string }>(
  data: T,
  fallbackMessage: string
): T => {
  if ('success' in data && data.success === false) {
    throw new Error(data.message || fallbackMessage);
  }

  return data;
};

const encodeId = (id: string): string => encodeURIComponent(id);

export class LearnAdminService {
  private authenticatedClient: ApiClient;

  constructor() {
    this.authenticatedClient = createAuthenticatedClient();
  }

  private async ensureAuthenticated() {
    await syncClientSessionToken(this.authenticatedClient);
  }

  // Courses
  async getCourses(): Promise<CourseSummary[]> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.get<CourseListResponse>(
      '/devices/learn/admin/courses'
    );

    const data = extractResponseData(response.data, 'Failed to load courses');

    return data.courses || [];
  }

  async getCourseById(courseId: string): Promise<Course> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.get<CourseResponse>(
      `/devices/learn/admin/courses/${encodeId(courseId)}`
    );

    const data = extractResponseData(
      response.data,
      'Failed to load course details'
    );

    if (!data.course) {
      throw new Error('Course not found');
    }

    return data.course;
  }

  async createCourse(payload: CreateCourseRequest): Promise<Course> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.post<CourseResponse>(
      '/devices/learn/admin/courses',
      payload
    );

    const data = extractResponseData(response.data, 'Failed to create course');

    if (!data.course) {
      throw new Error('Course creation failed');
    }

    return data.course;
  }

  async updateCourse(
    courseId: string,
    payload: UpdateCourseRequest
  ): Promise<Course> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.patch<CourseResponse>(
      `/devices/learn/admin/courses/${encodeId(courseId)}`,
      payload
    );

    const data = extractResponseData(response.data, 'Failed to update course');

    if (!data.course) {
      throw new Error('Course update failed');
    }

    return data.course;
  }

  async deleteCourse(courseId: string): Promise<void> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.delete<DeleteResponse>(
      `/devices/learn/admin/courses/${encodeId(courseId)}`
    );

    extractResponseData(response.data, 'Failed to delete course');
  }

  // Units
  async createUnit(
    courseId: string,
    payload: CreateUnitRequest
  ): Promise<UnitResponse['unit']> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.post<UnitResponse>(
      `/devices/learn/admin/courses/${encodeId(courseId)}/units`,
      payload
    );

    const data = extractResponseData(response.data, 'Failed to create unit');

    if (!data.unit) {
      throw new Error('Unit creation failed');
    }

    return data.unit;
  }

  async updateUnit(
    unitId: string,
    payload: UpdateUnitRequest
  ): Promise<UnitResponse['unit']> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.patch<UnitResponse>(
      `/devices/learn/admin/units/${encodeId(unitId)}`,
      payload
    );

    const data = extractResponseData(response.data, 'Failed to update unit');

    if (!data.unit) {
      throw new Error('Unit update failed');
    }

    return data.unit;
  }

  async deleteUnit(unitId: string): Promise<void> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.delete<DeleteResponse>(
      `/devices/learn/admin/units/${encodeId(unitId)}`
    );

    extractResponseData(response.data, 'Failed to delete unit');
  }

  // Lessons
  async createLesson(
    unitId: string,
    payload: CreateLessonRequest
  ): Promise<LessonResponse['lesson']> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.post<LessonResponse>(
      `/devices/learn/admin/units/${encodeId(unitId)}/lessons`,
      payload
    );

    const data = extractResponseData(response.data, 'Failed to create lesson');

    if (!data.lesson) {
      throw new Error('Lesson creation failed');
    }

    return data.lesson;
  }

  async updateLesson(
    lessonId: string,
    payload: UpdateLessonRequest
  ): Promise<LessonResponse['lesson']> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.patch<LessonResponse>(
      `/devices/learn/admin/lessons/${encodeId(lessonId)}`,
      payload
    );

    const data = extractResponseData(response.data, 'Failed to update lesson');

    if (!data.lesson) {
      throw new Error('Lesson update failed');
    }

    return data.lesson;
  }

  async deleteLesson(lessonId: string): Promise<void> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.delete<DeleteResponse>(
      `/devices/learn/admin/lessons/${encodeId(lessonId)}`
    );

    extractResponseData(response.data, 'Failed to delete lesson');
  }

  // Activities
  async createActivity(
    lessonId: string,
    payload: CreateActivityRequest
  ): Promise<ActivityResponse['activity']> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.post<ActivityResponse>(
      `/devices/learn/admin/lessons/${encodeId(lessonId)}/activities`,
      payload
    );

    const data = extractResponseData(
      response.data,
      'Failed to create activity'
    );

    if (!data.activity) {
      throw new Error('Activity creation failed');
    }

    return data.activity;
  }

  async updateActivity(
    activityId: string,
    payload: UpdateActivityRequest
  ): Promise<ActivityResponse['activity']> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.patch<ActivityResponse>(
      `/devices/learn/admin/activities/${encodeId(activityId)}`,
      payload
    );

    const data = extractResponseData(
      response.data,
      'Failed to update activity'
    );

    if (!data.activity) {
      throw new Error('Activity update failed');
    }

    return data.activity;
  }

  async deleteActivity(activityId: string): Promise<void> {
    await this.ensureAuthenticated();

    const response = await this.authenticatedClient.delete<DeleteResponse>(
      `/devices/learn/admin/activities/${encodeId(activityId)}`
    );

    extractResponseData(response.data, 'Failed to delete activity');
  }
}

export const learnAdminService = new LearnAdminService();
