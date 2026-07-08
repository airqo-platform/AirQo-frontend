import 'package:airqo/src/app/shared/services/analytics_service.dart';

extension LearnAnalyticsEvents on AnalyticsService {
  Future<void> trackLearnSectionViewed() => trackEvent('learn_section_viewed');

  Future<void> trackLessonViewed({String? lessonId}) =>
      trackEvent('lesson_viewed', properties: {
        if (lessonId != null) 'lesson_id': lessonId,
      });

  Future<void> trackLessonCompleted({String? lessonId}) =>
      trackEvent('lesson_completed', properties: {
        if (lessonId != null) 'lesson_id': lessonId,
      });
}
