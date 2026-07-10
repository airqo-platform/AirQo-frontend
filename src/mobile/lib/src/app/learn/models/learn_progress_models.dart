/// JSON numbers may arrive as int or double; never throw on either.
int _asInt(dynamic value, [int fallback = 0]) =>
    value is int ? value : (value is num ? value.toInt() : fallback);

/// One quiz activity's attempt, as sent to PUT /learn/progress/lessons/:id.
class QuizAttemptData {
  final String activityId;
  final String format;
  final int? selectedIndex;
  final List<int>? selectedIndices;
  final List<int>? selectedOrder;
  final bool isCorrect;

  const QuizAttemptData({
    required this.activityId,
    required this.format,
    this.selectedIndex,
    this.selectedIndices,
    this.selectedOrder,
    required this.isCorrect,
  });

  Map<String, dynamic> toJson() => {
        'activity_id': activityId,
        'format': format,
        if (selectedIndex != null) 'selected_index': selectedIndex,
        if (selectedIndices != null) 'selected_indices': selectedIndices,
        if (selectedOrder != null) 'selected_order': selectedOrder,
        'is_correct': isCorrect,
      };

  static List<int>? _intList(dynamic value) => value is List
      ? value.whereType<int>().toList()
      : null;

  factory QuizAttemptData.fromJson(Map<String, dynamic> json) =>
      QuizAttemptData(
        activityId: json['activity_id']?.toString() ?? '',
        format: json['format'] as String? ?? '',
        selectedIndex:
            json['selected_index'] is int ? json['selected_index'] as int : null,
        selectedIndices: _intList(json['selected_indices']),
        selectedOrder: _intList(json['selected_order']),
        isCorrect: json['is_correct'] as bool? ?? false,
      );
}

/// One lesson's progress as returned by GET /learn/progress.
class LearnServerLessonProgress {
  final bool completed;
  final int? furthestActivityIndex;
  final int stars;
  final int pointsEarned;
  final double? quizScoreRatio;
  final String? freeTextResponse;

  const LearnServerLessonProgress({
    required this.completed,
    this.furthestActivityIndex,
    required this.stars,
    required this.pointsEarned,
    this.quizScoreRatio,
    this.freeTextResponse,
  });

  factory LearnServerLessonProgress.fromJson(Map<String, dynamic> json) =>
      LearnServerLessonProgress(
        completed: json['completed'] as bool? ?? false,
        furthestActivityIndex: json['furthest_activity_index'] is num
            ? _asInt(json['furthest_activity_index'])
            : null,
        stars: _asInt(json['stars']),
        pointsEarned: _asInt(json['points_earned']),
        quizScoreRatio: json['quiz_score_ratio'] is num
            ? (json['quiz_score_ratio'] as num).toDouble()
            : null,
        freeTextResponse: json['free_text_response'] as String?,
      );
}

/// Account/guest progress as returned by GET /learn/progress. The API returns
/// `lessons` as an object keyed by lesson id, not an array.
class LearnServerProgress {
  final int totalPoints;
  final Map<String, LearnServerLessonProgress> lessons;

  const LearnServerProgress({
    required this.totalPoints,
    required this.lessons,
  });

  factory LearnServerProgress.fromJson(Map<String, dynamic> json) {
    final rawLessons = json['lessons'];
    final lessons = <String, LearnServerLessonProgress>{};
    if (rawLessons is Map) {
      for (final entry in rawLessons.entries) {
        if (entry.value is Map) {
          lessons[entry.key.toString()] = LearnServerLessonProgress.fromJson(
            Map<String, dynamic>.from(entry.value as Map),
          );
        }
      }
    }
    return LearnServerProgress(
      totalPoints: _asInt(json['total_points']),
      lessons: lessons,
    );
  }
}
