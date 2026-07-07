import 'dart:io';

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/utils/air_quality_card_utils.dart';
import 'package:airqo/src/app/dashboard/utils/clean_air_forum_branding.dart';
import 'package:airqo/src/app/dashboard/utils/measurement_location_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// A full-bleed selfie photo with an AirQo + Clean Air Forum branded overlay
/// (location, live AQI value/category, event dates) anchored near the
/// bottom — matches the "AQ/CAF" Figma template exactly (file
/// `Z0OLd2awVqgZhytJULgO8L`, node 169:534), including its 1080x1080
/// reference proportions (see [kCafReferenceWidth]).
///
/// If [selfieFile] is null a neutral placeholder avatar is shown instead so
/// the template stays visible/previewable before the user picks a photo.
///
/// Meant to be wrapped in a `RepaintBoundary` and captured as a single PNG
/// for sharing.
class CleanAirForumFilterCard extends StatelessWidget {
  final File? selfieFile;
  final Measurement measurement;
  final String? fallbackLocationName;

  const CleanAirForumFilterCard({
    super.key,
    required this.selfieFile,
    required this.measurement,
    this.fallbackLocationName,
  });

  @override
  Widget build(BuildContext context) {
    final locationName = sanitizeCardText(
      measurementDisplayName(
        measurement,
        fallbackLocationName: fallbackLocationName,
      ),
    );
    final locationDescription = sanitizeCardText(
      measurementLocationDescription(measurement),
    );
    final category = aqiCategoryLabel(
      sanitizeCardText(measurement.aqiCategory ?? 'Unavailable'),
    );
    final pm25Value = measurement.pm25?.value;
    final categoryColor = getMeasurementAqiColor(measurement);

    return AspectRatio(
      aspectRatio: 1,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final width = constraints.maxWidth;
          final scale = width / kCafReferenceWidth;

          return ClipRRect(
            borderRadius: BorderRadius.circular(32 * scale),
            child: Stack(
              fit: StackFit.expand,
              children: [
                selfieFile != null
                    ? Image.file(selfieFile!, fit: BoxFit.cover)
                    : _SelfiePlaceholder(scale: scale),
                // Soft top scrim so the brand header stays legible over
                // bright photos.
                const DecoratedBox(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [Colors.black38, Colors.transparent],
                      stops: [0.0, 0.3],
                    ),
                  ),
                ),
                // Teal scrim rising from the bottom, approximating the
                // Figma radial-gradient wash behind the AQI panel.
                Positioned(
                  left: 0,
                  right: 0,
                  bottom: 0,
                  height: width * 0.62,
                  child: DecoratedBox(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.bottomCenter,
                        colors: [
                          CleanAirForumBrand.scrimTeal.withValues(alpha: 0),
                          CleanAirForumBrand.scrimTeal.withValues(alpha: 0.5),
                          CleanAirForumBrand.scrimTeal.withValues(alpha: 0.94),
                        ],
                        stops: const [0.0, 0.5, 1.0],
                      ),
                    ),
                  ),
                ),
                Positioned(
                  top: 53 * scale,
                  left: 44 * scale,
                  right: 44 * scale,
                  child: CleanAirForumBrandHeader(scale: scale),
                ),
                Positioned(
                  left: 44 * scale,
                  right: 31 * scale,
                  bottom: 44 * scale,
                  child: _BottomPanel(
                    scale: scale,
                    categoryColor: categoryColor,
                    locationName: locationName,
                    locationDescription: locationDescription,
                    pm25Value: pm25Value,
                    category: category,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

/// Stand-in for the selfie photo before one is picked. Deliberately neutral
/// (no decorative gradient/icon) so the rest of the stack — header, scrim,
/// bottom panel — previews exactly as the final shared image will look.
class _SelfiePlaceholder extends StatelessWidget {
  final double scale;

  const _SelfiePlaceholder({required this.scale});

  @override
  Widget build(BuildContext context) {
    return ColoredBox(
      color: const Color(0xFF2B3238),
      child: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            SvgPicture.asset(
              'assets/icons/camera.svg',
              width: 64 * scale,
              height: 64 * scale,
              colorFilter: ColorFilter.mode(
                Colors.white.withValues(alpha: 0.4),
                BlendMode.srcIn,
              ),
            ),
            SizedBox(height: 12 * scale),
            Text(
              'Your photo here',
              style: TextStyle(
                color: Colors.white.withValues(alpha: 0.5),
                fontSize: 22 * scale,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _BottomPanel extends StatelessWidget {
  final double scale;
  final Color categoryColor;
  final String locationName;
  final String locationDescription;
  final double? pm25Value;
  final String category;

  const _BottomPanel({
    required this.scale,
    required this.categoryColor,
    required this.locationName,
    required this.locationDescription,
    required this.pm25Value,
    required this.category,
  });

  @override
  Widget build(BuildContext context) {
    final pm25 = pm25Value;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          locationName,
          maxLines: 2,
          overflow: TextOverflow.ellipsis,
          style: TextStyle(
            color: Colors.white,
            fontSize: 68.949 * scale,
            height: 1.05,
            fontWeight: FontWeight.w800,
          ),
        ),
        if (locationDescription.isNotEmpty) ...[
          SizedBox(height: 8 * scale),
          Text(
            locationDescription,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              color: Colors.white,
              fontSize: 22.701 * scale,
              height: 1.2,
              fontWeight: FontWeight.w500,
            ),
          ),
        ],
        SizedBox(height: 17 * scale),
        Row(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              pm25 != null ? pm25.toStringAsFixed(1) : '--',
              style: TextStyle(
                color: Colors.white,
                fontSize: 92.14 * scale,
                height: 1.0,
                fontWeight: FontWeight.w800,
              ),
            ),
            SizedBox(width: 8 * scale),
            Padding(
              padding: EdgeInsets.only(bottom: 10 * scale),
              child: Text(
                'PM2.5 µg/m³',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 21.021 * scale,
                  fontWeight: FontWeight.w700,
                ),
              ),
            ),
            SizedBox(width: 12 * scale),
            Padding(
              padding: EdgeInsets.only(bottom: 12 * scale),
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: 25.333 * scale,
                  vertical: 4.75 * scale,
                ),
                decoration: BoxDecoration(
                  color: aqiPillBackground(categoryColor),
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  category,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: categoryColor,
                    fontSize: 22.167 * scale,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
          ],
        ),
        SizedBox(height: 38.679 * scale),
        Row(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Flexible(
              child: Container(
                padding: EdgeInsets.symmetric(
                  horizontal: 18 * scale,
                  vertical: 10 * scale,
                ),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(999),
                ),
                child: Text(
                  'Shared from the AirQo app',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: CleanAirForumBrand.sharedCaptionText,
                    fontSize: 22.642 * scale,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
            ),
            if (CleanAirForumBrand.dateRange.isNotEmpty) ...[
              const Spacer(),
              Text(
                CleanAirForumBrand.dateRange,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 35.974 * scale,
                  fontWeight: FontWeight.w800,
                ),
              ),
            ],
          ],
        ),
      ],
    );
  }
}
