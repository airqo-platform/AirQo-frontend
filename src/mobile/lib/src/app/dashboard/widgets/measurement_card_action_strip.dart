import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/dashboard/widgets/air_quality_share_sheet.dart';
import 'package:airqo/src/app/shared/services/analytics_service.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

const double kMeasurementCardActionIconSize = 18;
const double kMeasurementCardActionTapTarget = 40;
const double kMeasurementCardHorizontalPadding = 16;
const double kMeasurementCardTopPadding = 16;
const double kMeasurementCardBottomPadding = 12;

/// Right-aligned icon slot shared by header share and footer chevron.
class MeasurementCardTrailingIconSlot extends StatelessWidget {
  final Widget icon;

  const MeasurementCardTrailingIconSlot({super.key, required this.icon});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: kMeasurementCardActionTapTarget,
      height: kMeasurementCardActionTapTarget,
      child: Center(child: icon),
    );
  }
}

/// Opens the air quality share sheet for a dashboard card measurement.
Future<void> openMeasurementShareSheet(
  BuildContext context, {
  required Measurement measurement,
  required String source,
  String? fallbackLocationName,
  GlobalKey? shareButtonKey,
}) async {
  final renderObject =
      shareButtonKey?.currentContext?.findRenderObject() as RenderBox?;
  final shareOrigin = renderObject == null
      ? null
      : renderObject.localToGlobal(Offset.zero) & renderObject.size;

  await showAirQualityShareSheet(
    context,
    measurement: measurement,
    source: source,
    fallbackLocationName: fallbackLocationName,
    sharePositionOrigin: shareOrigin,
  );
}

/// Share action for the top-right of measurement dashboard cards.
class MeasurementCardHeaderShare extends StatelessWidget {
  final VoidCallback onShare;
  final GlobalKey? shareButtonKey;

  const MeasurementCardHeaderShare({
    super.key,
    required this.onShare,
    this.shareButtonKey,
  });

  @override
  Widget build(BuildContext context) {
    final iconColor = AppTextColors.modalCloseIcon(context);

    return MeasurementCardTrailingIconSlot(
      key: shareButtonKey,
      icon: _CompactIconAction(
        tooltip: 'Share',
        semanticsLabel: 'Share air quality',
        onPressed: () {
          AnalyticsService().trackCardActionTapped(action: 'share');
          onShare();
        },
        icon: SvgPicture.asset(
          'assets/icons/share-icon.svg',
          width: kMeasurementCardActionIconSize,
          height: kMeasurementCardActionIconSize,
          colorFilter: ColorFilter.mode(iconColor, BlendMode.srcIn),
        ),
      ),
    );
  }
}

/// Forecast chevron for the bottom-right of measurement dashboard cards.
class MeasurementCardFooterForecast extends StatelessWidget {
  final VoidCallback onForecast;
  final bool enabled;

  const MeasurementCardFooterForecast({
    super.key,
    required this.onForecast,
    this.enabled = true,
  });

  @override
  Widget build(BuildContext context) {
    final iconColor = AppTextColors.modalCloseIcon(context);

    return Padding(
      padding: const EdgeInsets.fromLTRB(
        kMeasurementCardHorizontalPadding,
        0,
        kMeasurementCardHorizontalPadding,
        kMeasurementCardBottomPadding,
      ),
      child: Align(
        alignment: Alignment.centerRight,
        child: MeasurementCardTrailingIconSlot(
          icon: _CompactIconAction(
            tooltip: 'Forecast',
            semanticsLabel: 'View forecast',
            onPressed: enabled
                ? () {
                    AnalyticsService().trackCardActionTapped(action: 'forecast');
                    onForecast();
                  }
                : null,
            icon: SvgPicture.asset(
              'assets/icons/chevron-right.svg',
              width: kMeasurementCardActionIconSize,
              height: kMeasurementCardActionIconSize,
              colorFilter: ColorFilter.mode(iconColor, BlendMode.srcIn),
            ),
          ),
        ),
      ),
    );
  }
}

class _CompactIconAction extends StatelessWidget {
  final String tooltip;
  final String semanticsLabel;
  final VoidCallback? onPressed;
  final Widget icon;

  const _CompactIconAction({
    required this.tooltip,
    required this.semanticsLabel,
    required this.onPressed,
    required this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      label: semanticsLabel,
      child: Tooltip(
        message: tooltip,
        child: SizedBox(
          width: kMeasurementCardActionTapTarget,
          height: kMeasurementCardActionTapTarget,
          child: IconButton(
            onPressed: onPressed,
            padding: EdgeInsets.zero,
            visualDensity: VisualDensity.compact,
            constraints: const BoxConstraints(
              minWidth: kMeasurementCardActionTapTarget,
              minHeight: kMeasurementCardActionTapTarget,
            ),
            icon: icon,
          ),
        ),
      ),
    );
  }
}
