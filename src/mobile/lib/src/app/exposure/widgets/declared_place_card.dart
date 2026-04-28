import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:airqo/src/app/exposure/bloc/declared_places_cubit.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/services/exposure_place_readings.dart';
import 'package:airqo/src/app/exposure/widgets/hourly_detail_sheet.dart';
import 'package:airqo/src/app/exposure/widgets/label_picker_place_type_icon.dart';
import 'package:airqo/src/app/exposure/widgets/edit_place_sheet.dart';
import 'package:airqo/src/app/shared/widgets/edit_icon.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class DeclaredPlaceCard extends StatelessWidget {
  final DeclaredPlace place;
  /// Null when the user is not scheduled here today ([DeclaredPlace.isAbsentOn]).
  final ExposureLevel? exposureLevel;
  final List<HourlyReading> hourlyReadings;
  /// Calendar day used for weekday vs weekend window label + card PM average.
  final DateTime dayOfView;

  const DeclaredPlaceCard({
    super.key,
    required this.place,
    required this.exposureLevel,
    required this.hourlyReadings,
    required this.dayOfView,
  });

  ExposureLevel get _detailExposureLevel =>
      exposureLevel ?? ExposureLevelExtension.fromPm25(ExposurePlaceReadings.meanPm25(hourlyReadings));

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    // Mirror the analytics-card text style so both screens feel consistent.
    final nameColor = Theme.of(context).textTheme.headlineSmall?.color;
    final subtitleColor =
        Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.7);
    final hoursColor =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;
    // Inset elements (icon, divider) use the dark scaffold bg so they sink into the card
    final iconBg = isDark ? AppColors.darkThemeBackground : AppColors.dividerColorlight;
    final dividerColor = isDark ? AppColors.dividerColordark : AppColors.dividerColorlight;
    final isAbsent = place.isAbsentOn(dayOfView);
    final window = place.windowFor(dayOfView);

    void openHourlyDetail() {
      showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => HourlyDetailSheet(
          place: place,
          exposureLevel: _detailExposureLevel,
          readings: hourlyReadings,
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius: BorderRadius.circular(10),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.10),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Header: hourly tap on icon+name only; edit is outside that detector ──
          Padding(
            padding: const EdgeInsets.fromLTRB(22, 14, 16, 0),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: GestureDetector(
                    behavior: HitTestBehavior.opaque,
                    onTap: openHourlyDetail,
                    child: Row(
                      children: [
                        Container(
                          width: 28,
                          height: 28,
                          decoration: BoxDecoration(color: iconBg, shape: BoxShape.circle),
                          child: Center(
                            child: LabelPickerPlaceTypeIcon(
                              type: place.type,
                              selected: false,
                              size: 14,
                            ),
                          ),
                        ),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            place.displayName,
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.w700,
                              color: nameColor,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
                _EditButton(place: place),
              ],
            ),
          ),
          // ── Body: full-width tap for hourly detail ───────────────────────
          GestureDetector(
            behavior: HitTestBehavior.opaque,
            onTap: openHourlyDetail,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Padding(
                  padding: const EdgeInsets.fromLTRB(22, 12, 22, 0),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              place.locationName,
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: nameColor,
                                height: 1.2,
                              ),
                              overflow: TextOverflow.ellipsis,
                              maxLines: 1,
                            ),
                            const SizedBox(height: 4),
                            Text(
                              place.city,
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.w400,
                                color: subtitleColor,
                                height: 1.5,
                              ),
                            ),
                            if (isAbsent) ...[
                              const SizedBox(height: 4),
                              Text(
                                place.dailyHoursLabelFor(dayOfView),
                                style: TextStyle(
                                  fontSize: 12,
                                  fontWeight: FontWeight.w500,
                                  color: hoursColor,
                                ),
                              ),
                            ],
                          ],
                        ),
                      ),
                      if (!isAbsent && window != null) ...[
                        const SizedBox(width: 12),
                        Column(
                          crossAxisAlignment: CrossAxisAlignment.end,
                          children: [
                            Text(
                              window.durationLabel,
                              style: TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w500,
                                color: hoursColor,
                                height: 1,
                              ),
                            ),
                            const SizedBox(height: 3),
                            Text(
                              'per day',
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: FontWeight.w400,
                                color: hoursColor,
                                height: 1,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ],
                  ),
                ),
                const SizedBox(height: 14),
                Divider(height: 1, thickness: 1, color: dividerColor),
                Padding(
                  padding: const EdgeInsets.fromLTRB(22, 10, 22, 16),
                  child: isAbsent
                      ? Text(
                          "You're not usually here today based on your schedule.",
                          style: TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w400,
                            color: subtitleColor,
                            height: 1.6,
                          ),
                        )
                      : Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                              decoration: BoxDecoration(
                                color: _detailExposureLevel.color.withValues(alpha: 0.15),
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Text(
                                _detailExposureLevel.label,
                                style: TextStyle(
                                  fontSize: 14,
                                  fontWeight: FontWeight.w600,
                                  color: _detailExposureLevel.color,
                                ),
                              ),
                            ),
                            const SizedBox(height: 12),
                            Text(
                              _detailExposureLevel.copy,
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w400,
                                color: nameColor,
                                height: 1.75,
                              ),
                            ),
                          ],
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _EditButton extends StatelessWidget {
  final DeclaredPlace place;
  const _EditButton({required this.place});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      // Stop the tap from bubbling up to the card's GestureDetector.
      behavior: HitTestBehavior.opaque,
      onTap: () {
        final cubit = context.read<DeclaredPlacesCubit>();
        showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => BlocProvider.value(
            value: cubit,
            child: EditPlaceSheet(place: place),
          ),
        );
      },
      child: Padding(
        padding: const EdgeInsets.all(8),
        child: EditIcon(
          size: 18,
          color: Theme.of(context).brightness == Brightness.dark
              ? AppColors.boldHeadlineColor2
              : const Color(0xFF536A87),
        ),
      ),
    );
  }
}
