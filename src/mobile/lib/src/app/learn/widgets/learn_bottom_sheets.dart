import 'package:airqo/src/app/learn/models/lesson_response_model.dart';
import 'package:airqo/src/app/learn/pages/lesson_page.dart';
import 'package:flutter/material.dart';

/// Opens the lesson viewer inside a fixed-height modal bottom sheet.
///
/// Using [Container] with an explicit height (0.92 × screen height) is
/// intentional: it gives [LessonPage] a fully-bounded layout region so that
/// the card swiper and the progress stepper both have measured constraints.
/// DraggableScrollableSheet is intentionally avoided because its lazy sizing
/// leaves the child with unbounded height during the first frame, producing a
/// blank dark overlay.
Future<void> showLesson(BuildContext context, KyaLesson lesson) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    backgroundColor: Colors.transparent,
    useSafeArea: true,
    builder: (sheetContext) {
      return Container(
        height: MediaQuery.of(sheetContext).size.height * 0.92,
        decoration: BoxDecoration(
          color: Theme.of(sheetContext).scaffoldBackgroundColor,
          borderRadius: const BorderRadius.vertical(top: Radius.circular(16)),
        ),
        clipBehavior: Clip.antiAlias,
        child: LessonPage(lesson),
      );
    },
  );
}
