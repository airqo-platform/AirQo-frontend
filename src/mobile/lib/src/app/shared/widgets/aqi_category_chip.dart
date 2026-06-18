import 'package:airqo/src/meta/utils/forecast_utils.dart';
import 'package:flutter/material.dart';

/// AQI category pill — uses canonical app colors (ignores API hex).
class AqiCategoryChip extends StatelessWidget {
  final String category;

  const AqiCategoryChip({
    super.key,
    required this.category,
  });

  @override
  Widget build(BuildContext context) {
    final color = getAppAqiCategoryColor(category);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        category,
        style: TextStyle(
          fontSize: 14,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}
