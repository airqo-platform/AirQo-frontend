import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/models/learn_v2_catalog.dart';

class LearnLessonExperienceService {
  const LearnLessonExperienceService._();

  static List<LearnLessonActivity> buildFromV2Lesson({
    required LearnV2Lesson lesson,
  }) {
    final activities = <LearnLessonActivity>[];
    for (var i = 0; i < lesson.activities.length; i++) {
      final v2 = lesson.activities[i];
      final activity = _v2ActivityToLearnActivity(v2, i);
      if (activity != null) activities.add(activity);
    }
    return activities;
  }

  static LearnLessonActivity? _v2ActivityToLearnActivity(
      LearnV2Activity v2, int index) {
    final p = v2.payload;
    switch (v2.type) {
      case 'article':
        final body = p['body'] as String? ?? '';
        if (body.isEmpty) return null;
        return LearnLessonActivity(
          index: index,
          activityId: v2.id,
          type: LearnActivityType.article,
          title: p['title'] as String? ?? 'Read',
          article: LearnArticlePayload(
            body: body,
            audioText: p['audio_text'] as String?,
          ),
        );
      case 'video':
        final url = p['url'] as String? ?? '';
        if (url.isEmpty) return null;
        return LearnLessonActivity(
          index: index,
          activityId: v2.id,
          type: LearnActivityType.video,
          title: p['title'] as String? ?? 'Watch',
          video: LearnVideoPayload(
            videoUrl: url,
            description: p['description'] as String? ?? '',
            posterUrl: p['poster_url'] as String?,
          ),
        );
      case 'image':
        final url = p['url'] as String? ?? '';
        if (url.isEmpty) return null;
        return LearnLessonActivity(
          index: index,
          activityId: v2.id,
          type: LearnActivityType.image,
          title: p['title'] as String? ?? 'Look',
          image: LearnImagePayload(
            imageUrl: url,
            caption: p['caption'] as String? ?? '',
            subtitle: p['subtitle'] as String?,
          ),
        );
      case 'quiz':
        final quiz = _parseV2Quiz(p);
        if (quiz == null) return null;
        return LearnLessonActivity(
          index: index,
          activityId: v2.id,
          type: LearnActivityType.quiz,
          title: p['title'] as String? ?? 'Quiz',
          quiz: quiz,
        );
      default:
        return null;
    }
  }

  static int? _toInt(dynamic v) =>
      v is int ? v : (v is String ? int.tryParse(v) : null);

  static LearnQuizPayload? _parseV2Quiz(Map<String, dynamic> p) {
    final question = p['question'] as String? ?? '';
    if (question.isEmpty) return null;

    final format = LearnQuizFormat.fromApiKey(p['format'] as String? ?? '');
    final rawOptions = p['options'] as List? ?? [];
    final options = rawOptions.map((o) => o.toString()).toList();
    final correctIndex = _toInt(p['correct_index']);
    final rawIndices = p['correct_indices'] as List?;
    final correctIndices = rawIndices?.map(_toInt).whereType<int>().toSet();
    final rawOrder = p['correct_order'] as List?;
    final correctOrder = rawOrder?.map(_toInt).whereType<int>().toList();

    // Reject quizzes whose answer key is missing or inconsistent with the
    // options — they can never be graded correct and would always mark the
    // user wrong.
    switch (format) {
      case LearnQuizFormat.singleChoice:
        if (options.length < 2 ||
            correctIndex == null ||
            correctIndex < 0 ||
            correctIndex >= options.length) {
          return null;
        }
        break;
      case LearnQuizFormat.multiChoice:
        if (options.length < 2 ||
            correctIndices == null ||
            correctIndices.isEmpty ||
            correctIndices.any((i) => i < 0 || i >= options.length)) {
          return null;
        }
        break;
      case LearnQuizFormat.ranking:
        if (options.length < 2 ||
            correctOrder == null ||
            correctOrder.length != options.length ||
            correctOrder.toSet().length != options.length ||
            correctOrder.any((i) => i < 0 || i >= options.length)) {
          return null;
        }
        break;
      case LearnQuizFormat.freeText:
        break;
    }

    return LearnQuizPayload(
      format: format,
      question: question,
      options: options,
      correctIndex: correctIndex,
      correctIndices: correctIndices,
      correctOrder: correctOrder,
      correctFeedback: p['correct_feedback'] as String? ?? 'Correct!',
      incorrectFeedback: p['incorrect_feedback'] as String? ??
          'Not quite — try reviewing the lesson.',
      hint: p['hint'] as String?,
    );
  }

  /// Memoized per lesson instance — this runs inside widget builds, and a
  /// catalog refresh produces new lesson objects, naturally invalidating it.
  static final Expando<int> _gradedQuizCountCache = Expando<int>();

  /// Number of gradeable (non-free-text) quizzes in a lesson, using the same
  /// parsing rules as the lesson experience — the basis for max points.
  static int gradedQuizCount(LearnV2Lesson lesson) {
    return _gradedQuizCountCache[lesson] ??= buildFromV2Lesson(lesson: lesson)
        .where((a) =>
            a.type == LearnActivityType.quiz &&
            a.quiz?.format != LearnQuizFormat.freeText)
        .length;
  }

  static String activityTypeKey(LearnLessonActivity activity) {
    switch (activity.type) {
      case LearnActivityType.article:
        return 'ARTICLE';
      case LearnActivityType.video:
        return 'VIDEO';
      case LearnActivityType.image:
        return 'IMAGE';
      case LearnActivityType.quiz:
        return 'QUIZ';
    }
  }

  static String activityLabel(LearnLessonActivity activity) {
    switch (activity.type) {
      case LearnActivityType.article:
        return 'Reading';
      case LearnActivityType.video:
        return 'Video';
      case LearnActivityType.image:
        return 'Image';
      case LearnActivityType.quiz:
        return _quizLabel(activity.quiz?.format);
    }
  }

  static String _quizLabel(LearnQuizFormat? format) {
    switch (format) {
      case LearnQuizFormat.singleChoice:
        return 'Quiz · Single choice';
      case LearnQuizFormat.multiChoice:
        return 'Quiz · Multiple choice';
      case LearnQuizFormat.ranking:
        return 'Quiz · Ranking';
      case LearnQuizFormat.freeText:
        return 'Quiz · Your words';
      case null:
        return 'Quiz';
    }
  }

  static bool isCourseFinalLesson(
    LearnCourseViewModel course,
    int unitIndex,
    int lessonIndex,
  ) {
    if (course.units.isEmpty) return false;
    final lastUnitIndex = course.units.length - 1;
    if (unitIndex != lastUnitIndex) return false;
    final lastUnit = course.units[lastUnitIndex];
    return lessonIndex == lastUnit.lessons.length - 1;
  }

}
