import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/services/learn_quiz_scoring_service.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_experience_shell.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_quiz_option.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnQuizRankingActivity extends StatefulWidget {
  final LearnQuizPayload quiz;
  final ValueChanged<LearnQuizGrade> onGraded;
  final VoidCallback onContinue;

  const LearnQuizRankingActivity({
    super.key,
    required this.quiz,
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
  LearnQuizGrade? _grade;

  @override
  void initState() {
    super.initState();
    _order = List.generate(widget.quiz.options.length, (i) => i);
  }

  void _submit() {
    final grade = LearnQuizScoringService.gradeRanking(widget.quiz, _order);
    setState(() {
      _submitted = true;
      _grade = grade;
    });
    widget.onGraded(grade);
  }

  @override
  Widget build(BuildContext context) {
    return LearnActivityCardShell(
      child: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
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
                  const SizedBox(height: 12),
                  ReorderableListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: _order.length,
                    onReorder: (oldIndex, newIndex) {
                      if (_submitted) return;
                      setState(() {
                        if (newIndex > oldIndex) newIndex -= 1;
                        final item = _order.removeAt(oldIndex);
                        _order.insert(newIndex, item);
                      });
                    },
                    itemBuilder: (context, index) {
                      final optionIndex = _order[index];
                      return Container(
                        key: ValueKey(optionIndex),
                        margin: const EdgeInsets.only(bottom: 8),
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 12,
                        ),
                        decoration: BoxDecoration(
                          border: Border.all(
                            color: LearnDesignTokens.divider(context),
                          ),
                          borderRadius: BorderRadius.circular(8),
                          color: LearnDesignTokens.cardBg(context),
                        ),
                        child: Row(
                          children: [
                            Icon(
                              Icons.drag_handle,
                              color: LearnDesignTokens.muted(context),
                            ),
                            const SizedBox(width: 8),
                            Container(
                              width: 22,
                              height: 22,
                              alignment: Alignment.center,
                              decoration: BoxDecoration(
                                color: LearnDesignTokens.primary(context)
                                    .withValues(alpha: 0.1),
                                borderRadius: BorderRadius.circular(6),
                              ),
                              child: Text(
                                '${index + 1}',
                                style: TextStyle(
                                  fontSize: 11,
                                  fontWeight: FontWeight.w700,
                                  color: LearnDesignTokens.primary(context),
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
                      );
                    },
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
            onPrimary: _submitted ? widget.onContinue : _submit,
          ),
        ],
      ),
    );
  }
}
