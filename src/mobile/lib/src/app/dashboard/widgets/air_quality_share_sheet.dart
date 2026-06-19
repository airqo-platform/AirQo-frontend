import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/air_quality_share_card.dart';
import 'package:airqo/src/app/shared/services/air_quality_share_service.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';

Future<void> showAirQualityShareSheet(
  BuildContext context, {
  required Measurement measurement,
  String? fallbackLocationName,
  Rect? sharePositionOrigin,
}) {
  return showModalBottomSheet<void>(
    context: context,
    useRootNavigator: true,
    isScrollControlled: true,
    showDragHandle: true,
    backgroundColor: Colors.transparent,
    builder: (_) => AirQualityShareSheet(
      measurement: measurement,
      fallbackLocationName: fallbackLocationName,
      sharePositionOrigin: sharePositionOrigin,
    ),
  );
}

class AirQualityShareSheet extends StatefulWidget {
  final Measurement measurement;
  final String? fallbackLocationName;
  final Rect? sharePositionOrigin;

  const AirQualityShareSheet({
    super.key,
    required this.measurement,
    this.fallbackLocationName,
    this.sharePositionOrigin,
  });

  @override
  State<AirQualityShareSheet> createState() => _AirQualityShareSheetState();
}

class _AirQualityShareSheetState extends State<AirQualityShareSheet> {
  final GlobalKey _cardKey = GlobalKey();
  bool _isSharingCard = false;

  Future<void> _shareCard() async {
    if (_isSharingCard) return;

    setState(() {
      _isSharingCard = true;
    });

    try {
      final imageBytes = await _captureCard();
      if (imageBytes == null) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content:
                Text('Could not prepare the share card. Please try again.'),
          ),
        );
        return;
      }

      await AirQualityShareService.shareMeasurementCard(
        imageBytes,
        widget.measurement,
        fallbackLocationName: widget.fallbackLocationName,
        sharePositionOrigin: widget.sharePositionOrigin,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSharingCard = false;
        });
      }
    }
  }

  Future<Uint8List?> _captureCard() async {
    final pixelRatio =
        MediaQuery.of(context).devicePixelRatio.clamp(2.0, 3.0).toDouble();

    await Future<void>.delayed(const Duration(milliseconds: 16));

    final boundary =
        _cardKey.currentContext?.findRenderObject() as RenderRepaintBoundary?;
    if (boundary == null) return null;

    final image = await boundary.toImage(pixelRatio: pixelRatio);
    final byteData = await image.toByteData(format: ui.ImageByteFormat.png);

    return byteData?.buffer.asUint8List();
  }

  @override
  Widget build(BuildContext context) {
    final textColor = Theme.of(context).textTheme.headlineSmall?.color;
    final subtitleColor =
        Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.72);

    return SafeArea(
      child: Padding(
        padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
        child: DecoratedBox(
          decoration: BoxDecoration(
            color: Theme.of(context).cardColor,
            borderRadius: BorderRadius.circular(28),
          ),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 12, 16, 16),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Share card',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Preview the card before sending it.',
                  style: TextStyle(
                    fontSize: 14,
                    color: subtitleColor,
                  ),
                ),
                const SizedBox(height: 16),
                RepaintBoundary(
                  key: _cardKey,
                  child: AirQualityShareCard(
                    measurement: widget.measurement,
                    fallbackLocationName: widget.fallbackLocationName,
                  ),
                ),
                const SizedBox(height: 16),
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton.icon(
                    onPressed: _isSharingCard ? null : _shareCard,
                    icon: _isSharingCard
                        ? const SizedBox(
                            width: 16,
                            height: 16,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : const Icon(Icons.ios_share_outlined),
                    label: Text(
                      _isSharingCard ? 'Preparing card...' : 'Share card',
                    ),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primaryColor,
                      foregroundColor: Colors.white,
                      minimumSize: const Size.fromHeight(52),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(18),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
