import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/utils/air_quality_card_utils.dart';
import 'package:airqo/src/app/dashboard/utils/clean_air_forum_branding.dart';
import 'package:airqo/src/app/dashboard/utils/measurement_location_utils.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

/// A compact, transparent-background "sticker" — no photo, no card chrome —
/// meant to be saved and dropped onto the user's own Instagram Story
/// (Strava run-stat style). Matches the Figma "AQ/CAF Transparent" template
/// exactly (file `Z0OLd2awVqgZhytJULgO8L`, node 169:491), including its
/// 1080x1080 reference proportions (see [kCafReferenceWidth]).
///
/// Wrap in a `RepaintBoundary` and capture with `toImage`/`toByteData` using
/// PNG format to preserve the transparent background.
class CleanAirForumStickerFrame extends StatelessWidget {
  final Measurement measurement;
  final String? fallbackLocationName;

  const CleanAirForumStickerFrame({
    super.key,
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
    final iconAsset = getMeasurementAqiIconAsset(measurement);

    return AspectRatio(
      aspectRatio: 1,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final scale = constraints.maxWidth / kCafReferenceWidth;

          return Padding(
            padding: EdgeInsets.symmetric(horizontal: 60 * scale),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              mainAxisSize: MainAxisSize.max,
              children: [
                Text(
                  locationName,
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 68.949 * scale,
                    height: 1.05,
                    shadows: _textShadow,
                    fontWeight: FontWeight.w800,
                  ),
                ),
                if (locationDescription.isNotEmpty) ...[
                  SizedBox(height: 10 * scale),
                  Text(
                    locationDescription,
                    textAlign: TextAlign.center,
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 22.701 * scale,
                      height: 1.2,
                      shadows: _textShadow,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
                SizedBox(height: 30 * scale),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Row(
                          crossAxisAlignment: CrossAxisAlignment.baseline,
                          textBaseline: TextBaseline.alphabetic,
                          children: [
                            Text(
                              pm25Value != null
                                  ? pm25Value.toStringAsFixed(1)
                                  : '--',
                              style: TextStyle(
                                color: Colors.white,
                                fontSize: 92.14 * scale,
                                height: 1.0,
                                shadows: _textShadow,
                                fontWeight: FontWeight.w800,
                              ),
                            ),
                            SizedBox(width: 6 * scale),
                            Padding(
                              padding: EdgeInsets.only(bottom: 6 * scale),
                              child: Text(
                                'PM2.5\nµg/m³',
                                style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 21.021 * scale,
                                  height: 1.1,
                                  shadows: _textShadow,
                                  fontWeight: FontWeight.w700,
                                ),
                              ),
                            ),
                          ],
                        ),
                        SizedBox(height: 15 * scale),
                        Container(
                          padding: EdgeInsets.symmetric(
                            horizontal: 29.146 * scale,
                            vertical: 5.465 * scale,
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
                              fontSize: 25.502 * scale,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ],
                    ),
                    SizedBox(width: 45 * scale),
                    SvgPicture.asset(
                      iconAsset,
                      width: 195.598 * scale,
                      height: 195.598 * scale,
                    ),
                  ],
                ),
                SizedBox(height: 30 * scale),
                AirQoIconMark(size: 45 * scale),
                SizedBox(height: 10 * scale),
                Text(
                  'Shared from the AirQo app',
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    color: Colors.white,
                    fontSize: 18.853 * scale,
                    shadows: _textShadow,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  static const List<Shadow> _textShadow = [
    Shadow(color: Colors.black38, blurRadius: 10, offset: Offset(0, 2)),
  ];
}
