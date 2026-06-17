import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/learn_bottom_sheets.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class LearnLevelSummaryCard extends StatefulWidget {
  final LearnStageInfo stage;
  final int completedLessons;
  final int totalLessons;
  final int earnedPoints;
  final int maxPoints;

  const LearnLevelSummaryCard({
    super.key,
    required this.stage,
    required this.completedLessons,
    required this.totalLessons,
    this.earnedPoints = 0,
    this.maxPoints = 0,
  });

  @override
  State<LearnLevelSummaryCard> createState() => _LearnLevelSummaryCardState();
}

class _LearnLevelSummaryCardState extends State<LearnLevelSummaryCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final progress = widget.maxPoints > 0
        ? widget.earnedPoints / widget.maxPoints
        : widget.totalLessons > 0
            ? widget.completedLessons / widget.totalLessons
            : 0.0;
    final iconBg = LearnDesignTokens.iconBg(context);
    final stages = LearnCatalog.stages;

    return GestureDetector(
      onTap: () => setState(() => _expanded = !_expanded),
      child: Container(
        margin: const EdgeInsets.fromLTRB(16, 8, 16, 0),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: LearnDesignTokens.cardBg(context),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: LearnDesignTokens.divider(context)),
        ),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: iconBg,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  alignment: Alignment.center,
                  child: Icon(
                    Icons.emoji_events_outlined,
                    size: 20,
                    color: AppColors.primaryColor,
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TranslatedText(
                        'YOUR LEVEL',
                        style: TextStyle(
                          fontSize: 9,
                          letterSpacing: 1,
                          fontWeight: FontWeight.w600,
                          color: LearnDesignTokens.muted(context),
                        ),
                      ),
                      TranslatedText(
                        widget.stage.name,
                        style: TextStyle(
                          fontSize: 17,
                          fontWeight: FontWeight.w700,
                          color: LearnDesignTokens.headline(context),
                        ),
                      ),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    TranslatedText(
                      widget.maxPoints > 0
                          ? '${widget.earnedPoints} / ${widget.maxPoints} points'
                          : '${widget.completedLessons} / ${widget.totalLessons} lessons',
                      style: LearnDesignTokens.activitySubtitle(context),
                    ),
                    GestureDetector(
                      onTap: () {
                        if (_expanded) {
                          setState(() => _expanded = false);
                          return;
                        }
                        setState(() => _expanded = true);
                        LearnBottomSheets.showLevelUnlockDemo(context);
                      },
                      behavior: HitTestBehavior.opaque,
                      child: TranslatedText(
                        _expanded ? 'Hide levels' : 'See all levels',
                        style: TextStyle(
                          fontSize: 10,
                          color: LearnDesignTokens.primary(context),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 10),
            ClipRRect(
              borderRadius: BorderRadius.circular(2),
              child: LinearProgressIndicator(
                value: progress,
                minHeight: 3,
                backgroundColor: LearnDesignTokens.divider(context),
                color: LearnDesignTokens.primary(context),
              ),
            ),
            if (_expanded) ...[
              const SizedBox(height: 12),
              Divider(color: LearnDesignTokens.divider(context)),
              const SizedBox(height: 8),
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (var i = 0; i < stages.length; i++) ...[
                    if (i > 0)
                      Expanded(
                        child: Padding(
                          padding: const EdgeInsets.only(top: 13),
                          child: Container(
                            height: 1.5,
                            color: stages[i - 1].index < widget.stage.index
                                ? LearnDesignTokens.success
                                : LearnDesignTokens.divider(context),
                          ),
                        ),
                      ),
                    _LevelNode(
                      stage: stages[i],
                      active: stages[i].index == widget.stage.index,
                      done: stages[i].index < widget.stage.index,
                    ),
                  ],
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _LevelNode extends StatelessWidget {
  final LearnStageInfo stage;
  final bool active;
  final bool done;

  const _LevelNode({
    required this.stage,
    required this.active,
    required this.done,
  });

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: active ? 44 : 40,
      child: Column(
        children: [
          Container(
            width: active ? 28 : 26,
            height: active ? 28 : 26,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: done
                  ? LearnDesignTokens.successBg(context)
                  : active
                      ? const Color(0xffE8F0FF)
                      : Theme.of(context).highlightColor,
              border: Border.all(
                color: done
                    ? LearnDesignTokens.success
                    : active
                        ? LearnDesignTokens.primary(context)
                        : LearnDesignTokens.divider(context),
                width: active ? 2 : 1.5,
              ),
            ),
            child: Center(
              child: done
                  ? LearnDesignTokens.completedCheckIconWidget(size: 14)
                  : Text(
                      '${stage.index + 1}',
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.w600,
                        color: active
                            ? LearnDesignTokens.primary(context)
                            : LearnDesignTokens.disabled,
                      ),
                    ),
            ),
          ),
          const SizedBox(height: 4),
          Text(
            stage.name,
            textAlign: TextAlign.center,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 8,
              color: active
                  ? LearnDesignTokens.primary(context)
                  : LearnDesignTokens.muted(context),
              fontWeight: active ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ],
      ),
    );
  }
}
