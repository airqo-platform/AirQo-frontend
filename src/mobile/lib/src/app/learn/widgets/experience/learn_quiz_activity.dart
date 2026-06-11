import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_quiz_free_text.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_quiz_multi_choice.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_quiz_ranking.dart';
import 'package:airqo/src/app/learn/widgets/experience/learn_quiz_single_choice.dart';
import 'package:flutter/material.dart';

class LearnQuizActivity extends StatelessWidget {
  final LearnQuizPayload quiz;
  final ValueChanged<LearnQuizGrade> onGraded;
  final ValueChanged<String>? onFreeText;
  final VoidCallback onContinue;

  const LearnQuizActivity({
    super.key,
    required this.quiz,
    required this.onGraded,
    required this.onContinue,
    this.onFreeText,
  });

  @override
  Widget build(BuildContext context) {
    switch (quiz.format) {
      case LearnQuizFormat.singleChoice:
        return LearnQuizSingleChoiceActivity(
          quiz: quiz,
          onGraded: onGraded,
          onContinue: onContinue,
        );
      case LearnQuizFormat.multiChoice:
        return LearnQuizMultiChoiceActivity(
          quiz: quiz,
          onGraded: onGraded,
          onContinue: onContinue,
        );
      case LearnQuizFormat.ranking:
        return LearnQuizRankingActivity(
          quiz: quiz,
          onGraded: onGraded,
          onContinue: onContinue,
        );
      case LearnQuizFormat.freeText:
        return LearnQuizFreeTextActivity(
          quiz: quiz,
          onGraded: onGraded,
          onResponse: onFreeText ?? (_) {},
          onContinue: onContinue,
        );
    }
  }
}
