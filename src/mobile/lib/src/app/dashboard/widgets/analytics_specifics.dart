import 'dart:typed_data';
import 'dart:ui' as ui;

import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/air_quality_share_card.dart';
import 'package:airqo/src/app/dashboard/pages/forecast_overview_page.dart';
import 'package:airqo/src/app/dashboard/utils/measurement_location_utils.dart';
import 'package:airqo/src/app/dashboard/widgets/expanded_analytics_card.dart';
import 'package:airqo/src/app/dashboard/widgets/analytics_forecast_widget.dart';
import 'package:airqo/src/app/shared/services/air_quality_share_service.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:airqo/src/app/shared/widgets/translated_text.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_svg/flutter_svg.dart';

enum _ShareAction { quickText, card }

class AnalyticsSpecifics extends StatefulWidget {
  final Measurement measurement;
  final String? fallbackLocationName;
  const AnalyticsSpecifics(
      {super.key, required this.measurement, this.fallbackLocationName});

  @override
  State<AnalyticsSpecifics> createState() => _AnalyticsSpecificsState();
}

class _AnalyticsSpecificsState extends State<AnalyticsSpecifics> {
  double containerHeight = 90;
  bool expanded = false;
  bool _isSharing = false;
  final GlobalKey _shareButtonKey = GlobalKey();

  @override
  void initState() {
    super.initState();
  }

  void toggleContainer() {
    setState(() {
      if (expanded) {
        containerHeight = 90;
        expanded = false;
      } else {
        containerHeight = 180;
        expanded = true;
      }
    });
  }

  String _getLocationDescription(Measurement measurement) {
    final siteDetails = measurement.siteDetails;
    if (siteDetails == null) return "Unknown location";

    final List<String> locationParts = [];

    if (siteDetails.city != null && siteDetails.city!.isNotEmpty) {
      locationParts.add(siteDetails.city!);
    } else if (siteDetails.town != null && siteDetails.town!.isNotEmpty) {
      locationParts.add(siteDetails.town!);
    }

    if (siteDetails.region != null && siteDetails.region!.isNotEmpty) {
      locationParts.add(siteDetails.region!);
    } else if (siteDetails.county != null && siteDetails.county!.isNotEmpty) {
      locationParts.add(siteDetails.county!);
    }

    if (siteDetails.country != null && siteDetails.country!.isNotEmpty) {
      locationParts.add(siteDetails.country!);
    }

    return locationParts.isNotEmpty
        ? locationParts.join(", ")
        : siteDetails.locationName ??
            siteDetails.formattedName ??
            "Unknown location";
  }

  Future<void> _shareAirQuality() async {
    final renderObject =
        _shareButtonKey.currentContext?.findRenderObject() as RenderBox?;
    final shareOrigin = renderObject == null
        ? null
        : renderObject.localToGlobal(Offset.zero) & renderObject.size;

    final selectedAction = await showModalBottomSheet<_ShareAction>(
      context: context,
      useRootNavigator: true,
      showDragHandle: true,
      backgroundColor: Theme.of(context).cardColor,
      builder: (sheetContext) {
        final textColor = Theme.of(sheetContext).textTheme.headlineSmall?.color;
        final subtitleColor = Theme.of(sheetContext)
            .textTheme
            .bodyMedium
            ?.color
            ?.withValues(alpha: 0.72);

        return SafeArea(
          top: false,
          child: Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Share air quality',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w700,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  'Choose a quick text update or a richer share card.',
                  style: TextStyle(
                    fontSize: 14,
                    color: subtitleColor,
                  ),
                ),
                const SizedBox(height: 18),
                _ShareOptionTile(
                  icon: Icons.textsms_outlined,
                  title: 'Share quick text',
                  subtitle: 'Fast, lightweight, and works well in chats.',
                  onTap: () => Navigator.of(sheetContext).pop(
                    _ShareAction.quickText,
                  ),
                ),
                const SizedBox(height: 12),
                _ShareOptionTile(
                  icon: Icons.photo_outlined,
                  title: 'Share card',
                  subtitle: 'A cleaner visual snapshot of this location.',
                  onTap: () => Navigator.of(sheetContext).pop(
                    _ShareAction.card,
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );

    if (!mounted || selectedAction == null) return;

    if (selectedAction == _ShareAction.quickText) {
      await _shareQuickText(shareOrigin);
      return;
    }

    await showModalBottomSheet<void>(
      context: context,
      useRootNavigator: true,
      isScrollControlled: true,
      showDragHandle: true,
      backgroundColor: Colors.transparent,
      builder: (_) => _ShareCardSheet(
        measurement: widget.measurement,
        fallbackLocationName: widget.fallbackLocationName,
        sharePositionOrigin: shareOrigin,
      ),
    );
  }

  Future<void> _shareQuickText(Rect? shareOrigin) async {
    if (_isSharing) return;

    setState(() {
      _isSharing = true;
    });

    try {
      await AirQualityShareService.shareMeasurement(
        widget.measurement,
        fallbackLocationName: widget.fallbackLocationName,
        sharePositionOrigin: shareOrigin,
      );
    } finally {
      if (mounted) {
        setState(() {
          _isSharing = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final nameColor = Theme.of(context).textTheme.headlineSmall?.color;
    final subtitleColor =
        Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.7);

    return SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 8.0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    Expanded(
                      child: Text(
                        widget.measurement.siteDetails?.searchName ??
                            widget.measurement.siteDetails?.name ??
                            widget.fallbackLocationName ??
                            "---",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 24,
                          color: nameColor,
                        ),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        TextButton.icon(
                          key: _shareButtonKey,
                          onPressed: _isSharing ? null : _shareAirQuality,
                          icon: _isSharing
                              ? const SizedBox(
                                  width: 14,
                                  height: 14,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                  ),
                                )
                              : const Icon(Icons.share_outlined, size: 18),
                          label: const TranslatedText('Share'),
                          style: TextButton.styleFrom(
                            foregroundColor: AppColors.primaryColor,
                          ),
                        ),
                        InkWell(
                          onTap: () => Navigator.pop(context),
                          child: Icon(
                            Icons.close,
                            color: AppTextColors.modalCloseIcon(context),
                          ),
                        ),
                      ],
                    )
                  ],
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    SvgPicture.asset(
                      'assets/images/shared/location_pin.svg',
                      width: 14,
                      height: 14,
                    ),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(
                        _getLocationDescription(widget.measurement),
                        style: TextStyle(
                          fontSize: 14,
                          color: subtitleColor,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 24),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    TranslatedText(
                      "Today",
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        fontSize: 20,
                        color: nameColor,
                      ),
                    ),
                    if (widget.measurement.siteDetails?.id != null)
                      TextButton(
                        onPressed: () {
                          ForecastOverviewPage.show(
                            context,
                            siteId: widget.measurement.siteDetails!.id!,
                            siteName: measurementDisplayName(
                              widget.measurement,
                              fallbackLocationName:
                                  widget.fallbackLocationName,
                            ),
                            locationDescription: measurementLocationDescription(
                              widget.measurement,
                            ),
                            measurement: widget.measurement,
                          );
                        },
                        child: TranslatedText(
                          'Full forecast',
                          style: TextStyle(
                            fontSize: 13,
                            color: AppColors.primaryColor,
                          ),
                        ),
                      ),
                  ],
                ),
                const SizedBox(height: 16),
                if (widget.measurement.siteDetails?.id != null)
                  AnalyticsForecastWidget(
                    siteId: widget.measurement.siteDetails!.id!,
                  )
                else
                  const Center(
                    child: TranslatedText("Forecast not available"),
                  ),
                const SizedBox(height: 16),
              ],
            ),
          ),
          SafeArea(
            child: ExpandedAnalyticsCard(
              widget.measurement,
            ),
          ),
        ],
      ),
    );
  }
}

class _ShareOptionTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final VoidCallback onTap;

  const _ShareOptionTile({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final subtitleColor =
        Theme.of(context).textTheme.bodyMedium?.color?.withValues(alpha: 0.72);

    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(20),
      child: Ink(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: Theme.of(context).dividerColor),
          color: Theme.of(context).scaffoldBackgroundColor,
        ),
        child: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                color: AppColors.primaryColor.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Icon(
                icon,
                color: AppColors.primaryColor,
              ),
            ),
            const SizedBox(width: 14),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    title,
                    style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    subtitle,
                    style: TextStyle(
                      fontSize: 13,
                      color: subtitleColor,
                    ),
                  ),
                ],
              ),
            ),
            const Icon(Icons.chevron_right),
          ],
        ),
      ),
    );
  }
}

class _ShareCardSheet extends StatefulWidget {
  final Measurement measurement;
  final String? fallbackLocationName;
  final Rect? sharePositionOrigin;

  const _ShareCardSheet({
    required this.measurement,
    required this.fallbackLocationName,
    required this.sharePositionOrigin,
  });

  @override
  State<_ShareCardSheet> createState() => _ShareCardSheetState();
}

class _ShareCardSheetState extends State<_ShareCardSheet> {
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
