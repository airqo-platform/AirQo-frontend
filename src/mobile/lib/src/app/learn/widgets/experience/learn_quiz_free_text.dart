import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/services/learn_quiz_scoring_service.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_experience_shell.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_quiz_option.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';

class LearnQuizFreeTextActivity extends StatefulWidget {
  final LearnQuizPayload quiz;
  final ValueChanged<LearnQuizGrade> onGraded;
  final ValueChanged<String> onResponse;
  final VoidCallback onContinue;

  const LearnQuizFreeTextActivity({
    super.key,
    required this.quiz,
    required this.onGraded,
    required this.onResponse,
    required this.onContinue,
  });

  @override
  State<LearnQuizFreeTextActivity> createState() =>
      _LearnQuizFreeTextActivityState();
}

class _LearnQuizFreeTextActivityState extends State<LearnQuizFreeTextActivity> {
  final _controller = TextEditingController();
  bool _submitted = false;
  LearnQuizGrade? _grade;

  @override
  void initState() {
    super.initState();
    _controller.addListener(() => setState(() {}));
  }

  void _submit() {
    final grade = LearnQuizScoringService.gradeFreeText(_controller.text);
    if (_controller.text.trim().isEmpty) return;
    widget.onResponse(_controller.text.trim());
    setState(() {
      _submitted = true;
      _grade = grade;
    });
    widget.onGraded(grade);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
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
                  TextField(
                    controller: _controller,
                    enabled: !_submitted,
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: 'Type here...',
                      filled: true,
                      fillColor: Theme.of(context).highlightColor,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(8),
                        borderSide: BorderSide(
                          color: LearnDesignTokens.divider(context),
                        ),
                      ),
                    ),
                  ),
                  if (_grade != null)
                    LearnQuizFeedbackBanner(
                      message: _grade!.feedback,
                      isCorrect: true,
                    ),
                ],
              ),
            ),
          ),
          LearnExperienceBottomBar(
            primaryLabel: _submitted ? 'Complete lesson' : 'Submit',
            primaryEnabled:
                _submitted || _controller.text.trim().isNotEmpty,
            onPrimary: _submitted ? widget.onContinue : _submit,
          ),
        ],
      ),
    );
  }
}
