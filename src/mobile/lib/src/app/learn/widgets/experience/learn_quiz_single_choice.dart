import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/services/learn_quiz_scoring_service.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_experience_shell.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_quiz_option.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnQuizSingleChoiceActivity extends StatefulWidget {
  final LearnQuizPayload quiz;
  final ValueChanged<LearnQuizGrade> onGraded;
  final VoidCallback onContinue;

  const LearnQuizSingleChoiceActivity({
    super.key,
    required this.quiz,
    required this.onGraded,
    required this.onContinue,
  });

  @override
  State<LearnQuizSingleChoiceActivity> createState() =>
      _LearnQuizSingleChoiceActivityState();
}

class _LearnQuizSingleChoiceActivityState
    extends State<LearnQuizSingleChoiceActivity> {
  int? _selected;
  bool _submitted = false;
  LearnQuizGrade? _grade;

  void _submit() {
    final grade = LearnQuizScoringService.gradeSingleChoice(
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
                  ...List.generate(widget.quiz.options.length, (i) {
                    return LearnQuizOptionTile(
                      label: widget.quiz.options[i],
                      selected: _selected == i,
                      revealed: _submitted,
                      isCorrectOption: i == widget.quiz.correctIndex,
                      onTap: () => setState(() => _selected = i),
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
            primaryLabel: _submitted ? 'Continue' : 'Submit',
            primaryEnabled: _submitted || _selected != null,
            onPrimary: _submitted ? widget.onContinue : _submit,
          ),
        ],
      ),
    );
  }
}
