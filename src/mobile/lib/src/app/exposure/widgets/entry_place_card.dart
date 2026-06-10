import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/bloc/declared_places_cubit.dart';
import 'package:airqo/src/app/exposure/widgets/dashed_rounded_rect_border.dart';
import 'package:airqo/src/app/exposure/widgets/label_picker_sheet.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class EntryPlaceCard extends StatelessWidget {
  final SelectedSite site;
  const EntryPlaceCard({super.key, required this.site});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkHighlight : Colors.white,
        borderRadius: BorderRadius.circular(10),
        boxShadow: const [
          BoxShadow(
            color: Color(0x29536A87), // #536A87 @ 16%
            offset: Offset(0, 1),
            blurRadius: 2,
          ),
        ],
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(22, 16, 22, 18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Location name ────────────────────────────────────────────
            Text(
              site.name,
              style: TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.w700,
                height: 1.3,
                color: Theme.of(context).textTheme.headlineSmall?.color,
              ),
            ),
            const SizedBox(height: 4),
            // ── Subtitle ─────────────────────────────────────────────────
            Text(
              site.searchName,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w400,
                color: isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3,
              ),
            ),
            const SizedBox(height: 20),
            // ── CTA ──────────────────────────────────────────────────────
            _AddLabelButton(site: site),
          ],
        ),
      ),
    );
  }
}

class _AddLabelButton extends StatefulWidget {
  final SelectedSite site;
  const _AddLabelButton({required this.site});

  @override
  State<_AddLabelButton> createState() => _AddLabelButtonState();
}

class _AddLabelButtonState extends State<_AddLabelButton> {
  bool _pressed = false;

  void _handleTap(BuildContext context) {
    final cubit = context.read<DeclaredPlacesCubit>();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => BlocProvider.value(
        value: cubit,
        child: LabelPickerSheet(site: widget.site),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fillColor = _pressed
        ? (isDark
            ? AppColors.primaryColor.withValues(alpha: 0.18)
            : const Color(0xFFEEF3FF))
        : Colors.transparent;

    return GestureDetector(
      onTapDown: (_) => setState(() => _pressed = true),
      onTapUp: (_) {
        setState(() => _pressed = false);
        _handleTap(context);
      },
      onTapCancel: () => setState(() => _pressed = false),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 80),
        width: double.infinity,
        decoration: BoxDecoration(
          color: fillColor,
          borderRadius: BorderRadius.circular(12),
        ),
        child: CustomPaint(
          foregroundPainter: DashedRoundedRectPainter(
            borderRadius: 12,
            color: AppColors.primaryColor,
            strokeWidth: 1.5,
            dashLength: 5,
            gapLength: 4,
          ),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 12),
            child: Center(
              child: Text(
                '+ Add label to see exposure',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.w600,
                  color: AppColors.primaryColor,
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
