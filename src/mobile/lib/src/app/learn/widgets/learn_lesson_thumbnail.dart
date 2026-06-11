import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:flutter/material.dart';

/// Full-width header gradient for lesson cards.
class LearnLessonThumbnail extends StatelessWidget {
  static const height = 72.0;

  /// Non-semantic palettes: USG orange, hazardous, light blue.
  static const _gradients = [
    (
      light: Color(0xFFFFC170),
      dark: Color(0xFFFF851F),
      number: Color(0xFF9A4E00),
    ),
    (
      light: Color(0xFFF0B1D8),
      dark: Color(0xFFD95BA3),
      number: Color(0xFF8B2868),
    ),
    (
      light: Color(0xFFBFE7FF),
      dark: Color(0xFF5EB3F5),
      number: Color(0xFF1A5F8F),
    ),
  ];

  final LearnLessonSlot slot;
  final int unitIndex;
  final int lessonIndex;

  const LearnLessonThumbnail({
    super.key,
    required this.slot,
    required this.unitIndex,
    required this.lessonIndex,
  });

  static int gradientIndex(int unitIndex, int lessonIndex) {
    return (lessonIndex + unitIndex) % _gradients.length;
  }

  static LinearGradient gradientFor(int unitIndex, int lessonIndex) {
    final palette = _gradients[gradientIndex(unitIndex, lessonIndex)];
    return LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [palette.light, palette.dark],
    );
  }

  static Color numberColorFor(int unitIndex, int lessonIndex) {
    return _gradients[gradientIndex(unitIndex, lessonIndex)].number;
  }

  @override
  Widget build(BuildContext context) {
    final numberColor = numberColorFor(unitIndex, lessonIndex);

    return SizedBox(
      width: double.infinity,
      height: height,
      child: Stack(
        fit: StackFit.expand,
        children: [
          DecoratedBox(
            decoration: BoxDecoration(
              gradient: gradientFor(unitIndex, lessonIndex),
            ),
          ),
          Positioned(
            top: 8,
            right: 16,
            child: Text(
              '${lessonIndex + 1}',
              style: TextStyle(
                fontSize: 44,
                fontWeight: FontWeight.w800,
                height: 1,
                color: numberColor,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
