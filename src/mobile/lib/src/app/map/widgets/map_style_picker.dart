import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:airqo/src/meta/utils/colors.dart';

class MapStylePicker extends StatefulWidget {
  final MapType currentMapType;
  final ValueChanged<MapType> onApply;

  const MapStylePicker({
    super.key,
    required this.currentMapType,
    required this.onApply,
  });

  @override
  State<MapStylePicker> createState() => _MapStylePickerState();
}

class _MapStylePickerState extends State<MapStylePicker> {
  late MapType _pendingType;

  // Matches the icon set used on the AirQo analytics web map
  static const _options = [
    (
      type: MapType.normal,
      label: 'Streets',
      icon: Icons.map_outlined,
    ),
    (
      type: MapType.satellite,
      label: 'Satellite',
      icon: Icons.satellite_alt_outlined,
    ),
    (
      type: MapType.terrain,
      label: 'Terrain',
      icon: Icons.terrain_outlined,
    ),
    (
      type: MapType.hybrid,
      label: 'Hybrid',
      icon: Icons.layers_outlined,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _pendingType = widget.currentMapType;
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    // Idle tile bg mirrors TagPickerTile: #F4F6F8 (light) / darkThemeBackground (dark)
    final idleBg = isDark
        ? AppColors.darkThemeBackground
        : const Color(0xFFF4F6F8);
    final idleLabelColor =
        isDark ? AppColors.boldHeadlineColor2 : const Color(0xFF1A1D23);
    final subtitleColor =
        isDark ? AppColors.boldHeadlineColor2 : AppColors.boldHeadlineColor3;

    // Use explicit white/darkHighlight so the grey idle tiles are clearly
    // distinct from the modal background — same as LabelPickerSheet.
    final modalBg = isDark ? AppColors.darkHighlight : Colors.white;

    return Container(
      decoration: BoxDecoration(
        color: modalBg,
        borderRadius:
            const BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: SafeArea(
        top: false,
        child: Padding(
          padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // Handle
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.35),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              Text(
                'Map type',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: Theme.of(context).textTheme.headlineSmall?.color,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                'Choose how the map looks',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w400,
                  color: subtitleColor,
                ),
              ),
              const SizedBox(height: 20),
              Row(
                children: _options.map((option) {
                  final isSelected = _pendingType == option.type;
                  final isLast = option.type == MapType.hybrid;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () =>
                          setState(() => _pendingType = option.type),
                      behavior: HitTestBehavior.opaque,
                      child: Container(
                        margin: EdgeInsets.only(right: isLast ? 0 : 8),
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          // Selected → primary, idle → grey (TagPickerTile pattern)
                          color: isSelected
                              ? AppColors.primaryColor
                              : idleBg,
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              option.icon,
                              size: 22,
                              color: isSelected
                                  ? Colors.white
                                  : idleLabelColor,
                            ),
                            const SizedBox(height: 8),
                            Text(
                              option.label,
                              textAlign: TextAlign.center,
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                              style: TextStyle(
                                fontFamily: 'Inter',
                                fontSize: 12,
                                fontWeight: isSelected
                                    ? FontWeight.w700
                                    : FontWeight.w600,
                                color: isSelected
                                    ? Colors.white
                                    : idleLabelColor,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
              const SizedBox(height: 20),
              SizedBox(
                height: 48,
                width: double.infinity,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primaryColor,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  onPressed: () {
                    widget.onApply(_pendingType);
                    Navigator.pop(context);
                  },
                  child: const Text(
                    'Apply',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
