import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/app/dashboard/utils/forecast_met_icons.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';
import 'package:flutter_svg/flutter_svg.dart';

class ForecastMetRow extends StatelessWidget {
  final ForecastMet? met;
  final bool insetOnPanel;

  const ForecastMetRow({
    super.key,
    this.met,
    this.insetOnPanel = false,
  });

  @override
  Widget build(BuildContext context) {
    if (met == null) return const SizedBox.shrink();

    final items = <_MetItem>[
      if (met!.airTemperature != null)
        _MetItem(
          iconAsset: ForecastMetIcons.temperature,
          label: 'Temp',
          value: '${met!.airTemperature!.round()}°C',
        ),
      if (met!.relativeHumidity != null)
        _MetItem(
          iconAsset: ForecastMetIcons.humidity,
          label: 'Humidity',
          value: '${met!.relativeHumidity!.round()}%',
        ),
      if (met!.windSpeed != null)
        _MetItem(
          iconAsset: ForecastMetIcons.wind,
          label: met!.windDirectionCompass != null
              ? 'Wind ${met!.windDirectionCompass}'
              : 'Wind',
          value: '${met!.windSpeed!.toStringAsFixed(1)} m/s',
        ),
      if (met!.precipitationAmount != null)
        _MetItem(
          iconAsset: ForecastMetIcons.rain,
          label: 'Rain',
          value: '${met!.precipitationAmount!.toStringAsFixed(1)} mm',
        ),
    ];

    if (items.isEmpty) return const SizedBox.shrink();

    return Row(
      children: items
          .map(
            (item) => Expanded(
              child: _MetTile(item: item, insetOnPanel: insetOnPanel),
            ),
          )
          .toList(),
    );
  }
}

class _MetItem {
  final String iconAsset;
  final String label;
  final String value;

  const _MetItem({
    required this.iconAsset,
    required this.label,
    required this.value,
  });
}

class _MetTile extends StatelessWidget {
  final _MetItem item;
  final bool insetOnPanel;

  const _MetTile({
    required this.item,
    required this.insetOnPanel,
  });

  @override
  Widget build(BuildContext context) {
    final tileBg = insetOnPanel
        ? AppSurfaceColors.panelChip(context)
        : AppSurfaceColors.nested(context);
    final iconColor = AppColors.pmcolorlight;
    final useLightText =
        insetOnPanel && Theme.of(context).brightness == Brightness.dark;
    final valueColor =
        useLightText ? Colors.white : AppTextColors.headline(context);
    final labelColor = useLightText
        ? Colors.white.withValues(alpha: 0.85)
        : AppTextColors.subtitle(context);

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: tileBg,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppSurfaceColors.border(context)),
      ),
      child: Column(
        children: [
          SvgPicture.asset(
            item.iconAsset,
            width: 22,
            height: 22,
            colorFilter: ColorFilter.mode(iconColor, BlendMode.srcIn),
          ),
          const SizedBox(height: 6),
          Text(
            item.value,
            style: TextStyle(
              fontWeight: FontWeight.w600,
              fontSize: 13,
              color: valueColor,
            ),
          ),
          Text(
            item.label,
            style: TextStyle(
              fontSize: 10,
              color: labelColor,
            ),
            overflow: TextOverflow.ellipsis,
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }
}
