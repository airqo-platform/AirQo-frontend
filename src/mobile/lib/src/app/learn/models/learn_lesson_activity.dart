enum LearnActivityType { article, video, image, quiz }

enum LearnQuizFormat {
  singleChoice,
  multiChoice,
  ranking,
  freeText;

  String get apiKey => switch (this) {
        LearnQuizFormat.singleChoice => 'single_choice',
        LearnQuizFormat.multiChoice => 'multi_choice',
        LearnQuizFormat.ranking => 'ranking',
        LearnQuizFormat.freeText => 'free_text',
      };

  static LearnQuizFormat fromApiKey(String raw) => switch (raw) {
        'single_choice' => LearnQuizFormat.singleChoice,
        'multi_choice' => LearnQuizFormat.multiChoice,
        'ranking' => LearnQuizFormat.ranking,
        'free_text' => LearnQuizFormat.freeText,
        _ => LearnQuizFormat.singleChoice,
      };
}

class LearnArticlePayload {
  final String body;
  final String? audioText;

  const LearnArticlePayload({
    required this.body,
    this.audioText,
  });
}

class LearnVideoPayload {
  final String videoUrl;
  final String description;
  final String? posterUrl;

  const LearnVideoPayload({
    required this.videoUrl,
    required this.description,
    this.posterUrl,
  });
}

class LearnImagePayload {
  final String imageUrl;
  final String caption;
  final String? subtitle;

  const LearnImagePayload({
    required this.imageUrl,
    required this.caption,
    this.subtitle,
  });
}

class LearnQuizPayload {
  final LearnQuizFormat format;
  final String question;
  final List<String> options;
  final int? correctIndex;
  final Set<int>? correctIndices;
  final List<int>? correctOrder;
  final String correctFeedback;
  final String incorrectFeedback;
  final String? hint;

  const LearnQuizPayload({
    required this.format,
    required this.question,
    this.options = const [],
    this.correctIndex,
    this.correctIndices,
    this.correctOrder,
    this.correctFeedback = 'Correct!',
    this.incorrectFeedback = 'Not quite — try reviewing the lesson.',
    this.hint,
  });
}

class LearnLessonActivity {
  final int index;
  final LearnActivityType type;
  final String title;
  final LearnArticlePayload? article;
  final LearnVideoPayload? video;
  final LearnImagePayload? image;
  final LearnQuizPayload? quiz;

  const LearnLessonActivity({
    required this.index,
    required this.type,
    required this.title,
    this.article,
    this.video,
    this.image,
    this.quiz,
  });

  LearnQuizPayload? get quizPayload => quiz;
}

class LearnLessonResult {
  final int stars;
  final int pointsEarned;
  final double quizScoreRatio;
  final String? freeTextResponse;

  const LearnLessonResult({
    required this.stars,
    required this.pointsEarned,
    required this.quizScoreRatio,
    this.freeTextResponse,
  });
}

class LearnQuizGrade {
  final bool isCorrect;
  final String feedback;
  final int? selectedIndex;

  const LearnQuizGrade({
    required this.isCorrect,
    required this.feedback,
    this.selectedIndex,
  });
}
