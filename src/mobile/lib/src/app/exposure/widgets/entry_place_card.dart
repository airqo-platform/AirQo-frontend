import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/dashboard/models/user_preferences_model.dart';
import 'package:airqo/src/app/exposure/bloc/declared_places_cubit.dart';
import 'package:airqo/src/app/exposure/widgets/label_picker_sheet.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class EntryPlaceCard extends StatelessWidget {
  final SelectedSite site;
  const EntryPlaceCard({super.key, required this.site});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final txt1 = isDark ? Colors.white : const Color(0xFF1A1D23);
    final txt2 = AppColors.boldHeadlineColor;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.dividerColorlight, width: 1),
      ),
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(site.name, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: txt1)),
            const SizedBox(height: 2),
            Text(site.searchName, style: TextStyle(fontSize: 13, color: txt2)),
            const SizedBox(height: 14),
            GestureDetector(
              onTap: () {
                final cubit = context.read<DeclaredPlacesCubit>();
                showModalBottomSheet(
                  context: context,
                  isScrollControlled: true,
                  backgroundColor: Colors.transparent,
                  builder: (_) => BlocProvider.value(
                    value: cubit,
                    child: LabelPickerSheet(site: site),
                  ),
                );
              },
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                decoration: BoxDecoration(
                  color: isDark
                      ? AppColors.primaryColor.withValues(alpha: 0.15)
                      : const Color(0xFFEEF3FF),
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: AppColors.primaryColor.withValues(alpha: 0.3), width: 1),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Text('Set up this place', style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: AppColors.primaryColor)),
                    const SizedBox(width: 4),
                    Icon(Icons.arrow_forward_ios_rounded, size: 12, color: AppColors.primaryColor),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
