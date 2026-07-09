import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/services/learn_quiz_scoring_service.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_experience_shell.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_quiz_option.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

class LearnQuizRankingActivity extends StatefulWidget {
  final LearnQuizPayload quiz;
  final String activityTypeLabel;
  final ValueChanged<LearnQuizGrade> onGraded;
  final VoidCallback onContinue;

  const LearnQuizRankingActivity({
    super.key,
    required this.quiz,
    required this.activityTypeLabel,
    required this.onGraded,
    required this.onContinue,
  });

  @override
  State<LearnQuizRankingActivity> createState() =>
      _LearnQuizRankingActivityState();
}

class _LearnQuizRankingActivityState extends State<LearnQuizRankingActivity> {
  late List<int> _order;
  bool _submitted = false;
  bool _reordered = false;
  LearnQuizGrade? _grade;

  @override
  void initState() {
    super.initState();
    _order = List.generate(widget.quiz.options.length, (i) => i);
    // Present the items shuffled so the correct order is never pre-filled.
    if (_order.length > 1) {
      final expected = widget.quiz.correctOrder ?? List.of(_order);
      do {
        _order.shuffle();
      } while (listEquals(_order, expected));
    }
  }

  void _submit() {
    final grade = LearnQuizScoringService.gradeRanking(widget.quiz, _order);
    setState(() {
      _submitted = true;
      _grade = grade;
    });
    widget.onGraded(grade);
  }

  Widget _rankRow(int listIndex, int displayIndex, int optionIndex) {
    return ReorderableDelayedDragStartListener(
      key: ValueKey(optionIndex),
      index: listIndex,
      child: Container(
        margin: const EdgeInsets.only(bottom: 8),
        constraints: const BoxConstraints(minHeight: 56),
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        decoration: BoxDecoration(
          border: Border.all(color: LearnDesignTokens.divider(context)),
          borderRadius: BorderRadius.circular(8),
          color: LearnDesignTokens.cardBg(context),
        ),
        child: Row(
          children: [
            ReorderableDragStartListener(
              index: listIndex,
              child: Icon(
                Icons.drag_handle,
                color: LearnDesignTokens.muted(context),
              ),
            ),
            const SizedBox(width: 8),
            Container(
              width: 22,
              height: 22,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: LearnDesignTokens.divider(context),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(
                '${displayIndex + 1}',
                style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w700,
                  color: LearnDesignTokens.headline(context),
                ),
              ),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: TranslatedText(
                widget.quiz.options[optionIndex],
                style: TextStyle(
                  fontSize: 14,
                  color: LearnDesignTokens.headline(context),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return LearnActivityCardShell(
      activityTypeLabel: widget.activityTypeLabel,
      child: Column(
        children: [
          Expanded(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 10, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TranslatedText(
                    widget.quiz.question,
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                      color: LearnDesignTokens.headline(context),
                    ),
                  ),
                  const SizedBox(height: 4),
                  TranslatedText(
                    'Drag the handle to arrange the items in order',
                    style: LearnDesignTokens.activitySubtitle(context),
                  ),
                  const SizedBox(height: 12),
                  Expanded(
                    child: Theme(
                      data: Theme.of(context).copyWith(
                        canvasColor: Colors.transparent,
                        splashColor: Colors.transparent,
                        highlightColor: Colors.transparent,
                      ),
                      child: ReorderableListView.builder(
                        buildDefaultDragHandles: false,
                        itemCount: _order.length,
                        proxyDecorator: (child, index, animation) {
                          return AnimatedBuilder(
                            animation: animation,
                            builder: (context, child) {
                              return Material(
                                type: MaterialType.transparency,
                                elevation: 0,
                                color: Colors.transparent,
                                shadowColor: Colors.transparent,
                                child: child,
                              );
                            },
                            child: child,
                          );
                        },
                        onReorder: (oldIndex, newIndex) {
                          if (_submitted) return;
                          setState(() {
                            if (newIndex > oldIndex) newIndex -= 1;
                            final item = _order.removeAt(oldIndex);
                            _order.insert(newIndex, item);
                            _reordered = true;
                          });
                        },
                        itemBuilder: (context, index) {
                          final optionIndex = _order[index];
                          return _rankRow(index, index, optionIndex);
                        },
                      ),
                    ),
                  ),
                  if (_grade != null)
                    LearnQuizFeedbackBanner(
                      message: _grade!.feedback,
                      isCorrect: _grade!.isCorrect,
                    ),
                ],
              ),
            ),
          ),
          LearnExperienceBottomBar(
            primaryLabel: _submitted ? 'Continue' : 'Check order',
            primaryEnabled: _submitted || _reordered,
            onPrimary: _submitted ? widget.onContinue : _submit,
          ),
        ],
      ),
    );
  }
}
