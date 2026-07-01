import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_continuation.dart';
import 'package:airqo/src/app/learn/pages/learn_course_detail_page.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_course_certificate.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_lesson_experience.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_lesson_finish_pane.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_level_unlock_pane.dart';
import 'package:airqo/src/app/learn/widgets/learn_completion_sheet.dart';
import 'package:airqo/src/app/learn/widgets/learn_lesson_confetti.dart';
import 'package:flutter/material.dart';

class LearnBottomSheets {
  LearnBottomSheets._();

  static Widget _lessonCompletionStack(BuildContext sheetContext, Widget pane) {
    return LearnCompletionSheet.compactShell(
      context: sheetContext,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          pane,
          const Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 100,
            child: LearnLessonConfetti(),
          ),
        ],
      ),
    );
  }

  static Widget _courseCompletionStack(BuildContext sheetContext, Widget pane) {
    return LearnCompletionSheet.shell(
      context: sheetContext,
      child: Stack(
        fit: StackFit.expand,
        children: [
          pane,
          const LearnLessonConfetti(),
        ],
      ),
    );
  }

  static Future<void> showLessonComplete(
    BuildContext context, {
    required LearnLessonResult result,
    required int lessonNumberInUnit,
    required int lessonsInUnit,
    String? unitPlainTitle,
    LearnLessonContinuation? continuation,
    List<LearnCourseViewModel>? allCourses,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useRootNavigator: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return _lessonCompletionStack(
          sheetContext,
          LearnLessonFinishPane(
            result: result,
            lessonNumberInUnit: lessonNumberInUnit,
            lessonsInUnit: lessonsInUnit,
            unitPlainTitle: unitPlainTitle,
            onDone: () => Navigator.of(sheetContext).pop(),
            onNext: continuation == null
                ? null
                : () {
                    Navigator.of(sheetContext).pop();
                    if (!context.mounted) return;
                    _openNextLesson(
                      context,
                      continuation: continuation,
                      allCourses: allCourses,
                    );
                  },
            isNextUnit: continuation?.isNextUnit ?? false,
          ),
        );
      },
    );
  }

  static Future<void> showCourseComplete(
    BuildContext context, {
    required LearnCourseViewModel course,
    required LearnStageInfo stage,
  }) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useRootNavigator: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return _courseCompletionStack(
          sheetContext,
          LearnCourseCertificatePane(
            course: course,
            stage: stage,
            onDone: () => Navigator.of(sheetContext).pop(),
          ),
        );
      },
    );
  }

  static Future<void> _openNextLesson(
    BuildContext context, {
    required LearnLessonContinuation continuation,
    List<LearnCourseViewModel>? allCourses,
  }) async {
    final courses = allCourses;
    if (courses == null) return;

    final courseIndex =
        courses.indexWhere((c) => c.id == continuation.learnCourseId);
    if (courseIndex == -1) return;

    final course = courses[courseIndex];
    if (continuation.unitIndex < 0 ||
        continuation.unitIndex >= course.units.length) {
      return;
    }

    final unit = course.units[continuation.unitIndex];
    final chain = LearnCatalog.continuationFor(
      course,
      unit,
      continuation.unitIndex,
      continuation.lessonIndex,
      courses,
    );

    await showLessonExperience(
      context,
      slot: continuation.nextSlot,
      course: course,
      unitIndex: continuation.unitIndex,
      lessonIndex: continuation.lessonIndex,
      unitPlainTitle: continuation.unitPlainTitle,
      lessonNumberInUnit: continuation.lessonNumberInUnit,
      lessonsInUnit: continuation.lessonsInUnit,
      allCourses: courses,
      continuation: chain,
    );
  }

  static Future<void> showLevelUnlockDemo(BuildContext context) {
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (sheetContext) {
        return DecoratedBox(
          decoration: BoxDecoration(
            color: LearnCompletionSheet.sheetBackground(sheetContext),
            borderRadius: const BorderRadius.vertical(
              top: Radius.circular(LearnDesignTokens.sheetTopRadius),
            ),
          ),
          child: LearnLevelUnlockPane(
            previousStage: LearnCatalog.stages[0],
            newStage: LearnCatalog.stages[1],
            onContinue: () => Navigator.of(sheetContext).pop(),
          ),
        );
      },
    );
  }

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
        return SizedBox(
          height: MediaQuery.sizeOf(sheetContext).height,
          child: LearnCourseDetailPage(
            course: course,
            allCourses: allCourses,
            onLessonTap: (course, unit, unitIndex, lessonIndex, slot) async {
            final continuation = LearnCatalog.continuationFor(
              course,
              unit,
              unitIndex,
              lessonIndex,
              allCourses,
            );
            await Navigator.of(sheetContext).maybePop();
            if (!callerContext.mounted) return;
            await showLessonExperience(
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
          },
          ),
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
    final callerContext = context;
    return showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useRootNavigator: true,
      backgroundColor: Colors.transparent,
      useSafeArea: false,
      builder: (sheetContext) {
        final sheetHeight = MediaQuery.sizeOf(sheetContext).height * 0.92;
        return SizedBox(
          height: sheetHeight,
          width: double.infinity,
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: LearnDesignTokens.sheetBg(sheetContext),
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(LearnDesignTokens.sheetTopRadius),
              ),
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(LearnDesignTokens.sheetTopRadius),
              ),
              child: LearnLessonExperience(
                slot: slot,
                course: course,
                unitIndex: unitIndex,
                lessonIndex: lessonIndex,
                unitPlainTitle: unitPlainTitle,
                lessonNumberInUnit: lessonNumberInUnit,
                lessonsInUnit: lessonsInUnit,
                allCourses: allCourses,
                continuation: continuation,
                completionContext: callerContext,
                onClose: () => Navigator.of(sheetContext).pop(),
              ),
            ),
          ),
        );
      },
    );
  }

}
