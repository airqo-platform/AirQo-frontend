import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class CurrentTimePointer extends StatelessWidget {
  const CurrentTimePointer({super.key});

  @override
  Widget build(BuildContext context) {
    final currentHour = DateTime.now().hour;
    final currentMinute = DateTime.now().minute;

    final anglePerHour = 2 * math.pi / 24;
    final currentAngle = ((currentHour + currentMinute / 60) * anglePerHour) - (math.pi / 2);

    final pointerDistance = 60.0;
    final x = pointerDistance * math.cos(currentAngle);
    final y = pointerDistance * math.sin(currentAngle);

    return Positioned(
      left: 110 + x - 6,
      top: 110 + y - 6,
      child: Transform.rotate(
        angle: currentAngle + (math.pi / 2),
        child: Container(
          width: 12,
          height: 12,
          decoration: BoxDecoration(
            color: AppColors.primaryColor,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withValues(alpha: 0.3),
                blurRadius: 4,
                offset: Offset(0, 2),
              ),
            ],
          ),
          child: Icon(
            Icons.circle,
            size: 8,
            color: Colors.white,
          ),
        ),
      ),
    );
  }
}
