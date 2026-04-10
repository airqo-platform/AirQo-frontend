import 'package:flutter/material.dart';
import 'package:airqo/src/app/exposure/models/declared_place.dart';
import 'package:airqo/src/app/exposure/widgets/exposure_level_chip.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class HourlyDetailSheet extends StatelessWidget {
  final DeclaredPlace place;
  final ExposureLevel exposureLevel;
  final List<HourlyReading> readings;

  const HourlyDetailSheet({super.key, required this.place, required this.exposureLevel, required this.readings});

  double? get _avg {
    final valid = readings.where((r) => r.pm25 != null).toList();
    if (valid.isEmpty) return null;
    return valid.map((r) => r.pm25!).reduce((a, b) => a + b) / valid.length;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg = isDark ? AppColors.darkHighlight : Colors.white;
    final txt1 = isDark ? Colors.white : const Color(0xFF1A1D23);
    final txt2 = AppColors.boldHeadlineColor;
    final avg = _avg;

    return DraggableScrollableSheet(
      initialChildSize: 0.88, minChildSize: 0.5, maxChildSize: 0.95, expand: false,
      builder: (ctx, sc) {
        return Container(
          decoration: BoxDecoration(color: bg, borderRadius: const BorderRadius.vertical(top: Radius.circular(20))),
          child: Column(
            children: [
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Center(child: Container(width: 36, height: 4,
                    decoration: BoxDecoration(color: txt2.withValues(alpha: 0.3), borderRadius: BorderRadius.circular(2)))),
              ),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 0, 20, 0),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(place.displayName, style: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: txt1)),
                          const SizedBox(height: 2),
                          Row(children: [
                            Icon(Icons.sensors_rounded, size: 12, color: txt2),
                            const SizedBox(width: 4),
                            Text('Nearest monitor · ${place.city}', style: TextStyle(fontSize: 12, color: txt2)),
                          ]),
                        ],
                      ),
                    ),
                    ExposureLevelChip(level: exposureLevel),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              Divider(height: 1, color: AppColors.dividerColorlight),
              Expanded(
                child: ListView.builder(
                  controller: sc,
                  padding: const EdgeInsets.fromLTRB(20, 12, 20, 100),
                  itemCount: readings.length,
                  itemBuilder: (_, i) => _HourRow(reading: readings[i], isDark: isDark),
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
    final txt2 = AppColors.boldHeadlineColor;
    final offline = reading.isOffline;
    final level = reading.level;
    final frac = offline ? 0.0 : (reading.pm25! / 150.0).clamp(0.0, 1.0);

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        children: [
          SizedBox(width: 48, child: Text(_lbl(reading.hour), style: TextStyle(fontSize: 11, color: txt2, fontWeight: FontWeight.w500))),
          const SizedBox(width: 8),
          Expanded(
            child: LayoutBuilder(builder: (_, c) {
              final total = c.maxWidth;
              final bw = offline ? total * 0.15 : total * frac;
              return Stack(children: [
                Container(height: 20, width: total,
                    decoration: BoxDecoration(color: isDark ? const Color(0xFF2E2F33) : AppColors.highlightColor, borderRadius: BorderRadius.circular(4))),
                offline
                    ? _OfflineBar(width: bw)
                    : Container(height: 20, width: bw.clamp(4.0, total),
                        decoration: BoxDecoration(color: level?.color ?? AppColors.boldHeadlineColor, borderRadius: BorderRadius.circular(4))),
              ]);
            }),
          ),
          const SizedBox(width: 8),
          SizedBox(width: 40,
              child: Text(offline ? '—' : reading.pm25!.toStringAsFixed(1),
                  style: TextStyle(fontSize: 11, color: offline ? txt2 : level?.color ?? txt2, fontWeight: FontWeight.w600),
                  textAlign: TextAlign.right)),
        ],
      ),
    );
  }
}

class _OfflineBar extends StatelessWidget {
  final double width;
  const _OfflineBar({required this.width});

  @override
  Widget build(BuildContext context) => ClipRRect(
    borderRadius: BorderRadius.circular(4),
    child: Container(
      height: 20, width: width,
      decoration: BoxDecoration(color: AppColors.boldHeadlineColor.withValues(alpha: 0.2)),
      child: CustomPaint(painter: _StripePainter()),
    ),
  );
}

class _StripePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final p = Paint()..color = AppColors.boldHeadlineColor.withValues(alpha: 0.3)..strokeWidth = 1.5;
    for (double x = -size.height; x < size.width; x += 5) {
      canvas.drawLine(Offset(x, size.height), Offset(x + size.height, 0), p);
    }
  }
  @override bool shouldRepaint(_StripePainter o) => false;
}

class _Footer extends StatelessWidget {
  final double? average;
  final bool isDark;
  const _Footer({required this.average, required this.isDark});

  @override
  Widget build(BuildContext context) {
    final bg = isDark ? const Color(0xFF2E2F33) : AppColors.highlightColor;
    final txt2 = AppColors.boldHeadlineColor;
    final ExposureLevel? level = average != null ? ExposureLevelExtension.fromPm25(average!) : null;

    return Container(
      color: Theme.of(context).cardColor,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Divider(height: 1, color: AppColors.dividerColorlight),
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 14, 20, 20),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(color: bg, borderRadius: BorderRadius.circular(12)),
              child: Row(
                children: [
                  Text('Day Average', style: TextStyle(fontSize: 13, fontWeight: FontWeight.w600, color: txt2)),
                  const Spacer(),
                  if (average != null) ...[
                    Text('${average!.toStringAsFixed(1)} µg/m³',
                        style: TextStyle(fontSize: 14, fontWeight: FontWeight.w700, color: level?.color ?? txt2)),
                    const SizedBox(width: 8),
                    if (level != null) ExposureLevelChip(level: level),
                  ] else
                    Text('No data', style: TextStyle(fontSize: 13, color: txt2)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
