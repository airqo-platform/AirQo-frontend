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
    int initialUnitIndex = 0,
  }) {
    final callerContext = context;
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: false,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return DraggableScrollableSheet(
          initialChildSize: 0.88,
          minChildSize: 0.5,
          maxChildSize: 0.95,
          expand: true,
          builder: (_, __) {
            return Container(
              decoration: BoxDecoration(
                color: LearnDesignTokens.cardBg(sheetContext),
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(LearnDesignTokens.sheetTopRadius),
                ),
              ),
              clipBehavior: Clip.antiAlias,
              child: _LearnCourseSheetHost(
                callerContext: callerContext,
                course: course,
                allCourses: allCourses,
                initialUnitIndex: initialUnitIndex,
              ),
            );
          },
        );
      },
    );
  }

  static Future<void> showLesson(
    BuildContext context, {
    required KyaLesson lesson,
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

class _LearnCourseSheetHost extends StatelessWidget {
  final BuildContext callerContext;
  final LearnCourseViewModel course;
  final List<LearnCourseViewModel> allCourses;
  final int initialUnitIndex;

  const _LearnCourseSheetHost({
    required this.callerContext,
    required this.course,
    required this.allCourses,
    required this.initialUnitIndex,
  });

  @override
  Widget build(BuildContext context) {
    return LearnCourseDetailPage(
      course: course,
      allCourses: allCourses,
      initialUnitIndex: initialUnitIndex,
      onLessonTap: (course, unit, lessonIndex, slot) {
        if (slot.apiLesson == null) return;
        final continuation = LearnCatalog.continuationFor(
          course,
          unit,
          lessonIndex,
          allCourses,
        );
        Navigator.of(context).pop();
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!callerContext.mounted) return;
          LearnBottomSheets.showLesson(
            callerContext,
            lesson: slot.apiLesson!,
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
  }
}
