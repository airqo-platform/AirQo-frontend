import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/exposure/bloc/declared_places_cubit.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_level_chip.dart';
import 'package:airqo/src/app/exposure/widgets/hourly_detail_sheet.dart';
import 'package:airqo/src/app/exposure/widgets/edit_place_sheet.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class DeclaredPlaceCard extends StatelessWidget {
  final DeclaredPlace place;
  final ExposureLevel exposureLevel;
  final List<HourlyReading> hourlyReadings;

  const DeclaredPlaceCard({super.key, required this.place, required this.exposureLevel, required this.hourlyReadings});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final txt1 = isDark ? Colors.white : const Color(0xFF1A1D23);
    final txt2 = AppColors.boldHeadlineColor;

    return GestureDetector(
      onTap: () => showModalBottomSheet(
        context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
        builder: (_) => HourlyDetailSheet(place: place, exposureLevel: exposureLevel, readings: hourlyReadings),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        decoration: BoxDecoration(
          color: Theme.of(context).cardColor,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: AppColors.dividerColorlight, width: 1),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Header: type icon + label + dots
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 12, 0),
              child: Row(
                children: [
                  Container(
                    width: 32, height: 32,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkHighlight : AppColors.highlightColor,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(place.type.icon, size: 17, color: txt2),
                  ),
                  const SizedBox(width: 8),
                  Text(place.type.label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.w500, color: txt2)),
                  const Spacer(),
                  _DotsMenu(place: place),
                ],
              ),
            ),
            // Body: name + city + hours
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(place.displayName, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: txt1)),
                  const SizedBox(height: 2),
                  Text(place.city, style: TextStyle(fontSize: 13, color: txt2)),
                  if (place.hasTimeWindow) ...[
                    const SizedBox(height: 2),
                    Text(place.dailyHoursLabel, style: TextStyle(fontSize: 12, color: txt2, fontWeight: FontWeight.w500)),
                  ],
                ],
              ),
            ),
            Padding(padding: const EdgeInsets.symmetric(vertical: 12), child: Divider(height: 1, color: AppColors.dividerColorlight)),
            // Footer: chip + copy
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  ExposureLevelChip(level: exposureLevel),
                  const SizedBox(width: 10),
                  Expanded(child: Text(exposureLevel.copy, style: TextStyle(fontSize: 12, color: txt2, height: 1.35))),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _DotsMenu extends StatelessWidget {
  final DeclaredPlace place;
  const _DotsMenu({required this.place});

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<String>(
      icon: Icon(Icons.more_horiz, size: 20, color: AppColors.boldHeadlineColor),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      onSelected: (value) {
        if (value == 'edit') {
          final cubit = context.read<DeclaredPlacesCubit>();
          showModalBottomSheet(
            context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
            builder: (_) => BlocProvider.value(value: cubit, child: EditPlaceSheet(place: place)),
          );
        }
      },
      itemBuilder: (_) => [
        const PopupMenuItem(value: 'edit', child: Row(children: [
          Icon(Icons.edit_outlined, size: 18), SizedBox(width: 8), Text('Edit place'),
        ])),
      ],
    );
  }
}
