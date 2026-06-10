import 'package:flutter/material.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';

class ExposureLevelChip extends StatelessWidget {
  final ExposureLevel level;
  const ExposureLevelChip({super.key, required this.level});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
      decoration: BoxDecoration(
        color: level.bgColor,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Text(
        level.label,
        style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: level.color),
      ),
    );
  }
}
