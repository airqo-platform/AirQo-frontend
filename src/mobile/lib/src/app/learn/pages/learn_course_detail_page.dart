import 'package:airqo/src/app/learn/formatting/learn_display_text.dart';
import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/widgets/learn_lesson_list_row.dart';
import 'package:airqo/src/app/learn/widgets/learn_unit_chip.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

typedef LearnLessonTapCallback = void Function(
  LearnCourseViewModel course,
  LearnUnitViewModel unit,
  int unitIndex,
  int lessonIndex,
  LearnLessonSlot slot,
);

class LearnCourseDetailPage extends StatefulWidget {
  final LearnCourseViewModel course;
  final List<LearnCourseViewModel> allCourses;
  final LearnLessonTapCallback onLessonTap;

  const LearnCourseDetailPage({
    super.key,
    required this.course,
    required this.allCourses,
    required this.onLessonTap,
  });

  @override
  State<LearnCourseDetailPage> createState() => _LearnCourseDetailPageState();
}

class _LearnCourseDetailPageState extends State<LearnCourseDetailPage> {
  late int _selectedUnitIndex;

  @override
  void initState() {
    super.initState();
    _selectedUnitIndex = LearnCatalog.defaultSelectedUnitIndex(
      widget.course,
      LearnProgressService.instance,
    );
  }

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder<int>(
      valueListenable: LearnProgressService.instance.revision,
      builder: (context, _, __) => _buildSheet(context),
    );
  }

  Widget _buildSheet(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.darkHighlight : Colors.white;
    final titleColor = isDark ? Colors.white : const Color(0xFF1A1D23);
    final subtitleColor = isDark
        ? AppColors.boldHeadlineColor2
        : AppColors.secondaryHeadlineColor4;
    final progress = LearnProgressService.instance;
    final course = widget.course;
    final completed = course.completedLessons(progress);
    final total = course.totalLessons;
    final selectedUnit = course.units[_selectedUnitIndex.clamp(
      0,
      course.units.length - 1,
    )];
    final unitUnlocked = LearnCatalog.isUnitUnlocked(
      course,
      _selectedUnitIndex,
      progress,
    );

    return DraggableScrollableSheet(
      initialChildSize: 0.88,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (ctx, scrollCtrl) {
        return Container(
          decoration: BoxDecoration(
            color: bg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: subtitleColor.withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 12, 0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Course ${course.courseNumber}',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.5,
                              color: subtitleColor,
                            ),
                          ),
                          const SizedBox(height: 2),
                          TranslatedText(
                            course.plainTitleKey,
                            style: TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w700,
                              height: 1.2,
                              color: titleColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            '$completed of $total lessons complete',
                            style: TextStyle(fontSize: 13, color: subtitleColor),
                          ),
                        ],
                      ),
                    ),
                    IconButton(
                      onPressed: () => Navigator.of(context).pop(),
                      icon: Icon(Icons.close, color: subtitleColor),
                      visualDensity: VisualDensity.compact,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              LearnUnitChipRow(
                course: course,
                selectedUnitIndex: _selectedUnitIndex,
                isDark: isDark,
                onUnitSelected: (index) {
                  setState(() => _selectedUnitIndex = index);
                },
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 10, 20, 0),
                child: TranslatedText(
                  learnUnitHeader(
                    _selectedUnitIndex,
                    selectedUnit.plainTitleKey,
                  ),
                  style: TextStyle(
                    fontSize: 11,
                    fontWeight: FontWeight.w700,
                    letterSpacing: 0.6,
                    color: subtitleColor,
                  ),
                ),
              ),
              const SizedBox(height: 12),
              Expanded(
                child: ListView.builder(
                  controller: scrollCtrl,
                  padding: const EdgeInsets.fromLTRB(20, 0, 20, 32),
                  itemCount: selectedUnit.lessons.length,
                  itemBuilder: (context, lessonIndex) {
                    final slot = selectedUnit.lessons[lessonIndex];
                    final lessonUnlocked = unitUnlocked &&
                        LearnCatalog.isLessonUnlocked(
                          selectedUnit,
                          lessonIndex,
                          progress,
                        );
                    final complete =
                        progress.isLessonComplete(slot.progressKey);
                    final ratio = progress.lessonProgressRatio(
                      slot.progressKey,
                      slot.activityCount,
                    );
                    final locked = !lessonUnlocked;
                    final canOpen = lessonUnlocked;

                    return LearnLessonListRow(
                      slot: slot,
                      unitIndex: _selectedUnitIndex,
                      lessonIndex: lessonIndex,
                      locked: locked,
                      complete: complete,
                      progressRatio: ratio,
                      onOpen: canOpen
                          ? () => widget.onLessonTap(
                                course,
                                selectedUnit,
                                _selectedUnitIndex,
                                lessonIndex,
                                slot,
                              )
                          : null,
                    );
                  },
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
