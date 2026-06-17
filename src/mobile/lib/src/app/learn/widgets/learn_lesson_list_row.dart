import 'package:airqo/src/app/learn/formatting/learn_display_text.dart';
import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_lesson_thumbnail.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// Exposure-style lesson row for the course detail sheet.
class LearnLessonListRow extends StatelessWidget {
  static const _lessonIcon = 'assets/icons/learn_icon.svg';
  static const _chevronIcon = 'assets/icons/chevron-right.svg';
  static const _iconSize = 36.0;
  static const _iconGap = 12.0;

  final LearnLessonSlot slot;
  final int unitIndex;
  final int lessonIndex;
  final bool locked;
  final bool complete;
  final double progressRatio;
  final VoidCallback? onOpen;

  const LearnLessonListRow({
    super.key,
    required this.slot,
    required this.unitIndex,
    required this.lessonIndex,
    required this.locked,
    required this.complete,
    required this.progressRatio,
    this.onOpen,
  });

  String _activityLabel(int count) {
    return count == 1 ? '1 activity' : '$count activities';
  }

  String _statusLabel() {
    if (complete) return 'Completed';
    if (progressRatio > 0) return 'In progress';
    return 'Not started';
  }

  @override
  Widget build(BuildContext context) {
    final titleColor = LearnDesignTokens.headline(context);
    final subtitleColor = LearnDesignTokens.subtitle(context);
    final iconBg = LearnDesignTokens.iconBg(context);
    final dividerColor = LearnDesignTokens.divider(context);
    final activities = slot.activityCount;
    final barValue = complete ? 1.0 : progressRatio.clamp(0.0, 1.0);
    final progressColor = complete
        ? LearnDesignTokens.success
        : LearnDesignTokens.primary(context);
    final radius = BorderRadius.circular(10);
    final topRadius = const BorderRadius.vertical(top: Radius.circular(10));

    Widget row = Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: LearnDesignTokens.cardBg(context),
        borderRadius: radius,
        border: Border.all(color: dividerColor),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.1),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      clipBehavior: Clip.antiAlias,
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: locked ? null : onOpen,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              ClipRRect(
                borderRadius: topRadius,
                child: LearnLessonThumbnail(
                  slot: slot,
                  unitIndex: unitIndex,
                  lessonIndex: lessonIndex,
                ),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(14, 12, 12, 14),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      width: _iconSize,
                      height: _iconSize,
                      decoration: BoxDecoration(
                        color: complete
                            ? LearnDesignTokens.success
                            : iconBg,
                        shape: BoxShape.circle,
                      ),
                      child: Center(
                        child: locked
                            ? Icon(Icons.lock_outline,
                                size: 16, color: subtitleColor)
                            : complete
                                ? const Icon(
                                    LearnDesignTokens.completedCheckIcon,
                                    size: 18,
                                    color: Colors.white,
                                  )
                                : SvgPicture.asset(
                                    _lessonIcon,
                                    width: 16,
                                    height: 16,
                                    colorFilter: ColorFilter.mode(
                                      LearnDesignTokens.headline(context),
                                      BlendMode.srcIn,
                                    ),
                                  ),
                      ),
                    ),
                    const SizedBox(width: _iconGap),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            learnLessonLabel(lessonIndex),
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w600,
                              letterSpacing: 0.4,
                              color: subtitleColor,
                            ),
                          ),
                          const SizedBox(height: 2),
                          TranslatedText(
                            slot.plainTitleKey,
                            maxLines: 2,
                            overflow: TextOverflow.ellipsis,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: FontWeight.w600,
                              height: 1.25,
                              color: locked
                                  ? titleColor.withValues(alpha: 0.45)
                                  : titleColor,
                            ),
                          ),
                          const SizedBox(height: 6),
                          if (locked)
                            TranslatedText(
                              'Complete the previous lesson to unlock',
                              style: TextStyle(
                                  fontSize: 12, color: subtitleColor),
                            )
                          else
                            Text(
                              _activityLabel(activities),
                              style: TextStyle(
                                  fontSize: 12, color: subtitleColor),
                            ),
                          const SizedBox(height: 8),
                          ClipRRect(
                            borderRadius: BorderRadius.circular(2),
                            child: LinearProgressIndicator(
                              value: barValue,
                              minHeight: 3,
                              backgroundColor: dividerColor,
                              color: progressColor,
                            ),
                          ),
                          const SizedBox(height: 4),
                          if (!locked)
                            TranslatedText(
                              _statusLabel(),
                              style: LearnDesignTokens.activitySubtitle(context),
                            ),
                        ],
                      ),
                    ),
                    if (!locked)
                      GestureDetector(
                        onTap: onOpen,
                        behavior: HitTestBehavior.opaque,
                        child: Padding(
                          padding: const EdgeInsets.only(left: 4, top: 4),
                          child: SvgPicture.asset(
                            _chevronIcon,
                            width: 18,
                            height: 18,
                            colorFilter: ColorFilter.mode(
                              LearnDesignTokens.headline(context),
                              BlendMode.srcIn,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );

    if (locked) {
      row = LearnDesignTokens.lockedContentBlur(
        borderRadius: radius,
        child: row,
      );
    }

    return row;
  }
}
