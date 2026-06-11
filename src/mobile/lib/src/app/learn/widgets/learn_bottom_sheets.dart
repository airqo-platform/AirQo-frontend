import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_continuation.dart';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/pages/learn_course_detail_page.dart';
import 'package:airqo/src/app/learn/pages/lesson_page.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
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
          onLessonTap: (course, unit, lessonIndex, slot) {
            if (slot.apiLesson == null) return;
            final continuation = LearnCatalog.continuationFor(
              course,
              unit,
              lessonIndex,
              allCourses,
            );
            Navigator.of(sheetContext).pop();
            WidgetsBinding.instance.addPostFrameCallback((_) {
              if (!callerContext.mounted) return;
              LearnBottomSheets.showLesson(
                callerContext,
                lesson: slot.apiLesson!,
                progressKey: slot.progressKey,
                unitPlainTitle: unit.plainTitleKey,
                courseTitle: course.title,
                lessonNumberInUnit: lessonIndex + 1,
                lessonsInUnit: unit.lessons.length,
                learnCourseId: course.id,
                continuation: continuation,
              );
            });
          },
        );
      },
    );
  }

  static Future<void> showLesson(
    BuildContext context, {
    required KyaLesson lesson,
    String? progressKey,
    String? unitPlainTitle,
    String? courseTitle,
    int lessonNumberInUnit = 1,
    int lessonsInUnit = 1,
    String? learnCourseId,
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
          child: LessonPage(
            lesson,
            presentedAsModalSheet: true,
            progressKey: progressKey,
            unitPlainTitle: unitPlainTitle,
            courseTitle: courseTitle,
            lessonNumberInUnit: lessonNumberInUnit,
            lessonsInUnit: lessonsInUnit,
            learnCourseId: learnCourseId,
            continuation: continuation,
          ),
        );
      },
    );
  }
}
