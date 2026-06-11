import 'package:airqo/src/app/learn/models/learn_course_structure.dart';
import 'package:airqo/src/app/learn/services/learn_progress_service.dart';
import 'package:airqo/src/app/learn/theme/learn_design_tokens.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class LearnUnitChip extends StatelessWidget {
  final LearnUnitViewModel unit;
  final LearnUnitStatus status;
  final bool selected;
  final bool isDark;
  final VoidCallback onTap;

  const LearnUnitChip({
    super.key,
    required this.unit,
    required this.status,
    required this.selected,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final strokeColor = isDark
        ? AppColors.boldHeadlineColor2.withValues(alpha: 0.35)
        : AppColors.dividerColorlight;
    final inactiveTextColor =
        isDark ? Colors.white : AppColors.boldHeadlineColor4;
    final bg = selected ? AppColors.primaryColor : Colors.white;
    final textColor = selected ? Colors.white : inactiveTextColor;
    final iconColor = selected
        ? Colors.white
        : _statusColor(status, inactiveTextColor);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        height: 28,
        padding: const EdgeInsets.symmetric(horizontal: 10),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(20),
          border: selected ? null : Border.all(color: strokeColor),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            _StatusIcon(status: status, color: iconColor),
            const SizedBox(width: 6),
            TranslatedText(
              unit.plainTitleKey,
              style: TextStyle(
                fontSize: 12,
                fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                color: textColor,
              ),
            ),
          ],
        ),
      ),
    );
  }

  static Color _statusColor(LearnUnitStatus status, Color fallback) {
    switch (status) {
      case LearnUnitStatus.completed:
        return LearnDesignTokens.success;
      case LearnUnitStatus.inProgress:
        return AppColors.primaryColor;
      case LearnUnitStatus.locked:
        return fallback.withValues(alpha: 0.55);
    }
  }
}

class _StatusIcon extends StatelessWidget {
  final LearnUnitStatus status;
  final Color color;

  const _StatusIcon({
    required this.status,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final IconData icon;
    switch (status) {
      case LearnUnitStatus.locked:
        icon = Icons.lock_outline;
      case LearnUnitStatus.completed:
        icon = LearnDesignTokens.completedCheckIcon;
      case LearnUnitStatus.inProgress:
        icon = Icons.timelapse;
    }

    return Icon(icon, size: 14, color: color);
  }
}

class LearnUnitChipRow extends StatefulWidget {
  final LearnCourseViewModel course;
  final int selectedUnitIndex;
  final bool isDark;
  final ValueChanged<int> onUnitSelected;

  const LearnUnitChipRow({
    super.key,
    required this.course,
    required this.selectedUnitIndex,
    required this.isDark,
    required this.onUnitSelected,
  });

  @override
  State<LearnUnitChipRow> createState() => _LearnUnitChipRowState();
}

class _LearnUnitChipRowState extends State<LearnUnitChipRow> {
  late final List<GlobalKey> _chipKeys;

  @override
  void initState() {
    super.initState();
    _chipKeys = List.generate(widget.course.units.length, (_) => GlobalKey());
  }

  @override
  void didUpdateWidget(LearnUnitChipRow oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.selectedUnitIndex != widget.selectedUnitIndex) {
      _scrollToSelectedChip();
    }
  }

  void _scrollToSelectedChip() {
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      final index = widget.selectedUnitIndex.clamp(
        0,
        widget.course.units.length - 1,
      );
      final context = _chipKeys[index].currentContext;
      if (context == null) return;
      Scrollable.ensureVisible(
        context,
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
        alignment: 0.5,
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final progress = LearnProgressService.instance;

    return SizedBox(
      height: 32,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: widget.course.units.length,
        separatorBuilder: (_, __) => const SizedBox(width: 6),
        itemBuilder: (context, unitIndex) {
          final unit = widget.course.units[unitIndex];
          final status = LearnCatalog.unitStatus(
            widget.course,
            unit,
            unitIndex,
            progress,
          );

          return KeyedSubtree(
            key: _chipKeys[unitIndex],
            child: LearnUnitChip(
              unit: unit,
              status: status,
              selected: unitIndex == widget.selectedUnitIndex,
              isDark: widget.isDark,
              onTap: () => widget.onUnitSelected(unitIndex),
            ),
          );
        },
      ),
    );
  }
}
