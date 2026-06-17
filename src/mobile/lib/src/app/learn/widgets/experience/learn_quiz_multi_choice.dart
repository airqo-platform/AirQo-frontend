import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/services/learn_quiz_scoring_service.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_experience_shell.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_quiz_option.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnQuizMultiChoiceActivity extends StatefulWidget {
  final LearnQuizPayload quiz;
  final String activityTypeLabel;
  final ValueChanged<LearnQuizGrade> onGraded;
  final VoidCallback onContinue;

  const LearnQuizMultiChoiceActivity({
    super.key,
    required this.quiz,
    required this.activityTypeLabel,
    required this.onGraded,
    required this.onContinue,
  });

  @override
  State<LearnQuizMultiChoiceActivity> createState() =>
      _LearnQuizMultiChoiceActivityState();
}

class _LearnQuizMultiChoiceActivityState
    extends State<LearnQuizMultiChoiceActivity> {
  final Set<int> _selected = {};
  bool _submitted = false;
  LearnQuizGrade? _grade;

  void _toggle(int index) {
    setState(() {
      if (_selected.contains(index)) {
        _selected.remove(index);
      } else {
        _selected.add(index);
      }
    });
  }

  void _submit() {
    final grade = LearnQuizScoringService.gradeMultiChoice(
      widget.quiz,
      _selected,
    );
    setState(() {
      _submitted = true;
      _grade = grade;
    });
    widget.onGraded(grade);
  }

  @override
  Widget build(BuildContext context) {
    final correct = widget.quiz.correctIndices ?? {};

    return LearnActivityCardShell(
      activityTypeLabel: widget.activityTypeLabel,
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
                  const SizedBox(height: 4),
                  TranslatedText(
                    'Select all that apply',
                    style: LearnDesignTokens.activitySubtitle(context),
                  ),
                  const SizedBox(height: 12),
                  ...List.generate(widget.quiz.options.length, (i) {
                    return LearnQuizOptionTile(
                      label: widget.quiz.options[i],
                      selected: _selected.contains(i),
                      revealed: _submitted,
                      isCorrectOption: correct.contains(i),
                      showCheckbox: true,
                      onTap: () => _toggle(i),
                    );
                  }),
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
            primaryLabel: _submitted ? 'Continue' : 'Check answers',
            primaryEnabled: _submitted || _selected.isNotEmpty,
            onPrimary: _submitted ? widget.onContinue : _submit,
          ),
        ],
      ),
    );
  }
}
