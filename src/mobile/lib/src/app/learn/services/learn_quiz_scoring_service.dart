import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';

class LearnQuizScoringService {
  const LearnQuizScoringService._();

  static LearnQuizGrade gradeSingleChoice(
    LearnQuizPayload quiz,
    int? selectedIndex,
  ) {
    if (selectedIndex == null) {
      return const LearnQuizGrade(
        isCorrect: false,
        feedback: 'Please select an answer.',
      );
    }
    final correct = selectedIndex == quiz.correctIndex;
    return LearnQuizGrade(
      isCorrect: correct,
      feedback: correct ? quiz.correctFeedback : quiz.incorrectFeedback,
    );
  }

  static LearnQuizGrade gradeMultiChoice(
    LearnQuizPayload quiz,
    Set<int> selectedIndices,
  ) {
    final expected = quiz.correctIndices ?? {};
    if (selectedIndices.isEmpty) {
      return const LearnQuizGrade(
        isCorrect: false,
        feedback: 'Please select at least one answer.',
      );
    }
    final correct = selectedIndices.length == expected.length &&
        selectedIndices.containsAll(expected);
    return LearnQuizGrade(
      isCorrect: correct,
      feedback: correct ? quiz.correctFeedback : quiz.incorrectFeedback,
    );
  }

  static LearnQuizGrade gradeRanking(
    LearnQuizPayload quiz,
    List<int> submittedOrder,
  ) {
    final expected = quiz.correctOrder ?? [];
    if (submittedOrder.length != expected.length) {
      return const LearnQuizGrade(
        isCorrect: false,
        feedback: 'Please rank all items.',
      );
    }
    final correct = _listsEqual(submittedOrder, expected);
    return LearnQuizGrade(
      isCorrect: correct,
      feedback: correct ? quiz.correctFeedback : quiz.incorrectFeedback,
    );
  }

  static LearnQuizGrade gradeFreeText(String response) {
    final trimmed = response.trim();
    if (trimmed.isEmpty) {
      return const LearnQuizGrade(
        isCorrect: false,
        feedback: 'Please share a thought before continuing.',
      );
    }
    return const LearnQuizGrade(
      isCorrect: true,
      feedback: 'Thanks for sharing — your response has been saved.',
    );
  }

  static LearnLessonResult computeLessonResult({
    required List<bool> gradedQuizResults,
    String? freeTextResponse,
  }) {
    final graded = gradedQuizResults.where((r) => r).length;
    final totalGraded = gradedQuizResults.length;
    final ratio = totalGraded == 0 ? 1.0 : graded / totalGraded;

    final stars = graded >= totalGraded && totalGraded > 0
        ? 3
        : graded >= (totalGraded / 2).ceil()
            ? 2
            : 1;
    final points = stars * 10;

    return LearnLessonResult(
      stars: stars,
      pointsEarned: points,
      quizScoreRatio: ratio,
      freeTextResponse: freeTextResponse,
    );
  }

  static bool _listsEqual(List<int> a, List<int> b) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; i++) {
      if (a[i] != b[i]) return false;
    }
    return true;
  }
}
