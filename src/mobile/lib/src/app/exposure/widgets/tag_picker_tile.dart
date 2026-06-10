import 'package:flutter/material.dart';

import 'package:airqo/src/meta/utils/colors.dart';

/// Figma tag-picker tile: 111×78, 12 radius, 10 padding; primary selected / #F4F6F8 idle.
class TagPickerTile extends StatelessWidget {
  final String label;
  final bool selected;
  final bool isDark;
  final VoidCallback onTap;
  final Widget icon;

  const TagPickerTile({
    super.key,
    required this.label,
    required this.selected,
    required this.isDark,
    required this.onTap,
    required this.icon,
  });

  static const _idle = Color(0xFFF4F6F8),
      _labelIdle = Color(0xFF1A1D23);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.all(10),
        decoration: BoxDecoration(
          color: selected
              ? AppColors.primaryColor
              : (isDark ? AppColors.darkThemeBackground : _idle),
          borderRadius: BorderRadius.circular(12),
        ),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            SizedBox(width: 24, height: 24, child: icon),
            const SizedBox(height: 8),
            Text(
              label,
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
              style: TextStyle(
                fontFamily: 'Inter',
                fontSize: 13,
                fontWeight: selected ? FontWeight.w700 : FontWeight.w600,
                color: selected
                    ? Colors.white
                    : (isDark ? AppColors.boldHeadlineColor2 : _labelIdle),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
