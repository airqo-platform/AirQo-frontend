import 'package:airqo/src/app/learn/formatting/learn_display_text.dart';
import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

typedef LearnLessonTapCallback = void Function(
  LearnCourseViewModel course,
  LearnUnitViewModel unit,
  int lessonIndex,
  LearnLessonSlot slot,
);

class LearnCourseDetailPage extends StatefulWidget {
  final LearnCourseViewModel course;
  final List<LearnCourseViewModel> allCourses;
  final int initialUnitIndex;
  final LearnLessonTapCallback onLessonTap;

  const LearnCourseDetailPage({
    super.key,
    required this.course,
    required this.allCourses,
    required this.initialUnitIndex,
    required this.onLessonTap,
  });

  @override
  State<LearnCourseDetailPage> createState() => _LearnCourseDetailPageState();
}

class _LearnCourseDetailPageState extends State<LearnCourseDetailPage> {
  late int _selectedUnitIndex;
  final _unitRailController = ScrollController();

  @override
  void initState() {
    super.initState();
    _selectedUnitIndex = widget.initialUnitIndex.clamp(
      0,
      widget.course.units.length - 1,
    );
    WidgetsBinding.instance.addPostFrameCallback((_) => _scrollToActiveUnit());
  }

  @override
  void dispose() {
    _unitRailController.dispose();
    super.dispose();
  }

  void _scrollToActiveUnit() {
    if (!_unitRailController.hasClients) return;
    _unitRailController.animateTo(
      _selectedUnitIndex * 120.0,
      duration: const Duration(milliseconds: 300),
      curve: Curves.easeOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    final progress = LearnProgressService.instance;
    final unit = widget.course.units[_selectedUnitIndex];

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        LearnDesignTokens.dragHandle(context),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16),
          child: Row(
            children: [
              Expanded(
                child: TranslatedText(
                  widget.course.plainTitleKey,
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: LearnDesignTokens.headline(context),
                  ),
                ),
              ),
              IconButton(
                onPressed: () => Navigator.of(context).pop(),
                icon: const Icon(Icons.close),
              ),
            ],
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          height: 44,
          child: ListView.builder(
            controller: _unitRailController,
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: widget.course.units.length,
            itemBuilder: (context, index) {
              final u = widget.course.units[index];
              final unlocked = LearnCatalog.isUnitUnlocked(
                widget.course,
                index,
                progress,
              );
              final selected = index == _selectedUnitIndex;
              final allDone = u.lessons.every(
                (l) => progress.isLessonComplete(l.progressKey),
              );
              final isNext = !selected &&
                  !allDone &&
                  unlocked &&
                  u.lessons.any(
                    (l) => !progress.isLessonComplete(l.progressKey),
                  );

              Color bg = Theme.of(context).cardColor;
              Color border = LearnDesignTokens.divider(context);
              Color text = LearnDesignTokens.muted(context);

              if (!unlocked) {
                bg = Theme.of(context).highlightColor;
                text = LearnDesignTokens.disabled;
              } else if (selected) {
                bg = LearnDesignTokens.primary(context);
                border = LearnDesignTokens.primary(context);
                text = Colors.white;
              } else if (allDone) {
                bg = LearnDesignTokens.successBg;
                border = LearnDesignTokens.success;
                text = LearnDesignTokens.successText;
              } else if (isNext) {
                border = LearnDesignTokens.primary(context);
                text = LearnDesignTokens.primary(context);
              }

              return Padding(
                padding: const EdgeInsets.only(right: 8),
                child: GestureDetector(
                  onTap: unlocked
                      ? () => setState(() => _selectedUnitIndex = index)
                      : null,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 14),
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: bg,
                      borderRadius: BorderRadius.circular(40),
                      border: Border.all(color: border, width: 1.5),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        if (!unlocked)
                          Padding(
                            padding: const EdgeInsets.only(right: 4),
                            child: Icon(Icons.lock, size: 12, color: text),
                          ),
                        if (allDone && !selected)
                          Padding(
                            padding: const EdgeInsets.only(right: 4),
                            child: Icon(Icons.check, size: 12, color: text),
                          ),
                        TranslatedText(
                          learnDisplayTitle(u.title),
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w500,
                            color: text,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              );
            },
          ),
        ),
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 12, 16, 8),
          child: TranslatedText(
            learnUnitHeader(_selectedUnitIndex, unit.title),
            style: LearnDesignTokens.slbl(context),
          ),
        ),
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 2,
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 0.72,
            ),
            itemCount: unit.lessons.length,
            itemBuilder: (context, lessonIndex) {
              final slot = unit.lessons[lessonIndex];
              final unitUnlocked = LearnCatalog.isUnitUnlocked(
                widget.course,
                _selectedUnitIndex,
                progress,
              );
              final lessonUnlocked = unitUnlocked &&
                  LearnCatalog.isLessonUnlocked(
                    unit,
                    lessonIndex,
                    unit,
                    progress,
                  );
              final complete = progress.isLessonComplete(slot.progressKey);
              final ratio = slot.hasContent
                  ? progress.lessonProgressRatio(
                      slot.progressKey,
                      slot.apiLesson!.tasks.length,
                    )
                  : 0.0;
              final locked = !lessonUnlocked || !slot.hasContent;

              return GestureDetector(
                onTap: locked
                    ? null
                    : () => widget.onLessonTap(
                          widget.course,
                          unit,
                          lessonIndex,
                          slot,
                        ),
                child: _LessonPortraitTile(
                  slot: slot,
                  lessonIndex: lessonIndex,
                  locked: locked,
                  complete: complete,
                  progressRatio: ratio,
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}

class _LessonPortraitTile extends StatelessWidget {
  final LearnLessonSlot slot;
  final int lessonIndex;
  final bool locked;
  final bool complete;
  final double progressRatio;

  const _LessonPortraitTile({
    required this.slot,
    required this.lessonIndex,
    required this.locked,
    required this.complete,
    required this.progressRatio,
  });

  @override
  Widget build(BuildContext context) {
    return ClipRRect(
      borderRadius: BorderRadius.circular(LearnDesignTokens.portraitCardRadius),
      child: Stack(
        fit: StackFit.expand,
        children: [
          Container(color: slot.placeholderColor),
          Center(
            child: Opacity(
              opacity: locked ? 0.25 : 1,
              child: Text(slot.emoji, style: const TextStyle(fontSize: 46)),
            ),
          ),
          if (complete)
            Positioned(
              top: 8,
              right: 8,
              child: Container(
                width: 22,
                height: 22,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: LearnDesignTokens.success, width: 1.5),
                  color: LearnDesignTokens.success.withValues(alpha: 0.12),
                ),
                child: Icon(Icons.check, size: 11, color: LearnDesignTokens.success),
              ),
            ),
          if (locked)
            Center(
              child: Icon(Icons.lock, size: 24, color: LearnDesignTokens.disabled),
            ),
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: const EdgeInsets.fromLTRB(9, 7, 9, 9),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [
                    Colors.transparent,
                    LearnDesignTokens.footerGradient,
                  ],
                ),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    learnLessonLabel(lessonIndex),
                    style: const TextStyle(
                      fontSize: 9,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 0.5,
                      color: Color(0x80FFFFFF),
                    ),
                  ),
                  TranslatedText(
                    slot.plainTitleKey,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: locked
                          ? Colors.white.withValues(alpha: 0.55)
                          : Colors.white,
                      height: 1.2,
                    ),
                  ),
                  if (!locked && !complete && progressRatio > 0) ...[
                    const SizedBox(height: 6),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(1),
                      child: LinearProgressIndicator(
                        value: progressRatio,
                        minHeight: 2,
                        backgroundColor: Colors.white.withValues(alpha: 0.2),
                        color: LearnDesignTokens.primary(context),
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
