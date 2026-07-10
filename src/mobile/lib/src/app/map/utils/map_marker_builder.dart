import 'package:airqo/src/app/dashboard/models/airquality_response.dart';
import 'package:airqo/src/app/map/utils/map_aq_presentation.dart';
import 'package:airqo/src/meta/utils/utils.dart';
import 'package:airqo/src/meta/utils/widget_to_map_icon.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/painting.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapMarkerBuilder {
  /// Rasterized marker icon size, in logical pixels.
  static const Size _markerIconSize = Size(28, 28);

  Future<List<Marker>> buildMarkers({
    required List<Measurement> measurements,
    required ValueChanged<Measurement> onMeasurementTap,
  }) async {
    final valid = measurements.where(_hasMappableReading).toList();
    if (valid.isEmpty) return [];

    final markers = <Marker>[];
    for (final measurement in valid) {
      markers.add(await _measurementMarker(measurement, onMeasurementTap));
    }

    return markers;
  }

  bool _hasMappableReading(Measurement measurement) {
    return measurement.id != null &&
        measurement.pm25?.value != null &&
        measurement.siteDetails?.approximateLatitude != null &&
        measurement.siteDetails?.approximateLongitude != null;
  }

  Future<Marker> _measurementMarker(
    Measurement measurement,
    ValueChanged<Measurement> onTap,
  ) async {
    final pmValue = measurement.pm25!.value!;
    final iconPath = getAirQualityIcon(measurement, pmValue);
    final resolvedPath =
        iconPath.isNotEmpty ? iconPath : mapAqLevelFromPm25(pmValue).asset;

    return Marker(
      onTap: () => onTap(measurement),
      icon: await bitmapDescriptorFromSvgAsset(
        resolvedPath,
        _markerIconSize,
      ),
      // These icons are circular badges, not teardrop pins, so center the
      // icon on the coordinate instead of the default bottom-anchor.
      anchor: const Offset(0.5, 0.5),
      position: LatLng(
        measurement.siteDetails!.approximateLatitude!,
        measurement.siteDetails!.approximateLongitude!,
      ),
      markerId: MarkerId(measurement.id!),
    );
  }
}
