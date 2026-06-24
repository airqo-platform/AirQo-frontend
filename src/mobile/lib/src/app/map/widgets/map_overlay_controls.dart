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
    this.layersKey,
    this.locateKey,
    this.zoomKey,
  });

  final bool isDark;
  final VoidCallback onLayersTap;
  final VoidCallback? onLocateTap;
  final VoidCallback onZoomIn;
  final VoidCallback onZoomOut;
  final GlobalKey? layersKey;
  final GlobalKey? locateKey;
  final GlobalKey? zoomKey;

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Positioned(
          top: 50,
          right: mapControlSideInset,
          child: MapIconButton(
            key: layersKey,
            icon: Icons.layers_outlined,
            isDark: isDark,
            onTap: onLayersTap,
          ),
        ),
        Positioned(
          top: 112,
          right: mapControlSideInset,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              if (onLocateTap != null) ...[
                MapIconButton(
                  key: locateKey,
                  icon: Icons.my_location,
                  isDark: isDark,
                  filled: true,
                  onTap: onLocateTap!,
                ),
                const SizedBox(height: 6),
              ],
              MapZoomGroup(
                key: zoomKey,
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
