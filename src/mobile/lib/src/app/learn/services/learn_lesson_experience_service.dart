import 'package:airqo/src/app/learn/formatting/learn_display_text.dart';
import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/models/learn_lesson_activity.dart';
import 'package:airqo/src/app/learn/models/lesson_response_model.dart';

class LearnLessonExperienceService {
  const LearnLessonExperienceService._();

  static const demoActivityCount = 7;

  static const _demoVideoUrl =
      'https://www.youtube.com/watch?v=U5F-F2AHH7s';

  static List<LearnLessonActivity> buildDemoScript({
    required String lessonTitle,
    required String unitTitle,
    required LearnLessonSlot slot,
    KyaLesson? apiLesson,
  }) {
    final topic = learnDisplayTitle(lessonTitle.isNotEmpty
        ? lessonTitle
        : slot.plainTitleKey);
    final unit = learnDisplayTitle(unitTitle);
    final imageUrl = _resolveImage(slot, apiLesson);
    final articleBody = _resolveArticleBody(slot, apiLesson, topic, unit);

    return [
      LearnLessonActivity(
        index: 0,
        type: LearnActivityType.article,
        title: 'About $topic',
        article: LearnArticlePayload(
          body: articleBody,
          audioText: articleBody,
        ),
      ),
      LearnLessonActivity(
        index: 1,
        type: LearnActivityType.video,
        title: 'Watch: $topic',
        video: LearnVideoPayload(
          videoUrl: _demoVideoUrl,
          description:
              'A short overview of $topic and why it matters for the air around you in $unit.',
          posterUrl: imageUrl,
        ),
      ),
      LearnLessonActivity(
        index: 2,
        type: LearnActivityType.image,
        title: 'Spot it: $topic',
        image: LearnImagePayload(
          imageUrl: imageUrl,
          caption: 'Look for signs of $topic near your home.',
          subtitle:
              'Community photo — notice smoke, dust, or traffic that affects daily air quality.',
        ),
      ),
      LearnLessonActivity(
        index: 3,
        type: LearnActivityType.quiz,
        title: 'Quick check',
        quiz: LearnQuizPayload(
          format: LearnQuizFormat.singleChoice,
          question: 'What is the main pollution source in this lesson?',
          options: [
            'Vehicle exhaust',
            topic,
            'Factory chimney',
            'Crop burning',
          ],
          correctIndex: 1,
          correctFeedback: 'Correct! $topic is the focus of this lesson.',
          incorrectFeedback:
              'Not quite — re-read the article and try again.',
        ),
      ),
      LearnLessonActivity(
        index: 4,
        type: LearnActivityType.quiz,
        title: 'Multiple choice',
        quiz: LearnQuizPayload(
          format: LearnQuizFormat.multiChoice,
          question: 'Which activities can raise PM2.5 near your home?',
          options: [
            'Burning charcoal',
            'Using solar panels',
            'Smoking indoors',
            'Sweeping dry floors',
          ],
          correctIndices: {0, 2, 3},
          correctFeedback:
              'Correct! Charcoal, smoking, and sweeping all release particles.',
          incorrectFeedback:
              'Charcoal, smoking, and sweeping release particles. Solar panels do not.',
        ),
      ),
      LearnLessonActivity(
        index: 5,
        type: LearnActivityType.quiz,
        title: 'Ranking',
        quiz: LearnQuizPayload(
          format: LearnQuizFormat.ranking,
          question: 'Order these from most to least impact on indoor air.',
          options: [
            'Charcoal cooking',
            'Crop burning smoke',
            'Vehicle exhaust',
            'Road dust',
          ],
          correctOrder: [0, 1, 2, 3],
          correctFeedback: 'Great job — that order matches typical indoor impact.',
          incorrectFeedback:
              'Almost! Charcoal and crop smoke usually have the biggest indoor impact.',
        ),
      ),
      LearnLessonActivity(
        index: 6,
        type: LearnActivityType.quiz,
        title: 'Your thoughts',
        quiz: LearnQuizPayload(
          format: LearnQuizFormat.freeText,
          question:
              'Name one thing near your home that affects your air quality.',
          options: const [],
          correctFeedback:
              'Noted! Top answers from your area: open burning, road dust, charcoal smoke.',
        ),
      ),
    ];
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

  static String _resolveImage(LearnLessonSlot slot, KyaLesson? apiLesson) {
    if (apiLesson != null && apiLesson.image.isNotEmpty) {
      return apiLesson.image;
    }
    if (apiLesson != null) {
      for (final task in apiLesson.tasks) {
        if (task.image.isNotEmpty) return task.image;
      }
    }
    return '';
  }

  static String _resolveArticleBody(
    LearnLessonSlot slot,
    KyaLesson? apiLesson,
    String topic,
    String unit,
  ) {
    if (apiLesson != null && apiLesson.tasks.isNotEmpty) {
      final parts = apiLesson.tasks
          .where((t) => t.content.trim().isNotEmpty)
          .map((t) => t.content.trim())
          .toList();
      if (parts.isNotEmpty) return parts.join('\n\n');
    }
    return 'In $unit, understanding $topic helps you read the air around you. '
        'Small particles in smoke and dust can reach your lungs before you feel anything. '
        'Knowing what to look for is the first step to protecting yourself and your family.';
  }
}
