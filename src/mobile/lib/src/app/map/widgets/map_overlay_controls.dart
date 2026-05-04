import 'package:airqo/src/app/map/widgets/map_controls.dart';
import 'package:flutter/material.dart';

class MapOverlayControls extends StatelessWidget {
  const MapOverlayControls({
    super.key,
    required this.isDark,
    required this.onLayersTap,
    required this.onZoomIn,
    required this.onZoomOut,
    this.onLocateTap,
  });

  final bool isDark;
  final VoidCallback onLayersTap;
  final VoidCallback? onLocateTap;
  final VoidCallback onZoomIn;
  final VoidCallback onZoomOut;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: 50,
          right: 12,
          child: MapIconButton(
            icon: Icons.layers_outlined,
            isDark: isDark,
            onTap: onLayersTap,
          ),
        ),
        Positioned(
          top: 90,
          right: 12,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (onLocateTap != null) ...[
                MapIconButton(
                  icon: Icons.my_location,
                  isDark: isDark,
                  filled: true,
                  onTap: onLocateTap!,
                ),
                const SizedBox(height: 6),
              ],
              MapZoomGroup(
                isDark: isDark,
                onZoomIn: onZoomIn,
                onZoomOut: onZoomOut,
              ),
            ],
          ),
        ),
      ],
    );
  }
}
