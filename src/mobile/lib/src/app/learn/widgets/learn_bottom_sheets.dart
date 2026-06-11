import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_continuation.dart';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/pages/learn_course_detail_page.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_lesson_experience.dart';
import 'package:flutter/material.dart';

class LearnBottomSheets {
  LearnBottomSheets._();

  static Future<void> showCourseDetail(
    BuildContext context, {
    required LearnCourseViewModel course,
    required List<LearnCourseViewModel> allCourses,
  }) {
    final callerContext = context;
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: false,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return LearnCourseDetailPage(
          course: course,
          allCourses: allCourses,
          onLessonTap: (course, unit, unitIndex, lessonIndex, slot) {
            final continuation = LearnCatalog.continuationFor(
              course,
              unit,
              unitIndex,
              lessonIndex,
              allCourses,
            );
            Navigator.of(sheetContext).pop();
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (!callerContext.mounted) return;
              showLessonExperience(
                callerContext,
                slot: slot,
                course: course,
                unitIndex: unitIndex,
                lessonIndex: lessonIndex,
                unitPlainTitle: unit.plainTitleKey,
                lessonNumberInUnit: lessonIndex + 1,
                lessonsInUnit: unit.lessons.length,
                allCourses: allCourses,
                continuation: continuation,
              );
            });
          },
        );
      },
    );
  }

  static Future<void> showLessonExperience(
    BuildContext context, {
    required LearnLessonSlot slot,
    required LearnCourseViewModel course,
    required int unitIndex,
    required int lessonIndex,
    required String unitPlainTitle,
    int lessonNumberInUnit = 1,
    int lessonsInUnit = 1,
    List<LearnCourseViewModel>? allCourses,
    LearnLessonContinuation? continuation,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      useSafeArea: true,
      builder: (sheetContext) {
        return Container(
          height: MediaQuery.of(sheetContext).size.height * 0.92,
          decoration: BoxDecoration(
            color: Theme.of(sheetContext).scaffoldBackgroundColor,
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(LearnDesignTokens.sheetTopRadius),
            ),
          ),
          clipBehavior: Clip.antiAlias,
          child: LearnLessonExperience(
            slot: slot,
            apiLesson: slot.apiLesson,
            course: course,
            unitIndex: unitIndex,
            lessonIndex: lessonIndex,
            unitPlainTitle: unitPlainTitle,
            lessonNumberInUnit: lessonNumberInUnit,
            lessonsInUnit: lessonsInUnit,
            allCourses: allCourses,
            continuation: continuation,
            onClose: () => Navigator.of(sheetContext).pop(),
          ),
        );
      },
    );
  }

  /// Legacy entry for flat KYA list cards.
  static Future<void> showLesson(
    BuildContext context, {
    required KyaLesson lesson,
    String? progressKey,
    String? unitPlainTitle,
    int lessonNumberInUnit = 1,
    int lessonsInUnit = 1,
    LearnLessonContinuation? continuation,
    List<LearnCourseViewModel>? allCourses,
  }) {
    final slot = LearnLessonSlot(
      catalogId: progressKey ?? lesson.id,
      plainTitleKey: lesson.title,
      apiLesson: lesson,
    );

    if (allCourses != null && continuation != null) {
      final course =
          allCourses.firstWhere((c) => c.id == continuation.learnCourseId);
      return showLessonExperience(
        context,
        slot: slot,
        course: course,
        unitIndex: continuation.unitIndex,
        lessonIndex: continuation.lessonIndex,
        unitPlainTitle: unitPlainTitle ?? continuation.unitPlainTitle,
        lessonNumberInUnit: lessonNumberInUnit,
        lessonsInUnit: lessonsInUnit,
        allCourses: allCourses,
        continuation: continuation,
      );
    }

    final legacyCourse = LearnCourseViewModel(
      id: 'legacy_kya',
      courseNumber: 1,
      title: lesson.title,
      plainTitleKey: lesson.title,
      units: [
        LearnUnitViewModel(
          id: 'legacy_u1',
          title: 'Lesson',
          plainTitleKey: unitPlainTitle ?? 'Lesson',
          lessons: [slot],
        ),
      ],
    );

    return showLessonExperience(
      context,
      slot: slot,
      course: legacyCourse,
      unitIndex: 0,
      lessonIndex: 0,
      unitPlainTitle: unitPlainTitle ?? 'Lesson',
      lessonNumberInUnit: lessonNumberInUnit,
      lessonsInUnit: lessonsInUnit,
      allCourses: const [],
      continuation: continuation,
    );
  }
}
