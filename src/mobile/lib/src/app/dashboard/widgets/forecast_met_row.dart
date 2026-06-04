import 'package:airqo/src/app/dashboard/models/forecast_response.dart';
import 'package:airqo/src/meta/utils/colors.dart';
import 'package:flutter/material.dart';

class ForecastMetRow extends StatelessWidget {
  final ForecastMet? met;

  const ForecastMetRow({super.key, this.met});

  @override
  Widget build(BuildContext context) {
    if (met == null) return const SizedBox.shrink();

    final items = <_MetItem>[
      if (met!.airTemperature != null)
        _MetItem(
          icon: Icons.thermostat_rounded,
          label: 'Temp',
          value: '${met!.airTemperature!.round()}°C',
          color: const Color(0xFFFF6D00),
        ),
      if (met!.relativeHumidity != null)
        _MetItem(
          icon: Icons.water_drop_outlined,
          label: 'Humidity',
          value: '${met!.relativeHumidity!.round()}%',
          color: const Color(0xFF1565C0),
        ),
      if (met!.windSpeed != null)
        _MetItem(
          icon: Icons.air_rounded,
          label: met!.windDirectionCompass != null
              ? 'Wind ${met!.windDirectionCompass}'
              : 'Wind',
          value: '${met!.windSpeed!.toStringAsFixed(1)} m/s',
          color: const Color(0xFF00897B),
        ),
      if (met!.precipitationAmount != null)
        _MetItem(
          icon: Icons.umbrella_rounded,
          label: 'Rain',
          value: '${met!.precipitationAmount!.toStringAsFixed(1)} mm',
          color: const Color(0xFF5C6BC0),
        ),
    ];

    if (items.isEmpty) return const SizedBox.shrink();

    return Row(
      children: items
          .map((item) => Expanded(child: _MetTile(item: item)))
          .toList(),
    );
  }
}

class _MetItem {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _MetItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });
}

class _MetTile extends StatelessWidget {
  final _MetItem item;

  const _MetTile({required this.item});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 4),
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 8),
      decoration: BoxDecoration(
        color: isDark ? AppColors.darkHighlight : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark
              ? AppColors.dividerColordark
              : AppColors.dividerColorlight,
        ),
      ),
      child: Column(
        children: [
          Icon(item.icon, size: 22, color: item.color),
          const SizedBox(height: 6),
          Text(
            item.value,
            style:
                const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
          ),
          Text(
            item.label,
            style: TextStyle(
                fontSize: 10, color: AppColors.boldHeadlineColor),
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
