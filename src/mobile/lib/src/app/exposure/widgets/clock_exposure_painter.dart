import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:airqo/src/app/exposure/models/exposure_models.dart';

class ClockExposurePainter extends CustomPainter {
  final DailyExposureSummary? exposureData;
  final bool showData;

  ClockExposurePainter({
    this.exposureData,
    this.showData = false,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final outerRadius = size.width / 2;
    final strokeWidth = 16.0;

    // Calculate angle per hour (360° / 24 hours = 15° per hour)
    final anglePerHour = 2 * math.pi / 24;
    final segmentGap = 0.02;

    // Group exposure data by hour if available
    Map<int, double> hourlyExposure = {};
    Map<int, String> hourlyAqiCategory = {};

    if (showData && exposureData != null) {
      for (final point in exposureData!.dataPoints) {
        final hour = point.timestamp.hour;
        final exposure = point.exposureScore;

        if (hourlyExposure.containsKey(hour)) {
          hourlyExposure[hour] = hourlyExposure[hour]! + exposure;
        } else {
          hourlyExposure[hour] = exposure;
          hourlyAqiCategory[hour] = point.aqiCategory ?? 'Unknown';
        }
      }
    }

    // Draw 24 hour segments
    for (int hour = 0; hour < 24; hour++) {
      final startAngle = (hour * anglePerHour) - (math.pi / 2) + segmentGap;
      final sweepAngle = anglePerHour - (2 * segmentGap);

      Paint paint;

      if (showData && hourlyExposure.containsKey(hour)) {
        final exposure = hourlyExposure[hour]!;
        final category = hourlyAqiCategory[hour] ?? 'Unknown';
        paint = Paint()
          ..color = _getExposureColor(exposure, category)
          ..style = PaintingStyle.stroke
          ..strokeWidth = strokeWidth
          ..strokeCap = StrokeCap.butt;
      } else {
        paint = Paint()
          ..color = Colors.grey.withValues(alpha: 0.3)
          ..style = PaintingStyle.stroke
          ..strokeWidth = strokeWidth
          ..strokeCap = StrokeCap.butt;
      }

      canvas.drawArc(
        Rect.fromCircle(center: center, radius: outerRadius - strokeWidth / 2),
        startAngle,
        sweepAngle,
        false,
        paint,
      );
    }

    // Draw hour numbers
    final textPainter = TextPainter(
      textAlign: TextAlign.center,
      textDirection: TextDirection.ltr,
    );

    final numberRadius = outerRadius + 20;

    for (int hour = 0; hour < 24; hour++) {
      final angle = (hour * anglePerHour) - (math.pi / 2);
      final x = center.dx + numberRadius * math.cos(angle);
      final y = center.dy + numberRadius * math.sin(angle);

      final hourText = hour.toString().padLeft(2, '0');

      textPainter.text = TextSpan(
        text: hourText,
        style: TextStyle(
          color: Colors.grey.shade700,
          fontSize: 12,
          fontWeight: FontWeight.w500,
        ),
      );

      textPainter.layout();
      textPainter.paint(
        canvas,
        Offset(
          x - textPainter.width / 2,
          y - textPainter.height / 2,
        ),
      );
    }
  }

  Color _getExposureColor(double exposure, String aqiCategory) {
    switch (aqiCategory.toLowerCase()) {
      case 'good':
        return const Color(0xFF8FE6A4);
      case 'moderate':
        return const Color(0xFFFFEC89);
      case 'unhealthy for sensitive groups':
        return const Color(0xFFFFC170);
      case 'unhealthy':
        return const Color(0xFFF0B1D8);
      case 'very unhealthy':
        return const Color(0xFFDBB6F1);
      case 'hazardous':
        return const Color(0xFFF7453C);
      default:
        if (exposure >= 20) return const Color(0xFFF7453C);
        if (exposure >= 10) return const Color(0xFFF0B1D8);
        if (exposure >= 5) return const Color(0xFFFFC170);
        if (exposure >= 2) return const Color(0xFFFFEC89);
        return const Color(0xFF8FE6A4);
    }
  }

  @override
  bool shouldRepaint(ClockExposurePainter oldDelegate) {
    return oldDelegate.exposureData != exposureData ||
        oldDelegate.showData != showData;
  }
}
