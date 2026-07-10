import 'package:airqo/src/app/learn/models/learn_progress_models.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  group('LearnServerProgress.fromJson', () {
    test('accepts numeric fields sent as doubles', () {
      final progress = LearnServerProgress.fromJson({
        'success': true,
        'total_points': 210.0,
        'lessons': {
          'lesson-1': {
            'completed': true,
            'furthest_activity_index': 3.0,
            'stars': 3.0,
            'points_earned': 30.0,
            'quiz_score_ratio': 1,
          },
        },
      });

      expect(progress.totalPoints, 210);
      final lesson = progress.lessons['lesson-1']!;
      expect(lesson.furthestActivityIndex, 3);
      expect(lesson.stars, 3);
      expect(lesson.pointsEarned, 30);
      expect(lesson.quizScoreRatio, 1.0);
    });

    test('defaults missing or invalid numeric fields', () {
      final progress = LearnServerProgress.fromJson({
        'total_points': 'many',
        'lessons': {
          'lesson-1': {'stars': null, 'points_earned': 'x'},
        },
      });

      expect(progress.totalPoints, 0);
      final lesson = progress.lessons['lesson-1']!;
      expect(lesson.furthestActivityIndex, isNull);
      expect(lesson.stars, 0);
      expect(lesson.pointsEarned, 0);
    });
  });
}
