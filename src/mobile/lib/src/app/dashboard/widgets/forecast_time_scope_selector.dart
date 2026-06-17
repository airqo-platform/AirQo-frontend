import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

enum ForecastTimeScope { daily, hourly }

class ForecastTimeScopeSelector extends StatelessWidget {
  final ForecastTimeScope selected;
  final ValueChanged<ForecastTimeScope> onSelected;

  const ForecastTimeScopeSelector({
    super.key,
    required this.selected,
    required this.onSelected,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        _pill(
          context,
          label: 'Daily',
          isSelected: selected == ForecastTimeScope.daily,
          onTap: () => onSelected(ForecastTimeScope.daily),
        ),
        const SizedBox(width: 8),
        _pill(
          context,
          label: 'Hourly',
          isSelected: selected == ForecastTimeScope.hourly,
          onTap: () => onSelected(ForecastTimeScope.hourly),
        ),
      ],
    );
  }

  Widget _pill(
    BuildContext context, {
    required String label,
    required bool isSelected,
    required VoidCallback onTap,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 44,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(40),
          color: isSelected
              ? AppColors.primaryColor
              : (isDark
                  ? AppSurfaceColors.nested(context)
                  : AppColors.dividerColorlight),
        ),
        alignment: Alignment.center,
        child: Text(
          label,
          style: TextStyle(
            color: isSelected
                ? Colors.white
                : (isDark ? Colors.white : AppColors.boldHeadlineColor4),
            fontWeight: isSelected ? FontWeight.w700 : FontWeight.w500,
            fontSize: 14,
          ),
        ),
      ),
    );
  }
}
