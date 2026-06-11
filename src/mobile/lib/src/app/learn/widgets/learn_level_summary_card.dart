import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnLevelSummaryCard extends StatefulWidget {
  final LearnStageInfo stage;
  final int completedLessons;
  final int totalLessons;

  const LearnLevelSummaryCard({
    super.key,
    required this.stage,
    required this.completedLessons,
    required this.totalLessons,
  });

  @override
  State<LearnLevelSummaryCard> createState() => _LearnLevelSummaryCardState();
}

class _LearnLevelSummaryCardState extends State<LearnLevelSummaryCard> {
  bool _expanded = false;

  @override
  Widget build(BuildContext context) {
    final progress = widget.totalLessons > 0
        ? widget.completedLessons / widget.totalLessons
        : 0.0;

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
                    color: const Color(0xffF0F4FF),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  alignment: Alignment.center,
                  child: Text(widget.stage.emoji, style: const TextStyle(fontSize: 18)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      TranslatedText(
                        'YOUR STAGE',
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
                      '${widget.completedLessons} / ${widget.totalLessons} lessons',
                      style: LearnDesignTokens.activitySubtitle(context),
                    ),
                    TranslatedText(
                      _expanded ? 'Hide stages' : 'See all stages',
                      style: TextStyle(
                        fontSize: 10,
                        color: LearnDesignTokens.primary(context),
                        fontWeight: FontWeight.w500,
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
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: LearnCatalog.stages.map((s) {
                  final active = s.index == widget.stage.index;
                  final done = s.index < widget.stage.index;
                  return Expanded(
                    child: Column(
                      children: [
                        Container(
                          width: active ? 28 : 26,
                          height: active ? 28 : 26,
                          decoration: BoxDecoration(
                            shape: BoxShape.circle,
                            color: done
                                ? LearnDesignTokens.successBg
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
                                ? Icon(Icons.check,
                                    size: 11, color: LearnDesignTokens.success)
                                : Text(
                                    '${s.index + 1}',
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
                          s.name,
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
                }).toList(),
              ),
            ],
          ],
        ),
      ),
    );
  }
}
