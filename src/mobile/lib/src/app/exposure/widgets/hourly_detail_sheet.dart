import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/widgets/label_picker_place_type_icon.dart';
import 'package:airqo/src/meta/utils/colors.dart';

// Single source of truth: both emoji and bar colour use the same PM2.5 breakpoints.
// Colours are extracted directly from the airquality_indicators SVG fills.
({String asset, Color color}) _aqLevel(double pm25) {
  if (pm25 < 12.1) {
    return (
      asset: 'assets/images/shared/airquality_indicators/good.svg',
      color: const Color(0xFF34C759),
    );
  }
  if (pm25 < 35.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/moderate.svg',
      color: const Color(0xFFFDC412),
    );
  }
  if (pm25 < 55.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/unhealthy-sensitive.svg',
      color: const Color(0xFFFF851F),
    );
  }
  if (pm25 < 150.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/unhealthy.svg',
      color: const Color(0xFFFE726B),
    );
  }
  if (pm25 < 250.5) {
    return (
      asset: 'assets/images/shared/airquality_indicators/very-unhealthy.svg',
      color: const Color(0xFFC78AE8),
    );
  }
  return (
    asset: 'assets/images/shared/airquality_indicators/hazardous.svg',
    color: const Color(0xFFD95BA3),
  );
}

class HourlyDetailSheet extends StatelessWidget {
  final DeclaredPlace place;
  final ExposureLevel exposureLevel;
  final List<HourlyReading> readings;

  const HourlyDetailSheet({
    super.key,
    required this.place,
    required this.exposureLevel,
    required this.readings,
  });

  double? get _avg {
    final valid = readings.where((r) => r.pm25 != null).toList();
    if (valid.isEmpty) return null;
    return valid.map((r) => r.pm25!).reduce((a, b) => a + b) / valid.length;
  }

  bool get _hasOffline => readings.any((r) => r.isOffline);

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.darkHighlight : Colors.white;
    // Use the same theme tokens as DeclaredPlaceCard so the sheet header
    // feels like a natural continuation of the card the user tapped.
    final nameColor = Theme.of(context).textTheme.headlineSmall?.color;
    final subtitleColor =
        Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.7);
    final hoursColor =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;
    final iconBg =
        isDark ? AppColors.darkThemeBackground : AppColors.dividerColorlight;
    final dividerColor =
        isDark ? AppColors.dividerColordark : AppColors.dividerColorlight;
    final avg = _avg;
    final window = place.windowFor(DateTime.now());

    return DraggableScrollableSheet(
      initialChildSize: 0.88,
      minChildSize: 0.5,
      maxChildSize: 0.95,
      expand: false,
      builder: (ctx, sc) {
        return Container(
          decoration: BoxDecoration(
            color: bg,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(20)),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Drag handle ──────────────────────────────────
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: (subtitleColor ?? Colors.grey).withValues(alpha: 0.4),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
              ),

              // ── Header: icon + type label ─────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(22, 0, 22, 0),
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
                    Text(
                      place.displayName,
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: nameColor,
                      ),
                    ),
                  ],
                ),
              ),

              // ── Location name + hours ─────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(22, 10, 22, 0),
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
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
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
                        ],
                      ),
                    ),
                    if (window != null) ...[
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

              // ── Chip + description ────────────────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(22, 14, 22, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: exposureLevel.color.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: Text(
                        exposureLevel.label,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: FontWeight.w600,
                          color: exposureLevel.color,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),
                    Text(
                      exposureLevel.copy,
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

              const SizedBox(height: 16),
              Divider(height: 1, thickness: 1, color: dividerColor),

              // ── PM2.5 per hour column header ──────────────────
              Padding(
                padding: const EdgeInsets.fromLTRB(22, 12, 22, 8),
                child: Row(
                  children: [
                    Text(
                      'PM2.5 PER HOUR',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                        color: hoursColor,
                        letterSpacing: 0.5,
                      ),
                    ),
                    const Spacer(),
                    Text(
                      'µg/m³',
                      style: TextStyle(
                        fontSize: 11,
                        fontWeight: FontWeight.w400,
                        color: hoursColor,
                      ),
                    ),
                  ],
                ),
              ),

              // ── Hour rows ─────────────────────────────────────
              Expanded(
                child: ListView.builder(
                  controller: sc,
                  padding: const EdgeInsets.fromLTRB(22, 0, 22, 16),
                  itemCount: readings.length + (_hasOffline ? 1 : 0),
                  itemBuilder: (_, i) {
                    if (i == readings.length) {
                      return _OfflineNote(isDark: isDark);
                    }
                    return _HourRow(reading: readings[i], isDark: isDark);
                  },
                ),
              ),

              _Footer(average: avg, isDark: isDark),
            ],
          ),
        );
      },
    );
  }
}

// ── Hour row ─────────────────────────────────────────────────────────────────

class _HourRow extends StatelessWidget {
  final HourlyReading reading;
  final bool isDark;
  const _HourRow({required this.reading, required this.isDark});

  String _lbl(int h) {
    if (h == 0) return '12 AM';
    if (h < 12) return '$h AM';
    if (h == 12) return '12 PM';
    return '${h - 12} PM';
  }

  @override
  Widget build(BuildContext context) {
    final txt2 = isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;
    final offline = reading.isOffline;
    final aql = offline ? null : _aqLevel(reading.pm25!);
    final frac = offline ? 0.0 : (reading.pm25! / 150.0).clamp(0.0, 1.0);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 5),
      child: Row(
        children: [
          SizedBox(
            width: 48,
            child: Text(
              _lbl(reading.hour),
              style: TextStyle(fontSize: 11, color: txt2, fontWeight: FontWeight.w500),
            ),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: LayoutBuilder(builder: (_, c) {
              final total = c.maxWidth;
              final fillWidth = (offline ? total * 0.18 : (total * frac)).clamp(4.0, total);
              final emojiLeft = (fillWidth - 10).clamp(0.0, total - 20);
              final emojiAsset = offline
                  ? 'assets/images/shared/airquality_indicators/unavailable.svg'
                  : aql!.asset;
              return Stack(
                clipBehavior: Clip.none,
                children: [
                  // Track
                  Container(
                    height: 20,
                    width: total,
                    decoration: BoxDecoration(
                      color: isDark ? AppColors.darkThemeBackground : AppColors.highlightColor,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  // Fill
                  offline
                      ? _OfflineBar(width: fillWidth, isDark: isDark)
                      : Container(
                          height: 20,
                          width: fillWidth,
                          decoration: BoxDecoration(
                            color: aql!.color,
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                  // Emoji node pinned at the tip of the fill
                  Positioned(
                    left: emojiLeft,
                    top: 0,
                    child: SvgPicture.asset(emojiAsset, width: 20, height: 20),
                  ),
                ],
              );
            }),
          ),
          const SizedBox(width: 10),
          SizedBox(
            width: 44,
            child: Text(
              offline ? 'offline' : reading.pm25!.toStringAsFixed(1),
              style: TextStyle(
                fontSize: 11,
                color: offline ? txt2 : aql!.color,
                fontWeight: offline ? FontWeight.w400 : FontWeight.w600,
              ),
              textAlign: TextAlign.right,
            ),
          ),
        ],
      ),
    );
  }
}

// ── Offline bar ───────────────────────────────────────────────────────────────

class _OfflineBar extends StatelessWidget {
  final double width;
  final bool isDark;
  const _OfflineBar({required this.width, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final base = isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;
    return ClipRRect(
        borderRadius: BorderRadius.circular(4),
        child: Container(
          height: 20,
          width: width,
          decoration: BoxDecoration(color: base.withValues(alpha: 0.2)),
          child: CustomPaint(painter: _StripePainter(base.withValues(alpha: 0.35))),
        ),
      );
  }
}

class _StripePainter extends CustomPainter {
  final Color stripeColor;
  const _StripePainter(this.stripeColor);

  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()
      ..color = stripeColor
      ..strokeWidth = 1.5;
    for (double x = -size.height; x < size.width; x += 5) {
      canvas.drawLine(Offset(x, size.height), Offset(x + size.height, 0), p);
    }
  }

  @override
  bool shouldRepaint(covariant _StripePainter o) => o.stripeColor != stripeColor;
}

// ── Offline note ──────────────────────────────────────────────────────────────

class _OfflineNote extends StatelessWidget {
  final bool isDark;
  const _OfflineNote({required this.isDark});

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? AppColors.darkThemeBackground : AppColors.highlightColor;
    final txt2 = isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;
    return Container(
      margin: const EdgeInsets.only(top: 16, bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(10)),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 6,
            height: 6,
            margin: const EdgeInsets.only(top: 4, right: 8),
            decoration: BoxDecoration(color: txt2.withValues(alpha: 0.5), shape: BoxShape.circle),
          ),
          Expanded(
            child: Text(
              'Greyed hours = monitor was offline · avg calculated from available readings only',
              style: TextStyle(fontSize: 12, color: txt2, height: 1.5),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Footer ────────────────────────────────────────────────────────────────────

class _Footer extends StatelessWidget {
  final double? average;
  final bool isDark;
  const _Footer({required this.average, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final dividerColor =
        isDark ? AppColors.dividerColordark : AppColors.dividerColorlight;
    final txt2 = isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;
    final ExposureLevel? level = average != null ? ExposureLevelExtension.fromPm25(average!) : null;

    return Container(
      color: Theme.of(context).cardColor,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Divider(height: 1, thickness: 1, color: dividerColor),
          Padding(
            padding: const EdgeInsets.fromLTRB(22, 16, 22, 24),
            child: Row(
              children: [
                Text(
                  'Day average',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w500,
                    color: txt2,
                  ),
                ),
                const Spacer(),
                if (average != null)
                  Text(
                    '${average!.toStringAsFixed(1)} µg/m³',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: level?.color ?? txt2,
                    ),
                  )
                else
                  Text('No data', style: TextStyle(fontSize: 14, color: txt2)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
